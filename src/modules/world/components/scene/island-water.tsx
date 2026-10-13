'use client';

import type { ThreeEvent } from '@react-three/fiber';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import type { IUniform } from 'three';
import {
  AdditiveBlending,
  BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';

import {
  POND,
  POND_CENTER,
  POND_LEVEL,
  STREAM,
  streamLevel,
} from '../../config/island';
import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { interaction } from './interaction';
import { isDrag } from './pointer';
import { fogUniforms, setUniforms, setVector } from './shader-utils';

interface IslandWaterProps {
  palette: WorldPalette;
}

const { waterfall } = VISUAL;

// uv.x across the water, uv.y along the flow (0 = upstream). `uFlow` is how
// fast the ripples travel; the pond barely moves.
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vLocal;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vLocal = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const NOISE_GLSL = /* glsl */ `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
`;

// Pond and stream: deep colour in the middle, foam at the banks and ripple
// highlights drifting downstream.
const surfaceFragment = /* glsl */ `
  uniform float uTime;
  uniform float uFlow;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  uniform float uRound;
  // Click ripple: island-frame x, z and start time; uNow = clock time.
  uniform vec3 uRipple;
  uniform float uNow;
  uniform vec2 uOrigin;
  varying vec2 vUv;
  varying vec3 vLocal;
  #include <fog_pars_fragment>
  ${NOISE_GLSL}
  void main() {
    // Distance to the bank: across the stream, or out from the pond centre.
    float edge = uRound > 0.5
      ? length(vUv - 0.5) * 2.0
      : abs(vUv.x - 0.5) * 2.0;
    vec3 color = mix(uDeep, uShallow, smoothstep(0.1, 0.95, edge));
    vec2 p = vLocal.xz * 2.2;
    float ripple = noise(p + vec2(0.0, -uTime * uFlow * 2.0))
      * noise(p * 1.7 + vec2(uTime * 0.3, -uTime * uFlow * 3.0));
    color += uFoam * smoothstep(0.32, 0.6, ripple) * 0.35;
    float foam = smoothstep(0.78, 1.0, edge + noise(p * 2.0 + uTime) * 0.15);
    color = mix(color, uFoam, foam * 0.75);
    // Rings spreading from the last click.
    float age = uNow - uRipple.z;
    float spread = length(vLocal.xz + uOrigin - uRipple.xy);
    float rings = sin((spread - age * 1.6) * 14.0) * 0.5 + 0.5;
    float front = smoothstep(0.5, 0.0, abs(spread - age * 1.6));
    color = mix(color, uFoam, rings * front * exp(-age * 0.9) * step(0.0, age) * 0.8);
    gl_FragColor = vec4(color, 0.92);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

// The fall: streaks rushing down, brighter at the lip, thinning into spray.
const fallFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uShallow;
  uniform vec3 uFoam;
  varying vec2 vUv;
  varying vec3 vLocal;
  #include <fog_pars_fragment>
  ${NOISE_GLSL}
  void main() {
    float across = vUv.x;
    float down = vUv.y;
    float streak = noise(vec2(across * 14.0, down * 2.5 - uTime * 2.6));
    streak = mix(streak, noise(vec2(across * 31.0, down * 5.0 - uTime * 3.4)), 0.45);
    vec3 color = mix(uShallow, uFoam, smoothstep(0.35, 0.8, streak) * 0.85 + 0.15);
    color = mix(color, uFoam, smoothstep(0.12, 0.0, down));
    float sides = smoothstep(0.0, 0.18, across) * smoothstep(1.0, 0.82, across);
    float fade = 1.0 - smoothstep(0.45, 1.0, down);
    float alpha = sides * fade * (0.72 + streak * 0.28);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

// Soft spray puffs at the lip and along the fall.
const sprayVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    float life = fract(uTime * 0.35 + aSeed);
    vec3 p = position;
    p.y -= life * 3.5;
    p.x += sin(aSeed * 40.0 + uTime) * 0.4 * life;
    p.z += cos(aSeed * 23.0 + uTime) * 0.4 * life;
    vAlpha = (1.0 - life) * smoothstep(0.0, 0.15, life);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.6 + life) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const sprayFragment = /* glsl */ `
  uniform vec3 uFoam;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.0, d) * vAlpha * 0.45;
    gl_FragColor = vec4(uFoam, alpha);
    #include <colorspace_fragment>
  }
