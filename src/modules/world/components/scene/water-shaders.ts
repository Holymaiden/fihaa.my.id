// Shaders for the pond, the stream and the waterfall (see island-water.tsx).

export const NOISE_GLSL = /* glsl */ `
  // The pale blue shared by the falls' upper half and running water.
  #define PALE 0.28
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
// water depth over the bed, aAcross / aAlong = metres across and along the
// current (on pools, plain offsets from the centre).
export const surfaceVertex = /* glsl */ `
  attribute vec2 aFlow;
  attribute float aShore;
  attribute float aRapids;
  attribute float aDepth;
  attribute float aAcross;
  attribute float aAlong;
  varying vec2 vFlow;
  varying float vShore;
  varying float vRapids;
  varying float vDepth;
  varying float vAcross;
  varying float vAlong;
  varying vec3 vIsland;
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vFlow = aFlow;
    vShore = aShore;
    vRapids = aRapids;
    vDepth = aDepth;
    vAcross = aAcross;
    vAlong = aAlong;
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
  // Where a fall lands on this water: island-frame x, z and radius
  // (radius 0 when none does).
  uniform vec3 uLanding;
  varying vec2 vFlow;
  varying float vShore;
  varying float vRapids;
  varying float vDepth;
  varying float vAcross;
  varying float vAlong;
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
    // Flow space (metres across and along the current), stretched along it
    // and carried downstream.
    vec2 p = vec2(vAcross, vAlong);
    vec2 drift = vec2(0.0, uTime * (0.06 + speed * 0.9));
    vec2 flowP = vec2(p.x, p.y * (1.0 - min(speed, 0.6) * 0.6)) - drift;

    // Colour by depth, in the same two tones as the falls: pale blue over
    // the shallows, the falls' deeper blue (and a little darker) further in.
    float deep = 1.0 - exp(-vDepth * 3.0);
    vec3 pale = mix(uShallow, uFoam, PALE);
    vec3 low = mix(mix(uShallow, uFoam, 0.12), uDeep, 0.18);
    // Running water stays pale, like the top of the falls it feeds.
    float still = 1.0 - min(speed * 1.5, 0.8);
    vec3 body = mix(pale, mix(low, uDeep, 0.2), smoothstep(0.1, 0.9, deep) * still);
    // The falls' grain laid flat: thin darker lines running with the
    // current, spaced as on the falls (in metres) so they carry straight on
    // over the lip. Calm water has none.
    float run = min(speed * 1.2, 1.0);
    float lineX = p.x * 11.0 + waterNoise(vec2(p.x * 2.0, p.y * 0.5)) * 0.35;
    float grain = 1.0 - crisp(0.045, abs(fract(lineX) - 0.5));
    body = mix(body, mix(uShallow, uDeep, 0.55), grain * run * 0.5);

    // A little sky in it, more at grazing angles.
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - max(viewDir.y, 0.0), 4.0);
    vec3 sky = mix(uSky, uSkyTop, 0.35);
    vec3 color = mix(body, sky, 0.04 + fresnel * 0.2);

    // Sun sparkles: tiny cells that catch the light now and then.
    // In flow space, so the glints ride downstream with the current.
    vec2 glitter = voronoi((p - drift) * 3.0, uTime * 1.5);
    float sparkle = 1.0 - crisp(0.1, glitter.x);
    float facing = max(dot(reflect(-viewDir, vec3(0.0, 1.0, 0.0)), uSunDirection), 0.0);
    color += uSun * sparkle * pow(facing, 6.0) * (1.6 - run);

    // Shore foam: a crisp wavy line along the bank, its waves carried
    // downstream with the current (not across the island).
    float wobble = (waterNoise(flowP * 3.0) - 0.5) * 0.12;
    float shoreLine = crisp(0.86, vShore + wobble);
    // The falls' sharp white chips, a little longer along the current and
    // carried downstream; few on calm water. Kept well under a chip's
    // length per frame, or they strobe and seem to run upstream.
    float chipSpeed = 0.2 + speed * 0.45;
    float flecks = crisp(0.81, waterNoise(vec2(p.x * 27.0, p.y * 4.0 - uTime * chipSpeed * 4.0)))
      * (0.3 + run * 0.7);
    // Rapids: a few longer white streaks breaking up towards the lip.
    float rapids = crisp(0.72, waterNoise(flowP * vec2(14.0, 0.9))) * vRapids;
    // Where a fall lands: churned white water, streaks spreading outwards.
    vec2 fromFall = vIsland.xz - uLanding.xy;
    float landing = length(fromFall) / max(uLanding.z, 1e-3);
    float churn = (1.0 - smoothstep(0.6, 1.8, landing)) * step(1e-3, uLanding.z);
    vec2 outward = fromFall / max(length(fromFall), 1e-3);
    float spokes = waterNoise(outward * 3.0 + (landing * 2.0 - uTime * 1.4));
    rapids = max(rapids, crisp(0.62 - churn * 0.25, spokes) * churn);
    // Rain: rings opening on the surface.
    vec2 rainCells = voronoi(vIsland.xz * 5.0, 0.0);
    float rainPhase = fract(uTime * 1.3 + cellHash(floor(vIsland.xz * 5.0)).x);
    float rainRing = (1.0 - crisp(0.03, abs(rainCells.x - rainPhase * 0.5))) * (1.0 - rainPhase) * uRain;
    float foam = clamp(shoreLine * 0.9 + rapids + flecks + rainRing * 0.6, 0.0, 1.0);
    color = mix(color, uFoam, foam);

    // Rings from the last click.
    float age = uNow - uRipple.z;
    float spread = length(vIsland.xz - uRipple.xy);
    float ring = 1.0 - crisp(0.06, abs(spread - age * 1.6));
    color = mix(color, uFoam, ring * exp(-age * 0.9) * step(0.0, age) * 0.8);

    // Shallow water lets the bed show through; past the foam line it
    // fades out over the bank.
    // Running water is opaque like the falls.
    float clarity = max(mix(0.92, 0.98, deep), run);
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

