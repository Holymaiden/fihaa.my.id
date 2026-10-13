'use client';

import { LuArrowRight, LuX } from 'react-icons/lu';

import type { WorldContent, WorldStation } from '@/lib/content/types';

import { useWorldStore } from '../store/world-store';
import StationTeaser from './panels/station-teaser';
import { STATION_ICONS } from './ui/station-icons';
import { GLASS } from './ui/styles';

interface StationCardProps {
  station: WorldStation;
  content: WorldContent;
  // 'floating' hangs next to the station in 3D; 'sheet' sits at the bottom
  // of small screens (and when there is no 3D scene).
  variant: 'floating' | 'sheet';
}

export const CARD_TITLE_ID = 'world-card-title';

// What appears when a place is picked: its name, a few highlights and the
// way to the full list.
const StationCard = ({ station, content, variant }: StationCardProps) => {
  const openDetails = useWorldStore((state) => state.openDetails);
  const closeStation = useWorldStore((state) => state.closeStation);
  const Icon = STATION_ICONS[station.id];
  const { copy } = content;

  return (
    <section
      aria-labelledby={CARD_TITLE_ID}
      className={`${GLASS} rounded-2xl p-4 text-neutral-800 dark:text-neutral-100 ${
        variant === 'floating' ? 'w-80' : 'w-full'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-lg text-light"
        >
          <Icon />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id={CARD_TITLE_ID}
            tabIndex={-1}
            className="text-subheading font-semibold leading-tight outline-none"
          >
            {station.title}
          </h2>
          <p className="text-2xs text-neutral-500 dark:text-neutral-400">
            {station.place}
          </p>
        </div>
        <button
          type="button"
          onClick={closeStation}
          aria-label={copy.closeCard}
          className="rounded-full p-1.5 text-neutral-500 hover:bg-black/5 hover:text-accent dark:hover:bg-white/10"
        >
          <LuX aria-hidden />
        </button>
      </div>
      <p className="mt-3 text-meta text-neutral-600 dark:text-neutral-300">
        {station.summary}
      </p>
      <div className="mt-3">
        <StationTeaser id={station.id} content={content} />
      </div>
      <button
        type="button"
        onClick={openDetails}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-light transition hover:brightness-110"
      >
        {copy.viewDetails}
        <LuArrowRight aria-hidden />
      </button>
    </section>
  );
};

export default StationCard;
