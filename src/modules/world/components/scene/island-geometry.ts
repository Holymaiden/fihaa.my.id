import { BufferGeometry, Color, Float32BufferAttribute } from 'three';

import {
  ISLAND,
  islandEdge,
  islandHeight,
  pathMask,
  waterMask,
} from '../../config/island';
import { bakedOcclusion } from '../../config/viewpoint-search';

export interface TerrainColors {
  grassLight: string;
  grass: string;
  sand: string;
  cliff: string;
  rock: string;
  rockDeep: string;
  path: string;
  waterDeep: string;
}

const { radius, rings, segments, undersideRings, depth } = ISLAND;

// Rock under the island tapers to a point; this is its radius share at a
// given share of the depth.
const undersideShare = (depthShare: number) => (1 - depthShare) ** 1.4;

// Surface colour: hilltops lighter, then a sandy rim.
type ColorSet = Record<keyof TerrainColors, Color>;

// Cheap value noise for colour imperfections (patches, streaks).
const hash = (x: number, z: number) => {
  const value = Math.sin(x * 127.1 + z * 311.7) * 43_758.545_3;
  return value - Math.floor(value);
};
const valueNoise = (x: number, z: number) => {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const top = hash(ix, iz) + (hash(ix + 1, iz) - hash(ix, iz)) * ux;
  const bottom =
    hash(ix, iz + 1) + (hash(ix + 1, iz + 1) - hash(ix, iz + 1)) * ux;
  return top + (bottom - top) * uz;
};
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

// Two octaves, 0..1.
const mottle = (x: number, z: number) =>
  valueNoise(x * 0.45, z * 0.45) * 0.65 + valueNoise(x * 1.7, z * 1.7) * 0.35;

// The ground under the grass is darker than the blades, so the meadow reads
// as dense; paths are worn dirt and the pond/stream beds are dark.
const GROUND_UNDER_GRASS = 0.72;

// Texture layers blended on the ground (see island-terrain.tsx), as
// weights per vertex: grass, dirt (paths and water beds), sand, rock.
export type Splat = [number, number, number, number];

// Ground steeper than this shows bare rock (0 = flat, 1 = vertical).
const ROCK_SLOPE: [number, number] = [0.32, 0.55];

const surfaceColor = (
  {
    share,
    height,
    x,
    z,
    slope,
  }: { share: number; height: number; x: number; z: number; slope: number },
  colors: ColorSet,
  { color: out, splat }: { color: Color; splat: Splat },
) => {
  out
    .copy(colors.grass)
    .lerp(
      colors.grassLight,
      Math.min(Math.max(height / ISLAND.hillHeight, 0), 1) * 0.6,
    )
    .multiplyScalar(GROUND_UNDER_GRASS);
  const path = pathMask(x, z) * 0.9;
  out.lerp(colors.path, path);
  const beachStart = 1 - ISLAND.beachWidth;
  const sand =
    share > beachStart ? (share - beachStart) / ISLAND.beachWidth : 0;
  out.lerp(colors.sand, sand);
  const rock = smoothstep(ROCK_SLOPE[0], ROCK_SLOPE[1], slope);
  out.lerp(colors.cliff, rock * 0.85);
  const water = waterMask(x, z);
  out.lerp(colors.waterDeep, water * 0.85);
  // Same order as the colour blends above: each layer covers the ones
  // before it.
  const dirt = Math.max(path, water);
  splat[3] = rock;
  splat[2] = sand * (1 - rock);
  splat[1] = dirt * (1 - rock) * (1 - sand);
  splat[0] = 1 - splat[1] - splat[2] - splat[3];
  // Nothing in nature is one flat colour: soft patches of light and dark,
  // and baked shade where walls and trees block the sky.
  out.multiplyScalar((0.86 + mottle(x, z) * 0.28) * bakedOcclusion(x, z));
  return out;
};

