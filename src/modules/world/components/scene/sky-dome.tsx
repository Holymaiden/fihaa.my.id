'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { ShaderMaterial } from 'three';
import { BackSide, Color, Vector3 } from 'three';

import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { setUniforms } from './shader-utils';
import { weatherMix } from './weather-mix';

interface SkyDomeProps {
  palette: WorldPalette;
}

const vertexShader = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Three-stop vertical gradient: bottom -> horizon -> top.
// Plus a sun (or moon) disc with a wide glow around it.
const fragmentShader = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 horizonColor;
  uniform vec3 bottomColor;
  uniform vec3 sunColor;
  uniform vec3 sunDirection;
  uniform float sunSize;
  uniform float glowStrength;
  uniform vec3 greyColor;
  uniform float overcast;
  varying vec3 vDirection;
  void main() {
    vec3 direction = normalize(vDirection);
    float h = direction.y;
    vec3 color = h > 0.0
      ? mix(horizonColor, topColor, smoothstep(0.0, 0.6, h))
      : mix(horizonColor, bottomColor, smoothstep(0.08, 0.6, -h));
    float facing = max(dot(direction, sunDirection), 0.0);
    float clearSky = 1.0 - overcast;
    color += sunColor * pow(facing, 12.0) * glowStrength * clearSky;
    color += sunColor * pow(facing, 160.0) * glowStrength * 0.6 * clearSky;
    color = mix(color, sunColor * 1.4, smoothstep(1.0 - sunSize, 1.0 - sunSize * 0.6, facing) * clearSky);
    // Cloud cover: a soft grey that keeps a little of the sky's colour.
    color = mix(color, greyColor * (0.85 + 0.25 * h), overcast * 0.8);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

// Procedural gradient sky: no texture to download.
const SkyDome = ({ palette }: SkyDomeProps) => {
  const materialRef = useRef<ShaderMaterial>(null);
  useFrame(() => {
    if (materialRef.current) {
      setUniforms(materialRef.current, { overcast: weatherMix.overcast });
    }
  });
  const uniforms = useMemo(
    () => ({
      topColor: { value: new Color(palette.skyTop) },
      horizonColor: { value: new Color(palette.skyHorizon) },
      bottomColor: { value: new Color(palette.skyBottom) },
      sunColor: { value: new Color(palette.sun) },
      sunDirection: {
        value: new Vector3(...VISUAL.sky.sunDirection).normalize(),
      },
      sunSize: {
        value: palette.isNight ? VISUAL.sky.moonSize : VISUAL.sky.sunSize,
      },
      glowStrength: { value: palette.isNight ? 0.25 : 0.55 },
      greyColor: { value: new Color(palette.cloudShade) },
      overcast: { value: 0 },
    }),
    [
      palette.cloudShade,
      palette.skyTop,
      palette.skyHorizon,
      palette.skyBottom,
      palette.sun,
      palette.isNight,
    ],
  );

  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[VISUAL.sky.radius, 48, 24]} />
      <shaderMaterial
        ref={materialRef}
        side={BackSide}
        depthWrite={false}
        fog={false}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
};

export default SkyDome;
