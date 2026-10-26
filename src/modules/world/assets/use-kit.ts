'use client';

import { useGLTF } from '@react-three/drei';
import type { BufferGeometry, Material, Mesh, Object3D } from 'three';
import { BufferAttribute } from 'three';

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

// The first mesh of a model, with its geometry baked into the model's own
// frame (kit meshes are quantized, so the node transform matters). For
// hand-placed copies that don't go through InstancedModel.
export const getModelMesh = (
  scene: Object3D,
  name: string,
): { geometry: BufferGeometry; material: Material } => {
  const root = getModelNode(scene, name);
  root.updateWorldMatrix(true, true);
  let found: Mesh | undefined;
  root.traverse((object) => {
    if (!found && (object as Mesh).isMesh) {
      found = object as Mesh;
    }
  });
  if (!found) {
    throw new Error(`Model "${name}" has no mesh.`);
  }
  const local = root.matrixWorld.clone().invert().multiply(found.matrixWorld);
  const geometry = found.geometry.clone();
  // Quantized (normalized integer) attributes can't hold transformed
  // values: turn them into floats first, or normals come out broken (black).
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    if (attribute.array instanceof Float32Array) {
      continue;
    }
    const values = new Float32Array(attribute.count * attribute.itemSize);
    for (let index = 0; index < attribute.count; index++) {
      for (let item = 0; item < attribute.itemSize; item++) {
        values[index * attribute.itemSize + item] = attribute.getComponent(
          index,
          item,
        );
      }
    }
    geometry.setAttribute(
      name,
      new BufferAttribute(values, attribute.itemSize),
    );
  }
  return {
    geometry: geometry.applyMatrix4(local),
    material: found.material as Material,
  };
};

// A kit material by name (e.g. 'Bark_NormalTree'), for hand-built props
// that should match the kit models.
export const getKitMaterial = (scene: Object3D, name: string): Material => {
  let found: Material | undefined;
  scene.traverse((object) => {
    const material = (object as Mesh).material as Material | undefined;
    if (!found && material?.name === name) {
      found = material;
    }
  });
  if (!found) {
    throw new Error(`Material "${name}" is missing from the kit.`);
  }
  return found;
};
