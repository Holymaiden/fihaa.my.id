'use client';

import { useFrame } from '@react-three/fiber';
import { Effect } from 'postprocessing';
import { forwardRef, useEffect, useMemo, useRef } from 'react';
import type { Object3D } from 'three';
import { Uniform, Vector3 } from 'three';

import { weatherMix } from './weather-mix';

// Water on the camera lens: beads that slide down the glass, bend the
// picture behind them and catch a highlight. Rain brings a few; flying
// close to (or through) a waterfall soaks the lens at once, with
// rivulets running down and a light mist, then it slowly dries. Runs
// inside the post-processing pass (a uv warp plus a little colour).
const fragmentShader = /* glsl */ `
  uniform float uTime;
  // How much rain is on the lens, and how soaked it is from a waterfall.
  uniform float uRain;
  uniform float uSplash;

  vec2 dropHash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  // One grid of drops: xy = offset from the drop centre in drop radii
  // (for the bend and the highlight), z = how much of a drop is here.
  vec3 dropLayer(vec2 uv, float scale, float speed, float amount) {
    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
    vec2 st = uv * aspect * scale;
    st.y += uTime * speed * 0.04;
    vec2 cell = floor(st);
    vec2 local = fract(st) - 0.5;
    vec2 seed = dropHash(cell);
    // Only some cells hold a drop; more as the lens gets wetter.
    if (seed.y > amount) {
      return vec3(0.0);
    }
    float slide = fract(uTime * speed * (0.2 + seed.x * 0.35) + seed.y * 7.0);
    vec2 centre = vec2((seed.x - 0.5) * 0.6, 0.35 - slide * 0.7);
    float radius = 0.1 + seed.x * 0.08;
    vec2 offset = (local - centre) / radius;
    float bead = smoothstep(1.0, 0.75, length(offset * vec2(1.0, 0.85)));
    return vec3(offset, bead);
  }

  // Rivulets: thin wavering streams running down the glass.
  float rivulets(vec2 uv) {
    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
    vec2 st = uv * aspect * vec2(22.0, 1.0);
    float column = floor(st.x);
    vec2 seed = dropHash(vec2(column, 3.0));
    float x = fract(st.x) - 0.5 + sin(uv.y * 14.0 + seed.x * 6.0) * 0.12;
    float flow = fract(uv.y * 1.5 + uTime * (0.4 + seed.y * 0.6) + seed.x);
    return smoothstep(0.08, 0.0, abs(x)) * smoothstep(0.0, 0.3, flow) * step(0.45, seed.y);
  }

  vec3 lensWater(vec2 uv) {
    float wet = max(uRain * 0.6, uSplash);
    vec3 big = dropLayer(uv, 6.0, 1.0, wet * 0.8);
    vec3 small = dropLayer(uv + 0.37, 13.0, 1.4, wet);
    vec3 tiny = dropLayer(uv + 0.71, 26.0, 0.3, uSplash);
    return big.z > 0.0 ? big : (small.z > 0.0 ? small : tiny);
  }

  void mainUv(inout vec2 uv) {
    if (uRain + uSplash < 0.01) {
      return;
    }
    vec3 drop = lensWater(uv);
    // A drop is a little lens: it flips and shrinks what's behind it.
    uv -= drop.xy * drop.z * 0.018;
    uv.x += rivulets(uv) * uSplash * 0.004;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 color = inputColor.rgb;
    if (uRain + uSplash > 0.01) {
      vec3 drop = lensWater(uv);
      // Darker rim, bright highlight on the upper side of each bead.
      float rim = smoothstep(0.55, 1.0, length(drop.xy)) * drop.z;
      float glint = smoothstep(0.55, 0.0, length(drop.xy - vec2(-0.3, 0.35))) * drop.z;
      color *= 1.0 - rim * 0.35;
      color += glint * 0.35;
      // Soaked lens: running water and a pale mist over everything.
      color += rivulets(uv) * uSplash * 0.12;
      color = mix(color, vec3(0.92, 0.95, 1.0), uSplash * 0.18);
    }
    outputColor = vec4(color, inputColor.a);
  }
`;

class RainLensEffect extends Effect {
  constructor() {
    super('RainLensEffect', fragmentShader, {
      uniforms: new Map<string, Uniform<number>>([
        ['uTime', new Uniform(0)],
        ['uRain', new Uniform(0)],
        ['uSplash', new Uniform(0)],
      ]),
    });
  }

  update(_renderer: unknown, _input: unknown, delta: number) {
    const time = this.uniforms.get('uTime') as Uniform<number>;
    time.value += delta;
    (this.uniforms.get('uRain') as Uniform<number>).value = lensWater.rain;
    (this.uniforms.get('uSplash') as Uniform<number>).value = lensWater.splash;
  }
}

// Eased wetness of the lens: rain follows the weather a little behind;
// splash jumps up near a waterfall and dries off over a few seconds.
const lensWater = { rain: 0, splash: 0 };

// Waterfalls the camera can fly into: an object at the top of each fall
// (any frame; its world position is read every frame) and how far it drops.
export const waterfallSources = new Set<{ top: Object3D; drop: number }>();

// Marks a waterfall for the lens: put the returned ref on an object at the
// top of the fall.
export const useWaterfallSource = (drop: number) => {
  const ref = useRef<Object3D>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const source = { top: ref.current, drop };
    waterfallSources.add(source);
    return () => {
      waterfallSources.delete(source);
    };
  }, [drop]);
  return ref;
};

// Within this distance of a fall's sheet the lens gets wet (world units).
const SPLASH_REACH = 10;
const DRY_SECONDS = 4;

const top = new Vector3();
const nearest = new Vector3();

const LensRainClock = () => {
  useFrame(({ camera }, delta) => {
    const rainGoal = weatherMix.rain > 0.3 ? weatherMix.rain : 0;
    lensWater.rain += (rainGoal - lensWater.rain) * Math.min(delta * 0.5, 1);

    let soak = 0;
    for (const source of waterfallSources) {
      source.top.getWorldPosition(top);
      // Closest point on the (roughly vertical) fall to the camera.
      nearest.copy(top);
      nearest.y = Math.min(
        Math.max(camera.position.y, top.y - source.drop),
        top.y,
      );
      const distance = nearest.distanceTo(camera.position);
      soak = Math.max(soak, 1 - Math.min(distance / SPLASH_REACH, 1));
    }
    lensWater.splash =
      soak > lensWater.splash
        ? lensWater.splash + (soak - lensWater.splash) * Math.min(delta * 6, 1)
        : Math.max(soak, lensWater.splash - delta / DRY_SECONDS);
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
