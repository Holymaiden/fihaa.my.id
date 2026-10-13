'use client';

import { useSyncExternalStore } from 'react';

let supported: boolean | undefined;

const detect = (): boolean => {
  if (supported === undefined) {
    try {
      const canvas = document.createElement('canvas');
      supported = Boolean(
        canvas.getContext('webgl2') ?? canvas.getContext('webgl'),
      );
    } catch {
      supported = false;
    }
  }
  return supported;
};

const subscribe = () => () => {};

// null on the server (unknown yet), then true/false in the browser.
export const useWebGLSupport = (): boolean | null =>
  useSyncExternalStore(subscribe, detect, () => null);
