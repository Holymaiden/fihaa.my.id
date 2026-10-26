'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  ShaderMaterial,
} from 'three';

import {
  clearingMask,
  ISLAND,
  islandEdge,
  islandHeight,
  pathMask,
  waterMask,
} from '../../config/island';
import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { fogUniforms, setUniforms } from './shader-utils';
import { WIND_GLSL } from './wind';

interface MeadowLifeProps {
  palette: WorldPalette;
}

const { meadow } = VISUAL;

const random = (seed: number) => {
  const x = Math.sin(seed * 91.7 + 17.3) * 43_758.545_3;
  return x - Math.floor(x);
};

// Random grassy spots (not on paths, water or clearings).
export const meadowSpots = (count: number, seedOffset: number) => {
  const spots: [number, number][] = [];
  for (
    let attempt = 0;
    spots.length < count && attempt < count * 20;
    attempt++
  ) {
    const seed = attempt + seedOffset;
    const angle = random(seed) * Math.PI * 2;
    const distance =
      Math.sqrt(random(seed + 0.5)) * ISLAND.radius * islandEdge(angle) * 0.86;
    const x = Math.sin(angle) * distance;
    const z = Math.cos(angle) * distance;
    if (Math.max(pathMask(x, z), waterMask(x, z), clearingMask(x, z)) < 0.2) {
      spots.push([x, z]);
    }
  }
  return spots;
};

const flowerVertex = /* glsl */ `
  uniform float uTime;
  uniform float uWind;
  uniform float uSize;
  attribute float aKind;
  varying float vKind;
  #include <fog_pars_vertex>
  ${WIND_GLSL}
  void main() {
    vec3 p = position;
    float strength = windStrength(p.xz, uTime) * uWind;
    p.xz += WIND_DIR * strength * 0.12;
    vKind = aKind;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

// Little round blossoms: white, plus the two flower colours.
const flowerFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uLight;
  varying float vKind;
  #include <fog_pars_fragment>
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    vec3 color = vKind < 0.5 ? uColorA : vKind < 1.5 ? uColorB : uColorC;
    color = mix(color * 1.1, vec3(1.0, 0.92, 0.5), smoothstep(0.18, 0.0, d));
    gl_FragColor = vec4(color * uLight, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

// Fireflies at night, drifting pollen by day.
const moteVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  // How far they wander, and how high above the grass they float.
  uniform float uDrift;
  uniform float uLift;
  attribute float aSeed;
  varying float vGlow;
  void main() {
    vec3 p = position;
    float t = uTime * 0.35 + aSeed * 6.28;
    p.x += sin(t * 1.3 + aSeed * 10.0) * 0.9 * uDrift;
    p.z += cos(t * 1.1 + aSeed * 7.0) * 0.9 * uDrift;
    p.y += sin(t * 1.7 + aSeed * 3.0) * 0.45 * uDrift + uLift;
    vGlow = 0.35 + 0.65 * pow(sin(uTime * 1.4 + aSeed * 40.0) * 0.5 + 0.5, 3.0);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const moteFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  // Fireflies are little sideways ovals; pollen is round.
  uniform float uStretch;
  // Fireflies: a crisp bright oval (it blooms) in a faint halo.
  uniform float uCore;
  varying float vGlow;
  void main() {
    float d = length((gl_PointCoord - 0.5) * vec2(1.0, uStretch));
    float soft = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.3, 0.18, d) + soft * soft * 0.35;
    float alpha = mix(soft * soft, core, uCore) * vGlow * uOpacity;
    gl_FragColor = vec4(uColor * (1.0 + vGlow) * (1.0 + uCore * 1.5), alpha);
    #include <colorspace_fragment>
  }
`;

// Fireflies (and the pollen subset), in drifts over the grass tops.
const buildMotes = () => {
  const positions: number[] = [];
  const seeds: number[] = [];
  // In drifts, hovering over the grass tops.
  meadowSpots(meadow.fireflyDrifts, 503).forEach(([cx, cz], drift) => {
    for (let index = 0; index < meadow.firefliesPerDrift; index++) {
      const seed = drift * 37 + index;
      const angle = random(seed + 0.1) * Math.PI * 2;
      const radius = Math.sqrt(random(seed + 0.4)) * 1.5;
      const x = cx + Math.cos(angle) * radius;
      const z = cz + Math.sin(angle) * radius;
      if (Math.max(pathMask(x, z), waterMask(x, z)) > 0.3) {
        continue;
      }
      positions.push(
        x,
        islandHeight(x, z) + 0.35 + random(seed + 0.2) * 0.4,
        z,
      );
      seeds.push(random(seed + 0.7));
    }
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1));
  return geometry;
};

