'use client';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import type { MeshStandardMaterial } from 'three';
import { RepeatWrapping, SRGBColorSpace, Vector3 } from 'three';

import { getModelMesh, useKit } from '../../assets/use-kit';
import { islandHeight, STREAM, STREAM_PATH } from '../../config/island';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import InstancedModel from './instanced-model';
import { buildIslandGeometry } from './island-geometry';
import { fallMaterial, surfaceMaterial } from './island-water';
import { setUniforms } from './shader-utils';
import { applyTerrainMaterial, terrainTextureUrls } from './terrain-material';
import {
  buildFallSheet,
  buildPond,
  buildPool,
  buildStream,
} from './water-geometry';

// A small floating island above the travel journal: a scaled copy of the
// main island (pond and stream included) whose stream pours off its lip as
// a tall waterfall into a rock-ringed pool on the ground. In the station's
// frame: x to the right, z towards the camera, y up from the ground.

interface FloatingIsletProps {
  palette: WorldPalette;
}

const SCALE = 0.17;
// Where the waterfall lands, and how high its lip is above the ground.
const POOL: [number, number] = [-2.6, 0.9];
const POOL_RADIUS = 0.85;
const LIP_HEIGHT = 8.4;
const FALL_REACH = 0.7;

// The islet turns so its stream leaves towards the camera (+z).
const [lipX, lipZ] = STREAM_PATH.at(-1) ?? STREAM.end;
const [prevX, prevZ] = STREAM_PATH.at(-3) ?? STREAM.start;
const TURN = -Math.atan2(lipX, lipZ);
const UP = new Vector3(0, 1, 0);
const turned = (x: number, y: number, z: number) =>
  new Vector3(x, y, z).multiplyScalar(SCALE).applyAxisAngle(UP, TURN);
const LIP = turned(lipX, STREAM.endLevel, lipZ);
const FLOW = turned(lipX - prevX, 0, lipZ - prevZ).normalize();
// Islet origin, so its lip hangs over the pool.
const ORIGIN = new Vector3(
  POOL[0] - FLOW.x * (FALL_REACH - 0.25) - LIP.x,
  LIP_HEIGHT - LIP.y,
  POOL[1] - FLOW.z * (FALL_REACH - 0.25) - LIP.z,
);
const LIP_WORLD = ORIGIN.clone().add(LIP);

// A few plants on top, placed on the scaled ground (islet frame, unscaled
// units like the main island).
const PLANTS = (
  [
    ['Pine_2', [-5, -3], 0.5],
    ['CommonTree_3', [3, -6], 0.38],
    ['Bush_Common', [-2, 6], 0.35],
  ] as const
).map(([model, [x, z], scale]) => ({
  model,
  position: [x * SCALE, islandHeight(x, z) * SCALE, z * SCALE] as [
    number,
    number,
    number,
  ],
  scale,
}));

const ROCKS = Array.from({ length: 9 }, (_, index) => {
  const angle = (index / 9) * Math.PI * 2 + 0.3;
  const reach = POOL_RADIUS + 0.05 + (index % 3) * 0.06;
  return {
    position: [
      POOL[0] + Math.sin(angle) * reach,
      -0.05,
      POOL[1] + Math.cos(angle) * reach,
    ] as [number, number, number],
    turn: index * 2.3,
    size: (0.18 + (index % 3) * 0.06) / 1.5,
  };
});

// The islet's own pond and stream, the ground pool and the fall between.
const buildIsletWater = () => ({
  pond: buildPond(),
  stream: buildStream(),
  pool: buildPool({ center: POOL, radius: POOL_RADIUS, level: 0.04 }),
  fall: buildFallSheet({
    start: [LIP_WORLD.x, LIP_WORLD.y + 0.02, LIP_WORLD.z],
    direction: [FLOW.x, FLOW.z],
    topHalf: 0.3,
    reach: FALL_REACH,
    drop: LIP_HEIGHT,
    spread: 0.9,
  }),
  fallBack: buildFallSheet({
    start: [LIP_WORLD.x, LIP_WORLD.y + 0.02, LIP_WORLD.z],
    direction: [FLOW.x, FLOW.z],
    topHalf: 0.22,
    reach: FALL_REACH,
    drop: LIP_HEIGHT,
    spread: 0.7,
    back: 0.06,
  }),
});

const FloatingIslet = ({ palette }: FloatingIsletProps) => {
  const effects = useEffectsEnabled();
  const { grassLight, grass, sand, cliff, rock, rockDeep, path, waterDeep } =
    palette;

  const ground = useMemo(
    () =>
      buildIslandGeometry({
        grassLight,
        grass,
        sand,
        cliff,
        rock,
        rockDeep,
        path,
        waterDeep,
      }),
    [grassLight, grass, sand, cliff, rock, rockDeep, path, waterDeep],
  );
  useEffect(() => () => ground.dispose(), [ground]);

  const textures = useTexture(terrainTextureUrls(), (loaded) => {
    for (const [index, texture] of loaded.entries()) {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      if (index % 2 === 0) {
        texture.colorSpace = SRGBColorSpace;
      }
    }
  });

  const { scene } = useKit('core');
  const stone = useMemo(() => getModelMesh(scene, 'Rock_Medium_2'), [scene]);
  useEffect(() => () => stone.geometry.dispose(), [stone]);

  const water = useMemo(() => buildIsletWater(), []);
  useEffect(
    () => () => Object.values(water).forEach((item) => item.dispose()),
    [water],
  );
  const materials = useMemo(
    () => ({
      surface: surfaceMaterial(),
      fall: fallMaterial(5),
      fallBack: fallMaterial(23),
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
        uSky: palette.skyHorizon,
        uSun: palette.sun,
      });
    }
  }, [materials, palette]);

  useFrame(({ clock }) => {
    const time = effects ? clock.elapsedTime : 0;
    for (const material of Object.values(materials)) {
      setUniforms(material, { uTime: time, uNow: clock.elapsedTime });
    }
  });

  return (
    <group>
      <group position={ORIGIN} rotation-y={TURN}>
        <group scale={SCALE}>
          <mesh geometry={ground} castShadow receiveShadow>
            <meshStandardMaterial
              vertexColors
              roughness={0.95}
              ref={(material: MeshStandardMaterial | null) => {
                if (material) {
                  applyTerrainMaterial(material, textures);
                }
              }}
            />
          </mesh>
          <mesh
            geometry={water.pond}
            material={materials.surface}
            renderOrder={1}
          />
          <mesh
            geometry={water.stream}
            material={materials.surface}
            renderOrder={1}
          />
        </group>
        {PLANTS.map(({ model, position, scale }) => (
          <InstancedModel
            key={model}
            kit="core"
            model={model}
            instances={[{ position, scale }]}
            castShadow
          />
        ))}
      </group>
      <mesh geometry={water.fallBack} material={materials.fallBack} />
      <mesh geometry={water.fall} material={materials.fall} />
      <mesh
        geometry={water.pool}
        material={materials.surface}
        renderOrder={1}
      />
      {ROCKS.map(({ position, turn, size }, index) => (
        <mesh
          key={index}
          geometry={stone.geometry}
          material={stone.material}
          position={position}
          rotation-y={turn}
          scale={size}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
};

export default FloatingIslet;
