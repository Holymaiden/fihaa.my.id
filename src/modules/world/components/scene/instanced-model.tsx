'use client';

import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { BufferGeometry, InstancedMesh, Material, Mesh } from 'three';
import { Matrix4, Quaternion, Vector3 } from 'three';

import type { KitId } from '../../assets/kits.generated';
import type { ModelName } from '../../assets/use-kit';
import { getModelNode, useKit } from '../../assets/use-kit';
import type { Vec3 } from '../../config/island';
import { addSway } from './foliage-sway';

export interface InstanceTransform {
  position: Vec3;
  rotationY?: number;
  scale?: number;
}

interface InstancedModelProps<K extends KitId> {
  kit: K;
  model: ModelName<K>;
  // One transform per copy, in the parent's space.
  instances: InstanceTransform[];
  castShadow?: boolean;
  // Sway in the wind. The kit material is shared with buildings, so the
  // plant gets its own copy to patch.
  sway?: boolean;
}

interface Part {
  geometry: BufferGeometry;
  material: Material | Material[];
  // Mesh transform relative to the model's root node.
  local: Matrix4;
}

const UP = new Vector3(0, 1, 0);

const swayingCopy = (material: Material | Material[]) => {
  const copies = (Array.isArray(material) ? material : [material]).map(
    (item) => {
      const copy = item.clone();
      addSway(copy);
      return copy;
    },
  );
  return Array.isArray(material) ? copies : copies[0];
};

const toMatrix = ({ position, rotationY = 0, scale = 1 }: InstanceTransform) =>
  new Matrix4().compose(
    new Vector3(...position),
    new Quaternion().setFromAxisAngle(UP, rotationY),
    new Vector3(scale, scale, scale),
  );

interface InstancedPartProps {
  part: Part;
  matrices: Matrix4[];
  castShadow: boolean;
}

const InstancedPart = ({ part, matrices, castShadow }: InstancedPartProps) => {
  const meshRef = useRef<InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const matrix = new Matrix4();
    matrices.forEach((placement, index) => {
      mesh.setMatrixAt(index, matrix.multiplyMatrices(placement, part.local));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    // Needed with frameloop="demand".
    invalidate();
  }, [matrices, part, invalidate]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[part.geometry, part.material, matrices.length]}
      castShadow={castShadow}
      receiveShadow
    />
  );
};

// Draws many copies of one kit model with one draw call per mesh part.
const InstancedModel = <K extends KitId>({
  kit,
  model,
  instances,
  castShadow = false,
  sway = false,
}: InstancedModelProps<K>) => {
  const { scene } = useKit(kit);

  const parts = useMemo(() => {
    const root = getModelNode(scene, model);
    root.updateWorldMatrix(true, true);
    const rootInverse = root.matrixWorld.clone().invert();
    const found: Part[] = [];
    root.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.isMesh) {
        found.push({
          geometry: mesh.geometry,
          material: sway ? swayingCopy(mesh.material) : mesh.material,
          local: rootInverse.clone().multiply(mesh.matrixWorld),
        });
      }
    });
    return found;
  }, [scene, model, sway]);

  const matrices = useMemo(() => instances.map(toMatrix), [instances]);

  return (
    <>
      {parts.map((part, index) => (
        <InstancedPart
          key={index}
          part={part}
          matrices={matrices}
          castShadow={castShadow}
        />
      ))}
    </>
  );
};

export default InstancedModel;
