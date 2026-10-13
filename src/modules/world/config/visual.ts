// Central knobs for the look of the 3D world. Colors live in the CSS tokens
// (--color-world-*, see globals.css); everything else is here.

export const VISUAL = {
  // Filmic tone mapping plus soft shadows gives the smooth look; the
  // terrain itself stays flat-colored (vertex colors, no textures).
  exposure: 1.15,
  // Post-processing (see world-post.tsx).
  post: {
    multisampling: 4,
    ao: { radius: 1.8, intensity: 2.2, falloff: 1.2 },
    dof: { focus: 9, range: 14, bokeh: 2.2 },
    // Only things brighter than white bloom (sun, fire, crystals), so the
    // bright sky doesn't haze the whole frame.
    bloom: { day: 0.4, night: 0.8, threshold: 1.05 },
    saturation: 0.16,
    vignette: { offset: 0.3, darkness: 0.55 },
    grain: 0.08,
    // Temporal AA: share of the history kept each frame, and the size of
    // the sub-pixel camera nudge (1 = a full pixel).
    taa: { blend: 0.88, jitter: 1 },
    godRays: {
      samples: 48,
      density: 0.94,
      decay: 0.92,
      weight: 0.35,
      exposure: 0.55,
    },
  },
  // Image-based lighting from a small studio of light shapes (no HDR file).
  environment: { resolution: 128, day: 0.7, night: 0.35 },
  dpr: [1, 2] as [number, number],
  // Far enough that the zoomed-out phone view stays clear.
  fog: { near: 70, far: 220 },
  sky: {
    radius: 280,
    // Where the sun (or moon) disc sits, and its size (share of the dome).
    sunDirection: [0.8, 0.26, 0.54] as const,
    sunSize: 0.0016,
    moonSize: 0.0009,
  },
  // Grass tufts: grid spacing (smaller = denser), blade size, brightness.
  grass: {
    spacing: 0.15,
    minHeight: 0.2,
    maxHeight: 0.55,
    width: 0.055,
    dayLight: 1,
    nightLight: 0.5,
    // Share of tufts drawn on narrow screens, and when frames stay slow.
    narrowDensity: 0.5,
    fallbackDensity: 0.35,
  },
  waterfall: {
    // How far it arcs out from the rim, how far it falls, how much it widens.
    reach: 2.2,
    drop: 22,
    spread: 1.6,
    sprayCount: 90,
    spraySize: 900,
  },
  cloudSea: { height: -40, radius: 260, fade: [60, 210] as const },
  // Raymarched cloud layer under the island (high quality only).
  volumetricClouds: {
    bottom: -52,
    top: -24,
    steps: 20,
    coverage: 0.5,
    overcastCoverage: 0.22,
    absorption: 0.09,
    maxDistance: 420,
    fade: [180, 400] as const,
  },
  meadow: {
    flowerDrifts: 26,
    flowersPerDrift: 26,
    flowerSize: 22,
    moteCount: 90,
    fireflySize: 55,
    pollenSize: 18,
  },
  weather: {
    // Seconds for one weather to blend into the next.
    blendSeconds: 6,
    // How long each weather lasts when it changes by itself (seconds).
    autoDuration: [55, 95] as const,
    // Fog when it rains or is misty (near, far).
    rainFog: [25, 120] as const,
    mistFog: [6, 55] as const,
    // Sun and sky light kept under full cloud.
    overcastLight: 0.5,
    rain: { drops: 2600, narrowDrops: 1200, box: 36, speed: 26 },
  },
  campfire: { dayLight: 3, nightLight: 14, distance: 9 },
  light: {
    // Key (sun), rim (opposite, cool) and fill (sky), with IBL on top.
    day: { hemisphere: 0.7, sun: 2.8, rim: 0.7 },
    night: { hemisphere: 0.6, sun: 1.2, rim: 0.5 },
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
  camera: { damping: 4, fov: 45 },
  // Cinematic moves (seconds; damping = how quickly the camera settles).
  transition: {
    // From the clouds to the island after the entrance screen.
    introDamping: 0.9,
    introSeconds: 5,
    // Diving from the island view onto the island, and rising back out.
    diveSeconds: 3.6,
    exitDamping: 1.6,
    exitSeconds: 3,
    // Extra lens width at the fastest point of a dive.
    fovKick: 16,
  },
  // The 360° tour round the island.
  tour: {
    // Radians per second round the island (one loop ≈ 70 s).
    speed: 0.09,
    radius: [24, 34] as const,
    height: [3, 15] as const,
    // Seconds to ease from wherever the camera was onto the path.
    blendIn: 3,
    // Start by itself after this long without input (seconds).
    idleStart: 50,
  },
  // First-person explore mode.
  explore: {
    fov: 62,
    // Radians per dragged pixel, and how quickly the view follows.
    dragSpeed: 0.0042,
    lookDamping: 7,
    // Gentle look towards the mouse (radians at the screen edge).
    swayYaw: 0.07,
    swayPitch: 0.04,
    pitchRange: [-1.1, 0.95] as const,
    // Units per second along a walk, and its shortest/longest duration.
    walkSpeed: 6.5,
    minWalk: 1.6,
    maxWalk: 4.5,
    // Up-and-down of the idle breath, in units.
    breath: 0.025,
    // Wheel delta that switches between island and explore mode.
    wheelThreshold: 120,
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
  _Rock: 'stone',
  _Berry: 'berry',
  _Cyan: 'flowerA',
  _Yellow: 'flowerB',
} as const;
