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

// Three-stop vertical gradient (bottom -> horizon -> top) from the palette,
// with a hazy horizon band, Mie-style glow round the sun (or moon) and the
// disc itself.
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
    float mu = dot(direction, sunDirection);
    float facing = max(mu, 0.0);
    float clearSky = 1.0 - overcast;
    // Haze: the sky pales into a bright band along the horizon, as the
    // light passes through more air there.
    color = mix(color, horizonColor * 1.08, exp(-abs(h) * 14.0) * 0.5);
    // Forward (Mie) scattering: a broad glow round the sun, stronger low in
    // the sky where the air is thicker.
    float g = 0.76;
    float mie = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * mu, 1.5) / 12.566;
    color += sunColor * mie * glowStrength * 0.6 * clearSky
      * (0.45 + 0.55 * (1.0 - clamp(h, 0.0, 1.0)));
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
      color += tint * glow * north * aurora * 1.1;
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
