'use client';

import type { ThreeEvent } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { BufferGeometry, InstancedMesh, Material, Mesh } from 'three';
import { Color, Matrix4, Quaternion, Vector3 } from 'three';

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
  // Optional tint per copy (multiplies the material color); null = none.
  instanceColors?: (string | null)[];
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

const NO_TINT = new Color('white');

interface InstancedPartProps {
  part: Part;
  matrices: Matrix4[];
  colors?: (string | null)[];
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  onPointerMove?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: () => void;
}

const InstancedPart = ({
  part,
  matrices,
  colors,
  ...events
}: InstancedPartProps) => {
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
    if (colors) {
      const color = new Color();
      colors.forEach((tint, index) => {
        mesh.setColorAt(index, tint ? color.set(tint) : NO_TINT);
      });
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }
    mesh.computeBoundingSphere();
    // Needed with frameloop="demand".
    invalidate();
  }, [matrices, part, colors, invalidate]);

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
  instanceColors,
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
          colors={instanceColors}
          {...events}
        />
      ))}
    </>
  );
};

export default InstancedModel;
