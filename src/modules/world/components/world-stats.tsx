'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { create } from 'zustand';

// Debug readout for real-device checks: open /world?debug=stats.

export interface WorldStatsSample {
  fps: number;
  frameMs: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  pixelRatio: number;
}

const useStatsStore = create<{ sample: WorldStatsSample | null }>(() => ({
  sample: null,
}));

const SAMPLE_SECONDS = 1;

export const isStatsEnabled = (): boolean =>
  new URLSearchParams(window.location.search).get('debug') === 'stats';

// Inside the Canvas: averages frame time and reads renderer.info.
export const WorldStatsProbe = () => {
  const gl = useThree((state) => state.gl);
  const frames = useRef(0);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    frames.current += 1;
    elapsed.current += delta;
    if (elapsed.current < SAMPLE_SECONDS) {
      return;
    }
    const { render, memory } = gl.info;
    const sample: WorldStatsSample = {
      fps: Math.round(frames.current / elapsed.current),
      frameMs: Number(((elapsed.current / frames.current) * 1000).toFixed(1)),
      calls: render.calls,
      triangles: render.triangles,
      geometries: memory.geometries,
      textures: memory.textures,
      pixelRatio: gl.getPixelRatio(),
    };
    useStatsStore.setState({ sample });
    // Also exposed for automated measurements.
    (window as Window & { __worldStats?: WorldStatsSample }).__worldStats =
      sample;
    (window as Window & { __worldFrames?: number }).__worldFrames =
      render.frame;
    frames.current = 0;
    elapsed.current = 0;
  });

  return null;
};

// Outside the Canvas: small fixed readout.
export const WorldStatsOverlay = () => {
  const sample = useStatsStore((state) => state.sample);
  if (!sample) {
    return null;
  }
  return (
    <pre className="pointer-events-none absolute bottom-16 right-4 z-40 rounded bg-dark/80 p-2 font-code text-2xs text-light">
      {`${sample.fps} fps · ${sample.frameMs} ms
${sample.calls} draw calls · ${sample.triangles} tris
${sample.geometries} geometries · ${sample.textures} textures
dpr ${sample.pixelRatio}`}
    </pre>
  );
};

// Debug camera for same-angle comparisons: open /world?debug=cam, then set
// window.worldCam = { position: [x, y, z], target: [x, y, z] } (world
// space) from the console; window.worldThree holds the R3F state.
type Vec3 = [number, number, number];
type DebugWindow = Window & {
  worldCam?: { position: Vec3; target: Vec3 };
  worldThree?: unknown;
};

export const isDebugCameraEnabled = (): boolean =>
  new URLSearchParams(window.location.search).get('debug') === 'cam';

// Mounted after the other camera rigs so it has the last word each frame.
export const WorldDebugCamera = () => {
  useFrame((state) => {
    const debug = window as DebugWindow;
    debug.worldThree = state;
    if (debug.worldCam) {
      state.camera.position.set(...debug.worldCam.position);
      state.camera.lookAt(...debug.worldCam.target);
    }
  });
  return null;
};
