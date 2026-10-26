'use client';

import { Clone } from '@react-three/drei';
import { useMemo } from 'react';

import type { KitId } from '../../assets/kits.generated';
import type { ModelName } from '../../assets/use-kit';
import { getModelNode, useKit } from '../../assets/use-kit';
import type { Placement } from '../../config/props';
import InstancedModel from './instanced-model';
import { CROWN_MODELS } from './tree-crown';

interface KitModelProps<K extends KitId> {
  kit: K;
  placement: Placement<ModelName<K>>;
}

// One placed copy of a kit model. Trees go through InstancedModel, which
// draws their crowns as painted leaf clumps.
const KitModel = <K extends KitId>({ kit, placement }: KitModelProps<K>) => {
  const { scene } = useKit(kit);
  const node = useMemo(
    () => getModelNode(scene, placement.model),
    [scene, placement.model],
  );
  const instances = useMemo(() => [placement], [placement]);

  if (CROWN_MODELS.has(placement.model)) {
    return (
      <InstancedModel
        kit={kit}
        model={placement.model}
        instances={instances}
        castShadow
      />
    );
  }

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
