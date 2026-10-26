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
    // The skills tree: one big, gnarled tree.
    { model: 'TwistedTree_1', position: [0, 0, -0.4], scale: 0.34 },
    { model: 'lantern_standing', position: [2.2, 0, 1.2] },
  ],
  experience: [
    { model: 'stool', position: [0, 0, 0], scale: DUNGEON_PACK_SCALE * 2.2 },
    { model: 'spellbook_open', position: [0, 0.83, 0.05], scale: 1.4 },
    { model: 'lantern_standing', position: [1.6, 0, -0.6] },
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

// The Stylized Nature MegaKit is modelled life-size (a tree is ~7 units);
// these bring each kind of plant to the island's scale.
const NATURE_SCALE = {
  tree: 0.34,
  pine: 0.45,
  bush: 0.55,
  fern: 0.13,
  flower: 0.22,
  rock: 0.4,
} as const;

const nature = (
  model: CoreModelName,
  kind: keyof typeof NATURE_SCALE,
  {
    at: [x, z],
    size = 1,
    rotationY = 0,
  }: { at: [number, number]; size?: number; rotationY?: number },
): CorePlacement => ({
  model,
  position: [x, 0, z],
  rotationY,
  scale: NATURE_SCALE[kind] * size,
});

// Scenery in the island frame, kept clear of the station spots. Drawn with
// instancing.
export const DECOR: CorePlacement[] = [
  nature('Pine_1', 'pine', { at: [-5.4, 3.2], size: 1.1 }),
  nature('Pine_2', 'pine', { at: [5.6, 3.6], size: 0.9, rotationY: 1.2 }),
  nature('Pine_3', 'pine', { at: [-4, -6.6], rotationY: 2.1 }),
  nature('Pine_1', 'pine', { at: [4.6, -6.8], size: 1.2, rotationY: 0.7 }),
  nature('Pine_2', 'pine', { at: [-11.2, -2], size: 0.9, rotationY: 2.8 }),
  nature('Pine_3', 'pine', { at: [9.8, 3.2], rotationY: 4 }),
  nature('Pine_1', 'pine', { at: [-10.6, 4.4], size: 0.8, rotationY: 3.3 }),
  nature('Pine_3', 'pine', { at: [-9.2, 6.4], size: 1.1, rotationY: 5.1 }),
  nature('Pine_2', 'pine', { at: [1.2, -11.2], size: 1, rotationY: 0.4 }),
  nature('CommonTree_1', 'tree', { at: [-6.8, 7.2] }),
  nature('CommonTree_2', 'tree', { at: [7.2, -5], size: 1.1, rotationY: 1.9 }),
  nature('CommonTree_3', 'tree', { at: [-8, -8], size: 0.9, rotationY: 3.1 }),
  nature('CommonTree_4', 'tree', {
    at: [7.2, 10.8],
    size: 0.9,
    rotationY: 0.8,
  }),
  nature('CommonTree_2', 'tree', {
    at: [3, -11.4],
    size: 0.85,
    rotationY: 4.4,
  }),
  nature('CommonTree_1', 'tree', { at: [0.4, 4.6], size: 0.8, rotationY: 2.4 }),
  nature('CommonTree_4', 'tree', {
    at: [-1.6, -4.8],
    size: 0.85,
    rotationY: 5.3,
  }),
  nature('Bush_Common', 'bush', { at: [-3.4, 5.2] }),
  nature('Bush_Common', 'bush', { at: [3.6, 6], size: 0.85, rotationY: 1.3 }),
  nature('Bush_Common', 'bush', { at: [-6, -3.6], rotationY: 2.2 }),
  nature('Bush_Common', 'bush', {
    at: [6.4, -3.8],
    size: 0.85,
    rotationY: 3.7,
  }),
  nature('Bush_Common_Flowers', 'bush', { at: [10.6, -1.8], size: 0.85 }),
  nature('Bush_Common_Flowers', 'bush', {
    at: [-2.6, 10.2],
    size: 0.85,
    rotationY: 2,
  }),
  nature('Fern_1', 'fern', { at: [-7.4, 2.2], rotationY: 0.5 }),
  nature('Fern_1', 'fern', { at: [8.4, -2.6], size: 0.9, rotationY: 2.5 }),
  nature('Fern_1', 'fern', { at: [-3.2, -9.6], rotationY: 4.2 }),
  nature('Rock_Medium_1', 'rock', { at: [10.8, 4.6], size: 1.1 }),
  nature('Rock_Medium_2', 'rock', { at: [-12.2, 1.4], rotationY: 2 }),
  nature('Rock_Medium_3', 'rock', { at: [3.4, 11.8], size: 0.9, rotationY: 4 }),
  nature('Rock_Medium_3', 'rock', { at: [-5, -11], size: 0.8, rotationY: 1 }),
  nature('Rock_Medium_1', 'rock', { at: [8, -10], size: 0.7, rotationY: 3 }),
  nature('Flower_3_Group', 'flower', { at: [-3.6, 7.8] }),
  nature('Flower_4_Group', 'flower', { at: [4.2, 8.6], rotationY: 1.4 }),
  nature('Flower_3_Group', 'flower', { at: [-6.6, 4.8], rotationY: 2 }),
  nature('Flower_4_Group', 'flower', { at: [5.8, -4.2], rotationY: 0.6 }),
  nature('Flower_3_Group', 'flower', { at: [3.4, -9.4], rotationY: 2.6 }),
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
