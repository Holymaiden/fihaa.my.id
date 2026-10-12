import { WORLD_COPY, WORLD_STATIONS, WORLD_VAULT_SIZE } from '@content/world';

import type { WorldCopy, WorldStation } from './types';

export const getWorldStations = (): WorldStation[] => WORLD_STATIONS;

export const getWorldCopy = (): WorldCopy => WORLD_COPY;

export const getWorldVaultSize = (): number => WORLD_VAULT_SIZE;
