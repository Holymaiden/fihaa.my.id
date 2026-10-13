'use client';

import { DECOR } from '../../config/props';
import { groupByModel } from './group-by-model';
import InstancedModel from './instanced-model';
import { onGround } from './island-frame';

const GROUPS = groupByModel(DECOR.map(onGround));

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
      />
    ))}
  </>
);

export default IslandDecor;
