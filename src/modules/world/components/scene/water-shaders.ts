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
// aRapids = how broken the water is (rises towards the lip).
export const surfaceVertex = /* glsl */ `
  attribute vec2 aFlow;
  attribute float aShore;
  attribute float aRapids;
  varying vec2 vFlow;
  varying float vShore;
  varying float vRapids;
  varying vec3 vIsland;
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vFlow = aFlow;
    vShore = aShore;
    vRapids = aRapids;
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
  uniform vec3 uSun;
  uniform vec3 uSunDirection;
  uniform float uRain;
  // Click ripple: island-frame x, z and start time (clock seconds).
  uniform vec3 uRipple;
  varying vec2 vFlow;
  varying float vShore;
  varying float vRapids;
  varying vec3 vIsland;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  ${NOISE_GLSL}

  void main() {
    float speed = length(vFlow);
    vec2 along = speed > 1e-3 ? vFlow / speed : vec2(0.0, 1.0);
    vec2 across = vec2(-along.y, along.x);
    // Coordinates that run with the current, so ripples are drawn out
    // along the flow and travel downstream.
    vec2 p = vec2(dot(vIsland.xz, across), dot(vIsland.xz, along));
    float slow = uTime * (0.08 + speed);
    float wave1 = waterNoise(vec2(p.x * 2.6, p.y * 1.1 - slow * 1.4));
    float wave2 = waterNoise(vec2(p.x * 6.5 + 4.0, p.y * 2.6 - slow * 2.2));
    float drops = waterNoise(vIsland.xz * 9.0 + uTime * 3.0) * uRain;
    float ripples = wave1 * 0.6 + wave2 * 0.4 + drops * 0.3;

    // A tilted normal from the ripples, for the sky reflection and glints.
    vec3 normal = normalize(vec3(
      (wave1 - 0.5) * 0.55 + (drops - 0.15) * 0.3,
      1.0,
      (wave2 - 0.5) * 0.55
    ));
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);

    vec3 color = mix(uDeep, uShallow, smoothstep(0.05, 0.95, vShore));
    color = mix(color, uSky, 0.12 + fresnel * 0.55);
    // Sun glints on the ripple crests (bright enough to bloom).
    vec3 mirrored = reflect(-viewDir, normal);
    float glint = pow(max(dot(mirrored, uSunDirection), 0.0), 140.0);
    color += uSun * glint * 2.5;

    // Foam: a lace along the banks, streaks where it runs fast, and white
    // water in the rapids before the lip.
    float bankFoam = smoothstep(0.72, 0.95, vShore + (wave2 - 0.5) * 0.35);
    float streaks = smoothstep(0.62, 0.85, wave2) * smoothstep(0.3, 1.2, speed);
    float white = smoothstep(0.35, 0.75, ripples) * vRapids;
    float foam = clamp(bankFoam * 0.7 + streaks * 0.45 + white, 0.0, 1.0);
    color = mix(color, uFoam, foam);

    // Rings from the last click.
    float age = uNow - uRipple.z;
    float spread = length(vIsland.xz - uRipple.xy);
    float rings = sin((spread - age * 1.6) * 14.0) * 0.5 + 0.5;
    float front = smoothstep(0.5, 0.0, abs(spread - age * 1.6));
    color = mix(color, uFoam, rings * front * exp(-age * 0.9) * step(0.0, age) * 0.7);

    // Soft edge: the water thins out over the bank instead of a hard line.
    float alpha = mix(0.93, 0.0, smoothstep(0.82, 1.0, vShore));
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
