export type WorldMode = '2d' | '3d';

export const WORLD_MODES: readonly WorldMode[] = ['2d', '3d'];

export const isWorldMode = (value: unknown): value is WorldMode =>
  WORLD_MODES.includes(value as WorldMode);
