'use client';

import { useFrame } from '@react-three/fiber';
import type { PerspectiveCamera } from 'three';
import { MathUtils } from 'three';

import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import { useWorldStore } from '../../store/world-store';

// Widens the lens when standing on the island (first person feels cramped
// at the island view's narrow lens) and narrows it again on the way out.
const FovDirector = () => {
  const mode = useWorldStore((state) => state.mode);
  const animate = useEffectsEnabled();

  useFrame(({ camera, invalidate }, delta) => {
    const lens = camera as PerspectiveCamera;
    const goal = mode === 'explore' ? VISUAL.explore.fov : VISUAL.camera.fov;
    if (Math.abs(lens.fov - goal) < 0.01) {
      return;
    }
    lens.fov = animate ? MathUtils.damp(lens.fov, goal, 3, delta) : goal;
    lens.updateProjectionMatrix();
    invalidate();
  });

  return null;
};

export default FovDirector;
