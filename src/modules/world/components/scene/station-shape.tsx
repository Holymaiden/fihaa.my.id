import type { WorldStationId } from '@/lib/content/types';

interface StationShapeProps {
  id: WorldStationId;
  color: string;
}

// Greybox stand-ins, one rough silhouette per station. Replaced by models
// in Phase 8.
const StationShape = ({ id, color }: StationShapeProps) => {
  const material = <meshStandardMaterial color={color} flatShading />;

  switch (id) {
    case 'projects':
      // Quest board on two posts.
      return (
        <group>
          {[-1.3, 1.3].map((x) => (
            <mesh key={x} position={[x, 1.2, 0]}>
              <boxGeometry args={[0.2, 2.4, 0.2]} />
              {material}
            </mesh>
          ))}
          <mesh position={[0, 1.6, 0.05]}>
            <boxGeometry args={[2.8, 1.6, 0.15]} />
            {material}
          </mesh>
        </group>
      );
    case 'skills':
      // Big tree.
      return (
        <group>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.3, 0.45, 2.4, 6]} />
            {material}
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <icosahedronGeometry args={[1.8, 0]} />
            {material}
          </mesh>
        </group>
      );
    case 'experience':
      // Open journal on a lectern.
      return (
        <group>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.8, 1, 0.8]} />
            {material}
          </mesh>
          <mesh position={[0, 1.1, 0]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[1.4, 0.15, 1]} />
            {material}
          </mesh>
        </group>
      );
    case 'contact':
      // Tavern with a mailbox in front.
      return (
        <group>
          <mesh position={[0, 1, -0.8]}>
            <boxGeometry args={[2.6, 2, 2]} />
            {material}
          </mesh>
          <mesh position={[0, 2.6, -0.8]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[2, 1.2, 4]} />
            {material}
          </mesh>
          <mesh position={[1.6, 0.6, 1.2]}>
            <boxGeometry args={[0.12, 1.2, 0.12]} />
            {material}
          </mesh>
          <mesh position={[1.6, 1.3, 1.2]}>
            <boxGeometry args={[0.5, 0.4, 0.7]} />
            {material}
          </mesh>
        </group>
      );
    case 'secret':
      // Crystal under an arch.
      return (
        <group>
          <mesh position={[0, 1.3, 0]}>
            <octahedronGeometry args={[0.8, 0]} />
            {material}
          </mesh>
          {[-1.4, 1.4].map((x) => (
            <mesh key={x} position={[x, 1.2, -0.6]}>
              <boxGeometry args={[0.4, 2.4, 0.4]} />
              {material}
            </mesh>
          ))}
          <mesh position={[0, 2.6, -0.6]}>
            <boxGeometry args={[3.2, 0.4, 0.4]} />
            {material}
          </mesh>
        </group>
      );
  }
};

export default StationShape;
