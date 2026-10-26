'use client';

import { Environment } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
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

const SUN = VISUAL.light.sunPosition;

// Image-based lighting from a CC0 sky HDRI (Poly Haven, see ASSETS.md):
// soft fill and believable reflections on every PBR material. The sky dome
// stays the visible background.
// ponytail: HDRI sun direction is not aligned to VISUAL.light.sunPosition;
// rotate with environmentRotation if reflections look off.
const SkyLight = ({ palette }: { palette: WorldPalette }) => (
  <Suspense fallback={null}>
    <Environment
      files={
        palette.isNight
          ? VISUAL.environment.nightFile
          : VISUAL.environment.dayFile
      }
      environmentIntensity={
        palette.isNight ? VISUAL.environment.night : VISUAL.environment.day
      }
    />
  </Suspense>
);

// Sky, fog, image-based light, and a classic three-light rig: the sun as
// key (with soft shadows), a cool rim light from behind and the sky fill.
const WorldAtmosphere = ({
  palette,
  shadows,
  shadowMapSize,
}: WorldAtmosphereProps) => {
  const light = palette.isNight ? VISUAL.light.night : VISUAL.light.day;
  const sunRef = useRef<DirectionalLight>(null);
  const skyRef = useRef<HemisphereLight>(null);
  const rimRef = useRef<DirectionalLight>(null);

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
    if (rimRef.current) {
      rimRef.current.intensity = light.rim * dim;
    }
    if (skyRef.current) {
      skyRef.current.intensity = light.hemisphere * (0.4 + dim * 0.6);
    }
  });

  return (
    <>
      <SkyDome palette={palette} />
      <SkyLight palette={palette} />
      <directionalLight
        ref={rimRef}
        position={[-SUN[0], SUN[1] * 0.6, -SUN[2]]}
        color={palette.skyTop}
        intensity={light.rim}
      />
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
