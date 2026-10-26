import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

import type { WorldStationId } from '@/lib/content/types';

// Shape of the single floating island and where things sit on it, in world
// units. Layout only, no content and no colors.

export type Vec3 = readonly [number, number, number];

// Stations around the rim; 'profile' is the castle in the middle and
// 'secret' hangs under the island.
export type SurfaceStationId = Exclude<WorldStationId, 'secret' | 'profile'>;

export const ISLAND = {
  radius: 18,
  // Mesh resolution of the top surface (rings from the centre, segments
  // around) and of the rock underneath.
  rings: 96,
  segments: 256,
  undersideRings: 40,
  depth: 19,
  // Height of the gentle hills on top.
  hillHeight: 1.2,
  // Extra rolling hills and ridges where nothing stands (see relief()).
  reliefHeight: 2.4,
  // Outer share of the radius that turns into beach.
  beachWidth: 0.1,
} as const;

// The layout below (paths, stations, pond, scenery in props.ts) was drawn
// for a 14-unit island; distances are multiplied by this so they spread
// out with the island while buildings and trees keep their size.
export const LAYOUT_SCALE = ISLAND.radius / 14;

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

// Height of the hills before the pond and stream are carved in.
const baseHeight = (x: number, z: number): number => {
  const share = Math.min(Math.hypot(x, z) / ISLAND.radius, 1);
  const falloff = 1 - share ** 6;
  return (hills(x, z) + 0.4) * falloff * ISLAND.hillHeight - share ** 10 * 0.6;
};

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

// Distance from p to the segment a-b, and how far along it (0..1).
const toSegment = (
  [px, pz]: [number, number],
  [ax, az]: [number, number],
  [bx, bz]: [number, number],
) => {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.min(
    Math.max(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz), 0),
    1,
  );
  return { distance: Math.hypot(px - ax - dx * t, pz - az - dz * t), t };
};

// A pond on the front-right of the island; a stream runs from it to the rim
// and falls off the edge as a waterfall.
export const POND = {
  angle: Math.PI / 4,
  distance: 9.4 * LAYOUT_SCALE,
  radius: 2.3,
  depth: 0.5,
} as const;

const polar = (angle: number, distance: number): [number, number] => [
  Math.sin(angle) * distance,
  Math.cos(angle) * distance,
];

export const POND_CENTER = polar(POND.angle, POND.distance);
// Water surface of the pond, a little under the ground around it.
export const POND_LEVEL = baseHeight(POND_CENTER[0], POND_CENTER[1]) - 0.22;

// Where the stream leaves the island (just past the rim).
export const STREAM = {
  start: POND_CENTER,
  end: polar(POND.angle, ISLAND.radius * islandEdge(POND.angle) + 0.4),
  halfWidth: 0.55,
  // Surface level where it pours over the rim.
  endLevel: -0.75,
} as const;

// The stream meanders: sideways offsets (units, to the right of the
// straight line) at points along the way from the pond to the rim.
const MEANDER: [number, number][] = [
  [0, 0],
  [0.25, 0.75],
  [0.55, -0.55],
  [0.8, 0.3],
  [1, 0],
];
const PATH_SAMPLES = 36;

