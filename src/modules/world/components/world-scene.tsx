'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';

import type { WorldStation } from '@/lib/content/types';

import { VISUAL } from '../config/visual';
import { useEffectsEnabled } from '../hooks/use-effects-enabled';
import { useWorldPalette } from '../hooks/use-world-palette';
import { useWorldStore } from '../store/world-store';
import CameraRig from './scene/camera-rig';
import GuildHall from './scene/guild-hall';
import KitRecolor from './scene/kit-recolor';
import type { StationCounts } from './scene/station-extras';
import StationObject from './scene/station-object';
import WorldAtmosphere from './scene/world-atmosphere';
import WorldClouds from './scene/world-clouds';
import WorldIslands from './scene/world-islands';
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
        flat={VISUAL.flat}
        // Nothing moves when effects are off, so only render on change.
        frameloop={effects ? 'always' : 'demand'}
        // Clicking empty sky goes back to the overview.
        onPointerMissed={closeStation}
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
          onFallback={() => setDpr(VISUAL.dpr[0])}
        />
        <WorldAtmosphere palette={palette} />
        <Suspense fallback={null}>
          <KitRecolor palette={palette} />
          <WorldClouds />
          <WorldIslands
            stations={stations.map((station) => station.id)}
            palette={palette}
          />
          <GuildHall />
          {stations.map((station) => (
            <StationObject
              key={station.id}
              id={station.id}
              palette={palette}
              counts={counts}
            />
          ))}
        </Suspense>
        <CameraRig />
        {showStats && <WorldStatsProbe />}
      </Canvas>
      <WorldProgress label={loadingLabel} />
      {showStats && <WorldStatsOverlay />}
    </>
  );
};

export default WorldScene;
