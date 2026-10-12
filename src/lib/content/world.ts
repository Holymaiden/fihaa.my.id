import { WORLD_COPY, WORLD_STATIONS, WORLD_VAULT_SIZE } from '@content/world';
import WORLD_ASSETS from '@content/world-assets.json';

import type { WorldCopy, WorldCredit, WorldStation } from './types';

export const getWorldStations = (): WorldStation[] => WORLD_STATIONS;

export const getWorldCopy = (): WorldCopy => WORLD_COPY;

export const getWorldVaultSize = (): number => WORLD_VAULT_SIZE;

// Credits are built from the same file the asset build reads, so every
// pack that ships models is listed.
export const getWorldCredits = (): WorldCredit[] =>
  WORLD_ASSETS.packs
    .map((pack) => ({
      ...pack,
      modelCount: WORLD_ASSETS.models.filter((model) => model.pack === pack.id)
        .length,
    }))
    .filter((pack) => pack.modelCount > 0);
