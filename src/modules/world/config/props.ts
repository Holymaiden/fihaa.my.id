import type { CoreModelName, VaultModelName } from '../assets/kits.generated';
import type { SurfaceStationId, Vec3 } from './island';

// Where each model sits. Station props use the station's own frame: x to
// the right and z towards the camera when the station faces it, y above the
// ground. Layout only.

export interface Placement<Name extends string> {
  model: Name;
  position: Vec3;
  rotationY?: number;
  scale?: number;
}

export type CorePlacement = Placement<CoreModelName>;
export type VaultPlacement = Placement<VaultModelName>;

// KayKit's hexagon pack is modelled one hex tile (2 units) per building;
// the dungeon pack is about four times bigger. These bring both to one scale.
export const HEX_PACK_SCALE = 2.6;
export const DUNGEON_PACK_SCALE = 0.55;

const hex = (
  model: CoreModelName,
  position: Vec3,
  rotationY = 0,
): CorePlacement => ({ model, position, rotationY, scale: HEX_PACK_SCALE });

// Island frame (x/z on the island, y = offset above the ground).
export const GUILD_PROPS: CorePlacement[] = [
  hex('building_castle_blue', [0, 0, 0], 0.3),
  hex('building_tower_A_blue', [-3.6, 0, -2.6], 0.4),
  hex('building_tower_A_blue', [3.8, 0, -2.2], -0.6),
  hex('flag_blue', [-2.2, 0, 2.6], 0.5),
  hex('flag_blue', [2.4, 0, 2.4], -0.3),
];

export const STATION_PROPS: Record<SurfaceStationId, CorePlacement[]> = {
  projects: [
    hex('barrel', [1.9, 0, 0.6]),
    hex('crate_A_big', [-2, 0, 0.8], 0.4),
    hex('sack', [-1.5, 0, 1.6], 0.8),
    { model: 'lantern_standing', position: [2.5, 0, -0.6] },
  ],
  skills: [
    { model: 'CommonTree_1', position: [0, 0, -0.4], scale: 2.3 },
    { model: 'lantern_standing', position: [2.2, 0, 1.2] },
  ],
  experience: [
    { model: 'stool', position: [0, 0, 0], scale: DUNGEON_PACK_SCALE * 2.2 },
    { model: 'spellbook_open', position: [0, 0.83, 0.05], scale: 1.4 },
    { model: 'lantern_standing', position: [1.6, 0, -0.6] },
    hex('building_well_blue', [-2.4, 0, -0.6], 0.5),
  ],
  contact: [
    hex('building_tavern_blue', [0, 0, -1]),
    {
      model: 'keg',
      position: [-2.4, 0, 0.8],
      rotationY: 0.6,
      scale: DUNGEON_PACK_SCALE,
    },
    {
      model: 'stool',
      position: [1, 0, 1.6],
      scale: DUNGEON_PACK_SCALE * 1.3,
    },
    { model: 'mug_full', position: [1, 0.9, 1.6], scale: 0.8 },
    hex('barrel', [-2.8, 0, -0.6]),
  ],
};

// On the vault ledge (y = ledge top).
export const VAULT_PROPS: VaultPlacement[] = [
  { model: 'arch_gate', position: [0, 0, -1.3], scale: 0.7 },
  { model: 'shrine_candles', position: [-1.7, 0, -0.5], scale: 0.6 },
  { model: 'torch_lit', position: [1.8, 0.4, -0.6], scale: 0.9 },
  {
    model: 'chest_gold',
    position: [1.2, 0, 0.9],
    rotationY: -0.5,
    scale: 0.55,
  },
  { model: 'coin_stack_medium', position: [-1, 0, 1.1], scale: 0.55 },
];

// Scenery in the island frame, kept clear of the station spots. Drawn with
// instancing.
export const DECOR: CorePlacement[] = [
  { model: 'PineTree_3', position: [-5.4, 0, 3.2], scale: 1.1 },
  { model: 'PineTree_3', position: [5.6, 0, 3.6], scale: 0.9 },
  { model: 'PineTree_3', position: [-4, 0, -6.6], scale: 1 },
  { model: 'PineTree_3', position: [4.6, 0, -6.8], scale: 1.2 },
  { model: 'PineTree_3', position: [-11.2, 0, -2], scale: 0.9 },
  { model: 'PineTree_3', position: [9.8, 0, 3.2], scale: 1 },
  { model: 'CommonTree_1', position: [-6.8, 0, 7.2], scale: 1 },
  { model: 'CommonTree_1', position: [7.2, 0, -5], scale: 1.1 },
  { model: 'CommonTree_1', position: [-8, 0, -8], scale: 0.9 },
  { model: 'CommonTree_1', position: [9, 0, 8.4], scale: 0.9 },
  { model: 'trees_A_medium', position: [-10, 0, 5.4], scale: 1.6 },
  { model: 'trees_A_medium', position: [2, 0, -11], scale: 1.6 },
  { model: 'tree_single_A', position: [0.4, 0, 4.6], scale: 2.2 },
  { model: 'tree_single_A', position: [-1.6, 0, -4.8], scale: 2.4 },
  { model: 'Bush_1', position: [-3.4, 0, 5.2], scale: 0.7 },
  { model: 'Bush_1', position: [3.6, 0, 6], scale: 0.6 },
  { model: 'Bush_1', position: [-6, 0, -3.6], scale: 0.7 },
  { model: 'Bush_1', position: [6.4, 0, -3.8], scale: 0.6 },
  { model: 'BushBerries_1', position: [10.6, 0, -1.8], scale: 0.6 },
  { model: 'BushBerries_1', position: [-2.6, 0, 10.2], scale: 0.6 },
  { model: 'Rock_Moss_4', position: [10.8, 0, 4.6], scale: 1.2 },
  { model: 'Rock_Moss_4', position: [-12.2, 0, 1.4], scale: 1 },
  { model: 'Rock_Moss_4', position: [3.4, 0, 11.8], scale: 1 },
  { model: 'rock_single_C', position: [-5, 0, -11], scale: 3 },
  { model: 'rock_single_A', position: [8, 0, -10], scale: 4 },
  { model: 'Flowers', position: [-3.6, 0, 7.8] },
  { model: 'Flowers', position: [4.2, 0, 8.6], rotationY: 1.4 },
  { model: 'Flowers', position: [-6.6, 0, 4.8], rotationY: 2 },
  { model: 'Flowers', position: [5.8, 0, -4.2], rotationY: 0.6 },
  { model: 'Flowers', position: [3.4, 0, -9.4], rotationY: 2.6 },
];

// World positions of the clouds around and below the island.
export const CLOUDS: CorePlacement[] = [
  { model: 'cloud_big', position: [-24, -6, -10], scale: 2.6 },
  { model: 'cloud_big', position: [22, -9, -6], scale: 3 },
  { model: 'cloud_big', position: [-10, -13, 16], rotationY: 1, scale: 3.2 },
  { model: 'cloud_big', position: [26, 5, -20], scale: 2.2 },
  { model: 'cloud_small', position: [-28, 7, -22], scale: 2.4 },
  { model: 'cloud_small', position: [14, -16, 12], rotationY: 2, scale: 2.6 },
];
