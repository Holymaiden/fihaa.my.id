'use client';

import type { ThreeEvent } from '@react-three/fiber';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import type { IUniform } from 'three';
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  ShaderMaterial,
  Vector3,
} from 'three';

import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { interaction } from './interaction';
import { isDrag } from './pointer';
import { fogUniforms, setUniforms, setVector } from './shader-utils';
import {
  buildFall,
  buildPond,
  buildSpray,
  buildStream,
} from './water-geometry';
import {
  fallFragment,
  fallVertex,
  sprayFragment,
  sprayVertex,
  surfaceFragment,
  surfaceVertex,
} from './water-shaders';
import { weatherMix } from './weather-mix';

interface IslandWaterProps {
  palette: WorldPalette;
}

const SUN_DIRECTION = new Vector3(...VISUAL.sky.sunDirection).normalize();

const colors = () => ({
  uShallow: { value: new Color() },
  uDeep: { value: new Color() },
  uFoam: { value: new Color() },
  uSky: { value: new Color() },
  uSkyTop: { value: new Color() },
});

export const surfaceMaterial = () =>
  new ShaderMaterial({
    vertexShader: surfaceVertex,
    fragmentShader: surfaceFragment,
    transparent: true,
    depthWrite: false,
    fog: true,
    uniforms: {
      ...fogUniforms(),
      ...colors(),
      uTime: { value: 0 },
      uNow: { value: 0 },
      uRain: { value: 0 },
      uSun: { value: new Color() },
      uSunDirection: { value: SUN_DIRECTION },
      uRipple: { value: new Vector3(0, 0, -100) },
    } satisfies Record<string, IUniform>,
  });

export const fallMaterial = (seed: number) =>
  new ShaderMaterial({
    vertexShader: fallVertex,
    fragmentShader: fallFragment,
    transparent: true,
    depthWrite: true,
    side: DoubleSide,
    fog: true,
    uniforms: {
      ...fogUniforms(),
      ...colors(),
      uTime: { value: 0 },
      uSeed: { value: seed },
    },
  });

const buildMaterials = () => ({
  pond: surfaceMaterial(),
  stream: surfaceMaterial(),
  fall: fallMaterial(0),
  fallBack: fallMaterial(17),
  spray: new ShaderMaterial({
    vertexShader: sprayVertex,
    fragmentShader: sprayFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: VISUAL.waterfall.spraySize },
      uFoam: { value: new Color() },
    },
  }),
});

// Pond, meandering stream and waterfall, in the island frame. Clicking the
// water sends rings across it.
const IslandWater = ({ palette }: IslandWaterProps) => {
  const effects = useEffectsEnabled();
  const clock = useThree((state) => state.clock);
  const invalidate = useThree((state) => state.invalidate);

  const geometries = useMemo(
    () => ({
      pond: buildPond(),
      stream: buildStream(),
      fall: buildFall(),
      fallBack: buildFall({ back: 0.25, width: 0.75 }),
      spray: buildSpray(),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(geometries).forEach((item) => item.dispose()),
    [geometries],
  );
  const materials = useMemo(() => buildMaterials(), []);
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
        uSky: palette.skyHorizon,
        uSkyTop: palette.skyTop,
        uSun: palette.sun,
      });
    }
  }, [materials, palette]);

  useFrame(({ clock: frameClock }) => {
    const time = effects ? frameClock.elapsedTime : 0;
    for (const material of Object.values(materials)) {
      setUniforms(material, {
        uTime: time,
        uNow: frameClock.elapsedTime,
        uRain: weatherMix.rain,
      });
    }
    const { ripple } = interaction;
    for (const material of [materials.pond, materials.stream]) {
      setVector(material, 'uRipple', [ripple.x, ripple.z, ripple.time]);
    }
    if (frameClock.elapsedTime - ripple.time < 4) {
      invalidate();
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (isDrag(event)) {
      return;
    }
    event.stopPropagation();
    // The water meshes sit straight in the island frame.
    const parent = event.object.parent;
    const local = parent
      ? parent.worldToLocal(event.point.clone())
      : event.point.clone();
    Object.assign(interaction.ripple, {
      x: local.x,
      z: local.z,
      time: clock.elapsedTime,
    });
    invalidate();
  };

  return (
    <group>
      <mesh
        geometry={geometries.pond}
        material={materials.pond}
        onClick={handleClick}
        renderOrder={1}
      />
      <mesh
        geometry={geometries.stream}
        material={materials.stream}
        onClick={handleClick}
        renderOrder={1}
      />
      <mesh geometry={geometries.fallBack} material={materials.fallBack} />
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
