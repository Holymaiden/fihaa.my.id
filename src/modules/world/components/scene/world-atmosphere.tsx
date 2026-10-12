'use client';

import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import SkyDome from './sky-dome';

interface WorldAtmosphereProps {
  palette: WorldPalette;
}

// Sky, fog and two cheap lights (no shadows).
const WorldAtmosphere = ({ palette }: WorldAtmosphereProps) => {
  const light = palette.isNight ? VISUAL.light.night : VISUAL.light.day;

  return (
    <>
      <SkyDome palette={palette} />
      <fog attach="fog" args={[palette.fog, VISUAL.fog.near, VISUAL.fog.far]} />
      <hemisphereLight
        args={[palette.skyHorizon, palette.groundLight, light.hemisphere]}
      />
      <directionalLight
        position={VISUAL.light.sunPosition}
        color={palette.sun}
        intensity={light.sun}
      />
    </>
  );
};

export default WorldAtmosphere;
