'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import type { Fog, Scene } from 'three';
import { Color, MathUtils } from 'three';

import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import type { Weather } from '../../store/world-store';
import { useWorldStore, WEATHERS } from '../../store/world-store';
import { weatherMix } from './weather-mix';

interface WeatherDirectorProps {
  palette: WorldPalette;
}

const { weather: config } = VISUAL;

const GOALS: Record<Weather, typeof weatherMix> = {
  clear: { rain: 0, mist: 0, overcast: 0 },
  rain: { rain: 1, mist: 0.15, overcast: 1 },
  mist: { rain: 0, mist: 1, overcast: 0.6 },
};

const baseFog = new Color();
const greyFog = new Color();

// Fog closes in and greys out with the weather.
const applyFog = (scene: Scene, palette: WorldPalette) => {
  const fog = scene.fog as Fog | null;
  if (!fog) {
    return;
  }
  const { rain, mist } = weatherMix;
  const [near, far] = [VISUAL.fog.near, VISUAL.fog.far];
  fog.near = MathUtils.lerp(
    MathUtils.lerp(near, config.rainFog[0], rain),
    config.mistFog[0],
    mist,
  );
  fog.far = MathUtils.lerp(
    MathUtils.lerp(far, config.rainFog[1], rain),
    config.mistFog[1],
    mist,
  );
  baseFog.set(palette.fog);
  greyFog.set(palette.cloudShade);
  fog.color.copy(baseFog).lerp(greyFog, weatherMix.overcast * 0.6);
};

const randomDuration = () =>
  MathUtils.randFloat(config.autoDuration[0], config.autoDuration[1]);

// Eases the live weather mix towards the chosen weather, and changes the
// weather now and then while it is on automatic.
const WeatherDirector = ({ palette }: WeatherDirectorProps) => {
  const scene = useThree((state) => state.scene);
  const weather = useWorldStore((state) => state.weather);
  const autoWeather = useWorldStore((state) => state.autoWeather);
  const setWeather = useWorldStore((state) => state.setWeather);

  useEffect(() => {
    if (!autoWeather) {
      return;
    }
    const timer = window.setTimeout(() => {
      // Mostly clear skies, with rain or mist in between.
      const next: Weather =
        weather === 'clear'
          ? WEATHERS[1 + Math.floor(Math.random() * 2)]
          : 'clear';
      setWeather(next, true);
    }, randomDuration() * 1000);
    return () => window.clearTimeout(timer);
  }, [weather, autoWeather, setWeather]);

  useFrame((state, delta) => {
    const goal = GOALS[weather];
    const lambda = 4 / config.blendSeconds;
    let changing = false;
    for (const key of Object.keys(goal) as (keyof typeof weatherMix)[]) {
      const value = MathUtils.damp(weatherMix[key], goal[key], lambda, delta);
      weatherMix[key] = Math.abs(value - goal[key]) < 1e-3 ? goal[key] : value;
      changing = changing || weatherMix[key] !== goal[key];
    }
    applyFog(scene, palette);
    if (changing) {
      state.invalidate();
    }
  });

  return null;
};

export default WeatherDirector;
