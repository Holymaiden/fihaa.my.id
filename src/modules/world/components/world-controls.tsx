'use client';

import { useTheme } from 'next-themes';
import type { IconType } from 'react-icons';
import {
  LuCloudFog,
  LuCloudRain,
  LuCloudSun,
  LuGem,
  LuMoon,
  LuMusic,
  LuRotate3D,
  LuSparkles,
  LuSun,
  LuVolumeX,
} from 'react-icons/lu';

import type { WorldContent } from '@/lib/content/types';

import { CRYSTALS } from '../config/crystals';
import { useEffectsEnabled } from '../hooks/use-effects-enabled';
import type { Weather } from '../store/world-store';
import { useWorldStore, WEATHERS } from '../store/world-store';
import { GLASS, ICON_BUTTON } from './ui/styles';
import WorldCredits from './world-credits';

interface WorldControlsProps {
  content: WorldContent;
  sceneShown: boolean;
}

const WEATHER_ICONS: Record<Weather, IconType> = {
  clear: LuCloudSun,
  rain: LuCloudRain,
  mist: LuCloudFog,
};

// Top-right buttons: crystals found, tour, weather, sound, effects and
// credits.
const WorldControls = ({ content, sceneShown }: WorldControlsProps) => {
  const { copy } = content;
  const effectsEnabled = useEffectsEnabled();
  const setEffectsPreference = useWorldStore(
    (state) => state.setEffectsPreference,
  );
  const mode = useWorldStore((state) => state.mode);
  const startTour = useWorldStore((state) => state.startTour);
  const stopTour = useWorldStore((state) => state.stopTour);
  const weather = useWorldStore((state) => state.weather);
  const setWeather = useWorldStore((state) => state.setWeather);
  const soundOn = useWorldStore((state) => state.soundOn);
  const setSoundOn = useWorldStore((state) => state.setSoundOn);
  const found = useWorldStore((state) => state.crystals.length);
  const WeatherIcon = WEATHER_ICONS[weather];
  // Day and night follow the site theme (shared with the 2D site).
  const { resolvedTheme, setTheme } = useTheme();
  const touring = mode === 'tour';
  const nextWeather =
    WEATHERS[(WEATHERS.indexOf(weather) + 1) % WEATHERS.length];

  return (
    <div className="absolute right-4 top-4 z-30 flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {sceneShown && (
          <>
            <button
              type="button"
              aria-pressed={touring}
              aria-label={touring ? copy.tourStop : copy.tourStart}
              title={touring ? copy.tourStop : copy.tourStart}
              onClick={() => (touring ? stopTour() : startTour())}
              className={`${ICON_BUTTON} ${touring ? 'text-accent!' : ''}`}
            >
              <LuRotate3D aria-hidden />
            </button>
            <button
              type="button"
              aria-label={`${copy.weatherLabel}: ${copy.weathers[weather]}`}
              title={`${copy.weatherLabel}: ${copy.weathers[weather]} → ${copy.weathers[nextWeather]}`}
              onClick={() => setWeather(nextWeather)}
              className={ICON_BUTTON}
            >
              <WeatherIcon aria-hidden />
            </button>
          </>
        )}
        <button
          type="button"
          aria-label={copy.toggleDayNight}
          title={copy.toggleDayNight}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className={ICON_BUTTON}
        >
          {/* Both icons render; CSS shows the right one, so server and
              client markup match. */}
          <LuMoon aria-hidden className="dark:hidden" />
          <LuSun aria-hidden className="hidden dark:block" />
        </button>
        <button
          type="button"
          aria-pressed={soundOn}
          aria-label={soundOn ? copy.soundOn : copy.soundOff}
          title={soundOn ? copy.soundOn : copy.soundOff}
          onClick={() => setSoundOn(!soundOn)}
          className={ICON_BUTTON}
        >
          {soundOn ? <LuMusic aria-hidden /> : <LuVolumeX aria-hidden />}
        </button>
        {sceneShown && (
          <button
            type="button"
            aria-pressed={effectsEnabled}
            aria-label={effectsEnabled ? copy.effectsOn : copy.effectsOff}
            title={effectsEnabled ? copy.effectsOn : copy.effectsOff}
            onClick={() => setEffectsPreference(!effectsEnabled)}
            className={`${ICON_BUTTON} ${effectsEnabled ? '' : 'opacity-60'}`}
          >
            <LuSparkles aria-hidden />
          </button>
        )}
        <WorldCredits credits={content.credits} copy={copy} />
      </div>
      {sceneShown && (
        <p
          className={`${GLASS} flex items-center gap-1.5 rounded-full px-3 py-1 text-2xs font-medium text-neutral-800 dark:text-neutral-100`}
          title={copy.crystalsHint}
        >
          <LuGem aria-hidden className="text-accent" />
          <span className="sr-only">{copy.crystalsLabel}: </span>
          {found}/{CRYSTALS.length}
        </p>
      )}
    </div>
  );
};

export default WorldControls;
