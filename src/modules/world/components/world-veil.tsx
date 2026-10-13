'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { VISUAL } from '../config/visual';
import { useEffectsEnabled } from '../hooks/use-effects-enabled';
import type { WorldTransition } from '../store/world-store';
import { useWorldStore } from '../store/world-store';

const { transition: moves } = VISUAL;

// How the mist washes over the screen for each move: opacity keyframes,
// when they land (0..1) and how long it all takes.
const VEILS: Record<
  WorldTransition['kind'],
  { opacity: number[]; times: number[]; duration: number }
> = {
  // Coming out of the clouds: starts thick, clears as the island nears.
  intro: { opacity: [0.85, 0.6, 0], times: [0, 0.3, 1], duration: 2.6 },
  // Diving in: mist thickens at the fastest point, then we land in clear air.
  enter: {
    opacity: [0, 0, 0.8, 0],
    times: [0, 0.3, 0.55, 1],
    duration: moves.diveSeconds,
  },
  // Rising out: a quick pass through the mist.
  exit: { opacity: [0, 0.65, 0], times: [0, 0.35, 1], duration: 2.4 },
};

// A soft wash of mist and light over the screen during the camera's big
// moves, as if passing through cloud: what makes stepping in feel like
// entering the world. Off when effects are off.
const WorldVeil = () => {
  const transition = useWorldStore((state) => state.transition);
  const effects = useEffectsEnabled();
  if (!effects || !transition) {
    return null;
  }
  const veil = VEILS[transition.kind];

  return (
    <AnimatePresence>
      <motion.div
        key={transition.at}
        aria-hidden
        initial={{ opacity: veil.opacity[0] }}
        animate={{ opacity: veil.opacity }}
        transition={{
          duration: veil.duration,
          times: veil.times,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute inset-0 z-10 backdrop-blur-sm"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--color-world-cloud-light) 55%, transparent) 0%, var(--color-world-fog) 75%)',
        }}
      />
    </AnimatePresence>
  );
};

export default WorldVeil;
