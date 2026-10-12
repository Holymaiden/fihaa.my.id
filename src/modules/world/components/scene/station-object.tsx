'use client';

import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { Suspense } from 'react';

import type { WorldStationId } from '@/lib/content/types';

import { islandRadius, STATION_LAYOUT } from '../../config/layout';
import { STATION_PROPS } from '../../config/props';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import KitModel from './kit-model';
import type { StationCounts } from './station-extras';
import StationExtras from './station-extras';
import VaultProps from './vault-props';

interface StationObjectProps {
  id: WorldStationId;
  palette: WorldPalette;
  counts: StationCounts;
}

const SelectionRing = ({
  radius,
  color,
}: {
  radius: number;
  color: string;
}) => (
  <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[radius - 0.35, radius, 6, 1, Math.PI / 6]} />
    <meshBasicMaterial color={color} />
  </mesh>
);

const StationObject = ({ id, palette, counts }: StationObjectProps) => {
  const layout = STATION_LAYOUT[id];
  const isActive = useWorldStore((state) => state.activeStation === id);
  const isHovered = useWorldStore((state) => state.hoveredStation === id);
  const vaultRequested = useWorldStore((state) => state.vaultRequested);
  const openStation = useWorldStore((state) => state.openStation);
  const setHoveredStation = useWorldStore((state) => state.setHoveredStation);

  useCursor(isHovered);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    openStation(id);
  };

  return (
    <group
      position={layout.position}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHoveredStation(id);
      }}
      onPointerOut={() => setHoveredStation(null)}
    >
      {(isActive || isHovered) && (
        <SelectionRing
          radius={islandRadius(layout)}
          color={isActive ? palette.stationActive : palette.stationHover}
        />
      )}
      {id === 'secret'
        ? vaultRequested && (
            <Suspense fallback={null}>
              <VaultProps />
            </Suspense>
          )
        : STATION_PROPS[id].map((placement, index) => (
            <KitModel key={index} kit="core" placement={placement} />
          ))}
      <StationExtras id={id} palette={palette} counts={counts} />
    </group>
  );
};

export default StationObject;
