'use client';

import { PerformanceMonitor, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import type { Mesh } from 'three';

import type { WorldContent } from '@/lib/content/types';

import type { SurfaceStationId } from '../config/island';
import { VISUAL } from '../config/visual';
import { useEffectsEnabled } from '../hooks/use-effects-enabled';
import { useSceneQuality } from '../hooks/use-scene-quality';
import { useWorldPalette } from '../hooks/use-world-palette';
import { useWorldStore } from '../store/world-store';
import CameraDirector from './scene/camera-director';
import CloudSea from './scene/cloud-sea';
import CrystalHunt from './scene/crystal-hunt';
import DistantIslands from './scene/distant-islands';
import DistantRange from './scene/distant-range';
import ExploreCamera from './scene/explore-camera';
import FloatingCard from './scene/floating-card';
import FloatingIslet from './scene/floating-islet';
import FovDirector from './scene/fov-director';
import GroundCursor from './scene/ground-cursor';
import GuildHall from './scene/guild-hall';
import IslandDecor from './scene/island-decor';
import IslandRig from './scene/island-rig';
import IslandStation from './scene/island-station';
import IslandTerrain from './scene/island-terrain';
import IslandWater from './scene/island-water';
import KitRecolor from './scene/kit-recolor';
import MeadowGrass from './scene/meadow-grass';
import MeadowLife from './scene/meadow-life';
import Pampas from './scene/pampas';
import { endedDragJustNow } from './scene/pointer';
import Rain from './scene/rain';
import { LensRainClock } from './scene/rain-lens';
import ShadowUpdater from './scene/shadow-updater';
import type { StationCounts } from './scene/station-extras';
import StationLabels from './scene/station-labels';
import SunDisc from './scene/sun-disc';
import TourCamera from './scene/tour-camera';
import TrailMap from './scene/trail-map';
import VaultLedge from './scene/vault-ledge';
import ViewpointMarkers from './scene/viewpoint-markers';
import WaterBanks from './scene/water-banks';
import WeatherDirector from './scene/weather-director';
import Wildlife from './scene/wildlife';
import WindClock from './scene/wind-clock';
import WorldAtmosphere from './scene/world-atmosphere';
import WorldClouds from './scene/world-clouds';
import WorldPost from './scene/world-post';
import WorldProgress from './world-progress';
import {
  isDebugCameraEnabled,
  isStatsEnabled,
  WorldDebugCamera,
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
  const [debugCamera] = useState(isDebugCameraEnabled);
  const effects = useEffectsEnabled();
  const quality = useSceneQuality();
  // The sun mesh, once mounted, is the god rays' light source.
  const [sun, setSun] = useState<Mesh | null>(null);
  const surfaceStations = stations
    .map((station) => station.id)
    .filter(
      (id): id is SurfaceStationId => id !== 'secret' && id !== 'profile',
    );
  const hasVault = stations.some((station) => station.id === 'secret');

  return (
    <>
      <Canvas
        camera={{ fov: VISUAL.camera.fov, near: 0.1, far: 400 }}
        dpr={quality.dpr}
        shadows="soft"
        // Tone mapping happens in the post-processing pass, so the
        // renderer itself writes linear HDR.
        flat
        gl={{ toneMappingExposure: VISUAL.exposure, antialias: false }}
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
          onChange={quality.onChange}
          onFallback={quality.onFallback}
        />
        <WorldAtmosphere
          palette={palette}
          shadows={quality.shadows}
          shadowMapSize={quality.shadowMapSize}
        />
        {quality.shadows && <ShadowUpdater palette={palette} />}
        <CloudSea palette={palette} />
        {!palette.isNight && <SunDisc palette={palette} ref={setSun} />}
        <DistantIslands palette={palette} />
        <DistantRange palette={palette} />
        {palette.isNight && (
          <Stars radius={200} depth={50} count={2500} factor={5} fade />
        )}
        <Suspense fallback={null}>
          <KitRecolor palette={palette} />
          <WorldClouds palette={palette} />
          <IslandRig>
            <IslandTerrain palette={palette} lite={quality.liteTerrain} />
            <MeadowGrass palette={palette} density={quality.grassDensity} />
            <GroundCursor palette={palette} />
            <MeadowLife palette={palette} />
            <Pampas palette={palette} />
            {effects && <Wildlife palette={palette} />}
            <IslandWater palette={palette} />
            <FloatingIslet palette={palette} />
            <WaterBanks palette={palette} />
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
        <WorldPost
          palette={palette}
          quality={quality.postQuality}
          sun={palette.isNight ? null : sun}
        />
        <WeatherDirector palette={palette} />
        <WindClock />
        <TrailMap />
        <LensRainClock />
        {effects && <Rain palette={palette} narrow={quality.narrow} />}
        {showStats && <WorldStatsProbe />}
        {debugCamera && <WorldDebugCamera />}
      </Canvas>
      <WorldProgress label={content.copy.loadingAssets} />
      {showStats && <WorldStatsOverlay />}
    </>
  );
};

export default WorldScene;
