'use client';

import {
  Bloom,
  EffectComposer,
  GodRays,
  HueSaturation,
  N8AO,
  Noise,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import type { Mesh } from 'three';

import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import RainLens from './rain-lens';
import TemporalAA from './temporal-aa';
import VolumetricClouds from './volumetric-clouds';

export type PostQuality = 'high' | 'low' | 'off';

interface WorldPostProps {
  palette: WorldPalette;
  quality: PostQuality;
  // Light source for the god rays (day only).
  sun: Mesh | null;
}

const { post } = VISUAL;

// The finishing pass, in the order a film camera would see it:
// - in linear HDR: ambient occlusion, raymarched clouds, temporal AA
//   (which also smooths the AO and cloud noise), raindrops on the lens,
//   god rays from the sun and bloom;
// - then Khronos PBR Neutral tone mapping (keeps the palette's hues),
//   vignette, grain and a touch of saturation.
// 'low' keeps the cheap part and uses SMAA instead of TAA.
// No brightness/contrast pass: it pushes shadows below zero, and the soft
// light grain then turns them into NaN (black patches).
const WorldPost = ({ palette, quality, sun }: WorldPostProps) => {
  const clearSky = useWorldStore((state) => state.weather === 'clear');
  if (quality === 'off') {
    return null;
  }
  const high = quality === 'high';
  const rays = high && sun && clearSky && !palette.isNight;

  return (
    // autoClear off: the god rays render an extra pass of their own.
    <EffectComposer
      multisampling={0}
      enableNormalPass={false}
      autoClear={false}
    >
      {high ? (
        <N8AO
          halfRes
          depthAwareUpsampling
          quality="medium"
          aoRadius={post.ao.radius}
          intensity={post.ao.intensity}
          distanceFalloff={post.ao.falloff}
          color={palette.rockDeep}
        />
      ) : (
        <></>
      )}
      {high ? <VolumetricClouds palette={palette} /> : <></>}
      {high ? <TemporalAA /> : <></>}
      <RainLens />
      {rays ? (
        <GodRays
          sun={sun}
          samples={post.godRays.samples}
          density={post.godRays.density}
          decay={post.godRays.decay}
          weight={post.godRays.weight}
          exposure={post.godRays.exposure}
          blur
        />
      ) : (
        <></>
      )}
      <Bloom
        mipmapBlur
        intensity={palette.isNight ? post.bloom.night : post.bloom.day}
        luminanceThreshold={post.bloom.threshold}
        luminanceSmoothing={0.25}
      />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette
        offset={post.vignette.offset}
        darkness={post.vignette.darkness}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={post.grain}
      />
      {/* Saturation last: it can push dark colours a hair below zero,
          which the soft-light grain would turn into NaN (black). */}
      <HueSaturation saturation={post.saturation} />
      {high ? <></> : <SMAA />}
    </EffectComposer>
  );
};

export default WorldPost;
