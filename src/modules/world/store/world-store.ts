'use client';

import { create } from 'zustand';

import type { WorldStationId } from '@/lib/content/types';

import type { ViewpointId } from '../config/viewpoints';
import { isStationViewpoint } from '../config/viewpoints';

// 'island': the whole island, turned by dragging. 'explore': standing on
// it at eye height, looking around and walking between viewpoints. 'tour':
// the camera glides round the island on its own until the visitor moves.
export type WorldMode = 'island' | 'explore' | 'tour';

export type Weather = 'clear' | 'rain' | 'mist';

// A cinematic move between views: 'intro' flies in from the clouds after
// the visitor enters, 'enter' dives onto the island, 'exit' rises back
// out. `at` is performance.now() when it started.
export interface WorldTransition {
  kind: 'intro' | 'enter' | 'exit';
  at: number;
}
export const WEATHERS: Weather[] = ['clear', 'rain', 'mist'];

interface WorldState {
  mode: WorldMode;
  // False until the visitor passes the entrance screen (that click is
  // also what lets the browser start the music).
  entered: boolean;
  enterWorld: () => void;
  transition: WorldTransition | null;
  startTour: () => void;
  stopTour: () => void;
  weather: Weather;
  // Weather changes by itself until the visitor picks one.
  autoWeather: boolean;
  setWeather: (weather: Weather, auto?: boolean) => void;
  // Music and nature sounds; on unless the visitor turned them off (the
  // browser still waits for their first click or key press).
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  // Ids of the crystals found so far.
  crystals: string[];
  collectCrystal: (id: string) => void;
  restoreCrystals: (ids: string[]) => void;
  // A short message shown at the top for a few seconds.
  toast: string | null;
  showToast: (message: string | null) => void;
  // Where the visitor stands in explore mode: a viewpoint, or 'free' for a
  // spot they clicked on the ground (freeSpot, island frame).
  viewpoint: ViewpointId | 'free';
  freeSpot: [number, number] | null;
  walkTo: (spot: [number, number]) => void;
  enterExplore: (at: ViewpointId) => void;
  exitExplore: () => void;
  // Walk to a viewpoint; a station's viewpoint also opens the station.
  goTo: (id: ViewpointId) => void;
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

const now = () => performance.now();

export const useWorldStore = create<WorldState>((set) => ({
  mode: 'island',
  entered: false,
  enterWorld: () =>
    set({ entered: true, transition: { kind: 'intro', at: now() } }),
  transition: null,
  startTour: () =>
    set({ mode: 'tour', activeStation: null, detailsOpen: false }),
  stopTour: () =>
    set((state) => (state.mode === 'tour' ? { mode: 'island' } : {})),
  weather: 'clear',
  autoWeather: true,
  setWeather: (weather, auto = false) => set({ weather, autoWeather: auto }),
  soundOn: true,
  setSoundOn: (on) => set({ soundOn: on }),
  crystals: [],
  collectCrystal: (id) =>
    set((state) =>
      state.crystals.includes(id) ? {} : { crystals: [...state.crystals, id] },
    ),
  restoreCrystals: (ids) => set({ crystals: ids }),
  toast: null,
  showToast: (message) => set({ toast: message }),
  viewpoint: 'meadow',
  freeSpot: null,
  walkTo: (spot) =>
    set({
      viewpoint: 'free',
      freeSpot: spot,
      activeStation: null,
      detailsOpen: false,
    }),
  enterExplore: (at) =>
    set((state) => ({
      mode: 'explore',
      entered: true,
      transition: { kind: 'enter', at: now() },
      viewpoint: at,
      // Keep an open station only if we step in right at it.
      activeStation: state.activeStation === at ? state.activeStation : null,
      detailsOpen: false,
    })),
  exitExplore: () =>
    set({
      mode: 'island',
      detailsOpen: false,
      transition: { kind: 'exit', at: now() },
    }),
  goTo: (id) =>
    set((state) =>
      isStationViewpoint(id)
        ? {
            viewpoint: id,
            activeStation: id,
            detailsOpen: false,
            vaultRequested: state.vaultRequested || id === 'secret',
          }
        : { viewpoint: id, activeStation: null, detailsOpen: false },
    ),
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
      // Picking a place ends the tour.
      mode: state.mode === 'tour' ? 'island' : state.mode,
      activeStation: id,
      // In explore mode opening a station walks to it.
      viewpoint: state.mode === 'explore' ? id : state.viewpoint,
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
