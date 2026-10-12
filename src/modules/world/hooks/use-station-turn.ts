'use client';

import { useCallback } from 'react';

import type { WorldStationId } from '@/lib/content/types';

import { TURN_ORDER } from '../config/island';
import { useWorldStore } from '../store/world-store';

// ← / → walk the castle and the rim stations in order.
export const useStationTurn = () => {
  const activeStation = useWorldStore((state) => state.activeStation);
  const openStation = useWorldStore((state) => state.openStation);

  return useCallback(
    (step: -1 | 1) => {
      const index = TURN_ORDER.indexOf(activeStation as WorldStationId);
      const next =
        index === -1
          ? step === 1
            ? 0
            : TURN_ORDER.length - 1
          : (index + step + TURN_ORDER.length) % TURN_ORDER.length;
      openStation(TURN_ORDER[next]);
    },
    [activeStation, openStation],
  );
};
