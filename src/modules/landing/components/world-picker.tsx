'use client';

import clsx from 'clsx';
import Link from 'next/link';

import Card from '@/common/components/elements/Card';
import { ROUTE_WORLD, to2d } from '@/lib/routes';
import { useLowEndDeviceHint } from '@/lib/world-mode/device-hint';
import type { WorldMode } from '@/lib/world-mode/types';
import { useWorldModeStore } from '@/lib/world-mode/world-mode-store';

interface WorldOption {
  mode: WorldMode;
  href: string;
  title: string;
  description: string;
}

// Placeholder copy until the landing design is done.
const WORLD_OPTIONS: WorldOption[] = [
  {
    mode: '2d',
    href: to2d(),
    title: 'Dunia 2D',
    description: 'Portfolio klasik: ringan, cepat, dan mudah dibaca.',
  },
  {
    mode: '3d',
    href: ROUTE_WORLD,
    title: 'Dunia 3D',
    description: 'Jelajahi portfolio sebagai dunia 3D interaktif.',
  },
];

interface WorldPickerProps {
  // From the world-mode cookie
  lastMode: WorldMode | null;
}

const WorldPicker = ({ lastMode }: WorldPickerProps) => {
  const sessionMode = useWorldModeStore((state) => state.mode);
  const setMode = useWorldModeStore((state) => state.setMode);
  const isLowEndDevice = useLowEndDeviceHint();

  const rememberedMode = sessionMode ?? lastMode;
  const suggestedMode: WorldMode | null =
    rememberedMode ?? (isLowEndDevice ? '2d' : null);
  const rememberedOption = WORLD_OPTIONS.find(
    (option) => option.mode === rememberedMode,
  );

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 font-sora">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
          Pilih Dunia
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          M. Fiqri Haikhar Anwar — Software Engineer
        </p>
      </div>

      {rememberedOption && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Terakhir kali Anda memilih {rememberedOption.title}.{' '}
          <Link
            href={rememberedOption.href}
            onClick={() => setMode(rememberedOption.mode)}
            className="underline hover:text-neutral-800 hover:dark:text-neutral-200"
          >
            Lanjutkan
          </Link>
        </p>
      )}

      {!rememberedOption && isLowEndDevice && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Perangkat ini tampaknya terbatas, Dunia 2D disarankan. Anda tetap
          bebas memilih.
        </p>
      )}

      <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
        {WORLD_OPTIONS.map((option) => (
          <Link
            key={option.mode}
            href={option.href}
            onClick={() => setMode(option.mode)}
            className="rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-umami-event={`Choose World: ${option.mode}`}
          >
            <Card
              className={clsx(
                'h-full space-y-2 border border-neutral-200 p-6 dark:border-neutral-800 lg:hover:scale-[102%]',
                suggestedMode === option.mode &&
                  'border-neutral-400 dark:border-neutral-500',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-medium text-neutral-800 dark:text-neutral-200">
                  {option.title}
                </h2>
                {suggestedMode === option.mode && (
                  <span className="text-sm text-neutral-500">Disarankan</span>
                )}
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                {option.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default WorldPicker;
