'use client';

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

// One tuft = three tapered blades crossed at 60°. y runs 0..1 up the blade.
const buildTuft = () => {
  const positions: number[] = [];
  const indices: number[] = [];
  const levels = [0, 0.3, 0.62, 1];
  const widths = [1, 0.85, 0.55, 0];
  for (let blade = 0; blade < 3; blade++) {
    const angle = (blade / 3) * Math.PI + blade * 0.2;
    // Blades of a tuft stand apart, so it reads as grass, not a cone.
    const offsetX = (blade - 1) * 0.11;
    const offsetZ = ((blade * 7) % 3) * 0.09 - 0.09;
    const start = positions.length / 3;
    levels.forEach((level, index) => {
      const half = widths[index] * 0.5;
      for (const side of index === levels.length - 1 ? [0] : [-half, half]) {
        positions.push(
          Math.cos(angle) * side + offsetX,
          level,
          Math.sin(angle) * side + offsetZ,
        );
      }
    });
    // Pairs (left, right) per level, then the tip.
    for (let index = 0; index < levels.length - 2; index++) {
      const a = start + index * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const lastPair = start + (levels.length - 2) * 2;
    indices.push(lastPair, lastPair + 1, lastPair + 2);
  }
  return { positions, indices };
};

const vertexShader = /* glsl */ `
  #include <common>
  #include <shadowmap_pars_vertex>
  uniform float uTime;
  uniform float uWind;
  // Where the grass has been pressed (see trail-map.tsx).
  uniform sampler2D uTrail;
  uniform float uTrailExtent;
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
  #include <fog_pars_vertex>
  ${WIND_GLSL}

  void main() {
    float h = position.y;
    float c = cos(aParams.x);
    float s = sin(aParams.x);
    vec3 local = vec3(position.x * aParams.z, h * aParams.y, position.z * aParams.z);
    local = vec3(local.x * c - local.z * s, local.y, local.x * s + local.z * c);

    float strength = windStrength(aOffset.xz, uTime) * uWind;
    float bend = strength * h * h * aParams.y;
    // Each tuft also leans its own way a little, even without wind.
    local.xz += vec2(cos(aParams.x * 3.0), sin(aParams.x * 3.0)) * h * h * aParams.y * 0.25;
    local.xz += WIND_DIR * bend * 0.9;
    local.y -= bend * bend * 0.35;

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
  varying float vHeight;
  varying float vTint;
  varying float vGust;
  varying float vOcclusion;
  varying float vPressed;
  #include <fog_pars_fragment>

  void main() {
    vec3 color = mix(uBase * 0.7, uTip, smoothstep(0.0, 1.0, vHeight));
    // Patches of drier grass, and a sheen where the gust bends the blades.
    color = mix(color, uDry, vTint * 0.55 * vHeight);
    color += uTip * vGust * vHeight * 0.12;
    // Darker at the roots, like they're in each other's shade.
    float roots = 0.45 + 0.55 * smoothstep(0.0, 0.7, vHeight);
    // Key light from the sun (with its shadow), soft sky fill, baked AO.
    float shadow = getShadowMask();
    vec3 light = uSky * 0.55 * vOcclusion
      + uSun * uSunScale * shadow * vOcclusion * (0.5 + 0.5 * vHeight);
    // Flattened blades show their paler, shaded side: the trail reads.
    color = mix(color, uDry * 0.8, vPressed * 0.35);
    gl_FragColor = vec4(color * roots * light * uLight * (1.0 - vPressed * 0.2), 1.0);
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
  const tuft = buildTuft();
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
            (0.35 * random(seed + 0.75) + 0.65 * patch)) *
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

// Thousands of grass tufts in one draw call, swaying in the wind. Kept off
// paths, water, clearings and the beach.
const MeadowGrass = ({ palette, density }: MeadowGrassProps) => {
  const effects = useEffectsEnabled();

  const geometry = useMemo(() => buildMeadow(VISUAL.grass), []);

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
        },
      }),
    [],
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
