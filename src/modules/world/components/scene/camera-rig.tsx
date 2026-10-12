'use client';

import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import type { CameraView } from '../../config/layout';
import {
  homeView,
  NARROW_VIEW_ZOOM,
  PANEL_FOCAL_OFFSET,
  stationView,
} from '../../config/layout';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import { useWorldStore } from '../../store/world-store';

// Same breakpoint as Tailwind's md, where the panel moves to the side.
const NARROW_MAX_WIDTH = 768;
const MIN_DISTANCE = 6;
const MAX_DISTANCE = 110;
// Keep the camera from going far below the islands or straight overhead.
const MIN_POLAR = 0.15;
const MAX_POLAR = Math.PI * 0.62;
// Seconds to roughly reach the target (camera-controls damping).
const FLY_SMOOTH_TIME = 0.6;

const flyTo = (
  controls: CameraControls,
  { position, target }: CameraView,
  animate: boolean,
) =>
  controls.setLookAt(
    position[0],
    position[1],
    position[2],
    target[0],
    target[1],
    target[2],
    animate,
  );

// Flies the camera to the selected station, or back to the overview.
const CameraRig = () => {
  const controlsRef = useRef<CameraControls>(null);
  const activeStation = useWorldStore((state) => state.activeStation);
  // Off for prefers-reduced-motion or when the visitor turns effects off.
  const animateFlights = useEffectsEnabled();
  const isNarrow = useThree((state) => state.size.width < NARROW_MAX_WIDTH);
  const hasFlown = useRef(false);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    const zoom = isNarrow ? NARROW_VIEW_ZOOM : 1;
    const view = activeStation
      ? stationView(activeStation, zoom)
      : homeView(zoom);
    const offset = activeStation
      ? PANEL_FOCAL_OFFSET[isNarrow ? 'narrow' : 'wide']
      : ([0, 0, 0] as const);
    // Jump straight to the first view; animate later moves if allowed.
    const animate = hasFlown.current && animateFlights;
    void flyTo(controls, view, animate);
    void controls.setFocalOffset(offset[0], offset[1], offset[2], animate);
    hasFlown.current = true;
  }, [activeStation, isNarrow, animateFlights]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      minPolarAngle={MIN_POLAR}
      maxPolarAngle={MAX_POLAR}
      smoothTime={FLY_SMOOTH_TIME}
      truckSpeed={0}
    />
  );
};

export default CameraRig;
