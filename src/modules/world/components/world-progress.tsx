'use client';

import { useProgress } from '@react-three/drei';
import { useEffect } from 'react';

interface WorldProgressProps {
  label: string;
}

// Shown over the canvas while models are loading.
const WorldProgress = ({ label }: WorldProgressProps) => {
  const { active, progress, loaded } = useProgress();

  // Performance mark for load-time measurements (see 14-rilis.md).
  useEffect(() => {
    if (!active && loaded > 0) {
      performance.mark('world:assets-ready');
    }
  }, [active, loaded]);

  if (!active) {
    return null;
  }

  return (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-0 top-16 mx-auto w-fit rounded-md bg-light/90 px-3 py-1.5 text-sm text-neutral-700 dark:bg-dark/90 dark:text-neutral-300"
    >
      {label} {Math.round(progress)}%
    </div>
  );
};

export default WorldProgress;
