import type { Vec3 } from '../../config/layout';

interface IslandRockProps {
  position: Vec3;
  radius: number;
  color: string;
}

// The hex tiles are 1 unit thick; the rock hangs below them.
const TILE_DEPTH = 1;
const SEGMENTS = 7;

// Upside-down rock cone under a floating island.
const IslandRock = ({ position, radius, color }: IslandRockProps) => {
  const height = radius * 1.5;

  return (
    <mesh
      position={[
        position[0],
        position[1] - TILE_DEPTH - height / 2,
        position[2],
      ]}
      rotation={[Math.PI, 0.3, 0]}
    >
      <coneGeometry args={[radius * 0.95, height, SEGMENTS]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
};

export default IslandRock;
