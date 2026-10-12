'use client';

import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

import type { WorldStationId } from '@/lib/content/types';

import { STATION_LAYOUT } from '../../config/layout';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import FloatingIsland from './floating-island';
import StationShape from './station-shape';

interface StationObjectProps {
  id: WorldStationId;
  palette: WorldPalette;
}

const StationObject = ({ id, palette }: StationObjectProps) => {
  const { position, radius } = STATION_LAYOUT[id];
  const isActive = useWorldStore((state) => state.activeStation === id);
  const isHovered = useWorldStore((state) => state.hoveredStation === id);
  const openStation = useWorldStore((state) => state.openStation);
  const setHoveredStation = useWorldStore((state) => state.setHoveredStation);

  useCursor(isHovered);

  const shapeColor = isActive
    ? palette.stationActive
    : isHovered
      ? palette.stationHover
      : palette.station;

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    openStation(id);
  };

  return (
    <group>
      <FloatingIsland
        position={position}
        radius={radius}
        topColor={id === 'secret' ? palette.secret : palette.islandTop}
        sideColor={id === 'secret' ? palette.secret : palette.islandSide}
      />
      <group
        position={position}
        onClick={handleClick}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHoveredStation(id);
        }}
        onPointerOut={() => setHoveredStation(null)}
      >
        <StationShape id={id} color={shapeColor} />
      </group>
    </group>
  );
};

export default StationObject;
