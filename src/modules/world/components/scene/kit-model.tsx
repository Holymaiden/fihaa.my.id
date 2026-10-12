'use client';

import { Clone } from '@react-three/drei';
import { useMemo } from 'react';

import type { KitId } from '../../assets/kits.generated';
import type { ModelName } from '../../assets/use-kit';
import { getModelNode, useKit } from '../../assets/use-kit';
import type { Placement } from '../../config/props';

interface KitModelProps<K extends KitId> {
  kit: K;
  placement: Placement<ModelName<K>>;
}

// One placed copy of a kit model.
const KitModel = <K extends KitId>({ kit, placement }: KitModelProps<K>) => {
  const { scene } = useKit(kit);
  const node = useMemo(
    () => getModelNode(scene, placement.model),
    [scene, placement.model],
  );

  return (
    <Clone
      object={node}
      position={placement.position}
      rotation-y={placement.rotationY ?? 0}
      scale={placement.scale ?? 1}
      castShadow
      receiveShadow
    />
  );
};

export default KitModel;
