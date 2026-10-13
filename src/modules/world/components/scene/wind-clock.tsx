'use client';

import { useFrame } from '@react-three/fiber';

import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import { windUniforms } from './foliage-sway';
import { weatherMix } from './weather-mix';

// Drives the wind shared by the patched trees, bushes and flowers (gusts
// pick up in the rain; still when effects are off).
const WindClock = () => {
  const effects = useEffectsEnabled();
  useFrame(({ clock }) => {
    windUniforms.uTime.value = effects ? clock.elapsedTime : 0;
    windUniforms.uWind.value = effects ? 1 + weatherMix.rain * 1.2 : 0;
  });
  return null;
};

export default WindClock;
