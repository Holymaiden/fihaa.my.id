'use client';

import type { ThreeEvent } from '@react-three/fiber';
import { Suspense } from 'react';

import { VAULT, vaultAnchor } from '../../config/island';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import { isDrag } from './pointer';
import VaultMood from './vault-mood';
import VaultProps from './vault-props';

interface VaultLedgeProps {
  palette: WorldPalette;
}

const LEDGE_THICKNESS = 0.6;

// A rock shelf on the underside of the island holding the hidden vault.
const VaultLedge = ({ palette }: VaultLedgeProps) => {
  const vaultRequested = useWorldStore((state) => state.vaultRequested);
  const openStation = useWorldStore((state) => state.openStation);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (isDrag(event)) {
      return;
    }
    event.stopPropagation();
    openStation('secret');
  };

  return (
    <group
      position={vaultAnchor()}
      rotation-y={VAULT.angle}
      onClick={handleClick}
    >
      <mesh position={[0, -LEDGE_THICKNESS / 2, 0]} receiveShadow>
        <cylinderGeometry
          args={[
            VAULT.ledgeRadius,
            VAULT.ledgeRadius * 0.85,
            LEDGE_THICKNESS,
            24,
          ]}
        />
        <meshStandardMaterial color={palette.secret} roughness={1} />
      </mesh>
      <mesh
        position={[0, -LEDGE_THICKNESS - 1.1, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[VAULT.ledgeRadius * 0.85, 2.2, 24]} />
        <meshStandardMaterial color={palette.rockDeep} roughness={1} />
      </mesh>
      <VaultMood palette={palette} />
      {vaultRequested && (
        <Suspense fallback={null}>
          <VaultProps />
        </Suspense>
      )}
    </group>
  );
};

export default VaultLedge;
