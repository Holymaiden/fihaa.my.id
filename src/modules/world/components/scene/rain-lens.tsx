'use client';

import { useFrame } from '@react-three/fiber';
import { Effect } from 'postprocessing';
import { forwardRef, useEffect, useMemo } from 'react';
import { Uniform } from 'three';

import { weatherMix } from './weather-mix';

// Raindrops on the camera lens while it rains: beads that slide down the
// glass and bend the picture behind them. Runs as a uv warp inside the
// post-processing pass, so it costs one extra texture lookup.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmount;

  vec2 dropHash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  // Offset caused by one grid of drops (scale = drops across the screen).
  vec2 dropLayer(vec2 uv, float scale, float speed) {
    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
    vec2 st = uv * aspect * scale;
    st.y += uTime * speed * 0.05;
    vec2 cell = floor(st);
    vec2 local = fract(st) - 0.5;
    vec2 seed = dropHash(cell);
    // Only some cells hold a drop, more in heavier rain.
    if (seed.y > uAmount * 0.75) {
      return vec2(0.0);
    }
    float slide = fract(uTime * speed * (0.3 + seed.x * 0.4) + seed.y * 7.0);
    vec2 centre = vec2((seed.x - 0.5) * 0.6, 0.35 - slide * 0.7);
    vec2 offset = local - centre;
    float bead = smoothstep(0.16, 0.07, length(offset * vec2(1.0, 0.8)));
    // A thin wet trail above each sliding bead.
    float trail = smoothstep(0.04, 0.0, abs(local.x - centre.x))
      * smoothstep(centre.y, centre.y + 0.4, local.y) * 0.3;
    return offset * bead * 0.35 + vec2(0.0, -trail * 0.02);
  }

  void mainUv(inout vec2 uv) {
    if (uAmount < 0.01) {
      return;
    }
    vec2 bend = dropLayer(uv, 7.0, 1.0) + dropLayer(uv + 0.37, 12.0, 1.6) * 0.6;
    uv += bend * uAmount * 0.08;
  }
`;

class RainLensEffect extends Effect {
  constructor() {
    super('RainLensEffect', fragmentShader, {
      uniforms: new Map<string, Uniform<number>>([
        ['uTime', new Uniform(0)],
        ['uAmount', new Uniform(0)],
      ]),
    });
  }

  update(_renderer: unknown, _input: unknown, delta: number) {
    const time = this.uniforms.get('uTime') as Uniform<number>;
    time.value += delta;
    (this.uniforms.get('uAmount') as Uniform<number>).value = lensRain.amount;
  }
}

// Eased amount of drops on the lens (follows the rain, a little behind).
const lensRain = { amount: 0 };

const LensRainClock = () => {
  useFrame((_, delta) => {
    const goal = weatherMix.rain > 0.3 ? weatherMix.rain : 0;
    lensRain.amount += (goal - lensRain.amount) * Math.min(delta * 0.5, 1);
  });
  return null;
};

// For use inside <EffectComposer>.
const RainLens = forwardRef<RainLensEffect>(function RainLens(_, ref) {
  const effect = useMemo(() => new RainLensEffect(), []);
  useEffect(() => () => effect.dispose(), [effect]);
  return <primitive ref={ref} object={effect} dispose={null} />;
});

export { LensRainClock };
export default RainLens;
