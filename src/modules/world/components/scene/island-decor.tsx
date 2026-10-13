'use client';

import { DECOR } from '../../config/props';
import { groupByModel } from './group-by-model';
import InstancedModel from './instanced-model';
import { onGround } from './island-frame';

const GROUPS = groupByModel(DECOR.map(onGround));
// KayKit trees share the buildings' material, so they opt in to swaying
// here (the Quaternius plants sway through their own materials).
const SWAYING_MODELS = new Set<string>(['trees_A_medium', 'tree_single_A']);

// Trees, bushes, rocks and flowers, one instanced draw per model part.
const IslandDecor = () => (
  <>
    {GROUPS.map(([model, instances]) => (
      <InstancedModel
        key={model}
        kit="core"
        model={model}
        instances={instances}
        castShadow
        sway={SWAYING_MODELS.has(model)}
      />
    ))}
  </>
);

export default IslandDecor;
