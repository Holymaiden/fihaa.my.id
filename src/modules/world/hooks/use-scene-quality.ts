'use client';

import { useState } from 'react';

import type { PostQuality } from '../components/scene/world-post';
import { NARROW_MAX_WIDTH } from '../config/camera';
import { VISUAL } from '../config/visual';

// Quality settings that adapt to the device: start from the screen size,
// then step down while frames are slow (driven by drei's
// PerformanceMonitor). Client only, so window is available.
export const useSceneQuality = () => {
  const [narrow] = useState(() => window.innerWidth < NARROW_MAX_WIDTH);
  // Highest pixel ratio this screen can use, within the configured cap.
  const [maxDpr] = useState(() =>
    Math.min(window.devicePixelRatio, VISUAL.dpr[1]),
  );
  const [dpr, setDpr] = useState(maxDpr);
  const [shadows, setShadows] = useState(true);
  // Cheaper ground shading, only once frames stay slow at the lowest
  // settings (not just because the screen is small).
  const [liteTerrain, setLiteTerrain] = useState(false);
  // ?post=off|low|high overrides the automatic choice (handy for testing).
  const [postQuality, setPostQuality] = useState<PostQuality>(() => {
    const forced = new URLSearchParams(window.location.search).get('post');
    if (forced === 'low' || forced === 'high' || forced === 'off') {
      return forced;
    }
    return narrow ? 'low' : 'high';
  });
  const [grassDensity, setGrassDensity] = useState(
    narrow ? VISUAL.grass.narrowDensity : 1,
  );
  const shadowMapSize = narrow
    ? VISUAL.shadows.narrowMapSize
    : VISUAL.shadows.mapSize;

  // Fill rate dominates on phones (2x pixels ~ 2.2x frame time, see
  // 14-rilis.md), so lower the pixel ratio while frames are slow.
  const onChange = ({ factor }: { factor: number }) =>
    setDpr(
      Math.max(
        VISUAL.dpr[0],
        Math.round(maxDpr * (0.5 + factor / 2) * 10) / 10,
      ),
    );

  // Still slow at the lowest pixel ratio: drop shadows, the costly
  // post effects and part of the grass.
  const onFallback = () => {
    setDpr(VISUAL.dpr[0]);
    setShadows(false);
    setLiteTerrain(true);
    setPostQuality((quality) => (quality === 'off' ? quality : 'low'));
    setGrassDensity((density) =>
      Math.min(density, VISUAL.grass.fallbackDensity),
    );
  };

  return {
    dpr,
    shadows,
    shadowMapSize,
    postQuality,
    grassDensity,
    liteTerrain,
    narrow,
    onChange,
    onFallback,
  };
};
