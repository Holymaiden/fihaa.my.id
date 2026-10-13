// Central knobs for the look of the 3D world. Colors live in the CSS tokens
// (--color-world-*, see globals.css); everything else is here.

export const VISUAL = {
  // Filmic tone mapping plus soft shadows gives the smooth look; the
  // terrain itself stays flat-colored (vertex colors, no textures).
  exposure: 1.05,
  dpr: [1, 2] as [number, number],
  // Far enough that the zoomed-out phone view stays clear.
  fog: { near: 70, far: 220 },
  sky: { radius: 280 },
  light: {
    day: { hemisphere: 1.3, sun: 2.6 },
    night: { hemisphere: 1.1, sun: 1.3 },
    sunPosition: [18, 28, 12] as const,
  },
  // Soft shadows from the sun; switched off when frames stay slow.
  shadows: { mapSize: 2048, narrowMapSize: 1024, radius: 4, bias: -0.0005 },
  island: {
    // Radians per dragged pixel.
    dragSpeed: 0.008,
    // Higher = snappier turn (MathUtils.damp lambda).
    turnDamping: 5,
  },
  camera: { damping: 4 },
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
  _Rock: 'stone',
  _Berry: 'berry',
  _Cyan: 'flowerA',
  _Yellow: 'flowerB',
} as const;
