'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import type { InstancedMesh } from 'three';
import {
  Color,
  CylinderGeometry,
  Euler,
  IcosahedronGeometry,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three';

import {
  islandHeight,
  POND,
  POND_CENTER,
  POND_LEVEL,
  STREAM_PATH,
  streamHalfWidth,
} from '../../config/island';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { addSway } from './foliage-sway';

interface WaterBanksProps {
  palette: WorldPalette;
}

const random = (seed: number) => {
  const x = Math.sin(seed * 45.164 + 94.673) * 43_758.545_3;
  return x - Math.floor(x);
};

interface Stone {
  position: [number, number, number];
  scale: [number, number, number];
  turn: number;
  tint: number;
}

// Pebbles and stones along both banks, a ring round the pond, and big
// boulders framing the lip where the water falls.
const placeStones = (): Stone[] => {
  const stones: Stone[] = [];
  const add = ([x, z]: [number, number], size: number, seed: number) => {
    const squash = 0.55 + random(seed + 0.4) * 0.3;
    stones.push({
      position: [x, islandHeight(x, z) - size * squash * 0.3, z],
      scale: [size, size * squash, size * (0.8 + random(seed + 0.5) * 0.4)],
      turn: random(seed + 0.6) * Math.PI * 2,
      tint: random(seed + 0.7),
    });
  };
  const last = STREAM_PATH.length - 1;
  STREAM_PATH.forEach(([x, z], index) => {
    if (index === 0 || index === last) {
      return;
    }
    const t = index / last;
    const [nx, nz] = STREAM_PATH[index + 1];
    const length = Math.hypot(nx - x, nz - z) || 1;
    const acrossX = -(nz - z) / length;
    const acrossZ = (nx - x) / length;
    for (const side of [-1, 1]) {
      const seed = index * 2 + (side + 1);
      if (random(seed) < 0.35) {
        continue;
      }
      const reach = streamHalfWidth(t) + 0.1 + random(seed + 0.1) * 0.3;
      add(
        [x + acrossX * reach * side, z + acrossZ * reach * side],
        0.12 + random(seed + 0.2) * 0.22,
        seed,
      );
    }
  });
  for (let index = 0; index < 26; index++) {
    const seed = 300 + index;
    const angle = (index / 26) * Math.PI * 2 + random(seed) * 0.2;
    // Leave the outlet open.
    if (
      Math.abs(
        Math.atan2(Math.sin(angle - POND.angle), Math.cos(angle - POND.angle)),
      ) < 0.35
    ) {
      continue;
    }
    const reach = POND.radius + 0.05 + random(seed + 0.1) * 0.35;
    add(
      [
        POND_CENTER[0] + Math.sin(angle) * reach,
        POND_CENTER[1] + Math.cos(angle) * reach,
      ],
      0.14 + random(seed + 0.2) * 0.24,
      seed,
    );
  }
  // Boulders at the lip.
  const [lx, lz] = STREAM_PATH[last - 2];
  const [ex, ez] = STREAM_PATH[last];
  const length = Math.hypot(ex - lx, ez - lz) || 1;
  const acrossX = -(ez - lz) / length;
  const acrossZ = (ex - lx) / length;
  const lipHalf = streamHalfWidth(1);
  [
    [-1, 0.45, 0.2],
    [1, 0.55, -0.1],
    [1.4, 0.32, 0.8],
    [-1.5, 0.28, 0.9],
  ].forEach(([side, size, back], index) => {
    const reach = lipHalf + size * 0.7;
    add(
      [
        lx + acrossX * reach * side - ((ex - lx) / length) * back,
        lz + acrossZ * reach * side - ((ez - lz) / length) * back,
      ],
      size,
      500 + index,
    );
  });
  return stones;
};

// Reeds in clumps round the pond and at the stream's bends.
const placeReeds = () => {
  const reeds: {
    position: [number, number, number];
    height: number;
    lean: Euler;
  }[] = [];
  const clump = ([cx, cz]: [number, number], count: number, seed: number) => {
    for (let index = 0; index < count; index++) {
      const s = seed + index;
      const x = cx + (random(s) - 0.5) * 0.7;
      const z = cz + (random(s + 0.3) - 0.5) * 0.7;
      reeds.push({
        position: [x, Math.max(islandHeight(x, z), POND_LEVEL - 0.1), z],
        height: 0.6 + random(s + 0.5) * 0.7,
        lean: new Euler(
          (random(s + 0.6) - 0.5) * 0.35,
          0,
          (random(s + 0.7) - 0.5) * 0.35,
        ),
      });
    }
  };
  [POND.angle + 2.2, POND.angle - 2.0, POND.angle + 3.1].forEach(
    (angle, index) => {
      const reach = POND.radius + 0.15;
      clump(
        [
          POND_CENTER[0] + Math.sin(angle) * reach,
          POND_CENTER[1] + Math.cos(angle) * reach,
        ],
        9,
        700 + index * 20,
      );
    },
  );
  [8, 20].forEach((index, order) => {
    const [x, z] = STREAM_PATH[index];
    clump([x + 0.7, z + 0.4], 6, 800 + order * 20);
  });
  return reeds;
};

const LILY_PADS: [number, number, number][] = [
  [-0.7, 0.4, 0.26],
  [-0.2, -0.9, 0.2],
  [0.6, 0.7, 0.24],
  [-1.1, -0.2, 0.18],
  [0.2, 1.1, 0.16],
];

const matrix = new Matrix4();
const quaternion = new Quaternion();
const color = new Color();

const WaterBanks = ({ palette }: WaterBanksProps) => {
  const stonesRef = useRef<InstancedMesh>(null);
  const reedsRef = useRef<InstancedMesh>(null);
  const stones = useMemo(() => placeStones(), []);
  const reeds = useMemo(() => placeReeds(), []);
  const stoneGeometry = useMemo(() => new IcosahedronGeometry(1, 1), []);
  const reedGeometry = useMemo(
    () => new CylinderGeometry(0.012, 0.022, 1, 4).translate(0, 0.5, 0),
    [],
  );
  const reedMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({ roughness: 0.8 });
    addSway(material);
    return material;
  }, []);

  useLayoutEffect(() => {
    const mesh = stonesRef.current;
    if (!mesh) {
      return;
    }
    const stone = new Color(palette.stone);
    const dark = new Color(palette.rockDeep);
    const moss = new Color(palette.grass);
    stones.forEach(({ position, scale, turn, tint }, index) => {
      quaternion.setFromEuler(new Euler(tint * 0.6, turn, 0));
      matrix.compose(
        new Vector3(...position),
        quaternion,
        new Vector3(...scale),
      );
      mesh.setMatrixAt(index, matrix);
      color.copy(stone).lerp(dark, tint * 0.6);
      if (tint > 0.7) {
        color.lerp(moss, 0.35);
      }
      mesh.setColorAt(index, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
    mesh.computeBoundingSphere();
  }, [stones, palette.stone, palette.rockDeep, palette.grass]);

  useLayoutEffect(() => {
    const mesh = reedsRef.current;
    if (!mesh) {
      return;
    }
    const green = new Color(palette.foliage);
    const dry = new Color(palette.sand);
    reeds.forEach(({ position, height, lean }, index) => {
      quaternion.setFromEuler(lean);
      matrix.compose(
        new Vector3(...position),
        quaternion,
        new Vector3(1, height, 1),
      );
      mesh.setMatrixAt(index, matrix);
      mesh.setColorAt(index, color.copy(green).lerp(dry, (index % 5) / 10));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
    mesh.computeBoundingSphere();
  }, [reeds, palette.foliage, palette.sand]);

  return (
    <group>
      <instancedMesh
        ref={stonesRef}
        args={[stoneGeometry, undefined, stones.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={reedsRef}
        args={[reedGeometry, reedMaterial, reeds.length]}
        castShadow
      />
      {LILY_PADS.map(([dx, dz, size], index) => (
        <mesh
          key={index}
          position={[
            POND_CENTER[0] + dx,
            POND_LEVEL + 0.015,
            POND_CENTER[1] + dz,
          ]}
          rotation={[-Math.PI / 2, 0, index * 1.9]}
          renderOrder={2}
        >
          {/* A disc with a notch, like a lily pad. */}
          <circleGeometry args={[size, 14, 0.4, Math.PI * 2 - 0.4]} />
          <meshStandardMaterial color={palette.foliage} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

export default WaterBanks;