// One smooth mesh: a disc of rings for the top, then rings of rock going
// down to a point. Vertex colours carry the palette; the `splat` attribute
// says which ground texture shows where.
export const buildIslandGeometry = (palette: TerrainColors): BufferGeometry => {
  const colors = Object.fromEntries(
    (Object.entries(palette) as [keyof TerrainColors, string][]).map(
      ([key, value]) => [key, new Color(value)],
    ),
  ) as ColorSet;
  const positions: number[] = [];
  const underColors: number[] = [];
  const indices: number[] = [];
  const color = new Color();

  for (let ring = 0; ring <= rings; ring++) {
    const share = ring / rings;
    for (let step = 0; step < segments; step++) {
      const angle = (step / segments) * Math.PI * 2;
      const distance = radius * islandEdge(angle) * share;
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      positions.push(x, islandHeight(x, z), z);
    }
  }

  for (let ring = 1; ring <= undersideRings; ring++) {
    const depthShare = ring / undersideRings;
    for (let step = 0; step < segments; step++) {
      const angle = (step / segments) * Math.PI * 2;
      const distance =
        radius *
        islandEdge(angle) *
        undersideShare(depthShare) *
        (1 + 0.06 * Math.sin(angle * 9 + ring * 0.7)) *
        // Craggy rock: knobs and hollows that grow towards the bottom.
        (1 +
          (valueNoise(angle * 7, depthShare * 9) - 0.5) *
            0.26 *
            Math.min(depthShare * 4, 1));
      const y =
        -0.6 -
        depthShare * depth +
        0.4 * Math.sin(angle * 5 + depthShare * 6) +
        (valueNoise(angle * 11, depthShare * 5) - 0.5) * 0.8 * depthShare;
      positions.push(Math.sin(angle) * distance, y, Math.cos(angle) * distance);
      const px = Math.sin(angle) * distance;
      const pz = Math.cos(angle) * distance;
      color
        .copy(depthShare < 0.15 ? colors.cliff : colors.rock)
        .lerp(colors.rockDeep, depthShare);
      // Rock strata: bands of lighter and darker stone, broken up by noise.
      const strata = Math.sin(y * 2.4 + mottle(px, pz) * 4) * 0.5 + 0.5;
      color.multiplyScalar(0.82 + strata * 0.22 + mottle(px * 2, y * 2) * 0.12);
      // Moss hanging just under the grassy rim.
      color.lerp(
        colors.grass,
        Math.max(0, 1 - depthShare * 9) * 0.45 * mottle(px, pz),
      );
      underColors.push(color.r, color.g, color.b);
    }
  }

  // Ring k starts here: top rings 0..rings, then the underside rings.
  const ringStart = (ring: number) => ring * segments;
  const totalRings = rings + undersideRings;
  for (let ring = 0; ring < totalRings; ring++) {
    for (let step = 0; step < segments; step++) {
      const next = (step + 1) % segments;
      const a = ringStart(ring) + step;
      const b = ringStart(ring) + next;
      const c = ringStart(ring + 1) + step;
      const d = ringStart(ring + 1) + next;
      // Counter-clockwise seen from outside, so normals face out.
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Colours and texture weights of the top need the slope, so they come
  // after the normals; the rock underneath is all rock.
  const normals = geometry.getAttribute('normal');
  const topCount = (rings + 1) * segments;
  const vertexColors: number[] = [];
  const splats: number[] = [];
  const splat: Splat = [1, 0, 0, 0];
  for (let index = 0; index < topCount; index++) {
    const x = positions[index * 3];
    const y = positions[index * 3 + 1];
    const z = positions[index * 3 + 2];
    surfaceColor(
      {
        share: Math.floor(index / segments) / rings,
        height: y,
        x,
        z,
        slope: 1 - normals.getY(index),
      },
      colors,
      { color, splat },
    );
    vertexColors.push(color.r, color.g, color.b);
    splats.push(...splat);
  }
  vertexColors.push(...underColors);
  for (let index = topCount; index < normals.count; index++) {
    splats.push(0, 0, 0, 1);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(vertexColors, 3));
  geometry.setAttribute('splat', new Float32BufferAttribute(splats, 4));
  return geometry;
};
