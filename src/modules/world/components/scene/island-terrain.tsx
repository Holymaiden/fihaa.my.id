'use client';

import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';

import { STATION_ORDER, stationAnchor } from '../../config/island';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import { buildIslandGeometry } from './island-geometry';
import { isDrag } from './pointer';

interface IslandTerrainProps {
  palette: WorldPalette;
}

// Clicks within this distance of a station open it.
const STATION_HIT_RADIUS = 4;

const IslandTerrain = ({ palette }: IslandTerrainProps) => {
  const openStation = useWorldStore((state) => state.openStation);
  const { grassLight, grass, sand, cliff, rock, rockDeep } = palette;

  const geometry = useMemo(
    () =>
      buildIslandGeometry({ grassLight, grass, sand, cliff, rock, rockDeep }),
    [grassLight, grass, sand, cliff, rock, rockDeep],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Clicking the ground near a station opens it.
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (isDrag(event)) {
      return;
    }
    const local = event.object.worldToLocal(event.point.clone());
    const nearest = STATION_ORDER.map((id) => {
      const [x, , z] = stationAnchor(id);
      return { id, distance: Math.hypot(local.x - x, local.z - z) };
    }).sort((a, b) => a.distance - b.distance)[0];
    if (nearest.distance < STATION_HIT_RADIUS) {
      event.stopPropagation();
      openStation(nearest.id);
    }
  };

  return (
    <mesh geometry={geometry} receiveShadow castShadow onClick={handleClick}>
      <meshStandardMaterial vertexColors roughness={0.95} />
    </mesh>
  );
};

export default IslandTerrain;
