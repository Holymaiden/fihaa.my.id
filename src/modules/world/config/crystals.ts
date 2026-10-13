import type { Vec3 } from './island';
import { islandHeight, POND, POND_CENTER, STREAM } from './island';

// Crystals hidden round the island. Finding them all opens the way to the
// hidden vault. Positions are island frame; y is the height above ground.

export interface CrystalSpot {
  id: string;
  position: Vec3;
}

const onGround = (x: number, lift: number, z: number): Vec3 => [
  x,
  islandHeight(x, z) + lift,
  z,
];

// A spot on the stream bank, `distance` in from the rim.
const bank = (distance: number, lift: number): Vec3 => {
  const x = STREAM.end[0] - Math.sin(POND.angle) * distance + 0.9;
  const z = STREAM.end[1] - Math.cos(POND.angle) * distance - 0.9;
  return onGround(x, lift, z);
};

export const CRYSTALS: CrystalSpot[] = [
  {
    id: 'pond',
    position: onGround(POND_CENTER[0] - 2.6, 1, POND_CENTER[1] + 0.8),
  },
  { id: 'tower', position: onGround(3.8, 10.6, -2.2) },
  { id: 'waterfall', position: bank(1.6, 1.1) },
  { id: 'meadow', position: onGround(-4.2, 0.9, -9.4) },
  { id: 'grove', position: onGround(-9.2, 0.9, 3.2) },
  { id: 'stones', position: onGround(6.6, 0.9, -8.8) },
  { id: 'flag', position: onGround(-2.2, 3.6, 2.6) },
];

// Walking this close in explore mode picks a crystal up.
export const CRYSTAL_PICKUP_DISTANCE = 1.8;
