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

  vec2 cellHash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  // Animated Voronoi: distances to the nearest and second-nearest cell
  // points, whose points wander slowly so the pattern lives.
  vec2 voronoi(vec2 p, float time) {
    vec2 cell = floor(p);
    vec2 local = fract(p);
    float first = 8.0;
    float second = 8.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 offset = vec2(float(x), float(y));
        vec2 h = cellHash(cell + offset);
        vec2 point = offset + 0.5 + 0.4 * sin(time + h * 6.2831);
        float d = length(point - local);
        if (d < first) {
          second = first;
          first = d;
        } else if (d < second) {
          second = d;
        }
      }
    }
    return vec2(first, second);
  }

  // A crisp step that stays smooth at any zoom (no aliasing).
  float crisp(float edge, float value) {
    float width = max(fwidth(value), 1e-4) * 0.75;
    return smoothstep(edge - width, edge + width, value);
  }

  void main() {
    float speed = length(vFlow);
    vec2 along = speed > 1e-3 ? vFlow / speed : vec2(0.0, 1.0);
    vec2 across = vec2(-along.y, along.x);
    // Flow space: stretched along the current and carried downstream.
    vec2 p = vec2(dot(vIsland.xz, across), dot(vIsland.xz, along));
    vec2 drift = vec2(0.0, uTime * (0.06 + speed * 0.9));
    vec2 flowP = vec2(p.x, p.y * (1.0 - min(speed, 0.6) * 0.6)) - drift;

    // Colour by depth: bright and clear over the shallows, through a mid
    // tone, to deep water.
    float deep = 1.0 - exp(-vDepth * 3.0);
    vec3 mid = mix(uShallow, uDeep, 0.5);
    vec3 body = deep < 0.5
      ? mix(uShallow * 1.08, mid, deep * 2.0)
      : mix(mid, uDeep, deep * 2.0 - 1.0);

    // Caustic web: thin bright lines along the Voronoi cell edges, brighter
    // in the shallows where the light reaches the bed.
    vec2 cells = voronoi(flowP * 2.2, uTime * 0.6);
    float web = 1.0 - crisp(0.06, cells.y - cells.x);
    vec2 fine = voronoi(flowP * 4.7 + 3.1, uTime * 0.9);
    web = max(web, (1.0 - crisp(0.045, fine.y - fine.x)) * 0.6);
    body += uFoam * web * (0.28 - deep * 0.18);

    // A little sky in it, more at grazing angles.
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - max(viewDir.y, 0.0), 4.0);
    vec3 sky = mix(uSky, uSkyTop, 0.35);
    vec3 color = mix(body, sky, 0.06 + fresnel * 0.45);

    // Sun sparkles: tiny cells that catch the light now and then.
    vec2 glitter = voronoi(vIsland.xz * 9.0 + drift * 2.0, uTime * 2.5);
    float sparkle = 1.0 - crisp(0.08, glitter.x);
    float facing = max(dot(reflect(-viewDir, vec3(0.0, 1.0, 0.0)), uSunDirection), 0.0);
    color += uSun * sparkle * pow(facing, 6.0) * 1.6;

    // Shore foam: a crisp wavy line along the bank and a second one that
    // breathes in and out just inside it.
    float wobble = (waterNoise(vIsland.xz * 3.0 + uTime * 0.3) - 0.5) * 0.12;
    float shoreLine = crisp(0.86, vShore + wobble);
    float pulse = 0.72 + sin(uTime * 1.3 + vIsland.x * 0.7) * 0.04;
    float innerLine = crisp(pulse, vShore + wobble) - crisp(pulse + 0.035, vShore + wobble);
    // Rapids: white water breaking up towards the lip.
    float rapids = crisp(0.55, waterNoise(flowP * vec2(3.0, 1.2)) + vRapids * 0.5) * vRapids;
    // Rain: rings opening on the surface.
    vec2 rainCells = voronoi(vIsland.xz * 5.0, 0.0);
    float rainPhase = fract(uTime * 1.3 + cellHash(floor(vIsland.xz * 5.0)).x);
    float rainRing = (1.0 - crisp(0.03, abs(rainCells.x - rainPhase * 0.5))) * (1.0 - rainPhase) * uRain;
    float foam = clamp(shoreLine * 0.9 + innerLine * 0.7 + rapids + rainRing * 0.6, 0.0, 1.0);
    color = mix(color, uFoam, foam);

    // Rings from the last click.
    float age = uNow - uRipple.z;
    float spread = length(vIsland.xz - uRipple.xy);
    float ring = 1.0 - crisp(0.06, abs(spread - age * 1.6));
    color = mix(color, uFoam, ring * exp(-age * 0.9) * step(0.0, age) * 0.8);

    // Shallow water lets the bed show through; past the foam line it
    // fades out over the bank.
    float clarity = mix(0.55, 0.95, deep);
    float alpha = max(clarity, foam) * (1.0 - smoothstep(0.93, 1.0, vShore));
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
