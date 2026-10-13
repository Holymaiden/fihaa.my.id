'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { PointLight } from 'three';
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from 'three';

import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { setUniforms } from './shader-utils';

interface CampfireProps {
  palette: WorldPalette;
}

const { campfire } = VISUAL;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// A flame drawn on a plane: tapered teardrop with rising flicker.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCore;
  uniform vec3 uEdge;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  void main() {
    vec2 uv = vUv;
    float flicker = noise(vec2(uv.x * 4.0, uv.y * 3.0 - uTime * 3.5));
    uv.x += (flicker - 0.5) * 0.25 * uv.y;
    float width = (1.0 - uv.y) * 0.42 * (0.7 + 0.3 * sin(uv.y * 3.14));
    float shape = smoothstep(width, width * 0.4, abs(uv.x - 0.5));
    shape *= smoothstep(1.0, 0.55, uv.y + flicker * 0.25);
    vec3 color = mix(uEdge, uCore, smoothstep(0.2, 0.9, shape) * (1.0 - uv.y));
    gl_FragColor = vec4(color * 1.6, shape);
  }
`;

// Stones, logs, a flickering flame and a warm light, by the travel journal.
const Campfire = ({ palette }: CampfireProps) => {
  const effects = useEffectsEnabled();
  const lightRef = useRef<PointLight>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uCore: { value: new Color(palette.fireCore) },
          uEdge: { value: new Color(palette.fireEdge) },
        },
      }),
    [palette.fireCore, palette.fireEdge],
  );
  useEffect(() => () => material.dispose(), [material]);
  const intensity = palette.isNight ? campfire.nightLight : campfire.dayLight;

  useFrame(({ clock }) => {
    const time = effects ? clock.elapsedTime : 0;
    setUniforms(material, { uTime: time });
    if (lightRef.current) {
      lightRef.current.intensity =
        intensity *
        (effects
          ? 0.85 + Math.sin(time * 9) * 0.08 + Math.sin(time * 23) * 0.06
          : 1);
    }
  });

  return (
    <group>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.55, 0.08, Math.sin(angle) * 0.55]}
            rotation={[index, index * 2, 0]}
            castShadow
          >
            <dodecahedronGeometry args={[0.16 + (index % 3) * 0.03, 0]} />
            <meshStandardMaterial color={palette.stone} flatShading />
          </mesh>
        );
      })}
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          position={[0, 0.14, 0]}
          rotation={[0, (index / 3) * Math.PI, Math.PI / 2 - 0.25]}
        >
          <cylinderGeometry args={[0.07, 0.08, 0.8, 6]} />
          <meshStandardMaterial color={palette.trunk} flatShading />
        </mesh>
      ))}
      {[0, Math.PI / 2].map((rotation) => (
        <mesh
          key={rotation}
          position={[0, 0.62, 0]}
          rotation-y={rotation}
          material={material}
        >
          <planeGeometry args={[0.8, 1]} />
        </mesh>
      ))}
      <pointLight
        ref={lightRef}
        position={[0, 0.9, 0]}
        color={palette.fireEdge}
        intensity={intensity}
        distance={campfire.distance}
        decay={1.6}
      />
    </group>
  );
};

export default Campfire;
