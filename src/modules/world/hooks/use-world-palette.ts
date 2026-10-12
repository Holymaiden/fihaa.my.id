'use client';

import { useSyncExternalStore } from 'react';

// Colors of the 3D world come from the CSS tokens in globals.css
// (--color-world-*), so 2D and 3D share one source of truth. The dark theme
// swaps in a night palette, so the palette follows the <html> class.
const TOKENS = {
  skyTop: '--color-world-sky-top',
  skyHorizon: '--color-world-sky-horizon',
  skyBottom: '--color-world-sky-bottom',
  fog: '--color-world-fog',
  sun: '--color-world-sun',
  groundLight: '--color-world-ground-light',
  grassLight: '--color-world-grass-light',
  grass: '--color-world-grass',
  sand: '--color-world-sand',
  cliff: '--color-world-cliff',
  rock: '--color-world-rock',
  rockDeep: '--color-world-rock-deep',
  foliage: '--color-world-foliage',
  trunk: '--color-world-trunk',
  stone: '--color-world-stone',
  berry: '--color-world-berry',
  flowerA: '--color-world-flower-a',
  flowerB: '--color-world-flower-b',
  stationHover: '--color-world-station-hover',
  stationActive: '--color-world-station-active',
  wood: '--color-world-wood',
  paper: '--color-world-paper',
  skillNode: '--color-world-skill-node',
  mailbox: '--color-world-mailbox',
  crystal: '--color-world-crystal',
  crystalGlow: '--color-world-crystal-glow',
  secret: '--color-world-secret',
} as const;

export type WorldPaletteKey = keyof typeof TOKENS;

export type WorldPalette = Record<WorldPaletteKey, string> & {
  isNight: boolean;
};

let cachedKey = '';
let cached: WorldPalette | null = null;

const readPalette = (): WorldPalette => {
  const root = document.documentElement;
  const isNight = root.classList.contains('dark');
  const key = `${root.className}`;
  if (cached && key === cachedKey) {
    return cached;
  }
  const styles = getComputedStyle(root);
  cached = {
    ...(Object.fromEntries(
      Object.entries(TOKENS).map(([name, token]) => [
        name,
        styles.getPropertyValue(token).trim(),
      ]),
    ) as Record<WorldPaletteKey, string>),
    isNight,
  };
  cachedKey = key;
  return cached;
};

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
};

// Only used inside the client-only scene, so document is always there.
export const useWorldPalette = (): WorldPalette =>
  useSyncExternalStore(subscribe, readPalette, readPalette);
