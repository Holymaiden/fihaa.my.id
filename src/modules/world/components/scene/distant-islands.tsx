'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';

import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { buildIslandGeometry } from './island-geometry';

interface DistantIslandsProps {
  palette: WorldPalette;
}

// Far-off islands on the horizon (position, size, turn), so the world goes
// on past the one you're on. They share the main island's mesh.
const ISLANDS: {
  position: [number, number, number];
  scale: number;
  turn: number;
}[] = [
  { position: [-95, -6, -120], scale: 0.42, turn: 1.2 },
  { position: [120, 4, -85], scale: 0.3, turn: 2.6 },
  { position: [-150, 10, 40], scale: 0.26, turn: 4.1 },
  { position: [70, -14, 140], scale: 0.36, turn: 0.4 },
  { position: [165, -2, 60], scale: 0.2, turn: 5.3 },
];

const DistantIslands = ({ palette }: DistantIslandsProps) => {
  const effects = useEffectsEnabled();
  const groupRef = useRef<Group>(null);
  const { grassLight, grass, sand, cliff, rock, rockDeep } = palette;
  const geometry = useMemo(
    () =>
      buildIslandGeometry(
        {
          grassLight,
          grass: grassLight,
          sand,
          cliff,
          rock,
          rockDeep,
          path: grass,
          waterDeep: grass,
        },
        0.25,
      ),
    // No paths or ponds out there: both are painted as grass.
    [grassLight, grass, sand, cliff, rock, rockDeep],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  // They drift up and down very slowly, like boats at anchor.
  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group || !effects) {
      return;
    }
    group.children.forEach((child, index) => {
      child.position.y =
        ISLANDS[index].position[1] +
        Math.sin(clock.elapsedTime * 0.15 + index * 1.7) * 1.2;
    });
  });

  return (
    <group ref={groupRef}>
      {ISLANDS.map(({ position, scale, turn }, index) => (
        <mesh
          key={index}
          geometry={geometry}
          position={position}
          rotation-y={turn}
          scale={scale}
          raycast={() => null}
        >
          <meshStandardMaterial vertexColors roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
};

export default DistantIslands;
