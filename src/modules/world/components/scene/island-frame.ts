import type { Vec3 } from '../../config/island';
import { islandHeight } from '../../config/island';
import type { Placement } from '../../config/props';

// Turns a placement in a station's frame (x right, z outwards, y above the
// ground) into island coordinates that sit on the terrain.
export const toIsland = <Name extends string>(
  placement: Placement<Name>,
  anchor: Vec3,
  angle: number,
): Placement<Name> => {
  const [localX, lift, localZ] = placement.position;
  const x = anchor[0] + localX * Math.cos(angle) + localZ * Math.sin(angle);
  const z = anchor[2] - localX * Math.sin(angle) + localZ * Math.cos(angle);
  return {
    ...placement,
    position: [x, islandHeight(x, z) + lift, z],
    rotationY: (placement.rotationY ?? 0) + angle,
  };
};

// Island-frame placement (y = lift above the ground) onto the terrain.
export const onGround = <Name extends string>(
  placement: Placement<Name>,
): Placement<Name> => {
  const [x, lift, z] = placement.position;
  return { ...placement, position: [x, islandHeight(x, z) + lift, z] };
};
