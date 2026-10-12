'use client';

import { useRef } from 'react';

import type { WorldCopy, WorldCredit } from '@/lib/content/types';

interface WorldCreditsProps {
  credits: WorldCredit[];
  copy: WorldCopy;
}

const linkClass =
  'underline decoration-neutral-400 underline-offset-2 hover:text-accent';

// Credits button + modal, listing every asset pack the world uses.
const WorldCredits = ({ credits, copy }: WorldCreditsProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="absolute right-4 top-4 z-10 rounded-md border border-neutral-300 bg-light/90 px-3 py-1.5 text-2xs hover:border-accent dark:border-neutral-700 dark:bg-dark/90 md:bottom-4 md:left-4 md:right-auto md:top-auto"
      >
        {copy.credits}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="world-credits-title"
        className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-lg border border-neutral-300 bg-light p-5 text-neutral-800 backdrop:bg-dark/60 dark:border-neutral-700 dark:bg-dark dark:text-neutral-200"
      >
        <h2 id="world-credits-title" className="text-subheading font-semibold">
          {copy.credits}
        </h2>
        <p className="mt-1 text-meta text-neutral-600 dark:text-neutral-400">
          {copy.creditsIntro}
        </p>
        <ul className="mt-4 space-y-3 text-meta">
          {credits.map((credit) => (
            <li key={credit.id}>
              <a
                href={credit.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-medium ${linkClass}`}
              >
                {credit.name}
              </a>
              <p className="text-neutral-600 dark:text-neutral-400">
                <a
                  href={credit.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {credit.author}
                </a>{' '}
                ·{' '}
                <a
                  href={credit.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {credit.license}
                </a>{' '}
                · {credit.modelCount} {copy.creditsModels}
              </p>
            </li>
          ))}
        </ul>
        <form method="dialog" className="mt-5 text-right">
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:border-accent dark:border-neutral-700"
          >
            {copy.close}
          </button>
        </form>
      </dialog>
    </>
  );
};

export default WorldCredits;
