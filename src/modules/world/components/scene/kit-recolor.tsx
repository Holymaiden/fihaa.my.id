'use client';

import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import type { Material, Mesh, MeshStandardMaterial } from 'three';

import { useKit } from '../../assets/use-kit';
import { MATERIAL_RECOLOR } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';

interface KitRecolorProps {
  palette: WorldPalette;
}

const SUFFIXES = Object.entries(MATERIAL_RECOLOR);

// Paints the flat-color (untextured) kit materials with the palette.
// Clones and instances share these materials, so this covers every copy.
const KitRecolor = ({ palette }: KitRecolorProps) => {
  const { scene } = useKit('core');
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const seen = new Set<Material>();
    scene.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) {
        return;
      }
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const material of materials) {
        if (seen.has(material)) {
          continue;
        }
        seen.add(material);
        const match = SUFFIXES.find(([suffix]) =>
          material.name.endsWith(suffix),
        );
        if (match) {
          (material as MeshStandardMaterial).color.set(palette[match[1]]);
        }
      }
    });
    // Needed with frameloop="demand".
    invalidate();
  }, [scene, palette, invalidate]);

  return null;
};

export default KitRecolor;
