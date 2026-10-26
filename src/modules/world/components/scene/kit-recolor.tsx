'use client';

import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import type { Material, Mesh, MeshStandardMaterial } from 'three';
import { RepeatWrapping, SRGBColorSpace } from 'three';

import { useKit } from '../../assets/use-kit';
import { MATERIAL_RECOLOR } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { addSway } from './foliage-sway';
import { crownColors } from './tree-crown';

interface KitRecolorProps {
  palette: WorldPalette;
}

const SUFFIXES = Object.entries(MATERIAL_RECOLOR);
// Plant materials of the Quaternius models (only plants use them): name
// suffixes of the Ultimate Nature pack, prefixes of the Nature MegaKit.
const SWAYING = ['_Green', '_Wood', '_Berry', '_Cyan', '_Yellow'];
const SWAYING_PREFIXES = ['Leaves', 'Leaf_', 'Bark_', 'Flowers'];
// Tree trunks wear a CC0 sycamore bark scan (ASSETS.md): patchy grey and
// cream like the reference trees.
const BARK_URLS = [
  '/world/textures/japanese_sycamore_albedo.webp',
  '/world/textures/japanese_sycamore_normal.webp',
];

// Paints the flat-color (untextured) kit materials with the palette.
// Clones and instances share these materials, so this covers every copy.
const KitRecolor = ({ palette }: KitRecolorProps) => {
  const { scene } = useKit('core');
  const invalidate = useThree((state) => state.invalidate);
  const [barkMap, barkNormal] = useTexture(BARK_URLS, (loaded) => {
    for (const texture of loaded) {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
    }
    loaded[0].colorSpace = SRGBColorSpace;
  });

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
        const standard = material as MeshStandardMaterial;
        if (match) {
          standard.color.set(palette[match[1]]);
        }
        if (
          material.name.startsWith('Bark_') &&
          standard.isMeshStandardMaterial
        ) {
          standard.map = barkMap;
          standard.normalMap = barkNormal;
          standard.color.set('#ffffff');
          standard.needsUpdate = true;
        }
        // PBR: nothing here is metal; painted wood, stone and leaves are
        // rough but still catch a soft sheen from the sky light.
        // Leaves, trunks, berries and flowers sway in the wind.
        if (
          SWAYING.some((suffix) => material.name.endsWith(suffix)) ||
          SWAYING_PREFIXES.some((prefix) => material.name.startsWith(prefix))
        ) {
          addSway(material);
        }
        if (standard.isMeshStandardMaterial) {
          standard.metalness = 0;
          standard.roughness = Math.max(standard.roughness, 0.72);
          standard.envMapIntensity = 1;
        }
      }
    });
    crownColors.uLight.value.set(palette.leaf);
    crownColors.uShade.value.set(palette.leafShade);
    crownColors.uHeroLight.value.set(palette.heroLeaf);
    crownColors.uHeroShade.value.set(palette.heroLeafShade);
    // Needed with frameloop="demand".
    invalidate();
  }, [scene, palette, invalidate, barkMap, barkNormal]);

  return null;
};

export default KitRecolor;
