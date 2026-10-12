'use client';

import type { ThreeEvent } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { BufferGeometry, InstancedMesh, Material, Mesh } from 'three';
import { Matrix4, Quaternion, Vector3 } from 'three';

import type { KitId } from '../../assets/kits.generated';
import type { ModelName } from '../../assets/use-kit';
import { getModelNode, useKit } from '../../assets/use-kit';
import type { Vec3 } from '../../config/layout';

export interface InstanceTransform {
  position: Vec3;
  rotationY?: number;
  scale?: number;
}

interface InstancedModelProps<K extends KitId> {
  kit: K;
  model: ModelName<K>;
  // World-space transforms, one per copy.
  instances: InstanceTransform[];
  onInstanceClick?: (index: number) => void;
  onInstanceHover?: (index: number | null) => void;
}

interface Part {
  geometry: BufferGeometry;
  material: Material | Material[];
  // Mesh transform relative to the model's root node.
  local: Matrix4;
}

const UP = new Vector3(0, 1, 0);

const toMatrix = ({ position, rotationY = 0, scale = 1 }: InstanceTransform) =>
  new Matrix4().compose(
    new Vector3(...position),
    new Quaternion().setFromAxisAngle(UP, rotationY),
    new Vector3(scale, scale, scale),
  );

interface InstancedPartProps {
  part: Part;
  matrices: Matrix4[];
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  onPointerMove?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: () => void;
}

const InstancedPart = ({ part, matrices, ...events }: InstancedPartProps) => {
  const meshRef = useRef<InstancedMesh>(null);

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
  }, [matrices, part]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[part.geometry, part.material, matrices.length]}
      {...events}
    />
  );
};

// Draws many copies of one kit model with one draw call per mesh part.
const InstancedModel = <K extends KitId>({
  kit,
  model,
  instances,
  onInstanceClick,
  onInstanceHover,
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
          material: mesh.material,
          local: rootInverse.clone().multiply(mesh.matrixWorld),
        });
      }
    });
    return found;
  }, [scene, model]);

  const matrices = useMemo(() => instances.map(toMatrix), [instances]);

  const events = {
    onClick: onInstanceClick
      ? (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (event.instanceId !== undefined) {
            onInstanceClick(event.instanceId);
          }
        }
      : undefined,
    onPointerMove: onInstanceHover
      ? (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          onInstanceHover(event.instanceId ?? null);
        }
      : undefined,
    onPointerOut: onInstanceHover ? () => onInstanceHover(null) : undefined,
  };

  return (
    <>
      {parts.map((part, index) => (
        <InstancedPart
          key={index}
          part={part}
          matrices={matrices}
          {...events}
        />
      ))}
    </>
  );
};

export default InstancedModel;
