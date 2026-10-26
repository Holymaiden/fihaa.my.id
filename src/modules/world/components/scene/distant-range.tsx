'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  ShaderMaterial,
  Vector3,
} from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

import { seededRandom } from '../../config/island';
import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { setUniforms } from './shader-utils';
import { weatherMix } from './weather-mix';

interface DistantRangeProps {
  palette: WorldPalette;
}

// A ring of mountains far out, rising from below the cloud sea, so the
// horizon has land on it and the island reads as high up. Ridged noise
// gives sharp crests; the haze swallows them with distance (its own fade,
// lighter than the scene fog, so the silhouettes stay).
const RANGE = {
  inner: 150,
  outer: 255,
  rings: 40,
  segments: 320,
  base: -70,
  peak: 78,
} as const;

const simplex = new SimplexNoise(seededRandom(11));

const ridges = (x: number, z: number) => {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 0.012;
  for (let octave = 0; octave < 5; octave++) {
    value +=
      (1 - Math.abs(simplex.noise(x * frequency, z * frequency))) ** 2 *
      amplitude;
    amplitude *= 0.5;
    frequency *= 2.05;
  }
  return value;
};

const buildRange = () => {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let ring = 0; ring <= RANGE.rings; ring++) {
    const share = ring / RANGE.rings;
    const radius = RANGE.inner + (RANGE.outer - RANGE.inner) * share;
    // Low at the front and back edges of the band, highest in between.
    const swell = Math.sin(share * Math.PI) ** 0.7;
    for (let step = 0; step < RANGE.segments; step++) {
      const angle = (step / RANGE.segments) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      // Some stretches are high ranges, others low hills.
      const massif =
        0.45 + 0.55 * (simplex.noise(x * 0.004, z * 0.004) * 0.5 + 0.5);
      // The band's edges sink far below the cloud sea so no rim shows.
      const y =
        RANGE.base -
        (1 - swell) * 70 +
        ridges(x, z) * RANGE.peak * swell * massif;
      positions.push(x, y, z);
    }
  }
  for (let ring = 0; ring < RANGE.rings; ring++) {
    for (let step = 0; step < RANGE.segments; step++) {
      const next = (step + 1) % RANGE.segments;
      const a = ring * RANGE.segments + step;
      const b = ring * RANGE.segments + next;
      const c = (ring + 1) * RANGE.segments + step;
      const d = (ring + 1) * RANGE.segments + next;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uRock;
  uniform vec3 uGrass;
  uniform vec3 uSnow;
  uniform vec3 uHaze;
  uniform vec3 uSun;
  uniform vec3 uSky;
  uniform vec3 uSunDirection;
  uniform float uSnowLine;
  uniform float uSea;
  // Rain and mist close the view: the range fades out with them.
  uniform float uWeather;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    // Only what rises out of the cloud sea shows; the roots below it
    // would read as a dark band through the thin cloud.
    if (vWorld.y < uSea) discard;
    vec3 n = normalize(vNormal);
    float steep = 1.0 - n.y;
    // Green low and on gentle slopes, rock on steep faces, snow on top.
    vec3 color = mix(uGrass, uRock, smoothstep(0.25, 0.5, steep));
    float snow = smoothstep(uSnowLine - 4.0, uSnowLine + 6.0, vWorld.y + (1.0 - steep) * 6.0);
    color = mix(color, uSnow, snow * smoothstep(0.75, 0.35, steep));
    float light = max(dot(n, normalize(uSunDirection)), 0.0);
    color *= uSky * 0.45 + uSun * light * 0.9;
    // Aerial perspective: the further, the more it fades into the haze.
    float distance = length(vWorld.xz - cameraPosition.xz);
    float haze = smoothstep(60.0, 280.0, distance) * 0.82;
    color = mix(color, uHaze, clamp(haze + uWeather, 0.0, 1.0));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

const DistantRange = ({ palette }: DistantRangeProps) => {
  const geometry = useMemo(() => buildRange(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uRock: { value: new Color() },
          uGrass: { value: new Color() },
          uSnow: { value: new Color() },
          uHaze: { value: new Color() },
          uSun: { value: new Color() },
          uSky: { value: new Color() },
          uSunDirection: {
            value: new Vector3(...VISUAL.light.sunPosition).normalize(),
          },
          uSnowLine: { value: -6 },
          uSea: { value: VISUAL.cloudSea.height },
          uWeather: { value: 0 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    setUniforms(material, {
      uRock: palette.rock,
      uGrass: palette.grass,
      uSnow: palette.cloudLight,
      uHaze: palette.skyHorizon,
      uSun: palette.sun,
      uSky: palette.skyTop,
    });
  }, [material, palette]);

  useFrame(() => {
    setUniforms(material, {
      uWeather: Math.max(weatherMix.mist, weatherMix.rain * 0.7),
    });
  });

  return <mesh geometry={geometry} material={material} raycast={() => null} />;
};

export default DistantRange;
