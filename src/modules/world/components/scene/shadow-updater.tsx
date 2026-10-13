'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import type { WorldPalette } from '../../hooks/use-world-palette';
import { islandTurn } from './island-turn';

interface ShadowUpdaterProps {
  palette: WorldPalette;
}

// The island only changes when it turns, a model loads or the theme
// changes, so the shadow map is redrawn then instead of every frame
// (halves the draw calls while clouds and the crystal animate).
const ShadowUpdater = ({ palette }: ShadowUpdaterProps) => {
  // Read the renderer through get() so it is only touched in effects.
  const get = useThree((state) => state.get);
  const lastTurn = useRef(Number.NaN);
  const lastGeometries = useRef(-1);

  useEffect(() => {
    const { shadowMap } = get().gl;
    shadowMap.autoUpdate = false;
    shadowMap.needsUpdate = true;
    return () => {
      shadowMap.autoUpdate = true;
    };
  }, [get]);

  useEffect(() => {
    get().gl.shadowMap.needsUpdate = true;
  }, [get, palette]);

  useFrame(({ gl: renderer }) => {
    const geometries = renderer.info.memory.geometries;
    if (
      islandTurn.angle !== lastTurn.current ||
      geometries !== lastGeometries.current
    ) {
      renderer.shadowMap.needsUpdate = true;
      lastTurn.current = islandTurn.angle;
      lastGeometries.current = geometries;
    }
  });

  return null;
};

export default ShadowUpdater;
