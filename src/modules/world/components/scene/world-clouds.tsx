'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import {
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from 'three';

import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { fogUniforms, setUniforms } from './shader-utils';
import { weatherMix } from './weather-mix';

interface WorldCloudsProps {
  palette: WorldPalette;
}

// Soft clouds drifting round the island: each one a cluster of puffs,
// camera-facing quads with a noisy round edge, lit on the side that faces
// the sun and shaded underneath. World positions and widths.
export interface PuffCluster {
  position: [number, number, number];
  width: number;
}

const CLOUDS: PuffCluster[] = [
  { position: [-30, -6, -12], width: 14 },
  { position: [28, -10, -8], width: 16 },
  { position: [-14, -15, 22], width: 18 },
  { position: [32, 6, -26], width: 11 },
  { position: [-34, 8, -28], width: 10 },
  { position: [18, -18, 18], width: 13 },
  { position: [-4, 12, -40], width: 12 },
];
const PUFFS_PER_CLOUD = 14;

const random = (seed: number) => {
  const x = Math.sin(seed * 91.17 + 12.9) * 43_758.545_3;
  return x - Math.floor(x);
};

// Puffs fill a flattened ellipsoid: wide, a bit deep, not very tall, with
// the bigger ones low in the middle so the cloud has a flat-ish base. Also
// used for the splash at the foot of a waterfall.
export const buildPuffs = (
  clusters: PuffCluster[] = CLOUDS,
  puffsPerCluster = PUFFS_PER_CLOUD,
) => {
  const centers: number[] = [];
  const params: number[] = [];
  clusters.forEach(({ position: [cx, cy, cz], width }, cloud) => {
    for (let puff = 0; puff < puffsPerCluster; puff++) {
      const seed = cloud * 100 + puff;
      const angle = random(seed) * Math.PI * 2;
      const reach = Math.sqrt(random(seed + 0.3));
      const x = Math.cos(angle) * reach * width * 0.5;
      const z = Math.sin(angle) * reach * width * 0.3;
      const y = (random(seed + 0.6) * 0.5 + (1 - reach) * 0.4) * width * 0.22;
      centers.push(cx + x, cy + y, cz + z);
      // Size, noise seed.
      params.push(width * (0.32 + (1 - reach) * 0.3), random(seed + 0.9) * 50);
    }
  });
  const geometry = new InstancedBufferGeometry();
  const quad = new PlaneGeometry(1, 1);
  geometry.index = quad.index;
  geometry.setAttribute('position', quad.getAttribute('position'));
  geometry.setAttribute('uv', quad.getAttribute('uv'));
  geometry.setAttribute(
    'aCenter',
    new InstancedBufferAttribute(new Float32Array(centers), 3),
  );
  geometry.setAttribute(
    'aParams',
    new InstancedBufferAttribute(new Float32Array(params), 2),
  );
  geometry.instanceCount = centers.length / 3;
  return geometry;
};

const vertexShader = /* glsl */ `
  attribute vec3 aCenter;
  attribute vec2 aParams;
  varying vec2 vUv;
  varying float vSeed;
  varying float vHeight;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vSeed = aParams.y;
    vec4 center = modelMatrix * vec4(aCenter, 1.0);
    // How high this puff sits in its cloud (for the darker base).
    vHeight = clamp(position.y + 0.5, 0.0, 1.0);
    vec4 mvPosition = viewMatrix * center;
    mvPosition.xy += position.xy * aParams.x;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLight;
  uniform vec3 uShade;
  uniform vec3 uSun;
  uniform float uOvercast;
  varying vec2 vUv;
  varying float vSeed;
  varying float vHeight;
  #include <fog_pars_fragment>

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < 4; octave++) {
      value += noise(p) * amplitude;
      p *= 2.03;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 p = vUv - 0.5;
    float radius = length(p) * 2.0;
    float billow = fbm(vUv * 3.0 + vSeed + uTime * 0.02);
    // Round puff with a billowing, wispy edge.
    float density = smoothstep(1.0, 0.25, radius + (billow - 0.5) * 0.7);
    if (density < 0.01) discard;
    // Lit from above, shaded underneath; the sun warms the top.
    float lit = clamp(vHeight * 0.8 + billow * 0.5, 0.0, 1.0);
    vec3 color = mix(uShade, uLight, lit);
    color += uSun * pow(lit, 3.0) * 0.12 * (1.0 - uOvercast);
    gl_FragColor = vec4(color, density * 0.85);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

// Soft, lit puffs (colours set through uLight, uShade and uSun).
export const puffMaterial = () =>
  new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    fog: true,
    uniforms: {
      ...fogUniforms(),
      uTime: { value: 0 },
      uLight: { value: new Color() },
      uShade: { value: new Color() },
      uSun: { value: new Color() },
      uOvercast: { value: 0 },
    },
  });

const DRIFT_AXIS = new Vector3(0, 1, 0);

// Clouds slowly circle the islands when effects are on.
const WorldClouds = ({ palette }: WorldCloudsProps) => {
  const groupRef = useRef<Group>(null);
  const effects = useEffectsEnabled();
  const geometry = useMemo(() => buildPuffs(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const material = useMemo(() => puffMaterial(), []);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    setUniforms(material, {
      uLight: palette.cloudLight,
      uShade: palette.cloudShade,
      uSun: palette.sun,
    });
  }, [material, palette]);

  useFrame(({ clock }, delta) => {
    setUniforms(material, {
      uTime: effects ? clock.elapsedTime : 0,
      uOvercast: weatherMix.overcast,
    });
    if (groupRef.current && effects) {
      groupRef.current.rotateOnAxis(
        DRIFT_AXIS,
        delta * VISUAL.effects.cloudDriftSpeed,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        material={material}
        frustumCulled={false}
        raycast={() => null}
      />
    </group>
  );
};

export default WorldClouds;
