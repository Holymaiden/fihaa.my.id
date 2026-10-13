'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { BlendFunction, Effect, EffectAttribute } from 'postprocessing';
import { forwardRef, useEffect, useMemo } from 'react';
import type { Camera } from 'three';
import { Color, Matrix4, Uniform, Vector3 } from 'three';

import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { weatherMix } from './weather-mix';

// A layer of real, raymarched clouds under the island. For each pixel the
// ray is followed through a slab of 3D noise; light is sampled once
// towards the sun for shading, and the scene's depth stops the march at
// the island so clouds sit behind it properly. Noisy step offsets are
// smoothed out by the temporal AA pass that follows.

const { volumetricClouds: config } = VISUAL;

const fragmentShader = /* glsl */ `
  uniform mat4 uProjectionInverse;
  uniform mat4 uCameraWorld;
  uniform vec3 uCameraPosition;
  uniform vec3 uSunDirection;
  uniform vec3 uLight;
  uniform vec3 uShade;
  uniform vec3 uSun;
  uniform vec3 uFar;
  uniform float uTime;
  uniform float uCoverage;
  uniform float uBottom;
  uniform float uTop;
  uniform float uFrame;

  float cloudHash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float cloudNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(cloudHash(i), cloudHash(i + vec3(1, 0, 0)), f.x),
          mix(cloudHash(i + vec3(0, 1, 0)), cloudHash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(cloudHash(i + vec3(0, 0, 1)), cloudHash(i + vec3(1, 0, 1)), f.x),
          mix(cloudHash(i + vec3(0, 1, 1)), cloudHash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }

  float cloudDensity(vec3 p, int octaves) {
    vec3 q = p * 0.032 + vec3(uTime * 0.012, 0.0, uTime * 0.006);
    float value = 0.0;
    float amplitude = 0.55;
    for (int octave = 0; octave < 3; octave++) {
      if (octave >= octaves) break;
      value += cloudNoise(q) * amplitude;
      q = q * 2.07 + vec3(3.1, 1.7, 5.3);
      amplitude *= 0.45;
    }
    float height = clamp((p.y - uBottom) / (uTop - uBottom), 0.0, 1.0);
    // Flat-ish bottoms, rounded tops.
    float shape = smoothstep(0.0, 0.15, height) * smoothstep(1.0, 0.45, height);
    return clamp((value - (1.0 - uCoverage)) * 3.0, 0.0, 1.0) * shape;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
    vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    vec4 view = uProjectionInverse * clip;
    view /= view.w;
    vec3 world = (uCameraWorld * vec4(view.xyz, 1.0)).xyz;
    vec3 ray = normalize(world - uCameraPosition);
    float sceneDistance = depth >= 0.9999 ? 1e5 : length(world - uCameraPosition);

    float enter = (uBottom - uCameraPosition.y) / ray.y;
    float leave = (uTop - uCameraPosition.y) / ray.y;
    float start = max(min(enter, leave), 0.0);
    float end = min(min(max(enter, leave), sceneDistance), ${config.maxDistance.toFixed(1)});
    if (abs(ray.y) < 1e-4 || start >= end) {
      outputColor = inputColor;
      return;
    }

    const int STEPS = ${config.steps};
    float stepLength = (end - start) / float(STEPS);
    // A different offset each pixel and frame hides the banding.
    float jitter = fract(sin(dot(uv * 913.7 + uFrame * 0.618, vec2(12.9898, 78.233))) * 43758.5453);
    float travelled = start + stepLength * jitter;
    float transmittance = 1.0;
    vec3 scattered = vec3(0.0);
    float sunAlign = max(dot(ray, uSunDirection), 0.0);
    for (int i = 0; i < STEPS; i++) {
      vec3 p = uCameraPosition + ray * travelled;
      float density = cloudDensity(p, 3);
      if (density > 0.01) {
        // One cheap look towards the sun for self-shadowing.
        float towardSun = cloudDensity(p + uSunDirection * 4.0, 1);
        float lit = exp(-towardSun * 2.2);
        vec3 tone = mix(uShade, uLight, lit);
        // Silver lining when looking towards the sun.
        tone += uSun * pow(sunAlign, 6.0) * lit * 0.6;
        float absorb = density * stepLength * ${config.absorption.toFixed(3)};
        scattered += transmittance * tone * absorb;
        transmittance *= exp(-absorb);
        if (transmittance < 0.03) break;
      }
      travelled += stepLength;
    }
    // Far clouds melt into the sky.
    float distanceFade = smoothstep(${config.fade[0].toFixed(1)}, ${config.fade[1].toFixed(1)}, start);
    scattered = mix(scattered, uFar * (1.0 - transmittance), distanceFade);
    outputColor = vec4(inputColor.rgb * transmittance + scattered, inputColor.a);
  }
`;

