import type { Vec3 } from '../../config/layout';

interface FloatingIslandProps {
  position: Vec3;
  radius: number;
  topColor: string;
  sideColor: string;
}

const TOP_HEIGHT = 1;
const SEGMENTS = 8;

// Greybox island: flat top disc plus an upside-down cone of rock.
const FloatingIsland = ({
  position,
  radius,
  topColor,
  sideColor,
}: FloatingIslandProps) => {
  const coneHeight = radius * 1.6;

  return (
    <group position={position}>
      <mesh position={[0, -TOP_HEIGHT / 2, 0]} receiveShadow>
        <cylinderGeometry
          args={[radius, radius * 0.92, TOP_HEIGHT, SEGMENTS]}
        />
        <meshStandardMaterial color={topColor} flatShading />
      </mesh>
      <mesh
        position={[0, -TOP_HEIGHT - coneHeight / 2, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[radius * 0.92, coneHeight, SEGMENTS]} />
        <meshStandardMaterial color={sideColor} flatShading />
      </mesh>
    </group>
  );
};

export default FloatingIsland;
