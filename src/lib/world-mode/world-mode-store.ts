'use client';

import { create } from 'zustand';

import { WORLD_MODE_COOKIE, WORLD_MODE_COOKIE_MAX_AGE } from './cookie';
import type { WorldMode } from './types';

interface WorldModeState {
  mode: WorldMode | null;
  setMode: (mode: WorldMode) => void;
}

const writeModeCookie = (mode: WorldMode) => {
  document.cookie = `${WORLD_MODE_COOKIE}=${mode}; path=/; max-age=${WORLD_MODE_COOKIE_MAX_AGE}; samesite=lax`;
};

export const useWorldModeStore = create<WorldModeState>((set) => ({
  mode: null,
  setMode: (mode) => {
    writeModeCookie(mode);
    set({ mode });
  },
}));

export const rememberWorldMode = (mode: WorldMode) =>
  useWorldModeStore.getState().setMode(mode);
