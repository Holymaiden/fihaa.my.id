'use client';

import type { Ref } from 'react';
import type { Mesh } from 'three';

import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';

interface SunDiscProps {
  palette: WorldPalette;
  ref?: Ref<Mesh>;
}

const DISTANCE = 240;
const [sx, sy, sz] = VISUAL.sky.sunDirection;
const length = Math.hypot(sx, sy, sz);

// The sun as an object (the sky draws its glow), so the god rays have a
// light source to stream from. Sits where the sky's sun disc is.
const SunDisc = ({ palette, ref }: SunDiscProps) => (
  <mesh
    ref={ref}
    position={[
      (sx / length) * DISTANCE,
      (sy / length) * DISTANCE,
      (sz / length) * DISTANCE,
    ]}
    raycast={() => null}
  >
    <sphereGeometry args={[11, 24, 12]} />
    <meshBasicMaterial color={palette.sun} fog={false} toneMapped={false} />
  </mesh>
);

export default SunDisc;
