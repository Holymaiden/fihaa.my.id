import { BufferGeometry, Float32BufferAttribute } from 'three';

import {
  POND,
  POND_CENTER,
  POND_LEVEL,
  STREAM,
  STREAM_PATH,
  streamHalfWidth,
  streamLevel,
} from '../../config/island';
import { VISUAL } from '../../config/visual';

// Meshes for the pond, the stream and the waterfall, in the island frame.

const { waterfall } = VISUAL;
// How far the water reaches over the bank (its edge fades out there).
const BANK_OVERLAP = 0.25;
const ACROSS = [-1, -0.5, 0, 0.5, 1];

const geometryOf = (
  positions: number[],
  indices: number[],
  attributes: Record<string, [number[], number]>,
) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  for (const [name, [values, size]] of Object.entries(attributes)) {
    geometry.setAttribute(name, new Float32BufferAttribute(values, size));
  }
  geometry.setIndex(indices);
  return geometry;
};

// Rings round the pond centre; the water drifts slowly towards the outlet.
export const buildPond = () => {
  const rings = 10;
  const segments = 56;
  const radius = POND.radius + BANK_OVERLAP;
  const positions: number[] = [];
  const flow: number[] = [];
  const shore: number[] = [];
  const rapids: number[] = [];
  const indices: number[] = [];
  const outX = Math.sin(POND.angle);
  const outZ = Math.cos(POND.angle);
  for (let ring = 0; ring <= rings; ring++) {
    const share = ring / rings;
    for (let step = 0; step < segments; step++) {
      const angle = (step / segments) * Math.PI * 2;
      const x = Math.sin(angle) * radius * share;
      const z = Math.cos(angle) * radius * share;
      positions.push(POND_CENTER[0] + x, POND_LEVEL, POND_CENTER[1] + z);
      // A lazy swirl plus a pull towards the stream.
      flow.push(-z * 0.04 + outX * 0.12, x * 0.04 + outZ * 0.12);
      shore.push(share);
      rapids.push(0);
    }
  }
  for (let ring = 0; ring < rings; ring++) {
    for (let step = 0; step < segments; step++) {
      const next = (step + 1) % segments;
      const a = ring * segments + step;
      const b = ring * segments + next;
      const c = (ring + 1) * segments + step;
      const d = (ring + 1) * segments + next;
      indices.push(a, c, b, b, c, d);
    }
  }
  return geometryOf(positions, indices, {
    aFlow: [flow, 2],
    aShore: [shore, 1],
    aRapids: [rapids, 1],
  });
};

// A ribbon along the meandering stream, from just inside the pond to past
// the rim. The current speeds up and breaks into rapids near the lip.
export const buildStream = () => {
  const positions: number[] = [];
  const flow: number[] = [];
  const shore: number[] = [];
  const rapids: number[] = [];
  const indices: number[] = [];
  const last = STREAM_PATH.length - 1;
  let rows = 0;
  STREAM_PATH.forEach(([x, z], index) => {
    const t = index / last;
    const [px, pz] = STREAM_PATH[Math.max(index - 1, 0)];
    const [nx, nz] = STREAM_PATH[Math.min(index + 1, last)];
    const length = Math.hypot(nx - px, nz - pz) || 1;
    const dirX = (nx - px) / length;
    const dirZ = (nz - pz) / length;
    // Start just inside the pond so the two meet without a gap.
    if (
      Math.hypot(x - POND_CENTER[0], z - POND_CENTER[1]) <
      POND.radius * 0.8
    ) {
      return;
    }
    const half = streamHalfWidth(t) + BANK_OVERLAP;
    const speed = 0.35 + 1.6 * t * t;
    const y = streamLevel(t) + 0.03;
    for (const side of ACROSS) {
      positions.push(x - dirZ * half * side, y, z + dirX * half * side);
      flow.push(dirX * speed, dirZ * speed);
      shore.push(Math.abs(side));
      rapids.push(Math.max(0, (t - 0.72) / 0.28));
    }
    rows++;
  });
  const columns = ACROSS.length;
  for (let row = 0; row < rows - 1; row++) {
    for (let column = 0; column < columns - 1; column++) {
      const a = row * columns + column;
      const b = a + 1;
      const c = a + columns;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  return geometryOf(positions, indices, {
    aFlow: [flow, 2],
    aShore: [shore, 1],
    aRapids: [rapids, 1],
  });
};

// The fall: leaves the rim, arcs outwards and drops. `back` sets it a
// little behind the main sheet and `width` narrows it, for a second layer
// that gives the water some body.
export const buildFall = ({ back = 0, width = 1 } = {}) => {
  const [ex, ez] = STREAM_PATH.at(-1) ?? STREAM.end;
  const [px, pz] = STREAM_PATH.at(-3) ?? STREAM.start;
  const length = Math.hypot(ex - px, ez - pz) || 1;
  const dirX = (ex - px) / length;
  const dirZ = (ez - pz) / length;
  const steps = 60;
  const columns = 8;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  // A little wider than the stream: the water fans out over the lip.
  const topHalf = streamHalfWidth(1) * 1.3 * width;
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    // Water keeps its speed over the lip, then gravity takes over.
    const out = waterfall.reach * Math.sqrt(t) - back - 0.25;
    const y =
      STREAM.endLevel +
      0.02 -
      waterfall.drop * (t * t * 0.45 + t * 0.55) -
      back * 0.3;
    const half = topHalf * (1 + t * waterfall.spread);
    for (let column = 0; column <= columns; column++) {
      const side = (column / columns) * 2 - 1;
      positions.push(
        ex + dirX * out - dirZ * half * side,
        y,
        ez + dirZ * out + dirX * half * side,
      );
      uvs.push(column / columns, t);
    }
  }
  for (let step = 0; step < steps; step++) {
    for (let column = 0; column < columns; column++) {
      const a = step * (columns + 1) + column;
      const b = a + 1;
      const c = a + columns + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = geometryOf(positions, indices, {});
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  return geometry;
};

export const buildSpray = () => {
  const [ex, ez] = STREAM_PATH.at(-1) ?? STREAM.end;
  const dirX = Math.sin(POND.angle);
  const dirZ = Math.cos(POND.angle);
  const positions: number[] = [];
  const seeds: number[] = [];
  for (let index = 0; index < waterfall.sprayCount; index++) {
    const seed = (index * 0.618_034) % 1;
    // Most puffs at the lip, the rest spread down the fall.
    const t = index % 3 === 0 ? ((index * 7) % 10) / 10 : 0.02;
    const out = waterfall.reach * Math.sqrt(t) + 0.1;
    const y = STREAM.endLevel - waterfall.drop * t * 0.8;
    const side = (((index * 37) % 11) / 11 - 0.5) * STREAM.halfWidth * 3;
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
