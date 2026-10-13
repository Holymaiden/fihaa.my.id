'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LuVolume2, LuVolumeX } from 'react-icons/lu';

import type { WorldContent } from '@/lib/content/types';

import { useWorldStore } from '../store/world-store';

interface WorldEntranceProps {
  content: WorldContent;
}

// The doorway into the world: the visitor's click both starts the fly-in
// from the clouds and lets the browser play the music.
const WorldEntrance = ({ content }: WorldEntranceProps) => {
  const { copy, profile } = content;
  const entered = useWorldStore((state) => state.entered);
  const enterWorld = useWorldStore((state) => state.enterWorld);
  const setSoundOn = useWorldStore((state) => state.setSoundOn);

  const enter = (withSound: boolean) => {
    setSoundOn(withSound);
    enterWorld();
  };

  return (
    <AnimatePresence>
      {!entered && (
        <motion.div
          key="entrance"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-linear-to-b from-dark/10 via-dark/30 to-dark/70 px-6 text-center text-light"
        >
          <div className="flex flex-col items-center gap-2 drop-shadow-lg">
            <p className="text-sm uppercase tracking-widest text-light/80">
              {copy.entranceKicker}
            </p>
            <h1 className="text-4xl font-semibold md:text-6xl">
              {profile.name}
            </h1>
            <p className="text-base text-light/85 md:text-lg">{profile.role}</p>
          </div>
          <button
            type="button"
            // The entrance is the only thing to do here.
            autoFocus
            onClick={() => enter(true)}
            className="rounded-full bg-accent px-8 py-3 text-lg font-semibold text-light shadow-xl shadow-black/30 transition hover:scale-105 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-light"
          >
            {copy.enterWorld}
          </button>
          <div className="flex flex-col items-center gap-1 text-xs text-light/80">
            <span className="flex items-center gap-1.5">
              <LuVolume2 aria-hidden />
              {copy.entranceSound}
            </span>
            <button
              type="button"
              onClick={() => enter(false)}
              className="flex items-center gap-1.5 underline decoration-light/40 underline-offset-2 hover:text-light"
            >
              <LuVolumeX aria-hidden />
              {copy.enterSilently}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorldEntrance;
