'use client';

import { useThree } from '@react-three/fiber';
import type { RefObject } from 'react';
import { useEffect } from 'react';
import { MathUtils } from 'three';

import { frontViewpoint } from '../../config/viewpoints';
import { VISUAL } from '../../config/visual';
import { useWorldStore } from '../../store/world-store';
import { islandTurn } from './island-turn';
import { CLICK_TOLERANCE, lastDrag, setCanvasCursor } from './pointer';

const { explore } = VISUAL;

// A view offset (radians) that eases towards its goal.
export interface LookOffset {
  yaw: number;
  pitch: number;
  goalYaw: number;
  goalPitch: number;
}

interface ExploreInput {
  // Dragged look-around and the smaller mouse sway.
  look: RefObject<LookOffset>;
  sway: RefObject<LookOffset>;
  // Pitch of the viewpoint itself, so looking up/down stays in range.
  basePitch: RefObject<number>;
}

interface DragState {
  id: number;
  x: number;
  y: number;
  yaw: number;
  pitch: number;
  moved: boolean;
}

// Pointer and wheel input for explore mode: drag to look around, the mouse
// sways the view a little, and the wheel steps in and out of the island.
export const useExploreInput = ({ look, sway, basePitch }: ExploreInput) => {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const mode = useWorldStore((state) => state.mode);

  useEffect(() => {
    setCanvasCursor(gl.domElement, mode === 'explore' ? 'grab' : '');
  }, [gl, mode]);

  useEffect(() => {
    const element = gl.domElement;
    const exploring = () => useWorldStore.getState().mode === 'explore';
    let drag: DragState | null = null;
    let wheel = 0;
    let wheelReset = 0;

    const handleDown = (event: PointerEvent) => {
      if (!exploring()) {
        return;
      }
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        yaw: look.current.goalYaw,
        pitch: look.current.goalPitch,
        moved: false,
      };
    };

    const handleDrag = (state: DragState, event: PointerEvent) => {
      const dx = event.clientX - state.x;
      const dy = event.clientY - state.y;
      if (!state.moved && Math.hypot(dx, dy) > CLICK_TOLERANCE) {
        state.moved = true;
        element.setPointerCapture(event.pointerId);
        setCanvasCursor(element, 'grabbing');
      }
      if (state.moved) {
        // Grab the world: dragging right turns the view left.
        look.current.goalYaw = state.yaw + dx * explore.dragSpeed;
        look.current.goalPitch = MathUtils.clamp(
          state.pitch + dy * explore.dragSpeed,
          explore.pitchRange[0] - basePitch.current,
          explore.pitchRange[1] - basePitch.current,
        );
        invalidate();
      }
    };

    const handleMove = (event: PointerEvent) => {
      if (!exploring()) {
        return;
      }
      if (drag && drag.id === event.pointerId) {
        handleDrag(drag, event);
      } else if (event.pointerType === 'mouse') {
        const nx = (event.clientX / element.clientWidth) * 2 - 1;
        const ny = (event.clientY / element.clientHeight) * 2 - 1;
        sway.current.goalYaw = -nx * explore.swayYaw;
        sway.current.goalPitch = -ny * explore.swayPitch;
        invalidate();
      }
    };

    const handleUp = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) {
        return;
      }
      if (drag.moved) {
        lastDrag.endedAt = performance.now();
        setCanvasCursor(element, exploring() ? 'grab' : '');
      }
      drag = null;
    };

    // Scroll in on the island to step onto it, scroll out to leave.
    const handleWheel = (event: WheelEvent) => {
      window.clearTimeout(wheelReset);
      wheelReset = window.setTimeout(() => (wheel = 0), 250);
      wheel += event.deltaY;
      const store = useWorldStore.getState();
      if (store.mode === 'explore' && wheel > explore.wheelThreshold) {
        wheel = 0;
        store.exitExplore();
      } else if (store.mode === 'island' && wheel < -explore.wheelThreshold) {
        wheel = 0;
        store.enterExplore(
          store.activeStation ?? frontViewpoint(islandTurn.angle),
        );
      }
    };

    element.addEventListener('pointerdown', handleDown);
    element.addEventListener('pointermove', handleMove);
    element.addEventListener('pointerup', handleUp);
    element.addEventListener('pointercancel', handleUp);
    element.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.clearTimeout(wheelReset);
      element.removeEventListener('pointerdown', handleDown);
      element.removeEventListener('pointermove', handleMove);
      element.removeEventListener('pointerup', handleUp);
      element.removeEventListener('pointercancel', handleUp);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [gl, invalidate, look, sway, basePitch]);
};