`;

// Ribbon along the stream from the pond to just past the rim.
const buildStream = () => {
  const [sx, sz] = STREAM.start;
  const [ex, ez] = STREAM.end;
  const length = Math.hypot(ex - sx, ez - sz);
  const dirX = (ex - sx) / length;
  const dirZ = (ez - sz) / length;
  const steps = 40;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    // Start inside the pond so the two overlap without a seam.
    const along = POND.radius * 0.6 + (length - POND.radius * 0.6) * t;
    const share = along / length;
    const y = streamLevel(share) + 0.02;
    const half = STREAM.halfWidth * (0.85 + 0.25 * Math.sin(share * 9));
    for (const side of [-1, 1]) {
      positions.push(
        sx + dirX * along - dirZ * half * side,
        y,
        sz + dirZ * along + dirX * half * side,
      );
      uvs.push((side + 1) / 2, share);
    }
    if (step < steps) {
      const a = step * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
};

// The fall itself: a ribbon that leaves the rim, arcs out and drops.
const buildFall = () => {
  const [ex, ez] = STREAM.end;
  const dirX = Math.sin(POND.angle);
  const dirZ = Math.cos(POND.angle);
  const steps = 48;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const out = waterfall.reach * Math.sqrt(t) - 0.2;
    const y =
      STREAM.endLevel - waterfall.drop * t * t * 0.4 - waterfall.drop * t * 0.6;
    const half = STREAM.halfWidth * (1 + t * waterfall.spread);
    for (const side of [-1, 1]) {
      positions.push(
        ex + dirX * out - dirZ * half * side,
        y,
        ez + dirZ * out + dirX * half * side,
      );
      uvs.push((side + 1) / 2, t);
    }
    if (step < steps) {
      const a = step * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
};

const buildSpray = () => {
  const [ex, ez] = STREAM.end;
  const dirX = Math.sin(POND.angle);
  const dirZ = Math.cos(POND.angle);
  const positions: number[] = [];
  const seeds: number[] = [];
  for (let index = 0; index < waterfall.sprayCount; index++) {
    const seed = (index * 0.618_034) % 1;
    const t = (index % 7) / 7;
    const out = waterfall.reach * Math.sqrt(t) + 0.2;
    const y = STREAM.endLevel - waterfall.drop * t * 0.75;
    const side = (((index * 37) % 11) / 11 - 0.5) * STREAM.halfWidth * 2.4;
    positions.push(
      ex + dirX * out - dirZ * side,
      y,
      ez + dirZ * out + dirX * side,
    );
    seeds.push(seed);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1));
  return geometry;
};

const makeUniforms = (extra: Record<string, IUniform>) => ({
  ...fogUniforms(),
  uRipple: { value: new Vector3(0, 0, -100) },
  uOrigin: { value: new Vector2() },
  uTime: { value: 0 },
  uShallow: { value: new Color() },
  uDeep: { value: new Color() },
  uFoam: { value: new Color() },
  ...extra,
});

// Pond, stream and waterfall, in the island frame.
const IslandWater = ({ palette }: IslandWaterProps) => {
  const effects = useEffectsEnabled();
  const clock = useThree((state) => state.clock);
  const invalidate = useThree((state) => state.invalidate);

  // Touching the water sends rings across it.
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (isDrag(event)) {
      return;
    }
    event.stopPropagation();
    const group = event.object.parent;
    const local = group
      ? group.worldToLocal(event.point.clone())
      : event.point.clone();
    Object.assign(interaction.ripple, {
      x: local.x,
      z: local.z,
      time: clock.elapsedTime,
    });
    invalidate();
  };
  const geometries = useMemo(
    () => ({
      pond: new CircleGeometry(POND.radius + 0.25, 48).rotateX(-Math.PI / 2),
      stream: buildStream(),
      fall: buildFall(),
      spray: buildSpray(),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(geometries).forEach((item) => item.dispose()),
    [geometries],
  );

  const materials = useMemo(
    () => ({
      pond: new ShaderMaterial({
        vertexShader,
        fragmentShader: surfaceFragment,
        transparent: true,
        fog: true,
        uniforms: makeUniforms({
          uFlow: { value: 0.15 },
          uRound: { value: 1 },
          uNow: { value: 0 },
          uOrigin: { value: new Vector2(...POND_CENTER) },
        }),
      }),
      stream: new ShaderMaterial({
        vertexShader,
        fragmentShader: surfaceFragment,
        transparent: true,
        fog: true,
        uniforms: makeUniforms({
          uFlow: { value: 1 },
          uRound: { value: 0 },
          uNow: { value: 0 },
        }),
      }),
      fall: new ShaderMaterial({
        vertexShader,
        fragmentShader: fallFragment,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        fog: true,
        uniforms: makeUniforms({}),
      }),
      spray: new ShaderMaterial({
        vertexShader: sprayVertex,
        fragmentShader: sprayFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: waterfall.spraySize },
          uFoam: { value: new Color() },
        },
      }),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(materials).forEach((item) => item.dispose()),
    [materials],
  );

  useEffect(() => {
    for (const material of Object.values(materials)) {
      setUniforms(material, {
        uFoam: palette.foam,
        uShallow: palette.water,
        uDeep: palette.waterDeep,
      });
    }
  }, [materials, palette]);

  useFrame(({ clock }) => {
    const time = effects ? clock.elapsedTime : 0;
    for (const material of Object.values(materials)) {
      setUniforms(material, { uTime: time, uNow: clock.elapsedTime });
    }
    const { ripple } = interaction;
    for (const material of [materials.pond, materials.stream]) {
      setVector(material, 'uRipple', [ripple.x, ripple.z, ripple.time]);
    }
    if (clock.elapsedTime - ripple.time < 4) {
      invalidate();
    }
  });

  return (
    <group>
      <mesh
        geometry={geometries.pond}
        material={materials.pond}
        position={[POND_CENTER[0], POND_LEVEL, POND_CENTER[1]]}
        onClick={handleClick}
      />
      <mesh
        geometry={geometries.stream}
        material={materials.stream}
        onClick={handleClick}
      />
      <mesh geometry={geometries.fall} material={materials.fall} />
      {effects && (
        <points
          geometry={geometries.spray}
          material={materials.spray}
          frustumCulled={false}
        />
      )}
    </group>
  );
};

export default IslandWater;
