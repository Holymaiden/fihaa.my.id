import type { WorldStationId } from '@/lib/content/types';

// Shape of the single floating island and where things sit on it, in world
// units. Layout only, no content and no colors.

export type Vec3 = readonly [number, number, number];

// Stations around the rim; 'profile' is the castle in the middle and
// 'secret' hangs under the island.
export type SurfaceStationId = Exclude<WorldStationId, 'secret' | 'profile'>;

export const ISLAND = {
  radius: 14,
  // Mesh resolution of the top surface (rings from the centre, segments
  // around) and of the rock underneath.
  rings: 48,
  segments: 128,
  undersideRings: 24,
  depth: 16,
  // Height of the gentle hills on top.
  hillHeight: 1.2,
  // Outer share of the radius that turns into beach.
  beachWidth: 0.1,
} as const;

// Wobbly outline so the island doesn't read as a perfect disc.
export const islandEdge = (angle: number): number =>
  1 +
  0.12 * Math.sin(angle * 3) +
  0.07 * Math.sin(angle * 7 + 1) +
  0.04 * Math.sin(angle * 13);

const hills = (x: number, z: number): number =>
  Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.6 +
  Math.sin(x * 0.9 + z * 0.7) * 0.18 +
  Math.cos(z * 1.3 - x * 0.4) * 0.12;

// Height of the top surface at (x, z); flattens out towards the rim.
export const islandHeight = (x: number, z: number): number => {
  const share = Math.min(Math.hypot(x, z) / ISLAND.radius, 1);
  const falloff = 1 - share ** 6;
  return (hills(x, z) + 0.4) * falloff * ISLAND.hillHeight - share ** 10 * 0.6;
};

// Stations sit around the castle; the island turns so the active one faces
// the camera (+z). Angles are measured from +z towards +x.
export const STATION_ANGLES: Record<SurfaceStationId, number> = {
  projects: 0,
  skills: Math.PI / 2,
  experience: Math.PI,
  contact: (Math.PI * 3) / 2,
};

export const STATION_DISTANCE = 8.2;

// Dragging snaps to these, in this order.
export const STATION_ORDER: SurfaceStationId[] = [
  'projects',
  'skills',
  'experience',
  'contact',
];

const onCircle = (angle: number, distance: number): [number, number] => [
  Math.sin(angle) * distance,
  Math.cos(angle) * distance,
];

// Station centre on the island (before the island turns).
export const stationAnchor = (id: SurfaceStationId): Vec3 => {
  const [x, z] = onCircle(STATION_ANGLES[id], STATION_DISTANCE);
  return [x, islandHeight(x, z), z];
};

// The hidden vault is a ledge on the rock under the island, on the back
// side (between the journal and the mailbox), so the first view hides it.
// The ledge sits just outside the rock so the gate isn't buried.
export const VAULT = {
  angle: (Math.PI * 5) / 4,
  distance: 9.4,
  height: -6,
  ledgeRadius: 2.8,
} as const;

export const vaultAnchor = (): Vec3 => {
  const [x, z] = onCircle(VAULT.angle, VAULT.distance);
  return [x, VAULT.height, z];
};

// Island turn (around y) that brings a direction to the front.
export const facingRotation = (angle: number): number => -angle;

// ← / → walk through these (the vault is not on the way).
export const TURN_ORDER: WorldStationId[] = ['profile', ...STATION_ORDER];

// Island turn for a station; null for the castle, which is seen from any
// side.
export const stationRotation = (id: WorldStationId): number | null => {
  if (id === 'profile') {
    return null;
  }
  return facingRotation(id === 'secret' ? VAULT.angle : STATION_ANGLES[id]);
};

// Where a station's floating label and info card hang (island frame).
export const LABEL_LIFT = 4.2;
// Cards hang to the right of the station (in its own frame), about at its
// mid height, so they don't cover it.
const CARD_LIFT = 2.2;
const CARD_SIDE = 3;
const VAULT_CARD_LIFT = 1.6;
const VAULT_CARD_SIDE = 2.6;
export const CASTLE_LABEL: Vec3 = [0, 11.5, 0];
export const CASTLE_CARD: Vec3 = [4.2, 5.5, 2];

// Point `side` units to the right of a spot that faces `angle`.
const toRight = (
  [x, y, z]: Vec3,
  { angle, side, lift }: { angle: number; side: number; lift: number },
): Vec3 => [x + Math.cos(angle) * side, y + lift, z - Math.sin(angle) * side];

export const labelAnchor = (id: WorldStationId): Vec3 => {
  if (id === 'profile') {
    return CASTLE_LABEL;
  }
  const [x, y, z] = id === 'secret' ? vaultAnchor() : stationAnchor(id);
  return [x, y + LABEL_LIFT, z];
};

export const cardAnchor = (id: WorldStationId): Vec3 => {
  if (id === 'profile') {
    return CASTLE_CARD;
  }
  if (id === 'secret') {
    return toRight(vaultAnchor(), {
      angle: VAULT.angle,
      side: VAULT_CARD_SIDE,
      lift: VAULT_CARD_LIFT,
    });
  }
  return toRight(stationAnchor(id), {
    angle: STATION_ANGLES[id],
    side: CARD_SIDE,
    lift: CARD_LIFT,
  });
};