const uniformsMap = () =>
  new Map<string, Uniform>([
    ['uProjectionInverse', new Uniform(new Matrix4())],
    ['uCameraWorld', new Uniform(new Matrix4())],
    ['uCameraPosition', new Uniform(new Vector3())],
    [
      'uSunDirection',
      new Uniform(new Vector3(...VISUAL.sky.sunDirection).normalize()),
    ],
    ['uLight', new Uniform(new Color())],
    ['uShade', new Uniform(new Color())],
    ['uSun', new Uniform(new Color())],
    ['uFar', new Uniform(new Color())],
    ['uTime', new Uniform(0)],
    ['uCoverage', new Uniform(config.coverage)],
    ['uBottom', new Uniform(config.bottom)],
    ['uTop', new Uniform(config.top)],
    ['uFrame', new Uniform(0)],
  ]);

export class VolumetricCloudsEffect extends Effect {
  constructor() {
    super('VolumetricCloudsEffect', fragmentShader, {
      attributes: EffectAttribute.DEPTH,
      blendFunction: BlendFunction.NORMAL,
      uniforms: uniformsMap(),
    });
  }

  // Called once per frame from the scene with the live camera and state.
  sync(
    camera: Camera,
    { time, palette }: { time: number; palette: WorldPalette },
  ) {
    const get = <T,>(name: string) => this.uniforms.get(name) as Uniform<T>;
    get<Matrix4>('uProjectionInverse').value.copy(
      camera.projectionMatrixInverse,
    );
    get<Matrix4>('uCameraWorld').value.copy(camera.matrixWorld);
    get<Vector3>('uCameraPosition').value.setFromMatrixPosition(
      camera.matrixWorld,
    );
    get<number>('uTime').value = time;
    get<number>('uFrame').value = (get<number>('uFrame').value + 1) % 64;
    // Heavier, greyer cloud in bad weather.
    get<number>('uCoverage').value =
      config.coverage + weatherMix.overcast * config.overcastCoverage;
    get<Color>('uLight').value.set(palette.cloudLight);
    get<Color>('uShade').value.set(palette.cloudShade);
    get<Color>('uSun').value.set(palette.sun);
    get<Color>('uFar').value.set(palette.skyBottom);
  }
}

interface VolumetricCloudsProps {
  palette: WorldPalette;
}

// For use inside <EffectComposer>.
const VolumetricClouds = forwardRef<
  VolumetricCloudsEffect,
  VolumetricCloudsProps
>(function VolumetricClouds({ palette }, ref) {
  const camera = useThree((state) => state.camera);
  const effect = useMemo(() => new VolumetricCloudsEffect(), []);
  useEffect(() => () => effect.dispose(), [effect]);
  useFrame(({ clock }) => {
    syncClouds(effect, camera, { time: clock.elapsedTime, palette });
  });
  return <primitive ref={ref} object={effect} dispose={null} />;
});

const syncClouds = (
  effect: VolumetricCloudsEffect,
  camera: Camera,
  state: { time: number; palette: WorldPalette },
) => effect.sync(camera, state);

export default VolumetricClouds;
