'use client';

import { useFrame, useThree } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import type { Group } from 'three';
import { MathUtils } from 'three';

import type { SurfaceStationId } from '../../config/island';
import {
  facingRotation,
  STATION_ANGLES,
  STATION_ORDER,
  stationRotation,
} from '../../config/island';
import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import { useWorldStore } from '../../store/world-store';
import { islandTurn } from './island-turn';
import { CLICK_TOLERANCE, lastDrag } from './pointer';

interface IslandRigProps {
  children: ReactNode;
}

const TAU = Math.PI * 2;

// The equivalent of `angle` (mod 2π) closest to `from`, so the island
// always takes the short way round.
const closestTurn = (angle: number, from: number) =>
  angle + Math.round((from - angle) / TAU) * TAU;

const angularDistance = (a: number, b: number) =>
  Math.abs(closestTurn(a, b) - b);

interface DragState {
  pointerId: number;
  startX: number;
  startAngle: number;
  moved: boolean;
}

// Turns the island: dragging sideways spins it, letting go snaps to the
// nearest station (and opens it), and picking a station elsewhere turns it
// to the front. The camera never orbits.
const IslandRig = ({ children }: IslandRigProps) => {
  const groupRef = useRef<Group>(null);
  const angle = useRef(0);
  const target = useRef(0);
  const drag = useRef<DragState | null>(null);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const activeStation = useWorldStore((state) => state.activeStation);
  const openStation = useWorldStore((state) => state.openStation);
  const mode = useWorldStore((state) => state.mode);
  const animate = useEffectsEnabled();

  // Picking a station turns it to the front. In explore mode the island
  // holds still (the visitor walks instead); coming back, it catches up.
  useEffect(() => {
    if (mode !== 'island') {
      return;
    }
    const rotation = activeStation ? stationRotation(activeStation) : null;
    if (rotation !== null) {
      target.current = closestTurn(rotation, target.current);
      invalidate();
    }
  }, [activeStation, mode, invalidate]);

  useEffect(() => {
    const element = gl.domElement;

    const handleDown = (event: PointerEvent) => {
      if (useWorldStore.getState().mode !== 'island') {
        return;
      }
      drag.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startAngle: target.current,
        moved: false,
      };
    };

    const handleMove = (event: PointerEvent) => {
      const state = drag.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      const dx = event.clientX - state.startX;
      if (!state.moved && Math.abs(dx) > CLICK_TOLERANCE) {
        state.moved = true;
        element.setPointerCapture(event.pointerId);
      }
      if (state.moved) {
        target.current = state.startAngle + dx * VISUAL.island.dragSpeed;
        invalidate();
      }
    };

    const handleUp = (event: PointerEvent) => {
      const state = drag.current;
      drag.current = null;
      if (!state?.moved || state.pointerId !== event.pointerId) {
        return;
      }
      lastDrag.endedAt = performance.now();
      const turnOf = (id: SurfaceStationId) =>
        facingRotation(STATION_ANGLES[id]);
      const nearest = [...STATION_ORDER].sort(
        (a, b) =>
          angularDistance(turnOf(a), target.current) -
          angularDistance(turnOf(b), target.current),
      )[0];
      target.current = closestTurn(turnOf(nearest), target.current);
      openStation(nearest);
      invalidate();
    };

    element.addEventListener('pointerdown', handleDown);
    element.addEventListener('pointermove', handleMove);
    element.addEventListener('pointerup', handleUp);
    element.addEventListener('pointercancel', handleUp);
    return () => {
      element.removeEventListener('pointerdown', handleDown);
      element.removeEventListener('pointermove', handleMove);
      element.removeEventListener('pointerup', handleUp);
      element.removeEventListener('pointercancel', handleUp);
    };
  }, [gl, invalidate, openStation]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const following = drag.current?.moved ?? false;
    angle.current =
      animate && !following
        ? MathUtils.damp(
            angle.current,
            target.current,
            VISUAL.island.turnDamping,
            delta,
          )
        : target.current;
    // Lock on once close, so the turn (and the shadow map) settles.
    if (Math.abs(angle.current - target.current) < 1e-4) {
      angle.current = target.current;
    }
    group.rotation.y = angle.current;
    islandTurn.angle = angle.current;
    // Keep rendering until the turn settles (frameloop="demand").
    if (Math.abs(angle.current - target.current) > 1e-4) {
      invalidate();
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

export default IslandRig;
