'use client';

import { LuChevronLeft } from 'react-icons/lu';

import type { WorldContent, WorldStation } from '@/lib/content/types';

import { useWorldStore } from '../store/world-store';
import StationBody, { stationHasContent } from './panels/station-body';
import { GLASS } from './ui/styles';
import WorldSwitchLink from './world-switch-link';

interface WorldDetailsProps {
  station: WorldStation;
  content: WorldContent;
}

export const DETAILS_TITLE_ID = 'world-panel-title';

// Full list for the open place: side panel on wide screens, bottom sheet on
// small ones.
const WorldDetails = ({ station, content }: WorldDetailsProps) => {
  const closeDetails = useWorldStore((state) => state.closeDetails);
  const { copy } = content;

  return (
    <section
      aria-labelledby={DETAILS_TITLE_ID}
      className={`${GLASS} absolute inset-x-0 bottom-0 z-30 max-h-[75vh] overflow-y-auto rounded-t-2xl p-5 text-neutral-800 dark:text-neutral-100 md:inset-y-4 md:left-auto md:right-4 md:max-h-none md:w-[26rem] md:rounded-2xl`}
    >
      <button
        type="button"
        onClick={closeDetails}
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-accent dark:text-neutral-400"
      >
        <LuChevronLeft aria-hidden />
        {copy.back}
      </button>
      <h2
        id={DETAILS_TITLE_ID}
        tabIndex={-1}
        className="mt-3 text-subheading font-semibold outline-none"
      >
        {station.title}
      </h2>
      <p className="text-2xs text-neutral-500 dark:text-neutral-400">
        {station.place}
      </p>
      <p className="mt-2 text-meta text-neutral-600 dark:text-neutral-400">
        {station.summary}
      </p>
      <div className="mt-4">
        {stationHasContent(station.id, content) ? (
          <StationBody id={station.id} content={content} />
        ) : (
          <p className="text-meta italic">{station.emptyMessage}</p>
        )}
      </div>
      <p className="mt-6 flex flex-wrap justify-between gap-2 text-2xs text-neutral-500">
        <WorldSwitchLink
          to="2d"
          path={station.path2d}
          className="underline underline-offset-2 hover:text-accent"
        >
          {copy.openIn2d}
        </WorldSwitchLink>
        <span className="hidden md:inline">{copy.escapeHint}</span>
      </p>
    </section>
  );
};

export default WorldDetails;
