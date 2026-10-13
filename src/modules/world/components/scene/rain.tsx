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

import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { setUniforms } from './shader-utils';
import { weatherMix } from './weather-mix';

interface RainProps {
  palette: WorldPalette;
  narrow: boolean;
}

const { rain: config } = VISUAL.weather;

// Each drop is a short line; the shader moves it down through a box that
// follows the camera, wrapping round, so a few thousand drops fill the view.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBox;
  uniform float uSpeed;
  uniform vec3 uCenter;
  attribute vec3 aSeed;
  attribute float aTail;
  varying float vTail;
  void main() {
    vec3 slant = vec3(0.18, -1.0, 0.08);
    vec3 p = aSeed * uBox + slant * uTime * uSpeed * (0.8 + aSeed.y * 0.4);
    p = mod(p - uCenter, uBox) - uBox * 0.5 + uCenter;
    p -= slant * aTail * 0.55;
    vTail = aTail;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAmount;
  varying float vTail;
  void main() {
    gl_FragColor = vec4(uColor, uAmount * 0.45 * (1.0 - vTail * 0.8));
    #include <colorspace_fragment>
  }
`;

const center = new Vector3();

// Repeatable pseudo-random numbers for the drop layout.
const hash = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 4.1) * 43_758.545_3;
  return x - Math.floor(x);
};

const Rain = ({ palette, narrow }: RainProps) => {
  const geometry = useMemo(() => {
    const count = narrow ? config.narrowDrops : config.drops;
    const seeds: number[] = [];
    const tails: number[] = [];
    for (let index = 0; index < count; index++) {
      const seed = [hash(index), hash(index + 0.31), hash(index + 0.67)];
      seeds.push(...seed, ...seed);
      tails.push(0, 1);
    }
    const result = new BufferGeometry();
    result.setAttribute('aSeed', new Float32BufferAttribute(seeds, 3));
    result.setAttribute('aTail', new Float32BufferAttribute(tails, 1));
    // The shader places every vertex; position is only there for three.js.
    result.setAttribute(
      'position',
      new Float32BufferAttribute(new Float32Array(count * 6), 3),
    );
    return result;
  }, [narrow]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uBox: { value: config.box },
          uSpeed: { value: config.speed },
          uCenter: { value: new Vector3() },
          uColor: { value: new Color() },
          uAmount: { value: 0 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    setUniforms(material, { uColor: palette.foam });
  }, [material, palette.foam]);

  useFrame(({ camera, clock }) => {
    center.copy(camera.position);
    setUniforms(material, {
      uTime: clock.elapsedTime,
      uAmount: weatherMix.rain,
    });
    setCenter(material, center);
  });

  return (
    <lineSegments
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
};

const setCenter = (material: ShaderMaterial, value: Vector3) => {
  (material.uniforms.uCenter.value as Vector3).copy(value);
};

export default Rain;
