'use client';

import { create } from 'zustand';

import type { WorldStationId } from '@/lib/content/types';

interface WorldState {
  // null = overview of the whole island.
  activeStation: WorldStationId | null;
  hoveredStation: WorldStationId | null;
  // The vault's models load the first time someone heads there.
  vaultRequested: boolean;
  // The full list for the active station (the card shows a summary).
  detailsOpen: boolean;
  openDetails: () => void;
  closeDetails: () => void;
  // null = follow prefers-reduced-motion.
  effectsPreference: boolean | null;
  setEffectsPreference: (enabled: boolean) => void;
  openStation: (id: WorldStationId) => void;
  closeStation: () => void;
  setHoveredStation: (id: WorldStationId | null) => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  activeStation: null,
  hoveredStation: null,
  vaultRequested: false,
  detailsOpen: false,
  openDetails: () => set({ detailsOpen: true }),
  closeDetails: () => set({ detailsOpen: false }),
  effectsPreference: null,
  setEffectsPreference: (enabled) => set({ effectsPreference: enabled }),
  openStation: (id) =>
    set((state) => ({
      activeStation: id,
      detailsOpen: false,
      vaultRequested: state.vaultRequested || id === 'secret',
    })),
  closeStation: () => set({ activeStation: null, detailsOpen: false }),
  setHoveredStation: (id) =>
    set((state) => ({
      hoveredStation: id,
      vaultRequested: state.vaultRequested || id === 'secret',
    })),
}));
