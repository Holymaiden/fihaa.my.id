'use client';

import { SHADOW_EXTENT } from '../../config/camera';
import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import SkyDome from './sky-dome';

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

  return (
    <>
      <SkyDome palette={palette} />
      <fog attach="fog" args={[palette.fog, VISUAL.fog.near, VISUAL.fog.far]} />
      <hemisphereLight
        args={[palette.sun, palette.groundLight, light.hemisphere]}
      />
      <directionalLight
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
