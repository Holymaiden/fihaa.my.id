'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { DirectionalLight, HemisphereLight } from 'three';
import { MathUtils } from 'three';

import { SHADOW_EXTENT } from '../../config/camera';
import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import SkyDome from './sky-dome';
import { weatherMix } from './weather-mix';

interface WorldAtmosphereProps {
  palette: WorldPalette;
  shadows: boolean;
  shadowMapSize: number;
}

// Sky, fog, a hemisphere fill and one sun with soft shadows.
const WorldAtmosphere = ({
  palette,
  shadows,
  shadowMapSize,
}: WorldAtmosphereProps) => {
  const light = palette.isNight ? VISUAL.light.night : VISUAL.light.day;
  const sunRef = useRef<DirectionalLight>(null);
  const skyRef = useRef<HemisphereLight>(null);

  // Clouds dim the sun more than the sky light.
  useFrame(() => {
    const dim = MathUtils.lerp(
      1,
      VISUAL.weather.overcastLight,
      weatherMix.overcast,
    );
    if (sunRef.current) {
      sunRef.current.intensity = light.sun * dim * dim;
    }
    if (skyRef.current) {
      skyRef.current.intensity = light.hemisphere * (0.4 + dim * 0.6);
    }
  });

  return (
    <>
      <SkyDome palette={palette} />
      <fog attach="fog" args={[palette.fog, VISUAL.fog.near, VISUAL.fog.far]} />
      <hemisphereLight
        ref={skyRef}
        args={[palette.sun, palette.groundLight, light.hemisphere]}
      />
      <directionalLight
        ref={sunRef}
        position={VISUAL.light.sunPosition}
        color={palette.sun}
        intensity={light.sun}
        castShadow={shadows}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-radius={VISUAL.shadows.radius}
        shadow-bias={VISUAL.shadows.bias}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[
            -SHADOW_EXTENT,
            SHADOW_EXTENT,
            SHADOW_EXTENT,
            -SHADOW_EXTENT,
            1,
            90,
          ]}
        />
      </directionalLight>
    </>
  );
};

export default WorldAtmosphere;
