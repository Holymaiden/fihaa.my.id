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

import { islandHeight } from '../../config/island';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { fogUniforms, setUniforms } from './shader-utils';
import { weatherMix } from './weather-mix';

interface WildlifeProps {
  palette: WorldPalette;
}

// Two wings per creature: x < 0 is the left wing, x > 0 the right one. The
// shader flaps them by lifting the outer edge.
const buildWings = (span: number, length: number) => {
  const positions = [
    // left wing
    0,
    0,
    length * 0.5,
    -span,
    0,
    0,
    0,
    0,
    -length * 0.5,
    // right wing
    0,
    0,
    length * 0.5,
    0,
    0,
    -length * 0.5,
    span,
    0,
    0,
  ];
  const geometry = new InstancedBufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
};

// aPath: radius, height, speed, phase. aStyle: flap speed, wobble, colour.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFlutter;
  attribute vec4 aPath;
  attribute vec3 aCenter;
  attribute vec3 aStyle;
  varying float vShade;
  varying float vKind;
  #include <fog_pars_vertex>
  void main() {
    float t = uTime * aPath.z + aPath.w;
    // Butterflies (uFlutter = 1) wander in loops; birds circle smoothly.
    vec3 offset = vec3(
      sin(t) * aPath.x + sin(t * 2.3) * aStyle.y,
      aPath.y + sin(t * 1.7) * (0.3 + aStyle.y),
      cos(t) * aPath.x + cos(t * 3.1) * aStyle.y * uFlutter
    );
    vec3 next = vec3(
      sin(t + 0.05) * aPath.x + sin((t + 0.05) * 2.3) * aStyle.y,
      0.0,
      cos(t + 0.05) * aPath.x + cos((t + 0.05) * 3.1) * aStyle.y * uFlutter
    );
    vec2 heading = normalize(next.xz - offset.xz + 1e-4);
    vec3 p = position;
    float wing = abs(p.x);
    float flap = sin(uTime * aStyle.x + aPath.w * 7.0);
    p.y += wing * flap * (0.6 + uFlutter * 0.5);
    p.x *= 1.0 - abs(flap) * 0.25 * uFlutter;
    // Face along the heading (local +z forward).
    vec3 turned = vec3(
      p.x * heading.y + p.z * heading.x,
      p.y,
      -p.x * heading.x + p.z * heading.y
    );
    vShade = 0.75 + flap * 0.25;
    vKind = aStyle.z;
    vec4 mvPosition = modelViewMatrix * vec4(aCenter + offset + turned, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uShow;
  varying float vShade;
  varying float vKind;
  #include <fog_pars_fragment>
  void main() {
    if (uShow < 0.01) discard;
    vec3 color = mix(uColorA, uColorB, vKind) * vShade;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

interface Flock {
  count: number;
  center: (index: number) => [number, number, number];
  path: (index: number) => [number, number, number, number];
  style: (index: number) => [number, number, number];
}

const random = (seed: number) => {
  const x = Math.sin(seed * 78.233 + 12.9898) * 43_758.545_3;
  return x - Math.floor(x);
};

// Birds circle wide round the island; butterflies flit low over the meadow.
const BIRDS: Flock = {
  count: 9,
  center: () => [0, 0, 0],
  path: (index) => [
    20 + random(index) * 8,
    7 + random(index + 0.3) * 6,
    0.16 + random(index + 0.6) * 0.06,
    // Fly in two loose groups.
    (index % 2) * Math.PI + random(index + 0.9) * 0.6,
  ],
  style: (index) => [7 + random(index + 0.2) * 2, 0.6, 0],
};

const BUTTERFLIES: Flock = {
  count: 16,
  center: (index) => {
    const angle = random(index + 4) * Math.PI * 2;
    const distance = 5.5 + random(index + 5) * 6;
    const x = Math.sin(angle) * distance;
    const z = Math.cos(angle) * distance;
    return [x, islandHeight(x, z), z];
  },
  path: (index) => [
    0.8 + random(index + 1) * 1.2,
    0.9 + random(index + 2) * 0.8,
    0.5 + random(index + 3) * 0.5,
    random(index + 6) * 6.28,
  ],
  style: (index) => [16 + random(index + 7) * 6, 0.5, index % 2],
};

const buildFlock = (flock: Flock, wings: [number, number]) => {
  const geometry = buildWings(...wings);
  const centers: number[] = [];
  const paths: number[] = [];
  const styles: number[] = [];
  for (let index = 0; index < flock.count; index++) {
    centers.push(...flock.center(index));
    paths.push(...flock.path(index));
    styles.push(...flock.style(index));
  }
  geometry.setAttribute(
    'aCenter',
    new InstancedBufferAttribute(new Float32Array(centers), 3),
  );
  geometry.setAttribute(
    'aPath',
    new InstancedBufferAttribute(new Float32Array(paths), 4),
  );
  geometry.setAttribute(
    'aStyle',
    new InstancedBufferAttribute(new Float32Array(styles), 3),
  );
  geometry.instanceCount = flock.count;
  return geometry;
};

const makeMaterial = (flutter: number) =>
  new ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: DoubleSide,
    fog: true,
    uniforms: {
      ...fogUniforms(),
      uTime: { value: 0 },
      uFlutter: { value: flutter },
      uShow: { value: 1 },
      uColorA: { value: new Color() },
      uColorB: { value: new Color() },
    },
  });

// Birds round the island and butterflies over the meadow, by day. They
// shelter when it rains. All motion is in the shader: one draw per flock.
const Wildlife = ({ palette }: WildlifeProps) => {
  const geometries = useMemo(
    () => ({
      birds: buildFlock(BIRDS, [0.55, 0.35]),
      butterflies: buildFlock(BUTTERFLIES, [0.16, 0.2]),
    }),
    [],
  );
  const materials = useMemo(
    () => ({ birds: makeMaterial(0), butterflies: makeMaterial(1) }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geometries).forEach((item) => item.dispose());
      Object.values(materials).forEach((item) => item.dispose());
    },
    [geometries, materials],
  );

  useEffect(() => {
    setUniforms(materials.birds, {
      uColorA: palette.rockDeep,
      uColorB: palette.rockDeep,
    });
    setUniforms(materials.butterflies, {
      uColorA: palette.flowerB,
      uColorB: palette.flowerA,
    });
  }, [materials, palette]);

  const night = palette.isNight;
  useFrame(({ clock }) => {
    const show = night ? 0 : 1 - weatherMix.rain;
    for (const material of Object.values(materials)) {
      setUniforms(material, { uTime: clock.elapsedTime, uShow: show });
    }
  });

  return (
    <>
      <mesh
        geometry={geometries.birds}
        material={materials.birds}
        frustumCulled={false}
      />
      <mesh
        geometry={geometries.butterflies}
        material={materials.butterflies}
        frustumCulled={false}
      />
    </>
  );
};

export default Wildlife;
