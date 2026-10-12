'use client';

import { useState } from 'react';

// Colors of the 3D world come from the CSS tokens in globals.css
// (--color-world-*), so 2D and 3D share one source of truth.
const TOKENS = {
  sky: '--color-world-sky',
  islandTop: '--color-world-island-top',
  islandSide: '--color-world-island-side',
  station: '--color-world-station',
  stationHover: '--color-world-station-hover',
  stationActive: '--color-world-station-active',
  guild: '--color-world-guild',
  secret: '--color-world-secret',
} as const;

export type WorldPalette = Record<keyof typeof TOKENS, string>;

const readPalette = (): WorldPalette => {
  const styles = getComputedStyle(document.documentElement);

  return Object.fromEntries(
    Object.entries(TOKENS).map(([key, token]) => [
      key,
      styles.getPropertyValue(token).trim(),
    ]),
  ) as WorldPalette;
};

// Only used inside the client-only scene, so document is always there.
export const useWorldPalette = (): WorldPalette => useState(readPalette)[0];
