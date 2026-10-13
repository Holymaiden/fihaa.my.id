import { CatmullRomCurve3, Vector3 } from 'three';

import { ISLAND, VAULT } from '../../config/island';
import { CASTLE_CLEARANCE } from '../../config/viewpoints';

// Builds the walk between two spots (island frame): round the castle
// rather than through it, and over the rim and down for the vault.

const MAX_ARC_STEP = Math.PI / 4;

const angleOf = (point: Vector3) => Math.atan2(point.x, point.z);

const shortestDelta = (from: number, to: number) => {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
};

// Closest distance from the island's centre axis to the segment a-b (xz).
const passDistance = (a: Vector3, b: Vector3) => {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const lengthSq = dx * dx + dz * dz || 1;
  const t = Math.min(Math.max(-(a.x * dx + a.z * dz) / lengthSq, 0), 1);
  return Math.hypot(a.x + dx * t, a.z + dz * t);
};

// Points on a circle round the castle from a's angle to b's angle.
const arcAround = (
  [a, b]: [Vector3, Vector3],
  radius: number,
  height: (share: number) => number,
) => {
  const start = angleOf(a);
  const delta = shortestDelta(start, angleOf(b));
  const steps = Math.max(1, Math.ceil(Math.abs(delta) / MAX_ARC_STEP));
  const points: Vector3[] = [];
  for (let step = 1; step < steps; step++) {
    const share = step / steps;
    const angle = start + delta * share;
    points.push(
      new Vector3(
        Math.sin(angle) * radius,
        height(share),
        Math.cos(angle) * radius,
      ),
    );
  }
  return points;
};

export const buildWalk = (
  from: Vector3,
  to: Vector3,
  { toVault, fromVault }: { toVault: boolean; fromVault: boolean },
): CatmullRomCurve3 => {
  const points: Vector3[] = [from.clone()];
  // Out past the rim, where the camera can drop under the island.
  const outside = ISLAND.radius + 4;

  if (toVault || fromVault) {
    const top = fromVault ? to : from;
    const lip = new Vector3(
      Math.sin(VAULT.angle) * outside,
      1.5,
      Math.cos(VAULT.angle) * outside,
    );
    const below = new Vector3(
      Math.sin(VAULT.angle) * (outside - 1),
      VAULT.height + 1.5,
      Math.cos(VAULT.angle) * (outside - 1),
    );
    const radius = Math.max(Math.hypot(top.x, top.z), CASTLE_CLEARANCE + 1);
    const round = arcAround([top, lip], radius, () => Math.max(top.y, 3));
    points.push(
      ...(fromVault
        ? [below, lip, ...round.reverse()]
        : [...round, lip, below]),
      to.clone(),
    );
    return new CatmullRomCurve3(points, false, 'centripetal');
  }

  const lowEnough = from.y < 9 && to.y < 9;
  if (lowEnough && passDistance(from, to) < CASTLE_CLEARANCE) {
    const radius = Math.max(
      Math.hypot(from.x, from.z),
      Math.hypot(to.x, to.z),
      CASTLE_CLEARANCE + 1,
    );
    points.push(
      ...arcAround(
        [from, to],
        radius,
        (share) =>
          from.y + (to.y - from.y) * share + Math.sin(share * Math.PI) * 1.2,
      ),
    );
  } else {
    // A small rise in the middle so the walk feels like a glide.
    const middle = from.clone().lerp(to, 0.5);
    middle.y += Math.min(from.distanceTo(to) * 0.08, 1.5);
    points.push(middle);
  }
  points.push(to.clone());
  return new CatmullRomCurve3(points, false, 'centripetal');
};

// The way in from the island view: sweep forward and down in an arc, then
// glide in low over the grass from behind the spot and settle at eye
// height, like landing.
export const buildDive = (
  from: Vector3,
  to: Vector3,
  facing: Vector3,
): CatmullRomCurve3 => {
  const back = facing.clone().setY(0).normalize();
  const swoop = from.clone().lerp(to, 0.45);
  swoop.y = Math.max(to.y + 7, from.y * 0.6);
  const approach = to.clone().addScaledVector(back, -5.5);
  approach.y = to.y + 1.6;
  return new CatmullRomCurve3(
    [from.clone(), swoop, approach, to.clone()],
    false,
    'centripetal',
  );
};