// The fall, drawn like a painted curtain: pale blue up top and a deeper
// blue below, split by a hem of rounded drips; thin darker lines run down
// it, sharp white flecks rush down over both tones, and a dark rim marks
// the lip. Opaque, with slightly ragged sides.
export const fallFragment = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  // How tall the sheet is, in metres, so the drips stay round.
  uniform float uDrop;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  uniform vec3 uSky;
  varying vec2 vUv;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  ${NOISE_GLSL}

  float crisp(float edge, float value) {
    float width = max(fwidth(value), 1e-4) * 0.75;
    return smoothstep(edge - width, edge + width, value);
  }

  void main() {
    float across = vUv.x;
    float down = vUv.y;
    float rush = uTime * 1.6;

    vec3 upper = mix(uShallow, uFoam, PALE);
    vec3 lower = mix(mix(uShallow, uFoam, 0.12), uDeep, 0.18);
    // The hem: rounded drips hanging down, each a slightly different
    // length, swaying a little.
    float drip = fract(across * 7.0 + uSeed * 0.13);
    float lobe = sqrt(max(1.0 - pow(drip * 2.0 - 1.0, 2.0), 0.0));
    float dripLength = waterNoise(vec2(floor(across * 7.0 + uSeed * 0.13) * 3.7, uSeed));
    float hem = 0.42 + (lobe * (0.3 + dripLength * 0.35)
      + (waterNoise(vec2(across * 5.0 + uSeed, rush * 0.25)) - 0.5) * 0.25) / uDrop;
    vec3 color = mix(upper, lower, crisp(hem, down));
    // A second, fainter hem lower down.
    float hem2 = hem + 0.3 + (waterNoise(vec2(across * 9.0 - uSeed, 4.0)) - 0.5) * 0.08;
    color = mix(color, mix(lower, uDeep, 0.25), crisp(hem2, down) * 0.6);
    // Thin darker lines: the water's grain, barely wavy.
    float lineX = across * 16.0 + waterNoise(vec2(across * 3.0, down * 1.5)) * 0.35;
    float line = 1.0 - crisp(0.045, abs(fract(lineX) - 0.5));
    color = mix(color, mix(uShallow, uDeep, 0.55), line * 0.6);
    // Sharp white flecks, a little taller than wide (sized in metres, so
    // tall and short falls match), rushing down.
    float flecks = waterNoise(vec2(across * 38.0 + uSeed, vWorld.y * 5.0 + rush * 7.0));
    color = mix(color, uFoam * 1.25, crisp(0.81, flecks));
    // Dark rim where the water rolls over the lip.
    float rim = 1.0 - crisp(0.012 + waterNoise(vec2(across * 12.0, 1.0)) * 0.012, down);
    color = mix(color, mix(uShallow, uDeep, 0.5), rim * 0.45);

    // Slightly ragged sides; the sheet thins out at the very bottom.
    float edge = abs(across - 0.5) * 2.0;
    float ragged = 1.0 - crisp(0.94 - waterNoise(vec2(down * 6.0 - rush, uSeed)) * 0.08, edge);
    float fade = 1.0 - smoothstep(0.9, 1.0, down);
    float alpha = ragged * fade;
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
