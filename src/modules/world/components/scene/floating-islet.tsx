'use client';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { InstancedMesh, MeshStandardMaterial } from 'three';
import {
  Object3D,
  RepeatWrapping,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
} from 'three';

import {
  FALL_LANDING as LANDING,
  islandHeight,
  POND,
  POND_LEVEL,
  STREAM,
  STREAM_PATH,
} from '../../config/island';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import InstancedModel from './instanced-model';
import { buildIslandGeometry } from './island-geometry';
import { fallMaterial, surfaceMaterial } from './island-water';
import { useWaterfallSource } from './rain-lens';
import { setUniforms } from './shader-utils';
import { applyTerrainMaterial, terrainTextureUrls } from './terrain-material';
import { buildFallSheet, buildPond, buildStream } from './water-geometry';

// A small floating island over the pond: a scaled copy of the main island
// (pond and stream included) whose stream pours off its lip as a tall
// waterfall into the pond below. In the island frame.

interface FloatingIsletProps {
  palette: WorldPalette;
}

const SCALE = 0.17;
// How high the lip is above the pond, and how far the water arcs out.
const LIP_HEIGHT = 8.4;
const FALL_REACH = 0.7;
// Half the sheet's width at the lip, and how much wider it gets at the
// foot: a broad, nearly straight curtain.
const FALL_HALF = 0.75;
const FALL_SPREAD = 0.25;
const FOOT_HALF = FALL_HALF * (1 + FALL_SPREAD);

// The islet turns so its stream (and fall) faces out the same way as the
// pond, towards a visitor looking at it.
const [lipX, lipZ] = STREAM_PATH.at(-1) ?? STREAM.end;
const [prevX, prevZ] = STREAM_PATH.at(-3) ?? STREAM.start;
const TURN = -Math.atan2(lipX, lipZ) + POND.angle;
const UP = new Vector3(0, 1, 0);
const turned = (x: number, y: number, z: number) =>
  new Vector3(x, y, z).multiplyScalar(SCALE).applyAxisAngle(UP, TURN);
const LIP = turned(lipX, STREAM.endLevel, lipZ);
const FLOW = turned(lipX - prevX, 0, lipZ - prevZ).normalize();
// Islet origin, so its lip hangs over the landing spot.
const ORIGIN = new Vector3(
  LANDING[0] - FLOW.x * (FALL_REACH - 0.25) - LIP.x,
  POND_LEVEL + LIP_HEIGHT - LIP.y,
  LANDING[1] - FLOW.z * (FALL_REACH - 0.25) - LIP.z,
);
const LIP_WORLD = ORIGIN.clone().add(LIP);

// Foam where the fall lands: a row of round white balls across the foot of
// the sheet, with a few more spilling out in front. Each one churns
// (swells and shrinks) on its own beat.
const FOAM = Array.from({ length: 15 }, (_, index) => {
  const front = index >= 10;
  const side = front ? (index - 12) * 0.35 : (index / 9) * 2 - 1;
  const jitter = Math.sin(index * 12.9898) * 0.5;
  const across = side * FOOT_HALF * (front ? 0.8 : 0.95) + jitter * 0.08;
  const out = front ? 0.3 + jitter * 0.1 : jitter * 0.06;
  return {
    x: LANDING[0] - FLOW.z * across + FLOW.x * out,
    z: LANDING[1] + FLOW.x * across + FLOW.z * out,
    size: (front ? 0.2 : 0.3) + Math.abs(jitter) * 0.1,
    phase: index * 1.7,
  };
});
const foamBall = new Object3D();

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

// The islet's own pond and stream, and the fall down to the pond.
const buildIsletWater = () => ({
  pond: buildPond(),
  stream: buildStream(),
  fall: buildFallSheet({
    start: [LIP_WORLD.x, LIP_WORLD.y + 0.02, LIP_WORLD.z],
    direction: [FLOW.x, FLOW.z],
    topHalf: FALL_HALF,
    reach: FALL_REACH,
    drop: LIP_HEIGHT,
    spread: FALL_SPREAD,
  }),
  fallBack: buildFallSheet({
    start: [LIP_WORLD.x, LIP_WORLD.y + 0.02, LIP_WORLD.z],
    direction: [FLOW.x, FLOW.z],
    topHalf: FALL_HALF * 0.8,
    reach: FALL_REACH,
    drop: LIP_HEIGHT,
    spread: FALL_SPREAD,
    back: 0.06,
  }),
});

const FloatingIslet = ({ palette }: FloatingIsletProps) => {
  const effects = useEffectsEnabled();
  const fallTop = useWaterfallSource(LIP_HEIGHT);
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

  const water = useMemo(() => buildIsletWater(), []);
  const foamGeometry = useMemo(() => new SphereGeometry(1, 14, 8), []);
  useEffect(() => () => foamGeometry.dispose(), [foamGeometry]);
  const foam = useRef<InstancedMesh>(null);
  useEffect(
    () => () => Object.values(water).forEach((item) => item.dispose()),
    [water],
  );
  const materials = useMemo(
    () => ({
      surface: surfaceMaterial(),
      fall: fallMaterial(5, LIP_HEIGHT),
      fallBack: fallMaterial(23, LIP_HEIGHT),
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
        uSkyTop: palette.skyTop,
        uSun: palette.sun,
      });
    }
  }, [materials, palette]);

  useFrame(({ clock }) => {
    const time = effects ? clock.elapsedTime : 0;
    if (foam.current) {
      for (const [index, ball] of FOAM.entries()) {
        const churn = 1 + Math.sin(time * 3 + ball.phase) * 0.15;
        foamBall.position.set(ball.x, POND_LEVEL, ball.z);
        foamBall.scale.setScalar(ball.size * churn);
        foamBall.updateMatrix();
        foam.current.setMatrixAt(index, foamBall.matrix);
      }
      foam.current.instanceMatrix.needsUpdate = true;
    }
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
      <object3D ref={fallTop} position={LIP_WORLD} />
      <mesh geometry={water.fallBack} material={materials.fallBack} />
      <mesh geometry={water.fall} material={materials.fall} />
      <instancedMesh
        ref={foam}
        args={[foamGeometry, undefined, FOAM.length]}
        frustumCulled={false}
        raycast={() => null}
      >
        <meshStandardMaterial
          color={palette.foam}
          emissive={palette.foam}
          emissiveIntensity={0.35}
          roughness={1}
        />
      </instancedMesh>
    </group>
  );
};

export default FloatingIslet;
