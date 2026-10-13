import type { SurfaceStationId, Vec3 } from './island';
import {
  ISLAND,
  islandEdge,
  islandHeight,
  STATION_ANGLES,
  stationAnchor,
  waterMask,
} from './island';
import type { CorePlacement } from './props';
import { DECOR, GUILD_PROPS, HEX_PACK_SCALE, STATION_PROPS } from './props';

// Finds good spots to stand on: inside the rim, clear of trees and
// buildings, out of the water, with nothing big between the eye and what it
// looks at. Runs once when the module loads.

// Eye height above the ground (the quest board is 2.8 units tall).
export const EYE_HEIGHT = 1.6;
// Keep every spot this share of the rim radius inside the island.
const MAX_RIM_SHARE = 0.86;

interface Obstacle {
  x: number;
  z: number;
  radius: number;
}

// Rough footprint radius of each model at scale 1.
const FOOTPRINT: Partial<Record<CorePlacement['model'], number>> = {
  CommonTree_1: 1.5,
  PineTree_3: 1.3,
  trees_A_medium: 1,
  tree_single_A: 0.6,
  Bush_1: 1.1,
  BushBerries_1: 1.1,
  Rock_Moss_4: 1.1,
  rock_single_A: 0.3,
  rock_single_C: 0.3,
  building_castle_blue: 1.9,
  building_tower_A_blue: 0.7,
  building_tavern_blue: 0.9,
  building_well_blue: 0.6,
  barrel: 0.2,
  crate_A_big: 0.25,
  lantern_standing: 0.3,
};

const footprint = ({ model, scale = 1 }: CorePlacement) =>
  (FOOTPRINT[model] ?? 0.3) * scale;

// A point in a station's frame (x right, z outwards) in the island frame.
export const inStationFrame = (
  id: SurfaceStationId,
  [localX, localZ]: [number, number],
): [number, number] => {
  const angle = STATION_ANGLES[id];
  const [cx, , cz] = stationAnchor(id);
  return [
    cx + localX * Math.cos(angle) + localZ * Math.sin(angle),
    cz - localX * Math.sin(angle) + localZ * Math.cos(angle),
  ];
};

const pointOf = ([x, z]: [number, number]) => ({ x, z });

const OBSTACLES: Obstacle[] = [
  ...[...DECOR, ...GUILD_PROPS].map((placement) => ({
    x: placement.position[0],
    z: placement.position[2],
    radius: footprint(placement),
  })),
  ...(Object.keys(STATION_PROPS) as SurfaceStationId[]).flatMap((id) =>
    STATION_PROPS[id].map((placement) => {
      const [x, z] = inStationFrame(id, [
        placement.position[0],
        placement.position[2],
      ]);
      return { x, z, radius: footprint(placement) };
    }),
  ),
  // The quest board, the mailbox and the skill tree's crown.
  { ...pointOf(inStationFrame('projects', [0, -0.6])), radius: 1.6 },
  { ...pointOf(inStationFrame('contact', [2.4, 1.4])), radius: 0.5 },
];

// The castle itself, larger than any one model's footprint.
OBSTACLES.push({ x: 0, z: 0, radius: 2.6 * HEX_PACK_SCALE * 0.75 });

const clearance = (x: number, z: number) =>
  Math.min(
    ...OBSTACLES.map(
      (obstacle) =>
        Math.hypot(x - obstacle.x, z - obstacle.z) - obstacle.radius,
    ),
  );

const insideRim = (x: number, z: number, share = MAX_RIM_SHARE) =>
  Math.hypot(x, z) < ISLAND.radius * islandEdge(Math.atan2(x, z)) * share;

// Is anything in the way along the first part of the sight line? Obstacles
// right at the target are what we came to see, so they don't count.
const sightBlocked = (
  [ex, ez]: [number, number],
  [tx, tz]: [number, number],
  ignoreNearTarget: number,
) => {
  const dx = tx - ex;
  const dz = tz - ez;
  const lengthSq = dx * dx + dz * dz || 1;
  return OBSTACLES.some((obstacle) => {
    if (Math.hypot(obstacle.x - tx, obstacle.z - tz) < ignoreNearTarget) {
      return false;
    }
    const t = Math.min(
      Math.max(((obstacle.x - ex) * dx + (obstacle.z - ez) * dz) / lengthSq, 0),
      1,
    );
    const distance = Math.hypot(
      ex + dx * t - obstacle.x,
      ez + dz * t - obstacle.z,
    );
    return distance < obstacle.radius * 0.8;
  });
};

// Can the visitor stand here? Inside the rim, out of the water and clear
// of trees and buildings.
export const isWalkable = (x: number, z: number) =>
  insideRim(x, z, 0.9) && waterMask(x, z) < 0.05 && clearance(x, z) > 0.4;

export interface Candidate {
  ground: [number, number];
  // Higher is better; added to the clearance.
  bonus: number;
}

// Best spot among the candidates, with the eye on the ground there.
export const pickSpot = (
  candidates: Candidate[],
  target: [number, number],
  { ignoreNearTarget = 2.5, eye = EYE_HEIGHT, rimShare = MAX_RIM_SHARE } = {},
): Vec3 | null => {
  let best: { score: number; spot: [number, number] } | null = null;
  for (const { ground, bonus } of candidates) {
    const [x, z] = ground;
    const room = clearance(x, z);
    if (
      room < 0.5 ||
      !insideRim(x, z, rimShare) ||
      waterMask(x, z) > 0.05 ||
      sightBlocked(ground, target, ignoreNearTarget)
    ) {
      continue;
    }
    const score = Math.min(room, 2.5) + bonus;
    if (!best || score > best.score) {
      best = { score, spot: ground };
    }
  }
  if (!best) {
    return null;
  }
  const [x, z] = best.spot;
  return [x, islandHeight(x, z) + eye, z];
};

// Rings of spots round a station, front-left preferred (its card hangs on
// its right).
export const stationCandidates = (id: SurfaceStationId): Candidate[] => {
  const candidates: Candidate[] = [];
  for (const distance of [4.5, 5.2, 6, 6.8]) {
    for (let degrees = -80; degrees <= 50; degrees += 5) {
      const angle = (degrees * Math.PI) / 180;
      candidates.push({
        ground: inStationFrame(id, [
          Math.sin(angle) * distance,
          Math.cos(angle) * distance,
        ]),
        bonus: -Math.abs(degrees + 25) / 60 - Math.abs(distance - 5.6) / 3,
      });
    }
  }
  return candidates;
};

// Spots on an arc round the island centre, best near `preferred`.
export const arcCandidates = ({
  from,
  to,
  distances,
  preferred,
}: {
  from: number;
  to: number;
  distances: number[];
  preferred: number;
}): Candidate[] => {
  const candidates: Candidate[] = [];
  for (const distance of distances) {
    for (let angle = from; angle <= to; angle += 0.04) {
      candidates.push({
        ground: [Math.sin(angle) * distance, Math.cos(angle) * distance],
        bonus: -Math.abs(angle - preferred) * 1.5,
      });
    }
  }
  return candidates;
};
