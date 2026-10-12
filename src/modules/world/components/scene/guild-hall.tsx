'use client';

import type { ThreeEvent } from '@react-three/fiber';

import { GUILD_LAYOUT } from '../../config/layout';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import FloatingIsland from './floating-island';

interface GuildHallProps {
  palette: WorldPalette;
}

const TOWER_SPOTS: [number, number][] = [
  [-1.6, -1.6],
  [1.6, -1.6],
  [-1.6, 1.6],
  [1.6, 1.6],
];

// Greybox of the guild castle in the middle. Clicking it goes back to the
// overview.
const GuildHall = ({ palette }: GuildHallProps) => {
  const closeStation = useWorldStore((state) => state.closeStation);
  const material = <meshStandardMaterial color={palette.guild} flatShading />;

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    closeStation();
  };

  return (
    <group>
      <FloatingIsland
        position={GUILD_LAYOUT.position}
        radius={GUILD_LAYOUT.radius}
        topColor={palette.islandTop}
        sideColor={palette.islandSide}
      />
      <group position={GUILD_LAYOUT.position} onClick={handleClick}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[3.2, 3, 3.2]} />
          {material}
        </mesh>
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 2, 8]} />
          {material}
        </mesh>
        <mesh position={[0, 5.7, 0]}>
          <coneGeometry args={[1.2, 1.4, 8]} />
          {material}
        </mesh>
        {TOWER_SPOTS.map(([x, z]) => (
          <group key={`${x}:${z}`} position={[x, 0, z]}>
            <mesh position={[0, 1.9, 0]}>
              <cylinderGeometry args={[0.55, 0.6, 3.8, 8]} />
              {material}
            </mesh>
            <mesh position={[0, 4.3, 0]}>
              <coneGeometry args={[0.75, 1, 8]} />
              {material}
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

export default GuildHall;
