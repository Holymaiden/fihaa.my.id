import { BufferGeometry, Color, Float32BufferAttribute } from 'three';

import {
  ISLAND,
  islandEdge,
  islandHeight,
  pathMask,
  waterMask,
} from '../../config/island';

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

// The ground under the grass is darker than the blades, so the meadow reads
// as dense; paths are worn dirt and the pond/stream beds are dark.
const GROUND_UNDER_GRASS = 0.72;

const surfaceColor = (
  {
    share,
    height,
    x,
    z,
  }: { share: number; height: number; x: number; z: number },
  colors: ColorSet,
  out: Color,
) => {
  out
    .copy(colors.grass)
    .lerp(
      colors.grassLight,
      Math.min(Math.max(height / ISLAND.hillHeight, 0), 1) * 0.6,
    )
    .multiplyScalar(GROUND_UNDER_GRASS);
  out.lerp(colors.path, pathMask(x, z) * 0.9);
  const beachStart = 1 - ISLAND.beachWidth;
  if (share > beachStart) {
    out.lerp(colors.sand, (share - beachStart) / ISLAND.beachWidth);
  }
  out.lerp(colors.waterDeep, waterMask(x, z) * 0.85);
  return out;
};

// One smooth mesh: a disc of rings for the top, then rings of rock going
// down to a point. Vertex colours, no textures.
export const buildIslandGeometry = (palette: TerrainColors): BufferGeometry => {
  const colors = Object.fromEntries(
    (Object.entries(palette) as [keyof TerrainColors, string][]).map(
      ([key, value]) => [key, new Color(value)],
    ),
  ) as ColorSet;
  const positions: number[] = [];
  const vertexColors: number[] = [];
  const indices: number[] = [];
  const color = new Color();

  for (let ring = 0; ring <= rings; ring++) {
    const share = ring / rings;
    for (let step = 0; step < segments; step++) {
      const angle = (step / segments) * Math.PI * 2;
      const distance = radius * islandEdge(angle) * share;
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      const y = islandHeight(x, z);
      positions.push(x, y, z);
      surfaceColor({ share, height: y, x, z }, colors, color);
      vertexColors.push(color.r, color.g, color.b);
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
        (1 + 0.06 * Math.sin(angle * 9 + ring * 0.7));
      const y =
        -0.6 - depthShare * depth + 0.4 * Math.sin(angle * 5 + depthShare * 6);
      positions.push(Math.sin(angle) * distance, y, Math.cos(angle) * distance);
      color
        .copy(depthShare < 0.15 ? colors.cliff : colors.rock)
        .lerp(colors.rockDeep, depthShare);
      vertexColors.push(color.r, color.g, color.b);
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
  geometry.setAttribute('color', new Float32BufferAttribute(vertexColors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};
