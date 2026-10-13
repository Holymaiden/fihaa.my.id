'use client';

import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { Group } from 'three';
import { AdditiveBlending, MathUtils } from 'three';

import type { CrystalSpot } from '../../config/crystals';
import { CRYSTAL_PICKUP_DISTANCE, CRYSTALS } from '../../config/crystals';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import { interaction } from './interaction';
import { isDrag } from './pointer';

interface CrystalHuntProps {
  palette: WorldPalette;
}

// Seconds the pick-up flourish lasts.
const PICKUP_SECONDS = 0.9;

const Crystal = ({
  spot,
  palette,
  found,
}: {
  spot: CrystalSpot;
  palette: WorldPalette;
  found: boolean;
}) => {
  const groupRef = useRef<Group>(null);
  const collectCrystal = useWorldStore((state) => state.collectCrystal);
  const effects = useEffectsEnabled();
  const [hovered, setHovered] = useState(false);
  // Clock time of the pick-up, so it can rise and fade before it goes.
  const pickedAt = useRef<number | null>(null);
  const [gone, setGone] = useState(found);
  useCursor(hovered && !found);

  useFrame(({ clock, invalidate }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const time = clock.elapsedTime;
    // Found in explore mode by walking up to it.
    if (!found && interaction.walker.active) {
      const distance = Math.hypot(
        interaction.walker.x - spot.position[0],
        interaction.walker.z - spot.position[2],
      );
      if (distance < CRYSTAL_PICKUP_DISTANCE) {
        collectCrystal(spot.id);
      }
    }
    if (found && pickedAt.current === null) {
      pickedAt.current = time;
    }
    const bob = effects ? Math.sin(time * 1.6 + spot.position[0]) * 0.15 : 0;
    group.rotation.y = effects ? time * 1.2 : 0;
    if (pickedAt.current === null) {
      group.position.set(
        spot.position[0],
        spot.position[1] + bob,
        spot.position[2],
      );
      group.scale.setScalar(hovered ? 1.25 : 1);
      return;
    }
    const share = Math.min((time - pickedAt.current) / PICKUP_SECONDS, 1);
    group.position.set(
      spot.position[0],
      spot.position[1] + bob + share * 2.2,
      spot.position[2],
    );
    group.scale.setScalar(MathUtils.lerp(1.4, 0, share * share));
    group.rotation.y += share * 6;
    if (share >= 1) {
      setGone(true);
    } else {
      invalidate();
    }
  });

  if (gone) {
    return null;
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (isDrag(event)) {
      return;
    }
    event.stopPropagation();
    collectCrystal(spot.id);
  };

  return (
    <group ref={groupRef} position={spot.position}>
      <mesh
        onClick={handleClick}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        scale={[0.32, 0.55, 0.32]}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.crystal}
          emissive={palette.crystalGlow}
          emissiveIntensity={palette.isNight ? 1.4 : 0.7}
          flatShading
          roughness={0.2}
        />
      </mesh>
      {/* A larger invisible target, so the small crystal is easy to tap. */}
      <mesh visible={false} onClick={handleClick}>
        <sphereGeometry args={[0.9, 8, 6]} />
      </mesh>
      {/* Soft halo instead of a light, to keep lighting cheap. */}
      <mesh scale={0.62}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={palette.crystalGlow}
          transparent
          opacity={palette.isNight ? 0.04 : 0.12}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// Glowing crystals tucked round the island, there to be found.
const CrystalHunt = ({ palette }: CrystalHuntProps) => {
  const crystals = useWorldStore((state) => state.crystals);
  return (
    <>
      {CRYSTALS.map((spot) => (
        <Crystal
          key={spot.id}
          spot={spot}
          palette={palette}
          found={crystals.includes(spot.id)}
        />
      ))}
    </>
  );
};

export default CrystalHunt;