// Catmull-Rom through the meander points, sampled into a polyline.
const buildStreamPath = (): [number, number][] => {
  const [sx, sz] = STREAM.start;
  const [ex, ez] = STREAM.end;
  const length = Math.hypot(ex - sx, ez - sz);
  const dirX = (ex - sx) / length;
  const dirZ = (ez - sz) / length;
  const control = MEANDER.map(([t, side]): [number, number] => [
    sx + dirX * length * t + dirZ * side,
    sz + dirZ * length * t - dirX * side,
  ]);
  const at = (index: number) =>
    control[Math.min(Math.max(index, 0), control.length - 1)];
  const points: [number, number][] = [];
  for (let sample = 0; sample <= PATH_SAMPLES; sample++) {
    const u = (sample / PATH_SAMPLES) * (control.length - 1);
    const segment = Math.min(Math.floor(u), control.length - 2);
    const f = u - segment;
    const [p0, p1, p2, p3] = [
      at(segment - 1),
      at(segment),
      at(segment + 1),
      at(segment + 2),
    ];
    const blend = (axis: 0 | 1) =>
      0.5 *
      (2 * p1[axis] +
        (-p0[axis] + p2[axis]) * f +
        (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * f * f +
        (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * f * f * f);
    points.push([blend(0), blend(1)]);
  }
  return points;
};

export const STREAM_PATH = buildStreamPath();

// Half width of the stream at `t` (0 at the pond, 1 at the rim): it
// narrows in the bends and widens again as it reaches the lip.
export const streamHalfWidth = (t: number): number =>
  STREAM.halfWidth * (0.85 + 0.2 * Math.sin(t * 9 + 1) + 0.25 * t * t);

// Distance from (x, z) to the stream's centre line, and how far along it.
export const toStream = (x: number, z: number) => {
  let best = { distance: Infinity, t: 0 };
  for (let index = 0; index < STREAM_PATH.length - 1; index++) {
    const hit = toSegment([x, z], STREAM_PATH[index], STREAM_PATH[index + 1]);
    if (hit.distance < best.distance) {
      best = {
        distance: hit.distance,
        t: (index + hit.t) / (STREAM_PATH.length - 1),
      };
    }
  }
  return best;
};

// Water surface of the stream, `t` = 0 at the pond and 1 at the rim.
export const streamLevel = (t: number): number =>
  POND_LEVEL + (STREAM.endLevel - POND_LEVEL) * t ** 1.6;

// How much (0..1) a point is water: pond or stream.
export const waterMask = (x: number, z: number): number => {
  const pond = smoothstep(
    POND.radius + 0.2,
    POND.radius - 0.4,
    Math.hypot(x - POND_CENTER[0], z - POND_CENTER[1]),
  );
  const { distance, t } = toStream(x, z);
  const half = streamHalfWidth(t);
  const stream = smoothstep(half + 0.15, half - 0.3, distance);
  return Math.max(pond, stream);
};

// Height of the top surface at (x, z); flattens out towards the rim, with
// the pond bowl and the stream bed carved in.
export const islandHeight = (x: number, z: number): number => {
  let height = baseHeight(x, z) + relief(x, z);
  const pondDistance = Math.hypot(x - POND_CENTER[0], z - POND_CENTER[1]);
  const pondShare = smoothstep(
    POND.radius + 1.1,
    POND.radius - 0.2,
    pondDistance,
  );
  if (pondShare > 0) {
    const bed =
      POND_LEVEL -
      POND.depth * Math.max(1 - (pondDistance / POND.radius) ** 2, 0.15);
    height += (Math.min(bed, height) - height) * pondShare;
  }
  const stream = toStream(x, z);
  const half = streamHalfWidth(stream.t);
  const streamShare = smoothstep(half + 0.8, half - 0.15, stream.distance);
  if (streamShare > 0 && stream.t > 0) {
    const bed = streamLevel(stream.t) - 0.25;
    height += (Math.min(bed, height) - height) * streamShare;
  }
  return height;
};

// Dirt paths: a ring round the castle with spokes out to each station and
// the pond. 0 = grass, 1 = path.
const PATH_RING = 6.1 * LAYOUT_SCALE;
const PATH_HALF_WIDTH = 0.42;

// Stations sit around the castle; the island turns so the active one faces
// the camera (+z). Angles are measured from +z towards +x.
export const STATION_ANGLES: Record<SurfaceStationId, number> = {
  projects: 0,
  skills: Math.PI / 2,
  experience: Math.PI,
  contact: (Math.PI * 3) / 2,
};

export const STATION_DISTANCE = 8.2 * LAYOUT_SCALE;

// Dragging snaps to these, in this order.
export const STATION_ORDER: SurfaceStationId[] = [
  'projects',
  'skills',
  'experience',
  'contact',
];

const onCircle = polar;

// Station centre on the island (before the island turns).
export const stationAnchor = (id: SurfaceStationId): Vec3 => {
  const [x, z] = onCircle(STATION_ANGLES[id], STATION_DISTANCE);
  return [x, islandHeight(x, z), z];
};

// Where the path spokes start and end.
const PATH_SPOKES: [[number, number], [number, number]][] = [
  ...(['projects', 'skills', 'experience', 'contact'] as const).map(
    (id): [[number, number], [number, number]] => [
      polar(STATION_ANGLES[id], PATH_RING),
      polar(STATION_ANGLES[id], STATION_DISTANCE - 1.2),
    ],
  ),
  [
    polar(POND.angle, PATH_RING),
    polar(POND.angle, POND.distance - POND.radius - 0.4),
  ],
];

// Distance from (x, z) to the nearest path centre line.
const pathDistance = (x: number, z: number): number => {
  let distance = Math.abs(Math.hypot(x, z) - PATH_RING);
  for (const [from, to] of PATH_SPOKES) {
    distance = Math.min(distance, toSegment([x, z], from, to).distance);
  }
  return distance;
};

export const pathMask = (x: number, z: number): number => {
  const distance = pathDistance(x, z);
  // Wobble the edge a little so it reads as worn ground.
  const wobble = 0.08 * Math.sin(x * 2.3 + z * 1.7);
  return smoothstep(
    PATH_HALF_WIDTH + 0.25,
    PATH_HALF_WIDTH - 0.1,
    distance + wobble,
  );
};

// The two towers beside the castle (see GUILD_PROPS in props.ts).
export const TOWER_SPOTS: [number, number][] = [
  [-6.4 * LAYOUT_SCALE, -4.6 * LAYOUT_SCALE],
  [6.6 * LAYOUT_SCALE, -3.8 * LAYOUT_SCALE],
];

// Bare ground under the castle and around each station, where grass would
// poke through buildings and props.
export const clearingMask = (x: number, z: number): number => {
  let clearing = smoothstep(6, 5.2, Math.hypot(x, z));
  for (const [tx, tz] of TOWER_SPOTS) {
    clearing = Math.max(
      clearing,
      smoothstep(2, 1.4, Math.hypot(x - tx, z - tz)),
    );
  }
  for (const id of STATION_ORDER) {
    const [sx, sz] = polar(STATION_ANGLES[id], STATION_DISTANCE);
    clearing = Math.max(
      clearing,
      smoothstep(2.6, 1.6, Math.hypot(x - sx, z - sz)) * 0.85,
    );
  }
  return clearing;
};

// Fixed seed so every client (and the grass, props and camera that sit on
// the ground) sees the same hills.
export const seededRandom = (seed: number) => ({
  random: () => {
    seed = (seed + 0x6d_2b_79_f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  },
});
const simplex = new SimplexNoise(seededRandom(7));

// Rolling hills (fbm) mixed with sharper ridges, roughly -0.4..1.
const hillNoise = (x: number, z: number): number => {
  let fbm = 0;
  let ridge = 0;
  let amplitude = 0.5;
  let frequency = 0.11;
  for (let octave = 0; octave < 4; octave++) {
    const n = simplex.noise(x * frequency, z * frequency);
    fbm += n * amplitude;
    ridge += (1 - Math.abs(n)) ** 2 * amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return fbm * 0.6 + (ridge - 0.45) * 0.9;
};

// Share (0..1) of the relief allowed at (x, z): none under the castle, at
// the stations, on the paths or by the water, so everything that stands
// there stays level, and it fades out at the rim so the top meets the rock.
const reliefShare = (x: number, z: number): number => {
  const share = Math.hypot(x, z) / ISLAND.radius;
  let calm = smoothstep(7.8, 5.6, Math.hypot(x, z));
  for (const id of STATION_ORDER) {
    const [sx, sz] = polar(STATION_ANGLES[id], STATION_DISTANCE);
    calm = Math.max(calm, smoothstep(4.2, 2.4, Math.hypot(x - sx, z - sz)));
  }
  calm = Math.max(calm, smoothstep(2.2, 0.6, pathDistance(x, z)));
  const pond = Math.hypot(x - POND_CENTER[0], z - POND_CENTER[1]) - POND.radius;
  const { distance, t } = toStream(x, z);
  calm = Math.max(
    calm,
    smoothstep(2.6, 0.8, pond),
    smoothstep(2.4, 0.8, distance - streamHalfWidth(t)),
  );
  return (1 - calm) * smoothstep(1, 0.88, share);
};

const relief = (x: number, z: number): number =>
  Math.max(hillNoise(x, z), 0) * ISLAND.reliefHeight * reliefShare(x, z);

// The hidden vault is a ledge on the rock under the island, on the back
// side (between the journal and the mailbox), so the first view hides it.
// The ledge sits just outside the rock so the gate isn't buried.
export const VAULT = {
  angle: (Math.PI * 5) / 4,
  distance: 9.4 * LAYOUT_SCALE - 0.6,
  height: -7,
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
