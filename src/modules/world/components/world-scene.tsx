'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';

import type { WorldStation } from '@/lib/content/types';

import { NARROW_MAX_WIDTH } from '../config/camera';
import type { SurfaceStationId } from '../config/island';
import { VISUAL } from '../config/visual';
import { useEffectsEnabled } from '../hooks/use-effects-enabled';
import { useWorldPalette } from '../hooks/use-world-palette';
import { useWorldStore } from '../store/world-store';
import CameraDirector from './scene/camera-director';
import GuildHall from './scene/guild-hall';
import IslandDecor from './scene/island-decor';
import IslandRig from './scene/island-rig';
import IslandStation from './scene/island-station';
import IslandTerrain from './scene/island-terrain';
import KitRecolor from './scene/kit-recolor';
import { endedDragJustNow } from './scene/pointer';
import ShadowUpdater from './scene/shadow-updater';
import type { StationCounts } from './scene/station-extras';
import VaultLedge from './scene/vault-ledge';
import WorldAtmosphere from './scene/world-atmosphere';
import WorldClouds from './scene/world-clouds';
import WorldProgress from './world-progress';
import {
  isStatsEnabled,
  WorldStatsOverlay,
  WorldStatsProbe,
} from './world-stats';

interface WorldSceneProps {
  stations: WorldStation[];
  counts: StationCounts;
  loadingLabel: string;
  onContextLost: () => void;
}

const WorldScene = ({
  stations,
  counts,
  loadingLabel,
  onContextLost,
}: WorldSceneProps) => {
  const palette = useWorldPalette();
  const closeStation = useWorldStore((state) => state.closeStation);
  // Read once; the scene is client only, so window is available.
  const [showStats] = useState(isStatsEnabled);
  const effects = useEffectsEnabled();
  // Highest pixel ratio this screen can use, within the configured cap.
  const [maxDpr] = useState(() =>
    Math.min(window.devicePixelRatio, VISUAL.dpr[1]),
  );
  const [dpr, setDpr] = useState(maxDpr);
  const [shadows, setShadows] = useState(true);
  const [shadowMapSize] = useState(() =>
    window.innerWidth < NARROW_MAX_WIDTH
      ? VISUAL.shadows.narrowMapSize
      : VISUAL.shadows.mapSize,
  );
  const surfaceStations = stations
    .map((station) => station.id)
    .filter((id): id is SurfaceStationId => id !== 'secret');
  const hasVault = stations.some((station) => station.id === 'secret');

  // Fill rate dominates on phones (2x pixels ~ 2.2x frame time, see
  // 14-rilis.md), so lower the pixel ratio while frames are slow.
  const handlePerformance = ({ factor }: { factor: number }) =>
    setDpr(
      Math.max(
        VISUAL.dpr[0],
        Math.round(maxDpr * (0.5 + factor / 2) * 10) / 10,
      ),
    );

  return (
    <>
      <Canvas
        camera={{ fov: 45, near: 0.5, far: 400 }}
        dpr={dpr}
        shadows="soft"
        gl={{ toneMappingExposure: VISUAL.exposure }}
        style={{ touchAction: 'none' }}
        // Nothing moves when effects are off, so only render on change.
        frameloop={effects ? 'always' : 'demand'}
        // Clicking empty sky goes back to the overview (but not the click
        // that ends a drag).
        onPointerMissed={() => {
          if (!endedDragJustNow()) {
            closeStation();
          }
        }}
        aria-hidden
        onCreated={({ gl }) =>
          gl.domElement.addEventListener('webglcontextlost', onContextLost, {
            once: true,
          })
        }
      >
        <PerformanceMonitor
          factor={1}
          step={0.2}
          flipflops={3}
          onChange={handlePerformance}
          onFallback={() => {
            // Still slow at the lowest pixel ratio: drop the shadows too.
            setDpr(VISUAL.dpr[0]);
            setShadows(false);
          }}
        />
        <WorldAtmosphere
          palette={palette}
          shadows={shadows}
          shadowMapSize={shadowMapSize}
        />
        {shadows && <ShadowUpdater palette={palette} />}
        <Suspense fallback={null}>
          <KitRecolor palette={palette} />
          <WorldClouds />
          <IslandRig>
            <IslandTerrain palette={palette} />
            <GuildHall />
            <IslandDecor />
            {surfaceStations.map((id) => (
              <IslandStation
                key={id}
                id={id}
                palette={palette}
                counts={counts}
              />
            ))}
            {hasVault && <VaultLedge palette={palette} />}
          </IslandRig>
        </Suspense>
        <CameraDirector />
        {showStats && <WorldStatsProbe />}
      </Canvas>
      <WorldProgress label={loadingLabel} />
      {showStats && <WorldStatsOverlay />}
    </>
  );
};

export default WorldScene;
