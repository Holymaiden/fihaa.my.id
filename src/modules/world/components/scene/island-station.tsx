'use client';

import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';

import type { SurfaceStationId } from '../../config/island';
import { STATION_ANGLES, stationAnchor } from '../../config/island';
import { STATION_PROPS } from '../../config/props';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import { toIsland } from './island-frame';
import KitModel from './kit-model';
import { isDrag } from './pointer';
import type { StationCounts } from './station-extras';
import StationExtras from './station-extras';

interface IslandStationProps {
  id: SurfaceStationId;
  palette: WorldPalette;
  counts: StationCounts;
}

const RING_RADIUS = 3.4;
// The ring floats a little so it clears the gentle hills.
const RING_LIFT = 0.35;

// One station on the island: its models, its hand-built piece and a ring
// that shows hover/selection.
const IslandStation = ({ id, palette, counts }: IslandStationProps) => {
  const anchor = stationAnchor(id);
  const angle = STATION_ANGLES[id];
  const isActive = useWorldStore((state) => state.activeStation === id);
  const isHovered = useWorldStore((state) => state.hoveredStation === id);
  const openStation = useWorldStore((state) => state.openStation);
  const setHoveredStation = useWorldStore((state) => state.setHoveredStation);

  useCursor(isHovered);

  const props = useMemo(
    () =>
      STATION_PROPS[id].map((placement) =>
        toIsland(placement, stationAnchor(id), STATION_ANGLES[id]),
      ),
    [id],
  );

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (isDrag(event)) {
      return;
    }
    event.stopPropagation();
    openStation(id);
  };

  return (
    <group
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHoveredStation(id);
      }}
      onPointerOut={() => setHoveredStation(null)}
    >
      {props.map((placement, index) => (
        <KitModel key={index} kit="core" placement={placement} />
      ))}
      <group position={anchor} rotation-y={angle}>
        <StationExtras id={id} palette={palette} counts={counts} />
        {(isActive || isHovered) && (
          <mesh position={[0, RING_LIFT, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[RING_RADIUS - 0.25, RING_RADIUS, 48]} />
            <meshBasicMaterial
              color={isActive ? palette.stationActive : palette.stationHover}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default IslandStation;
