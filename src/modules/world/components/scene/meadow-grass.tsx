'use client';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import {
  Color,
  DoubleSide,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  MathUtils,
  ShaderMaterial,
  Vector3,
} from 'three';

import {
  clearingMask,
  ISLAND,
  islandEdge,
  islandHeight,
  pathMask,
  waterMask,
} from '../../config/island';
import { bakedOcclusion } from '../../config/viewpoint-search';
import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { interaction } from './interaction';
import {
  fogUniforms,
  lightUniforms,
  setInstanceCount,
  setUniforms,
} from './shader-utils';
import { GRASS_TEXTURE_SCALE, terrainTextureUrls } from './terrain-material';
import { trailUniforms } from './trail-map';
import { weatherMix } from './weather-mix';
import { WIND_GLSL } from './wind';

interface MeadowGrassProps {
  palette: WorldPalette;
  // Share (0..1) of the blades to draw; lowered on slow devices.
  density: number;
}

// Small deterministic random, so the meadow looks the same on every visit.
const random = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43_758.545_3;
  return x - Math.floor(x);
};

// One clump: three thin blades sprouting from almost the same spot, each
// turned its own way and a different height, tapered and curving out
// towards the tip (y runs 0..1 up the tallest blade). Clumps close together
// read as a soft, full carpet; normals round off towards each blade's edges
// so light rolls across it.
const LEVELS = [0, 0.3, 0.55, 0.8, 1];
const WIDTHS = [1, 0.85, 0.62, 0.32, 0];
const CURVE = 0.22;
const ROUNDING = 0.5;
// Per blade: turn (radians), height share, offset from the clump centre
// (in blade widths).
const CLUMP: [number, number, [number, number]][] = [
  [0, 1, [0, 0]],
  [2.1, 0.78, [0.9, 0.5]],
  [4.2, 0.88, [-0.7, 0.8]],
];

