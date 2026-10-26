// Shared wind for the grass, flowers and water spray, so everything sways
// together. GLSL: needs `uniform float uTime;` declared by the caller.
export const WIND_GLSL = /* glsl */ `
  const vec2 WIND_DIR = vec2(0.86, 0.5);

  float windHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Smooth value noise, 0..1.
  float windNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(windHash(i), windHash(i + vec2(1.0, 0.0)), u.x),
      mix(windHash(i + vec2(0.0, 1.0)), windHash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Gusts are patches of noise blown across the island along WIND_DIR; a
  // second, smaller layer drifts a little off-axis so the patches change
  // shape as they travel, with a quick flutter on top.
  float windStrength(vec2 p, float time) {
    vec2 side = vec2(-WIND_DIR.y, WIND_DIR.x);
    float gust = windNoise(p * 0.09 - WIND_DIR * time * 0.32);
    float ripple = windNoise(p * 0.27 - (WIND_DIR * 0.8 + side * 0.35) * time * 0.75);
    float flutter = sin(p.x * 2.7 + p.y * 3.1 + time * 4.3) * 0.08;
    return 0.2 + gust * 0.75 + ripple * 0.3 + flutter;
  }
`;
