'use client';

import { useCallback } from 'react';

import type { WorldStationId } from '@/lib/content/types';

import { TURN_ORDER } from '../config/island';
import { EXPLORE_ORDER } from '../config/viewpoints';
import { useWorldStore } from '../store/world-store';

// ← / → walk the castle and the rim stations in order; in explore mode
// they walk round every viewpoint, scenic ones included.
export const useStationTurn = () => {
  const activeStation = useWorldStore((state) => state.activeStation);
  const openStation = useWorldStore((state) => state.openStation);
  const mode = useWorldStore((state) => state.mode);
  const viewpoint = useWorldStore((state) => state.viewpoint);
  const goTo = useWorldStore((state) => state.goTo);

  return useCallback(
    (step: -1 | 1) => {
      const explore = mode === 'explore';
      const order: string[] = explore ? EXPLORE_ORDER : TURN_ORDER;
      const index = order.indexOf(
        explore ? viewpoint : (activeStation as WorldStationId),
      );
      const next =
        index === -1
          ? step === 1
            ? 0
            : order.length - 1
          : (index + step + order.length) % order.length;
      if (explore) {
        goTo(EXPLORE_ORDER[next]);
      } else {
        openStation(TURN_ORDER[next]);
      }
    },
    [activeStation, openStation, mode, viewpoint, goTo],
  );
};
