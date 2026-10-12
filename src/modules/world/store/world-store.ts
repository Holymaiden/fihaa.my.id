'use client';

import { create } from 'zustand';

import type { WorldStationId } from '@/lib/content/types';

interface WorldState {
  // null = overview of the whole island.
  activeStation: WorldStationId | null;
  hoveredStation: WorldStationId | null;
  openStation: (id: WorldStationId) => void;
  closeStation: () => void;
  setHoveredStation: (id: WorldStationId | null) => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  activeStation: null,
  hoveredStation: null,
  openStation: (id) => set({ activeStation: id }),
  closeStation: () => set({ activeStation: null }),
  setHoveredStation: (id) => set({ hoveredStation: id }),
}));