const buildBlade = () => {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  for (const [turn, tall, [ox, oz]] of CLUMP) {
    const c = Math.cos(turn);
    const s = Math.sin(turn);
    const start = positions.length / 3;
    LEVELS.forEach((level, index) => {
      const half = WIDTHS[index] * 0.5;
      const lean = CURVE * level * level;
      for (const side of index === LEVELS.length - 1 ? [0] : [-1, 1]) {
        // Facing +z before the turn.
        const x = side * half;
        const z = lean;
        positions.push(x * c + z * s + ox, level * tall, -x * s + z * c + oz);
        const nx = side * ROUNDING;
        const ny = level * CURVE * 2;
        const length = Math.hypot(nx, ny, 1);
        normals.push(
          (nx * c + s) / length,
          ny / length,
          (-nx * s + c) / length,
        );
      }
    });
    // Pairs (left, right) per level, then the tip.
    for (let index = 0; index < LEVELS.length - 2; index++) {
      const a = start + index * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const lastPair = start + (LEVELS.length - 2) * 2;
    indices.push(lastPair, lastPair + 1, lastPair + 2);
  }
  return { positions, normals, indices };
};

const vertexShader = /* glsl */ `
  #include <common>
  #include <shadowmap_pars_vertex>
  uniform float uTime;
  uniform float uWind;
  // Where the grass has been pressed (see trail-map.tsx).
  uniform sampler2D uTrail;
  uniform float uTrailExtent;
  // The ground's grass texture, so blades pick up its patches of colour.
  uniform sampler2D uGround;
  uniform float uGroundScale;
  attribute vec3 aOffset;
  // rotation, height, width, tint
  attribute vec4 aParams;
  // Baked ambient occlusion: 1 = open sky, less near walls and trees.
  attribute float aOcclusion;
  varying float vHeight;
  varying float vTint;
  varying float vGust;
  varying float vOcclusion;
  varying float vPressed;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vGround;
  #include <fog_pars_vertex>
  ${WIND_GLSL}

  void main() {
    float h = position.y;
    float c = cos(aParams.x);
    float s = sin(aParams.x);
    // Distance LOD: far from the camera most blades drop out (they'd be
    // thinner than a pixel and cost fill for nothing) and the rest widen
    // a little to keep the carpet closed; the ground texture is grassy too.
    vec3 rootWorld = (modelMatrix * vec4(aOffset, 1.0)).xyz;
    float far = smoothstep(20.0, 48.0, distance(rootWorld, cameraPosition));
    float keep = 1.0 - far * 0.65;
    float pick = fract(aParams.x * 7.31 + aOffset.x * 3.7);
    if (pick > keep) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }
    float widen = 1.0 + far * 1.6;
    vec3 local = vec3(position.x * aParams.z * widen, h * aParams.y, position.z * aParams.z);
    local = vec3(local.x * c - local.z * s, local.y, local.x * s + local.z * c);
    vec3 bladeNormal = vec3(normal.x * c - normal.z * s, normal.y, normal.x * s + normal.z * c);

    float strength = windStrength(aOffset.xz, uTime) * uWind;
    // Lean: each blade a little its own way, plus the wind. The blade
    // turns about its root (more towards the tip) so it keeps its length
    // and stays a standing blade instead of being combed flat.
    vec2 own = vec2(cos(aParams.x * 3.0), sin(aParams.x * 3.0)) * 0.2;
    vec2 lean = own + WIND_DIR * strength * 0.42;
    float tilt = min(length(lean), 0.9) * h;
    vec2 leanDir = lean / max(length(lean), 1e-4);
    float rise = local.y;
    local.xz += leanDir * rise * sin(tilt);
    local.y = rise * cos(tilt);

    // Pressed down where the pointer or the visitor's feet passed, lying
    // away from the path and slowly springing back up.
    vec4 trail = texture2D(uTrail, aOffset.xz / uTrailExtent + 0.5);
    float push = trail.r;
    vec2 away = trail.gb * 2.0 - 1.0;
    local.xz += away * push * h * aParams.y * 1.1;
    local.y -= push * h * aParams.y * 0.6;
    vPressed = push;

    vHeight = h;
    vTint = aParams.w;
    vGust = strength;
    vOcclusion = aOcclusion;
    vec4 worldPosition = modelMatrix * vec4(local + aOffset, 1.0);
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(mat3(modelMatrix) * bladeNormal);
    vec3 groundAverage = max(textureLod(uGround, vec2(0.5), 12.0).rgb, vec3(0.02));
    vGround = textureLod(uGround, aOffset.xz / uGroundScale, 2.0).rgb / groundAverage;
    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    // Blades take the sun's real shadow (castle, trees) from the shadow map.
    vec3 transformedNormal = normalMatrix * vec3(0.0, 1.0, 0.0);
    #include <shadowmap_vertex>
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  #include <common>
  #include <packing>
  #include <lights_pars_begin>
  #include <shadowmap_pars_fragment>
  #include <shadowmask_pars_fragment>
  uniform vec3 uSun;
  uniform float uSunScale;
  uniform vec3 uSky;
  uniform vec3 uBase;
  uniform vec3 uTip;
  uniform vec3 uDry;
  uniform float uLight;
  uniform vec3 uSunDirection;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vGround;
  varying float vHeight;
  varying float vTint;
  varying float vGust;
  varying float vOcclusion;
  varying float vPressed;
  #include <fog_pars_fragment>

  float bladeHash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Dark, cool roots up to a light, warm tip, like a lit meadow seen
    // close up; each blade a little lighter or darker than its neighbours.
    float tip = smoothstep(0.0, 1.0, vHeight);
    vec3 color = mix(uBase * 0.78, uTip * 1.15, tip);
    float own = bladeHash(floor(vWorldPosition.xz * 40.0));
    color *= 0.93 + own * 0.14;
    // Patches of drier grass, and a sheen where the gust bends the blades.
    color = mix(color, uDry, vTint * 0.4 * vHeight);
    color += uTip * vGust * vHeight * 0.1;
    // The ground's own colour patches show through.
    color *= mix(vec3(1.0), clamp(vGround, 0.6, 1.4), 0.3);
    // Darker at the roots, like they're in each other's shade.
    float roots = 0.72 + 0.28 * smoothstep(0.0, 0.5, vHeight);

    // Both sides of a blade face the light the same way; soften towards
    // straight up so a meadow doesn't flicker blade by blade.
    vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
    n = normalize(mix(n, vec3(0.0, 1.0, 0.0), 0.6));
    vec3 toCamera = normalize(cameraPosition - vWorldPosition);
    vec3 toSun = normalize(uSunDirection);
    // Wrapped diffuse, a glow where the sun shines through the blade
    // towards the camera, and a soft glossy highlight.
    float diffuse = max(dot(n, toSun), 0.0) * 0.7 + 0.3;
    float through = pow(max(dot(toCamera, -toSun), 0.0), 3.0) * vHeight;
    float gloss = pow(max(dot(n, normalize(toSun + toCamera)), 0.0), 28.0) * vHeight;

    // Key light from the sun (with its shadow), soft sky fill, baked AO.
    float shadow = getShadowMask();
    vec3 sun = uSun * uSunScale * shadow * vOcclusion;
    vec3 light = uSky * 0.7 * vOcclusion
      + sun * diffuse * (0.55 + 0.45 * vHeight)
      + sun * uTip * through * 0.9;
    // Flattened blades show their paler, shaded side: the trail reads.
    color = mix(color, uDry * 0.8, vPressed * 0.35);
    color = color * roots * light + sun * gloss * 0.12;
    gl_FragColor = vec4(color * uLight * (1.0 - vPressed * 0.2), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

// Places the tufts on the island, shuffled so drawing only the first n
// thins the meadow evenly.
const buildMeadow = ({
  spacing,
  minHeight,
  maxHeight,
  width,
}: typeof VISUAL.grass) => {
  const tuft = buildBlade();
  const offsets: number[] = [];
  const params: number[] = [];
  const occlusion: number[] = [];
  let seed = 1;
  const extent = ISLAND.radius * 1.25;
  for (let gx = -extent; gx <= extent; gx += spacing) {
    for (let gz = -extent; gz <= extent; gz += spacing) {
      seed++;
      const x = gx + (random(seed) - 0.5) * spacing * 1.6;
      const z = gz + (random(seed + 0.5) - 0.5) * spacing * 1.6;
      const share =
        Math.hypot(x, z) / (ISLAND.radius * islandEdge(Math.atan2(x, z)));
      if (share > 0.9) {
        continue;
      }
      const bare = Math.max(
        pathMask(x, z),
        waterMask(x, z),
        clearingMask(x, z),
        // Thin out towards the sand.
        (share - 0.8) * 10,
      );
      if (random(seed + 0.25) < bare) {
        continue;
      }
      // Clumps: taller in some patches, short where it's thinning.
      const patch =
        Math.sin(x * 0.7 + 1.3) * Math.cos(z * 0.6 - 0.4) * 0.5 + 0.5;
      const height =
        (minHeight +
          (maxHeight - minHeight) *
            (0.55 * random(seed + 0.75) + 0.45 * patch)) *
        (1 - bare * 0.6);
      offsets.push(x, islandHeight(x, z) - 0.03, z);
      occlusion.push(bakedOcclusion(x, z));
      params.push(
        random(seed + 0.1) * Math.PI,
        height,
        width * (0.8 + random(seed + 0.2) * 0.5),
        Math.max(
          0,
          Math.sin(x * 0.31 - z * 0.27) * 0.5 + 0.2 * random(seed + 0.3),
        ),
      );
    }
  }
  // Shuffle, so drawing only the first n (on slow devices) thins the whole
  // meadow evenly instead of cutting off one side.
  const count = offsets.length / 3;
  const order = Array.from({ length: count }, (_, index) => index);
  for (let index = count - 1; index > 0; index--) {
    const swap = Math.floor(random(index + 0.9) * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  const shuffledOffsets = new Float32Array(count * 3);
  const shuffledParams = new Float32Array(count * 4);
  const shuffledOcclusion = new Float32Array(count);
  order.forEach((from, to) => {
    shuffledOffsets.set(offsets.slice(from * 3, from * 3 + 3), to * 3);
    shuffledParams.set(params.slice(from * 4, from * 4 + 4), to * 4);
    shuffledOcclusion[to] = occlusion[from];
  });
  const result = new InstancedBufferGeometry();
  result.setAttribute(
    'position',
    new Float32BufferAttribute(tuft.positions, 3),
  );
  result.setAttribute('normal', new Float32BufferAttribute(tuft.normals, 3));
  result.setIndex(tuft.indices);
  result.setAttribute(
    'aOffset',
    new InstancedBufferAttribute(shuffledOffsets, 3),
  );
  result.setAttribute(
    'aParams',
    new InstancedBufferAttribute(shuffledParams, 4),
  );
  result.setAttribute(
    'aOcclusion',
    new InstancedBufferAttribute(shuffledOcclusion, 1),
  );
  result.instanceCount = count;
  // The tufts sit on the island; skip per-frame culling maths.
  result.boundingSphere = null;
  return result;
};

// Many thousands of grass blades in one draw call, swaying in the wind. Kept off
// paths, water, clearings and the beach.
const MeadowGrass = ({ palette, density }: MeadowGrassProps) => {
  const effects = useEffectsEnabled();

  const geometry = useMemo(() => buildMeadow(VISUAL.grass), []);
  // Same texture (and cache entry) as the terrain's grass layer.
  const groundTexture = useTexture(terrainTextureUrls()[0]);

  const total = geometry.getAttribute('aOffset').count;
  useEffect(() => {
    setInstanceCount(geometry, Math.max(1, Math.round(total * density)));
  }, [geometry, total, density]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: DoubleSide,
        fog: true,
        lights: true,
        uniforms: {
          ...lightUniforms(),
          ...fogUniforms(),
          uSun: { value: new Color() },
          uSunScale: { value: 1 },
          uSky: { value: new Color() },
          uTime: { value: 0 },
          uWind: { value: 1 },
          uBase: { value: new Color() },
          uTip: { value: new Color() },
          uDry: { value: new Color() },
          uLight: { value: 1 },
          uTrail: trailUniforms.uTrail,
          uTrailExtent: trailUniforms.uTrailExtent,
          uGround: { value: groundTexture },
          uGroundScale: { value: GRASS_TEXTURE_SCALE },
          uSunDirection: {
            value: new Vector3(...VISUAL.light.sunPosition).normalize(),
          },
        },
      }),
    [groundTexture],
  );
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    setUniforms(material, {
      uBase: palette.grass,
      uTip: palette.grassLight,
      uDry: palette.sand,
      uLight: palette.isNight ? VISUAL.grass.nightLight : VISUAL.grass.dayLight,
      uSun: palette.sun,
      uSky: palette.skyHorizon,
    });
  }, [material, palette]);

  useFrame(({ clock }, delta) => {
    const { touch } = interaction;
    touch.strength = MathUtils.damp(touch.strength, touch.goal, 6, delta);
    setUniforms(material, {
      uTime: effects ? clock.elapsedTime : 0,
      uWind: effects ? 1 + weatherMix.rain * 0.9 : 0.4,
      uSunScale: 0.8 * (1 - weatherMix.overcast * 0.6),
    });
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      frustumCulled={false}
      receiveShadow
      raycast={() => null}
    />
  );
};

export default MeadowGrass;
