'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { Color, ShaderMaterial } from 'three';

import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { setUniforms } from './shader-utils';

interface CloudSeaProps {
  palette: WorldPalette;
}

const { cloudSea } = VISUAL;

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Rolling fbm clouds lit from above, fading into the sky far away.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLight;
  uniform vec3 uShade;
  uniform vec3 uFar;
  uniform float uFadeStart;
  uniform float uFadeEnd;
  varying vec3 vWorld;

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
      p = p * 2.03 + vec2(1.7, 9.2);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 p = vWorld.xz * 0.022 + vec2(uTime * 0.01, uTime * 0.005);
    float puff = fbm(p);
    float detail = fbm(p * 3.1 - vec2(uTime * 0.018, 0.0));
    float cloud = smoothstep(0.38, 0.68, puff * 0.8 + detail * 0.3);
    // Lit tops and shaded valleys between the billows.
    vec3 color = mix(uShade, uLight, cloud);
    color = mix(color, uLight * 1.08, smoothstep(0.62, 0.8, puff + detail * 0.2) * 0.6);
    float distance = length(vWorld.xz - cameraPosition.xz);
    color = mix(color, uFar, smoothstep(uFadeStart, uFadeEnd, distance) * 0.6);
    // Gaps between the billows, and the whole layer melts into the sky far
    // away, so there is no hard horizon line.
    float alpha = smoothstep(0.22, 0.5, puff * 0.8 + detail * 0.3);
    alpha *= 1.0 - smoothstep(uFadeStart, uFadeEnd, distance);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// A sea of clouds far below, so the island reads as floating high up.
const CloudSea = ({ palette }: CloudSeaProps) => {
  const effects = useEffectsEnabled();
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uLight: { value: new Color() },
          uShade: { value: new Color() },
          uFar: { value: new Color() },
          uFadeStart: { value: cloudSea.fade[0] },
          uFadeEnd: { value: cloudSea.fade[1] },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    setUniforms(material, {
      uLight: palette.cloudLight,
      uShade: palette.cloudShade,
      uFar: palette.skyHorizon,
    });
  }, [material, palette]);

  useFrame(({ clock }) => {
    if (effects) {
      setUniforms(material, { uTime: clock.elapsedTime });
    }
  });

  return (
    <mesh
      material={material}
      position={[0, cloudSea.height, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={-1}
    >
      <circleGeometry args={[cloudSea.radius, 64]} />
    </mesh>
  );
};

export default CloudSea;
