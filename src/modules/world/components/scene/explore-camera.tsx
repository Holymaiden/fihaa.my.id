'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { CatmullRomCurve3 } from 'three';
import { MathUtils, Vector3 } from 'three';

import { islandHeight } from '../../config/island';
import { EYE_HEIGHT, VIEWPOINTS } from '../../config/viewpoints';
import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import { useWorldStore } from '../../store/world-store';
import { buildWalk } from './explore-path';
import { interaction } from './interaction';
import { islandTurn } from './island-turn';
import type { LookOffset } from './use-explore-input';
import { useExploreInput } from './use-explore-input';

// First-person camera for explore mode: stands at a viewpoint, looks
// around while dragging (and a little with the mouse), and glides along a
// path to the next viewpoint. Everything is worked out in the island frame
// and turned by the island's (fixed) rotation.

const { explore } = VISUAL;

interface Walk {
  curve: CatmullRomCurve3;
  duration: number;
  elapsed: number;
  fromYaw: number;
  fromPitch: number;
  toYaw: number;
  toPitch: number;
}

const yawOf = (direction: Vector3) => Math.atan2(direction.x, direction.z);
const pitchOf = (direction: Vector3) =>
  Math.asin(MathUtils.clamp(direction.y, -1, 1));

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

// Same angle as `to`, but within half a turn of `from`.
const nearAngle = (from: number, to: number) =>
  to + Math.round((from - to) / (Math.PI * 2)) * Math.PI * 2;

const UP = new Vector3(0, 1, 0);
const forward = new Vector3();
const lookPoint = new Vector3();
const worldPoint = new Vector3();

const still = (): LookOffset => ({
  yaw: 0,
  pitch: 0,
  goalYaw: 0,
  goalPitch: 0,
});

// Eases an offset towards its goal; true while it is still moving.
const easeOffset = (
  offset: LookOffset,
  { animate, delta }: { animate: boolean; delta: number },
) => {
  if (animate) {
    offset.yaw = MathUtils.damp(
      offset.yaw,
      offset.goalYaw,
      explore.lookDamping,
      delta,
    );
    offset.pitch = MathUtils.damp(
      offset.pitch,
      offset.goalPitch,
      explore.lookDamping,
      delta,
    );
  } else {
    offset.yaw = offset.goalYaw;
    offset.pitch = offset.goalPitch;
  }
  return (
    Math.abs(offset.yaw - offset.goalYaw) > 1e-4 ||
    Math.abs(offset.pitch - offset.goalPitch) > 1e-4
  );
};

const ExploreCamera = () => {
  const mode = useWorldStore((state) => state.mode);
  const viewpoint = useWorldStore((state) => state.viewpoint);
  const freeSpot = useWorldStore((state) => state.freeSpot);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const animate = useEffectsEnabled();

  // Island-frame position and the viewpoint's own view direction.
  const position = useRef(new Vector3());
  const baseYaw = useRef(0);
  const basePitch = useRef(0);
  const walk = useRef<Walk | null>(null);
  const look = useRef(still());
  const sway = useRef(still());

  useExploreInput({ look, sway, basePitch });

  // Start a walk whenever we step in or pick another viewpoint.
  useEffect(() => {
    if (mode !== 'explore') {
      walk.current = null;
      return;
    }
    const turn = islandTurn.angle;
    const from = camera.position.clone().applyAxisAngle(UP, -turn);
    const direction = camera
      .getWorldDirection(new Vector3())
      .applyAxisAngle(UP, -turn);
    let to: Vector3;
    let toDirection: Vector3;
    if (viewpoint === 'free') {
      // A clicked spot: walk there and keep looking the way we walked.
      const [x, z] = freeSpot ?? [from.x, from.z];
      to = new Vector3(x, islandHeight(x, z) + EYE_HEIGHT, z);
      toDirection = to.clone().sub(from).setY(0);
      if (toDirection.lengthSq() < 1e-4) {
        toDirection.copy(direction);
      }
      toDirection.normalize();
      toDirection.y = Math.sin(basePitch.current) * 0.5;
      toDirection.normalize();
    } else {
      const spot = VIEWPOINTS[viewpoint];
      to = new Vector3(...spot.position);
      toDirection = new Vector3(...spot.target).sub(to).normalize();
    }
    const curve = buildWalk(from, to, {
      toVault: viewpoint === 'secret',
      fromVault: from.y < -2,
    });
    const fromYaw = yawOf(direction);
    look.current = still();
    walk.current = {
      curve,
      duration: animate
        ? MathUtils.clamp(
            curve.getLength() / explore.walkSpeed,
            explore.minWalk,
            explore.maxWalk,
          )
        : 0,
      elapsed: 0,
      fromYaw,
      fromPitch: pitchOf(direction),
      toYaw: nearAngle(fromYaw, yawOf(toDirection)),
      toPitch: pitchOf(toDirection),
    };
    invalidate();
  }, [mode, viewpoint, freeSpot, camera, animate, invalidate]);

  useFrame(({ camera: view, clock }, delta) => {
    if (mode !== 'explore') {
      interaction.walker.active = 0;
      return;
    }
    let moving = false;
    const current = walk.current;
    if (current) {
      current.elapsed += delta;
      const share =
        current.duration > 0
          ? Math.min(current.elapsed / current.duration, 1)
          : 1;
      const eased = easeInOut(share);
      current.curve.getPointAt(eased, position.current);
      baseYaw.current = MathUtils.lerp(current.fromYaw, current.toYaw, eased);
      basePitch.current = MathUtils.lerp(
        current.fromPitch,
        current.toPitch,
        eased,
      );
      if (share >= 1) {
        walk.current = null;
      }
      moving = true;
    }
    moving = easeOffset(look.current, { animate, delta }) || moving;
    moving = easeOffset(sway.current, { animate, delta }) || moving;

    // Grass parts round the visitor's feet.
    Object.assign(interaction.walker, {
      x: position.current.x,
      z: position.current.z,
      active: position.current.y > -1 ? 1 : 0,
    });

    const turn = islandTurn.angle;
    const yaw = baseYaw.current + look.current.yaw + sway.current.yaw + turn;
    const pitch = MathUtils.clamp(
      basePitch.current + look.current.pitch + sway.current.pitch,
      explore.pitchRange[0],
      explore.pitchRange[1],
    );
    worldPoint.copy(position.current).applyAxisAngle(UP, turn);
    // A slow breath while standing still.
    if (animate) {
      worldPoint.y += Math.sin(clock.elapsedTime * 0.9) * explore.breath;
    }
    view.position.copy(worldPoint);
    forward.set(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    );
    view.lookAt(lookPoint.copy(worldPoint).add(forward));
    if (moving) {
      invalidate();
    }
  });

  return null;
};

export default ExploreCamera;
