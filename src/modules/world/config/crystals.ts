import type { Vec3 } from './island';
import {
  islandHeight,
  LAYOUT_SCALE,
  POND,
  POND_CENTER,
  STREAM,
  TOWER_SPOTS,
} from './island';

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
  const x = STREAM.end[0] - Math.sin(POND.angle) * distance + 1.5;
  const z = STREAM.end[1] - Math.cos(POND.angle) * distance - 1.5;
  return onGround(x, lift, z);
};

export const CRYSTALS: CrystalSpot[] = [
  {
    id: 'pond',
    position: onGround(POND_CENTER[0] - 2.6, 1, POND_CENTER[1] + 0.8),
  },
  // On top of the crystal tower.
  {
    id: 'tower',
    position: onGround(TOWER_SPOTS[1][0], 4.8, TOWER_SPOTS[1][1]),
  },
  { id: 'waterfall', position: bank(1.6, 1.1) },
  {
    id: 'meadow',
    position: onGround(-4.2 * LAYOUT_SCALE, 0.9, -9.4 * LAYOUT_SCALE),
  },
  {
    id: 'grove',
    position: onGround(-9.2 * LAYOUT_SCALE, 0.9, 3.2 * LAYOUT_SCALE),
  },
  {
    id: 'stones',
    position: onGround(6.6 * LAYOUT_SCALE, 0.9, -8.8 * LAYOUT_SCALE),
  },
  // Above the banner by the castle gate.
  { id: 'flag', position: onGround(-2.6, 3.6, 6.8) },
];

// Walking this close in explore mode picks a crystal up.
export const CRYSTAL_PICKUP_DISTANCE = 1.8;
