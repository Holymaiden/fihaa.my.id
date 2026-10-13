import type { WorldStationId } from '@/lib/content/types';

import type { SurfaceStationId, Vec3 } from './island';
import { islandHeight, POND, STREAM, VAULT, vaultAnchor } from './island';
import {
  arcCandidates,
  EYE_HEIGHT,
  inStationFrame,
  pickSpot,
  stationCandidates,
} from './viewpoint-search';

// Spots you can stand on in explore mode (first-person view), in the island
// frame. Every station has one; the scenic ones only show the world.

export type ScenicViewpointId = 'waterfall' | 'meadow';
export type ViewpointId = WorldStationId | ScenicViewpointId;

export interface Viewpoint {
  id: ViewpointId;
  // Eye position and the point it looks at, island frame.
  position: Vec3;
  target: Vec3;
  // Where its ring sits, when not right under the eye (spots in mid-air).
  marker?: Vec3;
}

export { EYE_HEIGHT } from './viewpoint-search';

const along = (angle: number, distance: number): [number, number] => [
  Math.sin(angle) * distance,
  Math.cos(angle) * distance,
];

const groundAt = ([x, z]: [number, number], lift: number): Vec3 => [
  x,
  islandHeight(x, z) + lift,
  z,
];

// Fallback when no candidate is clear: straight out from the target.
const fallback = (target: [number, number], distance: number): Vec3 => {
  const angle = Math.atan2(target[0], target[1]);
  return groundAt(along(angle, Math.hypot(...target) + distance), EYE_HEIGHT);
};

// Look a little right of the station, so it and its card share the view.
const stationViewpoint = (id: SurfaceStationId): Viewpoint => {
  const lookAt = inStationFrame(id, [0.9, -0.3]);
  const lift = id === 'skills' ? 2.4 : 1.5;
  return {
    id,
    position: pickSpot(stationCandidates(id), lookAt) ?? fallback(lookAt, 4.5),
    target: groundAt(lookAt, lift),
  };
};

const vaultViewpoint = (): Viewpoint => {
  const [vx, vy, vz] = vaultAnchor();
  const [ox, oz] = along(VAULT.angle, 2.1);
  // A step to the side so the card on the right has room.
  const [sx, sz] = along(VAULT.angle - Math.PI / 2, 0.7);
  return {
    id: 'secret',
    position: [vx + ox + sx, vy + 1.5, vz + oz + sz],
    target: [vx - sx, vy + 1.1, vz - sz],
  };
};

// Out beside the falls, as if hovering off the cliff: the water pours
// past, the rock face behind it and the clouds far below. Its ring sits on
// the bank where the stream leaves the island.
const waterfallViewpoint = (): Viewpoint => {
  const [ex, ez] = STREAM.end;
  const [ox, oz] = along(POND.angle, 1.2);
  const [sideX, sideZ] = along(POND.angle - Math.PI / 2, 7.5);
  const [outX, outZ] = along(POND.angle, 3.5);
  const [bankX, bankZ] = along(POND.angle, -2.2);
  const [nudgeX, nudgeZ] = along(POND.angle - Math.PI / 2, 1.2);
  const markerX = ex + bankX + nudgeX;
  const markerZ = ez + bankZ + nudgeZ;
  return {
    id: 'waterfall',
    position: [ex + sideX + outX, 0.6, ez + sideZ + outZ],
    target: [ex + ox, -3.5, ez + oz],
    marker: [markerX, islandHeight(markerX, markerZ), markerZ],
  };
};

// Out in the long grass behind the castle, looking back at it.
const meadowViewpoint = (): Viewpoint => ({
  id: 'meadow',
  position:
    pickSpot(
      arcCandidates({
        from: 3.2,
        to: 4.4,
        distances: [9.5, 10.5, 11.5],
        preferred: 3.7,
      }),
      [0, 0],
      { ignoreNearTarget: 6 },
    ) ?? fallback([0, 0], 10.5),
  target: [0, 4.2, 0],
});

// In front of the castle, looking up at it.
const profileViewpoint = (): Viewpoint => ({
  id: 'profile',
  position:
    pickSpot(
      arcCandidates({
        from: -1.3,
        to: -0.2,
        distances: [10, 11, 12],
        preferred: -0.7,
      }),
      [0, 0],
      { ignoreNearTarget: 6, eye: 1.4 },
    ) ?? fallback([0, 0], 10.6),
  target: [0.6, 4.6, 0],
});

export const VIEWPOINTS: Record<ViewpointId, Viewpoint> = {
  profile: profileViewpoint(),
  projects: stationViewpoint('projects'),
  skills: stationViewpoint('skills'),
  experience: stationViewpoint('experience'),
  contact: stationViewpoint('contact'),
  secret: vaultViewpoint(),
  waterfall: waterfallViewpoint(),
  meadow: meadowViewpoint(),
};

// Walking order for ← / → in explore mode, going round the island (the
// vault stays off the loop).
export const EXPLORE_ORDER: ViewpointId[] = [
  'profile',
  'projects',
  'waterfall',
  'skills',
  'experience',
  'meadow',
  'contact',
];

export const SCENIC_VIEWPOINTS: ScenicViewpointId[] = ['waterfall', 'meadow'];

export const isStationViewpoint = (id: ViewpointId): id is WorldStationId =>
  id !== 'waterfall' && id !== 'meadow';

// The surface spot closest to the camera, used when stepping in from the
// island view. `turn` is the island's current rotation.
export const frontViewpoint = (turn: number): ViewpointId => {
  const facing = (id: ViewpointId) => {
    const [x, , z] = VIEWPOINTS[id].position;
    // World z after the island turns (the camera sits on +z).
    return -x * Math.sin(turn) + z * Math.cos(turn);
  };
  // The waterfall spot hangs off the cliff, so it isn't a place to land.
  return EXPLORE_ORDER.filter((id) => id !== 'waterfall').sort(
    (a, b) => facing(b) - facing(a),
  )[0];
};

// Ground point under a viewpoint, where its marker ring sits.
export const viewpointGround = (id: ViewpointId): Vec3 => {
  const { position, marker } = VIEWPOINTS[id];
  if (marker) {
    return marker;
  }
  const [x, , z] = position;
  return id === 'secret' ? [x, VAULT.height, z] : [x, islandHeight(x, z), z];
};

// Paths between spots go round the castle instead of through it.
export const CASTLE_CLEARANCE = 7.5;
