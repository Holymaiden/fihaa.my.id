// Shaders for the pond, the stream and the waterfall (see island-water.tsx).

export const NOISE_GLSL = /* glsl */ `
  float waterHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float waterNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(waterHash(i), waterHash(i + vec2(1.0, 0.0)), u.x),
      mix(waterHash(i + vec2(0.0, 1.0)), waterHash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
`;

// Pond and stream share one surface. Per vertex: aFlow = flow direction
// times speed (island frame), aShore = 0 mid-water .. 1 at the bank,
// aRapids = how broken the water is (rises towards the lip), aDepth =
// water depth over the bed.
export const surfaceVertex = /* glsl */ `
  attribute vec2 aFlow;
  attribute float aShore;
  attribute float aRapids;
  attribute float aDepth;
  varying vec2 vFlow;
  varying float vShore;
  varying float vRapids;
  varying float vDepth;
  varying vec3 vIsland;
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vFlow = aFlow;
    vShore = aShore;
    vRapids = aRapids;
    vDepth = aDepth;
    vIsland = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

export const surfaceFragment = /* glsl */ `
  uniform float uTime;
  uniform float uNow;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  uniform vec3 uSky;
  uniform vec3 uSkyTop;
  uniform vec3 uSun;
  uniform vec3 uSunDirection;
  uniform float uRain;
  // Click ripple: island-frame x, z and start time (clock seconds).
  uniform vec3 uRipple;
  varying vec2 vFlow;
  varying float vShore;
  varying float vRapids;
  varying float vDepth;
  varying vec3 vIsland;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  ${NOISE_GLSL}

  // Ripple height: two layers drawn out along the current and travelling
  // downstream, plus raindrops.
  float rippleHeight(vec2 p, float slow) {
    return waterNoise(vec2(p.x * 2.6, p.y * 1.1 - slow * 1.4)) * 0.6
      + waterNoise(vec2(p.x * 6.5 + 4.0, p.y * 2.6 - slow * 2.2)) * 0.3
      + waterNoise(vec2(p.x * 15.0 - 7.0, p.y * 9.0 - slow * 3.4)) * 0.1;
  }

  void main() {
    float speed = length(vFlow);
    vec2 along = speed > 1e-3 ? vFlow / speed : vec2(0.0, 1.0);
    vec2 across = vec2(-along.y, along.x);
    vec2 p = vec2(dot(vIsland.xz, across), dot(vIsland.xz, along));
    float slow = uTime * (0.08 + speed);

    // Surface normal from the slope of the ripples (finite differences),
    // turned back from flow space into the island frame.
    float e = 0.04;
    float h = rippleHeight(p, slow);
    float dx = (rippleHeight(p + vec2(e, 0.0), slow) - h) / e;
    float dy = (rippleHeight(p + vec2(0.0, e), slow) - h) / e;
    float drops = waterNoise(vIsland.xz * 9.0 + uTime * 3.0) * uRain;
    float bump = 0.08 + speed * 0.05 + uRain * 0.06;
    vec2 slope = (across * dx + along * dy) * bump + (drops - 0.15) * 0.3 * uRain;
    vec3 normal = normalize(vec3(-slope.x, 1.0, -slope.y));

    // Deeper water absorbs more light: clear and bright over the shallows,
    // dark in the middle of the pond.
    float deep = 1.0 - exp(-vDepth * 3.2);
    vec3 body = mix(uShallow, uDeep, deep);

    // The sky it mirrors: horizon colour low down, the zenith above.
    vec3 viewDir = normalize(cameraPosition - vWorld);
    vec3 mirrored = reflect(-viewDir, normal);
    vec3 sky = mix(uSky, uSkyTop, smoothstep(0.0, 0.6, mirrored.y));
    float fresnel = 0.02 + 0.98 * pow(1.0 - max(dot(viewDir, normal), 0.0), 5.0);
    vec3 color = mix(body, sky, clamp(fresnel * 0.9 + 0.08, 0.0, 1.0));
    // Sun glints on the ripple crests (bright enough to bloom).
    float glint = pow(max(dot(mirrored, uSunDirection), 0.0), 220.0);
    color += uSun * glint * 3.0;

    // Foam: a soft lace along the banks, streaks where it runs fast, and
    // white water in the rapids before the lip.
    float lace = waterNoise(vIsland.xz * 7.0 + uTime * 0.4);
    float bankFoam = smoothstep(0.8, 0.97, vShore + (lace - 0.5) * 0.25) * 0.6;
    float streaks = smoothstep(0.66, 0.88, h) * smoothstep(0.3, 1.2, speed);
    float white = smoothstep(0.4, 0.8, h + lace * 0.3) * vRapids;
    float foam = clamp(bankFoam * 0.6 + streaks * 0.4 + white, 0.0, 1.0);
    color = mix(color, uFoam, foam);

    // Rings from the last click.
    float age = uNow - uRipple.z;
    float spread = length(vIsland.xz - uRipple.xy);
    float rings = sin((spread - age * 1.6) * 14.0) * 0.5 + 0.5;
    float front = smoothstep(0.5, 0.0, abs(spread - age * 1.6));
    color = mix(color, uFoam, rings * front * exp(-age * 0.9) * step(0.0, age) * 0.7);

    // Shallow water lets the bed show through; the edge fades out over
    // the bank instead of a hard line.
    float clarity = mix(0.45, 0.94, deep);
    float alpha = max(clarity, fresnel) * (1.0 - smoothstep(0.82, 1.0, vShore));
    alpha = max(alpha, foam * 0.6 * (1.0 - smoothstep(0.9, 1.0, vShore)));
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export const fallVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

// The fall: a clear glassy sheet over the lip that breaks into white
// streaks, ragged at the sides, thinning into spray as it drops.
export const fallFragment = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform vec3 uShallow;
  uniform vec3 uFoam;
  uniform vec3 uSky;
  varying vec2 vUv;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  ${NOISE_GLSL}
  void main() {
    float across = vUv.x;
    float down = vUv.y;
    float rush = uTime * 2.8;
    float coarse = waterNoise(vec2(across * 9.0 + uSeed, down * 2.6 - rush));
    float fine = waterNoise(vec2(across * 26.0 + uSeed, down * 6.0 - rush * 1.5));
    float edge = abs(across - 0.5) * 2.0;
    float ragged = 1.0 - smoothstep(0.55 - coarse * 0.35, 1.0, edge);
    float sheet = 1.0 - smoothstep(0.02, 0.12, down);

    float white = clamp(coarse * 0.7 + fine * 0.6 - 0.25 + down * 0.7, 0.0, 1.0);
    vec3 color = mix(uShallow, uFoam, white);
    // Over the lip the water is still smooth and reflects the sky.
    color = mix(color, mix(uShallow, uSky, 0.5), sheet * 0.7);
    // Sparkle on the crests (blooms).
    color += uFoam * smoothstep(0.78, 0.95, fine) * 0.8 * (1.0 - sheet);

    float fade = 1.0 - smoothstep(0.5, 1.0, down);
    float alpha = ragged * fade * mix(0.7 + fine * 0.3, 0.9, sheet);
    // The fall writes depth (so the raymarched clouds go behind it); its
    // see-through edges are dropped so they don't block what's behind.
    if (alpha < 0.12) discard;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

// Soft spray puffs where the water leaves the rim and along the fall.
export const sprayVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    float life = fract(uTime * 0.3 + aSeed);
    vec3 p = position;
    p.y -= life * 3.0;
    p.x += sin(aSeed * 40.0 + uTime * 0.7) * 0.6 * life;
    p.z += cos(aSeed * 23.0 + uTime * 0.6) * 0.6 * life;
    vAlpha = (1.0 - life) * smoothstep(0.0, 0.2, life);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.5 + life) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const sprayFragment = /* glsl */ `
  uniform vec3 uFoam;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uFoam, alpha * alpha * vAlpha * 0.35);
    #include <colorspace_fragment>
  }
`;
