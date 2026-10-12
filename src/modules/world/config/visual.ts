// Central knobs for the look of the 3D world. Colors live in the CSS tokens
// (--color-world-*, see globals.css); everything else is here.

export const VISUAL = {
  // Flat colors: no tone mapping, so model colors stay as authored.
  flat: true,
  dpr: [1, 2] as [number, number],
  // Far enough that the zoomed-out phone view (about 100 units away) stays clear.
  fog: { near: 90, far: 260 },
  sky: { radius: 280 },
  light: {
    day: { hemisphere: 1.5, sun: 1.7 },
    night: { hemisphere: 1.2, sun: 0.9 },
    sunPosition: [20, 30, 15] as const,
  },
  vault: {
    // A small coloured light so the vault reads as its own place.
    lightIntensity: 18,
    lightDistance: 9,
  },
  // Motion effects. All of them can be switched off from the HUD and are
  // off by default for prefers-reduced-motion.
  effects: {
    cloudDriftSpeed: 0.01, // radians per second around the island
    crystalSpinSpeed: 0.5,
    crystalPulseSpeed: 1.6,
    sparkles: { count: 40, scale: 5, size: 3, speed: 0.3 },
  },
} as const;

// Kit material name suffix -> palette token, so the Quaternius models pick up
// the shared palette. KayKit models keep their atlas texture.
export const MATERIAL_RECOLOR = {
  _Green: 'foliage',
  _Wood: 'trunk',
  _Rock: 'rock',
  _Berry: 'berry',
  _Cyan: 'flowerA',
  _Yellow: 'flowerB',
} as const;