// Flowers dotted through the grass and motes floating above it.
const MeadowLife = ({ palette }: MeadowLifeProps) => {
  const effects = useEffectsEnabled();

  const flowers = useMemo(() => {
    const positions: number[] = [];
    const kinds: number[] = [];
    // Flowers grow in drifts: pick centres, then scatter around them.
    meadowSpots(meadow.flowerDrifts, 7).forEach(([cx, cz], drift) => {
      for (let index = 0; index < meadow.flowersPerDrift; index++) {
        const seed = drift * 101 + index;
        const angle = random(seed) * Math.PI * 2;
        const radius = Math.sqrt(random(seed + 0.3)) * 1.6;
        const x = cx + Math.cos(angle) * radius;
        const z = cz + Math.sin(angle) * radius;
        if (
          Math.max(pathMask(x, z), waterMask(x, z), clearingMask(x, z)) > 0.3
        ) {
          continue;
        }
        positions.push(
          x,
          islandHeight(x, z) + 0.28 + random(seed + 0.6) * 0.25,
          z,
        );
        kinds.push(drift % 3 === 0 ? 1 + (index % 2) : 0);
      }
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aKind', new Float32BufferAttribute(kinds, 1));
    return geometry;
  }, []);

  const motes = useMemo(() => buildMotes(), []);

  useEffect(
    () => () => {
      flowers.dispose();
      motes.dispose();
    },
    [flowers, motes],
  );

  const flowerMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: flowerVertex,
        fragmentShader: flowerFragment,
        fog: true,
        uniforms: {
          ...fogUniforms(),
          uTime: { value: 0 },
          uWind: { value: 1 },
          uSize: { value: meadow.flowerSize },
          uColorA: { value: new Color() },
          uColorB: { value: new Color() },
          uColorC: { value: new Color() },
          uLight: { value: 1 },
        },
      }),
    [],
  );

  const moteMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: moteVertex,
        fragmentShader: moteFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 0 },
          uColor: { value: new Color() },
          uOpacity: { value: 1 },
          uDrift: { value: 1 },
          uLift: { value: 0 },
          uStretch: { value: 1 },
          uCore: { value: 0 },
        },
      }),
    [],
  );

  useEffect(
    () => () => {
      flowerMaterial.dispose();
      moteMaterial.dispose();
    },
    [flowerMaterial, moteMaterial],
  );

  useEffect(() => {
    const night = palette.isNight;
    setUniforms(flowerMaterial, {
      uColorA: palette.blossom,
      uColorB: palette.flowerA,
      uColorC: palette.flowerB,
      uLight: night ? VISUAL.grass.nightLight : VISUAL.grass.dayLight,
    });
    setUniforms(moteMaterial, {
      uColor: night ? palette.firefly : palette.pollen,
      uSize: night ? meadow.fireflySize : meadow.pollenSize,
      uOpacity: night ? 1 : 0.55,
      uDrift: night ? 0.3 : 1,
      uLift: night ? 0 : 0.9,
      uStretch: night ? 1.8 : 1,
      uCore: night ? 1 : 0,
    });
    motes.setDrawRange(0, night ? Infinity : meadow.pollenCount);
  }, [flowerMaterial, moteMaterial, motes, palette]);

  useFrame(({ clock }) => {
    const time = effects ? clock.elapsedTime : 0;
    setUniforms(flowerMaterial, { uTime: time, uWind: effects ? 1 : 0 });
    setUniforms(moteMaterial, { uTime: time });
  });

  return (
    <>
      <points
        geometry={flowers}
        material={flowerMaterial}
        frustumCulled={false}
      />
      {effects && (
        <points
          geometry={motes}
          material={moteMaterial}
          frustumCulled={false}
        />
      )}
    </>
  );
};

export default MeadowLife;
