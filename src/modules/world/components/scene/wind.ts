// Shared wind for the grass, flowers and water spray, so everything sways
// together. GLSL: needs `uniform float uTime;` declared by the caller.
export const WIND_GLSL = /* glsl */ `
  // Gusts roll across the island as slow waves, with a faster flutter.
  float windStrength(vec2 p, float time) {
    float gust = sin(p.x * 0.22 + p.y * 0.12 + time * 0.9) * 0.5 + 0.5;
    float wave = sin(p.x * 0.6 - time * 1.7 + sin(p.y * 0.4 + time * 0.6));
    float flutter = sin(p.x * 2.7 + p.y * 3.1 + time * 4.3) * 0.15;
    return 0.25 + gust * 0.55 + wave * 0.18 + flutter;
  }
  const vec2 WIND_DIR = vec2(0.86, 0.5);
`;
