'use client';

import { Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh, MeshStandardMaterial } from 'three';

import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';

interface VaultMoodProps {
  palette: WorldPalette;
}

const CRYSTAL_HEIGHT = 1.6;
const BASE_GLOW = 0.6;

// The crystal, its light and the drifting motes: the vault is the only
// place in the world with this darker, mysterious mood.
const VaultMood = ({ palette }: VaultMoodProps) => {
  const crystalRef = useRef<Mesh>(null);
  const effects = useEffectsEnabled();
  const { crystalSpinSpeed, crystalPulseSpeed, sparkles } = VISUAL.effects;

  useFrame(({ clock }, delta) => {
    const crystal = crystalRef.current;
    if (!crystal || !effects) {
      return;
    }
    crystal.rotation.y += delta * crystalSpinSpeed;
    const material = crystal.material as MeshStandardMaterial;
    material.emissiveIntensity =
      BASE_GLOW + Math.sin(clock.elapsedTime * crystalPulseSpeed) * 0.3;
  });

  return (
    <group>
      <mesh
        ref={crystalRef}
        position={[0, CRYSTAL_HEIGHT, 0]}
        scale={[0.7, 1.2, 0.7]}
      >
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color={palette.crystal}
          emissive={palette.crystalGlow}
          emissiveIntensity={BASE_GLOW}
          flatShading
        />
      </mesh>
      <pointLight
        position={[0, CRYSTAL_HEIGHT + 0.5, 0.6]}
        color={palette.crystalGlow}
        intensity={VISUAL.vault.lightIntensity}
        distance={VISUAL.vault.lightDistance}
      />
      {effects && (
        <Sparkles
          position={[0, CRYSTAL_HEIGHT, 0]}
          count={sparkles.count}
          scale={sparkles.scale}
          size={sparkles.size}
          speed={sparkles.speed}
          color={palette.crystalGlow}
        />
      )}
    </group>
  );
};

export default VaultMood;
