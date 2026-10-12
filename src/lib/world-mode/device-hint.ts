'use client';

import { useSyncExternalStore } from 'react';

// Rough thresholds, only used to suggest 2D. Not final.
const LOW_DEVICE_MEMORY_GB = 4;
const LOW_CPU_CORES = 4;
const SMALL_SCREEN_PX = 768;

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

const isLowEndDevice = (): boolean => {
  const { deviceMemory, hardwareConcurrency } =
    navigator as NavigatorWithMemory;

  const lowMemory =
    deviceMemory !== undefined && deviceMemory < LOW_DEVICE_MEMORY_GB;
  const lowCpu =
    hardwareConcurrency !== undefined && hardwareConcurrency < LOW_CPU_CORES;
  const smallScreen = window.innerWidth < SMALL_SCREEN_PX;

  return lowMemory || lowCpu || smallScreen;
};

const subscribe = () => () => {};

// null on the server, where we can't tell yet.
export const useLowEndDeviceHint = (): boolean | null =>
  useSyncExternalStore(subscribe, isLowEndDevice, () => null);
