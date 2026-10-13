'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { ShaderMaterial } from 'three';
import { BackSide, Color, Vector3 } from 'three';

import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
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
  uniform float uTime;
  // Aurora strength (night, clear sky) and its two colours.
  uniform float aurora;
  uniform vec3 auroraLow;
  uniform vec3 auroraHigh;
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
    // Aurora: three wavering curtains over the northern sky, with fine
    // vertical rays drifting through them. Bright enough to bloom.
    if (aurora > 0.001 && h > 0.05) {
      float azimuth = atan(direction.x, direction.z);
      float north = smoothstep(-0.2, 0.6, cos(azimuth - 2.6));
      float glow = 0.0;
      for (int band = 0; band < 3; band++) {
        float b = float(band);
        float wave = sin(azimuth * 3.0 + b * 1.7 + uTime * 0.05) * 0.07
          + sin(azimuth * 7.0 - uTime * 0.09 + b) * 0.025;
        float base = 0.2 + b * 0.075 + wave;
        float curtain = smoothstep(base, base + 0.025, h)
          * (1.0 - smoothstep(base + 0.03, base + 0.3, h));
        float rays = 0.5 + 0.5 * sin(azimuth * 70.0 + b * 13.0
          + sin(azimuth * 9.0 + uTime * 0.12) * 5.0 + uTime * 0.25);
        glow += curtain * (0.35 + 0.65 * rays) * (0.65 - b * 0.15);
      }
      vec3 tint = mix(auroraLow, auroraHigh, smoothstep(0.15, 0.55, h));
      color += tint * glow * north * aurora * 1.6;
    }
    // Cloud cover: a soft grey that keeps a little of the sky's colour.
    color = mix(color, greyColor * (0.85 + 0.25 * h), overcast * 0.8);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

// Procedural gradient sky: no texture to download.
const SkyDome = ({ palette }: SkyDomeProps) => {
  const materialRef = useRef<ShaderMaterial>(null);
  const night = palette.isNight;
  const effects = useEffectsEnabled();
  useFrame(({ clock }) => {
    if (materialRef.current) {
      setUniforms(materialRef.current, {
        overcast: weatherMix.overcast,
        uTime: effects ? clock.elapsedTime : 0,
        // Northern lights only on clear nights.
        aurora: night ? 1 - weatherMix.overcast : 0,
      });
    }
  });
  // One stable set of uniforms (three.js keeps the object it compiled
  // with), updated in place when the theme changes.
  const uniforms = useMemo(
    () => ({
      topColor: { value: new Color() },
      horizonColor: { value: new Color() },
      bottomColor: { value: new Color() },
      sunColor: { value: new Color() },
      sunDirection: {
        value: new Vector3(...VISUAL.sky.sunDirection).normalize(),
      },
      sunSize: { value: VISUAL.sky.sunSize },
      glowStrength: { value: 0.55 },
      greyColor: { value: new Color() },
      overcast: { value: 0 },
      uTime: { value: 0 },
      aurora: { value: 0 },
      auroraLow: { value: new Color() },
      auroraHigh: { value: new Color() },
    }),
    [],
  );
  useEffect(() => {
    const material = materialRef.current;
    if (!material) {
      return;
    }
    setUniforms(material, {
      topColor: palette.skyTop,
      horizonColor: palette.skyHorizon,
      bottomColor: palette.skyBottom,
      sunColor: palette.sun,
      greyColor: palette.cloudShade,
      auroraLow: palette.auroraLow,
      auroraHigh: palette.auroraHigh,
      sunSize: palette.isNight ? VISUAL.sky.moonSize : VISUAL.sky.sunSize,
      glowStrength: palette.isNight ? 0.25 : 0.55,
    });
  }, [palette]);

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
