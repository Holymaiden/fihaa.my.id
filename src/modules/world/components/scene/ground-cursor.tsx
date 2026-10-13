'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Mesh } from 'three';
import { Color, ShaderMaterial } from 'three';

import { islandHeight, waterMask } from '../../config/island';
import { isWalkable } from '../../config/viewpoint-search';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import { interaction } from './interaction';
import { setUniforms } from './shader-utils';

interface GroundCursorProps {
  palette: WorldPalette;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// A footstep on the ground: a soft pressed-down shade, with a thin bright
// ring when you can walk there (explore mode) that breathes gently.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uStrength;
  uniform float uRing;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    if (d > 1.0) discard;
    float radius = 0.72 + sin(uTime * 3.0) * 0.04;
    float ring = smoothstep(0.07, 0.0, abs(d - radius)) * uRing;
    float shade = smoothstep(0.85, 0.0, d) * 0.28;
    float alpha = max(ring * 0.85, shade) * uStrength;
    vec3 color = mix(vec3(0.02, 0.03, 0.02), uColor, ring / (ring + shade + 1e-4));
    gl_FragColor = vec4(color, alpha);
  }
`;

const SIZE = 1.3;

// Follows the pointer across the ground in every mode, so the island feels
// like something you can step on. The grass parts round the same spot.
const GroundCursor = ({ palette }: GroundCursorProps) => {
  const meshRef = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color() },
          uStrength: { value: 0 },
          uRing: { value: 0 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    setUniforms(material, { uColor: palette.marker });
  }, [material, palette.marker]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const { touch } = interaction;
    const onWater = waterMask(touch.x, touch.z) > 0.3;
    const exploring = useWorldStore.getState().mode === 'explore';
    mesh.visible = touch.strength > 0.02 && !onWater;
    mesh.position.set(touch.x, islandHeight(touch.x, touch.z) + 0.05, touch.z);
    setUniforms(material, {
      uTime: clock.elapsedTime,
      uStrength: touch.strength,
      uRing: exploring && isWalkable(touch.x, touch.z) ? 1 : 0.35,
    });
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      raycast={() => null}
      renderOrder={2}
    >
      <planeGeometry args={[SIZE, SIZE]} />
    </mesh>
  );
};

export default GroundCursor;
