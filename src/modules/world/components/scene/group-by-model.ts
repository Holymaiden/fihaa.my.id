import type { CoreModelName } from '../../assets/kits.generated';
import type { CorePlacement } from '../../config/props';
import type { InstanceTransform } from './instanced-model';

// Groups placements by model, ready for one InstancedModel per model.
export const groupByModel = (
  placements: CorePlacement[],
): [CoreModelName, InstanceTransform[]][] => {
  const groups = new Map<CoreModelName, InstanceTransform[]>();
  for (const { model, ...transform } of placements) {
    groups.set(model, [...(groups.get(model) ?? []), transform]);
  }
  return [...groups.entries()];
};
