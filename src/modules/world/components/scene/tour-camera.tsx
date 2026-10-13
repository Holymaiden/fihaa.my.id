'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';

import { VISUAL } from '../../config/visual';
import { useWorldStore } from '../../store/world-store';

const { tour } = VISUAL;

const position = new Vector3();
const target = new Vector3();
const startPosition = new Vector3();
const startTarget = new Vector3();
const blendedTarget = new Vector3();

const easeInOut = (t: number) => t * t * (3 - 2 * t);

// Where the tour camera is at `angle` round the island: it swings in and
// out, rises and dips (down past the waterfall and up over the castle),
// always looking at the island.
const tourPose = (angle: number) => {
  const [nearRadius, farRadius] = tour.radius;
  const [low, high] = tour.height;
  const swing = Math.sin(angle * 2 + 0.6) * 0.5 + 0.5;
  const rise = Math.sin(angle * 1.5 + 1.2) * 0.5 + 0.5;
  const radius = nearRadius + (farRadius - nearRadius) * swing;
  position.set(
    Math.sin(angle) * radius,
    low + (high - low) * rise,
    Math.cos(angle) * radius,
  );
  target.set(0, 0.5 + rise * 2.5 - (1 - swing) * 1.5, 0);
};

// The 360° tour: glides round the island on its own. Any click, touch,
// wheel or key ends it (the HUD handles keys).
const TourCamera = () => {
  const mode = useWorldStore((state) => state.mode);
  const stopTour = useWorldStore((state) => state.stopTour);
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const angle = useRef(0);
  const elapsed = useRef(0);

  // Start on the path where the camera already is, so the turn picks up
  // smoothly from the current view.
  useEffect(() => {
    if (mode !== 'tour') {
      return;
    }
    angle.current = Math.atan2(camera.position.x, camera.position.z);
    elapsed.current = 0;
    startPosition.copy(camera.position);
    camera
      .getWorldDirection(startTarget)
      .multiplyScalar(20)
      .add(camera.position);
  }, [mode, camera]);

  useEffect(() => {
    if (mode !== 'tour') {
      return;
    }
    const element = gl.domElement;
    const stop = () => stopTour();
    element.addEventListener('pointerdown', stop);
    element.addEventListener('wheel', stop, { passive: true });
    return () => {
      element.removeEventListener('pointerdown', stop);
      element.removeEventListener('wheel', stop);
    };
  }, [gl, mode, stopTour]);

  useFrame(({ camera: view, invalidate }, delta) => {
    if (mode !== 'tour') {
      return;
    }
    elapsed.current += delta;
    // Ease the speed in too, so the first second isn't a jolt.
    const blend = easeInOut(Math.min(elapsed.current / tour.blendIn, 1));
    angle.current += delta * tour.speed * blend;
    tourPose(angle.current);
    view.position.copy(startPosition).lerp(position, blend);
    blendedTarget.copy(startTarget).lerp(target, blend);
    view.lookAt(blendedTarget);
    invalidate();
  });

  return null;
};

export default TourCamera;
