'use client';

import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';

import { STATION_ORDER, stationAnchor } from '../../config/island';
import { isWalkable } from '../../config/viewpoint-search';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import { interaction } from './interaction';
import { buildIslandGeometry } from './island-geometry';
import { isDrag } from './pointer';

interface IslandTerrainProps {
  palette: WorldPalette;
}

// Clicks within this distance of a station open it.
const STATION_HIT_RADIUS = 4;

const IslandTerrain = ({ palette }: IslandTerrainProps) => {
  const openStation = useWorldStore((state) => state.openStation);
  const walkTo = useWorldStore((state) => state.walkTo);
  const { grassLight, grass, sand, cliff, rock, rockDeep, path, waterDeep } =
    palette;

  const geometry = useMemo(
    () =>
      buildIslandGeometry({
        grassLight,
        grass,
        sand,
        cliff,
        rock,
        rockDeep,
        path,
        waterDeep,
      }),
    [grassLight, grass, sand, cliff, rock, rockDeep, path, waterDeep],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  // The grass parts where the pointer touches the ground.
  const handleMove = (event: ThreeEvent<PointerEvent>) => {
    const local = event.object.worldToLocal(event.point.clone());
    Object.assign(interaction.touch, { x: local.x, z: local.z, goal: 1 });
  };

  // Clicking the ground near a station opens it; elsewhere, while
  // exploring, the visitor walks to the spot.
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
    } else if (
      useWorldStore.getState().mode === 'explore' &&
      isWalkable(local.x, local.z)
    ) {
      event.stopPropagation();
      walkTo([local.x, local.z]);
    }
  };

  return (
    <mesh
      geometry={geometry}
      receiveShadow
      castShadow
      onClick={handleClick}
      onPointerMove={handleMove}
      onPointerOut={() => (interaction.touch.goal = 0)}
    >
      <meshStandardMaterial vertexColors roughness={0.95} />
    </mesh>
  );
};

export default IslandTerrain;
