'use client';

import { useEffect } from 'react';

import { useWorldStore } from '../store/world-store';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

const STORAGE_KEY = 'world-effects';

// Motion effects are on unless the visitor turned them off or prefers
// reduced motion.
export const useEffectsEnabled = (): boolean => {
  const preference = useWorldStore((state) => state.effectsPreference);
  const reducedMotion = usePrefersReducedMotion();
  return preference ?? !reducedMotion;
};

// Restores and saves the visitor's choice. Storage may be unavailable
// (private mode), which just means the choice isn't remembered.
export const useEffectsPreferenceStorage = () => {
  const preference = useWorldStore((state) => state.effectsPreference);
  const setPreference = useWorldStore((state) => state.setEffectsPreference);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'on' || saved === 'off') {
        setPreference(saved === 'on');
      }
    } catch {
      // ignore
    }
  }, [setPreference]);

  useEffect(() => {
    if (preference === null) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, preference ? 'on' : 'off');
    } catch {
      // ignore
    }
  }, [preference]);
};
