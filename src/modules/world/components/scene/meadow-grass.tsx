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
import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { interaction } from './interaction';
import {
  fogUniforms,
  setInstanceCount,
  setUniforms,
  setVector,
} from './shader-utils';
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
  uniform float uTime;
  uniform float uWind;
  // Pointer on the ground (x, z, strength) and the walker (x, z, active).
  uniform vec3 uTouch;
  uniform vec3 uWalker;
  attribute vec3 aOffset;
  // rotation, height, width, tint
  attribute vec4 aParams;
  varying float vHeight;
  varying float vTint;
  varying float vGust;
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

    // Blades part round the pointer and round the visitor's feet.
    vec2 fromTouch = aOffset.xz - uTouch.xy;
    float touch = uTouch.z * smoothstep(1.7, 0.0, length(fromTouch));
    vec2 fromWalker = aOffset.xz - uWalker.xy;
    float walk = uWalker.z * smoothstep(1.4, 0.2, length(fromWalker));
    vec2 away = normalize(fromTouch + 1e-4) * touch + normalize(fromWalker + 1e-4) * walk;
    float push = max(touch, walk);
    local.xz += away * h * aParams.y * 0.9;
    local.y -= push * h * h * aParams.y * 0.45;

    vHeight = h;
    vTint = aParams.w;
    vGust = strength;
    vec4 mvPosition = modelViewMatrix * vec4(local + aOffset, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uTip;
  uniform vec3 uDry;
  uniform float uLight;
  varying float vHeight;
  varying float vTint;
  varying float vGust;
  #include <fog_pars_fragment>

  void main() {
    vec3 color = mix(uBase * 0.7, uTip, smoothstep(0.0, 1.0, vHeight));
    // Patches of drier grass, and a sheen where the gust bends the blades.
    color = mix(color, uDry, vTint * 0.55 * vHeight);
    color += uTip * vGust * vHeight * 0.12;
    // Darker at the roots, like they're in each other's shade.
    color *= 0.55 + 0.45 * smoothstep(0.0, 0.6, vHeight);
    gl_FragColor = vec4(color * uLight, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

// Thousands of grass tufts in one draw call, swaying in the wind. Kept off
// paths, water, clearings and the beach.
const MeadowGrass = ({ palette, density }: MeadowGrassProps) => {
  const effects = useEffectsEnabled();
  const { spacing, minHeight, maxHeight, width } = VISUAL.grass;

  const geometry = useMemo(() => {
    const tuft = buildTuft();
    const offsets: number[] = [];
    const params: number[] = [];
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
    order.forEach((from, to) => {
      shuffledOffsets.set(offsets.slice(from * 3, from * 3 + 3), to * 3);
      shuffledParams.set(params.slice(from * 4, from * 4 + 4), to * 4);
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
    result.instanceCount = count;
    // The tufts sit on the island; skip per-frame culling maths.
    result.boundingSphere = null;
    return result;
  }, [spacing, minHeight, maxHeight, width]);

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
        uniforms: {
          ...fogUniforms(),
          uTime: { value: 0 },
          uWind: { value: 1 },
          uBase: { value: new Color() },
          uTip: { value: new Color() },
          uDry: { value: new Color() },
          uLight: { value: 1 },
          uTouch: { value: new Vector3() },
          uWalker: { value: new Vector3() },
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
    });
  }, [material, palette]);

  useFrame(({ clock }, delta) => {
    const { touch, walker } = interaction;
    touch.strength = MathUtils.damp(touch.strength, touch.goal, 6, delta);
    setVector(material, 'uTouch', [touch.x, touch.z, touch.strength]);
    setVector(material, 'uWalker', [walker.x, walker.z, walker.active]);
    setUniforms(material, {
      uTime: effects ? clock.elapsedTime : 0,
      uWind: effects ? 1 + weatherMix.rain * 0.9 : 0.4,
    });
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
};

export default MeadowGrass;
