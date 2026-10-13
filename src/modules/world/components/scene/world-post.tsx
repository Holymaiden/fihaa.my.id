'use client';

import {
  Bloom,
  EffectComposer,
  HueSaturation,
  N8AO,
  Noise,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';

import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import RainLens from './rain-lens';

export type PostQuality = 'high' | 'low' | 'off';

interface WorldPostProps {
  palette: WorldPalette;
  quality: PostQuality;
}

const { post } = VISUAL;

// The finishing pass, in the order a film camera would see it: ambient
// occlusion and bloom in linear HDR, then Khronos PBR Neutral tone mapping
// (keeps the palette's hues) to the screen, vignette, grain and a touch
// of saturation. 'low' drops the costly AO and multisampling.
// No brightness/contrast pass: it pushes shadows below zero, and the soft
// light grain then turns them into NaN (black patches).
const WorldPost = ({ palette, quality }: WorldPostProps) => {
  const high = quality === 'high';
  if (quality === 'off') {
    return null;
  }

  return (
    <EffectComposer
      multisampling={high ? post.multisampling : 0}
      enableNormalPass={false}
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
      <RainLens />
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
