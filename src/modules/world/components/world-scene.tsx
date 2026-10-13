'use client';

import { PerformanceMonitor, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';

import type { WorldContent } from '@/lib/content/types';

import { NARROW_MAX_WIDTH } from '../config/camera';
import type { SurfaceStationId } from '../config/island';
import { VISUAL } from '../config/visual';
import { useEffectsEnabled } from '../hooks/use-effects-enabled';
import { useWorldPalette } from '../hooks/use-world-palette';
import { useWorldStore } from '../store/world-store';
import CameraDirector from './scene/camera-director';
import CloudSea from './scene/cloud-sea';
import CrystalHunt from './scene/crystal-hunt';
import ExploreCamera from './scene/explore-camera';
import FloatingCard from './scene/floating-card';
import FovDirector from './scene/fov-director';
import GuildHall from './scene/guild-hall';
import IslandDecor from './scene/island-decor';
import IslandRig from './scene/island-rig';
import IslandStation from './scene/island-station';
import IslandTerrain from './scene/island-terrain';
import IslandWater from './scene/island-water';
import KitRecolor from './scene/kit-recolor';
import MeadowGrass from './scene/meadow-grass';
import MeadowLife from './scene/meadow-life';
import { endedDragJustNow } from './scene/pointer';
import Rain from './scene/rain';
import ShadowUpdater from './scene/shadow-updater';
import type { StationCounts } from './scene/station-extras';
import StationLabels from './scene/station-labels';
import TourCamera from './scene/tour-camera';
import VaultLedge from './scene/vault-ledge';
import ViewpointMarkers from './scene/viewpoint-markers';
import WeatherDirector from './scene/weather-director';
import Wildlife from './scene/wildlife';
import WorldAtmosphere from './scene/world-atmosphere';
import WorldClouds from './scene/world-clouds';
import WorldProgress from './world-progress';
import {
  isStatsEnabled,
  WorldStatsOverlay,
  WorldStatsProbe,
} from './world-stats';

interface WorldSceneProps {
  content: WorldContent;
  onContextLost: () => void;
}

const WorldScene = ({ content, onContextLost }: WorldSceneProps) => {
  const { stations } = content;
  const counts: StationCounts = {
    projects: content.projects.length,
    skillGroups: content.skillGroups.length,
  };
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
  const [grassDensity, setGrassDensity] = useState(() =>
    window.innerWidth < NARROW_MAX_WIDTH ? VISUAL.grass.narrowDensity : 1,
  );
  const [shadowMapSize] = useState(() =>
    window.innerWidth < NARROW_MAX_WIDTH
      ? VISUAL.shadows.narrowMapSize
      : VISUAL.shadows.mapSize,
  );
  const surfaceStations = stations
    .map((station) => station.id)
    .filter(
      (id): id is SurfaceStationId => id !== 'secret' && id !== 'profile',
    );
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
        camera={{ fov: VISUAL.camera.fov, near: 0.1, far: 400 }}
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
        onCreated={({ gl }) => {
          // Only the <canvas> is decorative: labels and cards rendered by
          // drei's Html live in the same wrapper and must stay accessible.
          gl.domElement.setAttribute('aria-hidden', 'true');
          gl.domElement.addEventListener('webglcontextlost', onContextLost, {
            once: true,
          });
        }}
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
            setGrassDensity((density) =>
              Math.min(density, VISUAL.grass.fallbackDensity),
            );
          }}
        />
        <WorldAtmosphere
          palette={palette}
          shadows={shadows}
          shadowMapSize={shadowMapSize}
        />
        {shadows && <ShadowUpdater palette={palette} />}
        <CloudSea palette={palette} />
        {palette.isNight && (
          <Stars radius={200} depth={50} count={2500} factor={5} fade />
        )}
        <Suspense fallback={null}>
          <KitRecolor palette={palette} />
          <WorldClouds />
          <IslandRig>
            <IslandTerrain palette={palette} />
            <MeadowGrass palette={palette} density={grassDensity} />
            <MeadowLife palette={palette} />
            {effects && <Wildlife palette={palette} />}
            <IslandWater palette={palette} />
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
            <CrystalHunt palette={palette} />
            <StationLabels stations={stations} />
            <FloatingCard content={content} />
            <ViewpointMarkers
              palette={palette}
              scenicNames={content.copy.scenicPlaces}
            />
          </IslandRig>
        </Suspense>
        <CameraDirector />
        <ExploreCamera />
        <TourCamera />
        <FovDirector />
        <WeatherDirector palette={palette} />
        {effects && <Rain palette={palette} narrow={grassDensity < 1} />}
        {showStats && <WorldStatsProbe />}
      </Canvas>
      <WorldProgress label={content.copy.loadingAssets} />
      {showStats && <WorldStatsOverlay />}
    </>
  );
};

export default WorldScene;
