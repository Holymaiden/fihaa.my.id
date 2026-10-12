import type { CoreModelName, VaultModelName } from '../assets/kits.generated';
import type { Vec3 } from './layout';

// Where each model sits, relative to its island's top (y = 0). Layout only.

export interface Placement<Name extends string> {
  model: Name;
  position: Vec3;
  rotationY?: number;
  scale?: number;
}

export type CorePlacement = Placement<CoreModelName>;
export type VaultPlacement = Placement<VaultModelName>;

// KayKit's hexagon pack is modelled one tile (2 units) per building; the
// dungeon pack is about four times bigger. These bring both to one scale.
export const HEX_PACK_SCALE = 2.5;
export const DUNGEON_PACK_SCALE = 0.5;

const hex = (
  model: CoreModelName,
  position: Vec3,
  rotationY = 0,
): CorePlacement => ({ model, position, rotationY, scale: HEX_PACK_SCALE });

export const GUILD_PROPS: CorePlacement[] = [
  hex('building_castle_blue', [0, 0, 0]),
  hex('building_tower_A_blue', [-4.2, 0, 1.6], 0.4),
  hex('building_tower_A_blue', [4, 0, -2], -0.6),
  hex('building_well_blue', [3.4, 0, 3.4], 0.3),
  hex('flag_blue', [-2.6, 0, 4.2], 0.5),
  hex('flag_blue', [2.4, 0, 4.6], -0.3),
  hex('barrel', [4.6, 0, 2.2]),
  hex('crate_A_big', [-3.6, 0, 4]),
  { model: 'lantern_standing', position: [0, 0, 4.8] },
];

export const STATION_PROPS: Record<
  'projects' | 'skills' | 'experience' | 'contact',
  CorePlacement[]
> = {
  projects: [
    hex('barrel', [1.9, 0, 0.9]),
    hex('crate_A_big', [-1.9, 0, 1], 0.4),
    hex('sack', [-1.4, 0, 1.8], 0.8),
    { model: 'lantern_standing', position: [2.6, 0, -0.4] },
  ],
  skills: [
    { model: 'CommonTree_1', position: [0, 0, 0], scale: 2.2 },
    { model: 'lantern_standing', position: [2.4, 0, 1.6] },
  ],
  experience: [
    {
      model: 'stool',
      position: [0, 0, 0],
      scale: DUNGEON_PACK_SCALE * 2.4,
    },
    { model: 'spellbook_open', position: [0, 0.82, 0.05], scale: 1.4 },
    { model: 'lantern_standing', position: [1.6, 0, -0.6] },
    hex('sack', [-1.5, 0, 0.8], 1.2),
  ],
  contact: [
    hex('building_tavern_blue', [0, 0, -0.8]),
    {
      model: 'keg',
      position: [-2.2, 0, 1],
      rotationY: 0.6,
      scale: DUNGEON_PACK_SCALE,
    },
    {
      model: 'stool',
      position: [1, 0, 2],
      scale: DUNGEON_PACK_SCALE * 1.4,
    },
    { model: 'mug_full', position: [1, 0.95, 2], scale: 0.8 },
    hex('barrel', [-2.6, 0, -0.4]),
  ],
};

// Local positions on the Hidden Vault island.
export const VAULT_PROPS: VaultPlacement[] = [
  { model: 'floor_tile_large', position: [0, 0.05, 0], scale: 0.9 },
  { model: 'arch_gate', position: [0, 0, -1.6], scale: 0.75 },
  { model: 'shrine_candles', position: [-1.9, 0, -0.6], scale: 0.7 },
  { model: 'torch_lit', position: [1.9, 0.4, -0.8], scale: 0.9 },
  {
    model: 'chest_gold',
    position: [1.4, 0, 1.1],
    rotationY: -0.5,
    scale: 0.6,
  },
  { model: 'coin_stack_medium', position: [-1.2, 0, 1.4], scale: 0.6 },
];

// Repeated scenery, drawn with instancing. Positions are per island.
export const DECOR: Record<
  'guild' | 'projects' | 'skills' | 'experience' | 'contact',
  CorePlacement[]
> = {
  guild: [
    { model: 'PineTree_3', position: [-5.6, 0, -2.4], scale: 1.1 },
    { model: 'PineTree_3', position: [-2.4, 0, -5.4], scale: 0.9 },
    { model: 'trees_A_medium', position: [5.6, 0, 1], scale: 1.6 },
    { model: 'Bush_1', position: [-5, 0, 3], scale: 0.8 },
    { model: 'BushBerries_1', position: [1.2, 0, 5.6], scale: 0.7 },
    { model: 'Rock_Moss_4', position: [5.4, 0, -3.2], scale: 1.2 },
    { model: 'Flowers', position: [-1.2, 0, 5], scale: 1 },
    { model: 'Flowers', position: [3.6, 0, 5], rotationY: 1.4 },
  ],
  projects: [
    { model: 'tree_single_A', position: [-2.8, 0, -1.8], scale: 2.4 },
    { model: 'Bush_1', position: [2.6, 0, -2.4], scale: 0.7 },
    { model: 'rock_single_C', position: [0.4, 0, 3], scale: 3 },
  ],
  skills: [
    { model: 'Bush_1', position: [-2.6, 0, 1.4], scale: 0.7 },
    { model: 'Flowers', position: [1.4, 0, 2.6] },
    { model: 'Flowers', position: [-1, 0, 3], rotationY: 2 },
    { model: 'Rock_Moss_4', position: [2.8, 0, -1.6] },
  ],
  experience: [
    { model: 'PineTree_3', position: [-2.6, 0, -2], scale: 0.8 },
    { model: 'tree_single_A', position: [2.6, 0, -2.2], scale: 2.2 },
    { model: 'rock_single_A', position: [1.2, 0, 2.8], scale: 4 },
    { model: 'Flowers', position: [-0.6, 0, 2.6] },
  ],
  contact: [
    { model: 'trees_A_medium', position: [2.8, 0, -2.6], scale: 1.4 },
    { model: 'BushBerries_1', position: [2.8, 0, 1.6], scale: 0.6 },
    { model: 'Flowers', position: [-0.4, 0, 3] },
  ],
};

// World positions of the clouds around the islands.
export const CLOUDS: CorePlacement[] = [
  { model: 'cloud_big', position: [-26, 4, -12], scale: 2.4 },
  { model: 'cloud_big', position: [24, -6, -20], scale: 2 },
  { model: 'cloud_big', position: [-6, -10, 22], rotationY: 1, scale: 2.2 },
  { model: 'cloud_small', position: [28, 8, 12], scale: 2 },
  { model: 'cloud_small', position: [-22, -4, 18], rotationY: 2, scale: 1.8 },
  { model: 'cloud_small', position: [4, 12, -28], scale: 2.2 },
];
