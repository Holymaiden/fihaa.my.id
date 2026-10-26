'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import {
  Color,
  DoubleSide,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  ShaderMaterial,
} from 'three';

import { islandHeight, pathMask, waterMask } from '../../config/island';
import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { meadowSpots } from './meadow-life';
import { fogUniforms, setUniforms } from './shader-utils';
import { WIND_GLSL } from './wind';

interface PampasProps {
  palette: WorldPalette;
}

const { pampas } = VISUAL;

const random = (seed: number) => {
  const x = Math.sin(seed * 57.3 + 9.1) * 43_758.545_3;
  return x - Math.floor(x);
};

// One stalk: two crossed ribbons, thin up the stem and widening into a
// pointed plume of seed near the top (y runs 0..1).
const STEPS: [number, number][] = [
  [0, 0.012],
  [0.6, 0.01],
  [0.72, 0.05],
  [0.88, 0.04],
  [1, 0],
];

const buildStalk = () => {
  const positions: number[] = [];
  const indices: number[] = [];
  for (const turn of [0, Math.PI / 2]) {
    const c = Math.cos(turn);
    const s = Math.sin(turn);
    const start = positions.length / 3;
    STEPS.forEach(([y, half], index) => {
      const sides = index === STEPS.length - 1 ? [0] : [-1, 1];
      for (const side of sides) {
        positions.push(side * half * c, y, side * half * s);
      }
    });
    for (let index = 0; index < STEPS.length - 2; index++) {
      const a = start + index * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const last = start + (STEPS.length - 2) * 2;
    indices.push(last, last + 1, last + 2);
  }
  return { positions, indices };
};

// Tall golden seed stalks poking out of the meadow, in loose clusters,
// nodding with the shared wind.
const buildPampas = () => {
  const stalk = buildStalk();
  const offsets: number[] = [];
  const params: number[] = [];
  meadowSpots(pampas.clusters, 911).forEach(([cx, cz], cluster) => {
    for (let index = 0; index < pampas.perCluster; index++) {
      const seed = cluster * 13 + index;
      const angle = random(seed) * Math.PI * 2;
      const radius = Math.sqrt(random(seed + 0.3)) * 1.2;
      const x = cx + Math.cos(angle) * radius;
      const z = cz + Math.sin(angle) * radius;
      if (Math.max(pathMask(x, z), waterMask(x, z)) > 0.2) {
        continue;
      }
      offsets.push(x, islandHeight(x, z) - 0.02, z);
      // lean direction, height, shade
      params.push(
        random(seed + 0.5) * Math.PI * 2,
        pampas.minHeight +
          (pampas.maxHeight - pampas.minHeight) * random(seed + 0.7),
        random(seed + 0.9),
      );
    }
  });
  const geometry = new InstancedBufferGeometry();
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(stalk.positions, 3),
  );
  geometry.setIndex(stalk.indices);
  geometry.setAttribute(
    'aOffset',
    new InstancedBufferAttribute(new Float32Array(offsets), 3),
  );
  geometry.setAttribute(
    'aParams',
    new InstancedBufferAttribute(new Float32Array(params), 3),
  );
  geometry.instanceCount = offsets.length / 3;
  return geometry;
};

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWind;
  attribute vec3 aOffset;
  attribute vec3 aParams;
  varying float vHeight;
  varying float vShade;
  #include <fog_pars_vertex>
  ${WIND_GLSL}
  void main() {
    float h = position.y;
    vec3 local = position * vec3(1.0, aParams.y, 1.0);
    // A slight lean of its own, plus the wind: tall and light, it bends
    // more than the grass, mostly near the plume.
    float strength = windStrength(aOffset.xz, uTime) * uWind;
    float nod = sin(uTime * 2.1 + aParams.x * 5.0) * 0.06 * uWind;
    vec2 lean = vec2(cos(aParams.x), sin(aParams.x)) * 0.12
      + WIND_DIR * (strength * 0.5 + nod);
    float tilt = min(length(lean), 1.0) * h * h;
    vec2 leanDir = lean / max(length(lean), 1e-4);
    local.xz += leanDir * local.y * sin(tilt);
    local.y *= cos(tilt);
    vHeight = h;
    vShade = aParams.z;
    vec4 mvPosition = modelViewMatrix * vec4(local + aOffset, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uStem;
  uniform vec3 uPlume;
  uniform float uLight;
  varying float vHeight;
  varying float vShade;
  #include <fog_pars_fragment>
  void main() {
    vec3 color = mix(uStem, uPlume, smoothstep(0.55, 0.75, vHeight));
    color *= (0.82 + vShade * 0.3) * uLight;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

const Pampas = ({ palette }: PampasProps) => {
  const effects = useEffectsEnabled();
  const geometry = useMemo(() => buildPampas(), []);
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
          uStem: { value: new Color() },
          uPlume: { value: new Color() },
          uLight: { value: 1 },
        },
      }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useEffect(() => {
    const plume = new Color(palette.pampas);
    setUniforms(material, {
      uPlume: palette.pampas,
      uLight: palette.isNight ? VISUAL.grass.nightLight : VISUAL.grass.dayLight,
    });
    (material.uniforms.uStem.value as Color)
      .copy(plume)
      .multiply(new Color(palette.grass))
      .lerp(plume, 0.4);
  }, [material, palette]);

  useFrame(({ clock }) => {
    setUniforms(material, {
      uTime: effects ? clock.elapsedTime : 0,
      uWind: effects ? 1 : 0.4,
    });
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      frustumCulled={false}
      raycast={() => null}
    />
  );
};

export default Pampas;
