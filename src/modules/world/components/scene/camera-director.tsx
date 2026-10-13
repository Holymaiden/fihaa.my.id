'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Vector3 } from 'three';

import type { CameraView } from '../../config/camera';
import {
  INTRO_VIEW,
  NARROW_MAX_WIDTH,
  NARROW_ZOOM,
  OVERVIEW,
  PANEL_SHIFT,
  PROFILE_VIEW,
  shiftView,
  STATION_VIEW,
  VAULT_VIEW,
  zoomView,
} from '../../config/camera';
import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldTransition } from '../../store/world-store';
import { useWorldStore } from '../../store/world-store';

const SETTLED = 1e-3;
const { transition: moves } = VISUAL;

// Slower, sweeping moves for the fly-in and for rising out of explore
// mode; the usual quick settle otherwise.
const dampingFor = (transition: WorldTransition | null) => {
  if (transition) {
    const seconds = (performance.now() - transition.at) / 1000;
    if (transition.kind === 'intro' && seconds < moves.introSeconds) {
      return moves.introDamping;
    }
    if (transition.kind === 'exit' && seconds < moves.exitSeconds) {
      return moves.exitDamping;
    }
  }
  return VISUAL.camera.damping;
};

// Eases the camera between the overview, a station close-up and the vault
// shot. Snaps instead of easing when effects are off.
const CameraDirector = () => {
  const activeStation = useWorldStore((state) => state.activeStation);
  const entered = useWorldStore((state) => state.entered);
  const transition = useWorldStore((state) => state.transition);
  const mode = useWorldStore((state) => state.mode);
  const isNarrow = useThree((state) => state.size.width < NARROW_MAX_WIDTH);
  const invalidate = useThree((state) => state.invalidate);
  const animate = useEffectsEnabled();
  const lookAt = useRef<Vector3 | null>(null);
  const goal = useRef({ position: new Vector3(), target: new Vector3() });

  const view = useMemo(() => {
    if (!entered) {
      return INTRO_VIEW;
    }
    let shot: CameraView =
      activeStation === 'secret'
        ? VAULT_VIEW
        : activeStation === 'profile'
          ? PROFILE_VIEW
          : activeStation
            ? STATION_VIEW
            : OVERVIEW;
    if (isNarrow) {
      shot = zoomView(
        shot,
        activeStation ? NARROW_ZOOM.closeUp : NARROW_ZOOM.overview,
      );
    }
    if (activeStation) {
      shot = shiftView(shot, PANEL_SHIFT[isNarrow ? 'narrow' : 'wide']);
    }
    return shot;
  }, [activeStation, isNarrow, entered]);

  useEffect(() => {
    goal.current.position.set(...view.position);
    goal.current.target.set(...view.target);
    invalidate();
  }, [view, invalidate]);

  // Explore mode drives the camera itself. Coming back, pick up from where
  // it is looking.
  const returning = useRef(false);
  useEffect(() => {
    if (mode !== 'island') {
      returning.current = true;
    }
    invalidate();
  }, [mode, invalidate]);

  useFrame(({ camera }, delta) => {
    if (mode !== 'island') {
      return;
    }
    const { position, target } = goal.current;
    if (returning.current) {
      // Back from explore mode: start from the current view.
      returning.current = false;
      lookAt.current = camera
        .getWorldDirection(new Vector3())
        .multiplyScalar(camera.position.distanceTo(target))
        .add(camera.position);
    }
    if (!lookAt.current) {
      // First frame: start in place.
      camera.position.copy(position);
      lookAt.current = target.clone();
    } else if (animate) {
      const t = 1 - Math.exp(-dampingFor(transition) * delta);
      camera.position.lerp(position, t);
      lookAt.current.lerp(target, t);
    } else {
      camera.position.copy(position);
      lookAt.current.copy(target);
    }
    // A slow drift round the framed shot, so the island view breathes.
    if (animate) {
      const time = performance.now() / 1000;
      camera.position.x += Math.sin(time * 0.11) * 0.012;
      camera.position.y += Math.sin(time * 0.17 + 1) * 0.006;
    }
    camera.lookAt(lookAt.current);
    if (
      camera.position.distanceTo(position) > SETTLED ||
      lookAt.current.distanceTo(target) > SETTLED
    ) {
      invalidate();
    }
  });

  return null;
};

export default CameraDirector;
