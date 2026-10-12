'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import type { WorldStation } from '@/lib/content/types';

import { VISUAL } from '../config/visual';
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

interface WorldSceneProps {
  stations: WorldStation[];
  counts: StationCounts;
  loadingLabel: string;
}

const WorldScene = ({ stations, counts, loadingLabel }: WorldSceneProps) => {
  const palette = useWorldPalette();
  const closeStation = useWorldStore((state) => state.closeStation);

  return (
    <>
      <Canvas
        camera={{ fov: 45, near: 0.5, far: 400 }}
        dpr={VISUAL.dpr}
        flat={VISUAL.flat}
        // Clicking empty sky goes back to the overview.
        onPointerMissed={closeStation}
        aria-hidden
      >
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
      </Canvas>
      <WorldProgress label={loadingLabel} />
    </>
  );
};

export default WorldScene;
