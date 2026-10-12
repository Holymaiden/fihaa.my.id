'use client';

import { useCallback } from 'react';

import type { SurfaceStationId } from '../config/island';
import { STATION_ORDER } from '../config/island';
import { useWorldStore } from '../store/world-store';

// ← / → walk the surface stations in order (the vault is not on the way).
export const useStationTurn = () => {
  const activeStation = useWorldStore((state) => state.activeStation);
  const openStation = useWorldStore((state) => state.openStation);

  return useCallback(
    (step: -1 | 1) => {
      const index = STATION_ORDER.indexOf(activeStation as SurfaceStationId);
      const next =
        index === -1
          ? step === 1
            ? 0
            : STATION_ORDER.length - 1
          : (index + step + STATION_ORDER.length) % STATION_ORDER.length;
      openStation(STATION_ORDER[next]);
    },
    [activeStation, openStation],
  );
};
