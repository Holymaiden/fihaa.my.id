'use client';

import { useGLTF } from '@react-three/drei';
import type { Object3D } from 'three';

import type {
  CoreKitGLTF,
  CoreModelName,
  KitId,
  VaultKitGLTF,
  VaultModelName,
} from './kits.generated';
import { KIT_URLS } from './kits.generated';

interface KitMap {
  core: { gltf: CoreKitGLTF; model: CoreModelName };
  vault: { gltf: VaultKitGLTF; model: VaultModelName };
}

export type ModelName<K extends KitId> = KitMap[K]['model'];

// Kits are meshopt-compressed; the meshopt decoder ships with three-stdlib,
// so Draco (which fetches its decoder from a CDN) stays off.
const USE_DRACO = false;
const USE_MESHOPT = true;

// useGLTF's return type depends on the path type, which TypeScript can't
// narrow for a generic K; the generated kit types describe the real files.
export const useKit = <K extends KitId>(kit: K): KitMap[K]['gltf'] =>
  useGLTF(
    KIT_URLS[kit],
    USE_DRACO,
    USE_MESHOPT,
  ) as unknown as KitMap[K]['gltf'];

export const preloadKit = (kit: KitId) =>
  useGLTF.preload(KIT_URLS[kit], USE_DRACO, USE_MESHOPT);

// Every model is a top-level node named after it (see build.mjs).
export const getModelNode = (scene: Object3D, name: string): Object3D => {
  const node = scene.getObjectByName(name);
  if (!node) {
    throw new Error(`Model "${name}" is missing from the kit.`);
  }
  return node;
};
