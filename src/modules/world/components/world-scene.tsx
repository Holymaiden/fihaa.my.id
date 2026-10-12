'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import type { WorldStation } from '@/lib/content/types';

import { useWorldPalette } from '../hooks/use-world-palette';
import { useWorldStore } from '../store/world-store';
import CameraRig from './scene/camera-rig';
import GuildHall from './scene/guild-hall';
import StationObject from './scene/station-object';
import WorldProgress from './world-progress';

interface WorldSceneProps {
  stations: WorldStation[];
  loadingLabel: string;
}

const WorldScene = ({ stations, loadingLabel }: WorldSceneProps) => {
  const palette = useWorldPalette();
  const closeStation = useWorldStore((state) => state.closeStation);

  return (
    <>
      <Canvas
        camera={{ fov: 45, near: 0.5, far: 300 }}
        dpr={[1, 2]}
        // Clicking empty sky goes back to the overview.
        onPointerMissed={closeStation}
        aria-hidden
      >
        <color attach="background" args={[palette.sky]} />
        <hemisphereLight args={[palette.sky, palette.islandSide, 1.4]} />
        <directionalLight position={[20, 30, 15]} intensity={1.6} />
        <Suspense fallback={null}>
          <GuildHall palette={palette} />
          {stations.map((station) => (
            <StationObject key={station.id} id={station.id} palette={palette} />
          ))}
        </Suspense>
        <CameraRig />
      </Canvas>
      <WorldProgress label={loadingLabel} />
    </>
  );
};

export default WorldScene;
