'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { DirectionalLight, HemisphereLight } from 'three';
import { BackSide, MathUtils } from 'three';

import { SHADOW_EXTENT } from '../../config/camera';
import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';
import SkyDome from './sky-dome';
import { weatherMix } from './weather-mix';

interface WorldAtmosphereProps {
  palette: WorldPalette;
  shadows: boolean;
  shadowMapSize: number;
}

const SUN = VISUAL.light.sunPosition;

// Image-based lighting, baked once into an environment map from a few
// light shapes: the sky dome, a warm sun disc, a cool rim from the other
// side and bounce light from the grass below. Gives every PBR material
// soft fill and believable reflections without an HDR download.
const SkyLight = ({ palette }: { palette: WorldPalette }) => (
  <Environment
    // Rebuilt when day turns to night.
    key={palette.isNight ? 'night' : 'day'}
    frames={1}
    resolution={VISUAL.environment.resolution}
    environmentIntensity={
      palette.isNight ? VISUAL.environment.night : VISUAL.environment.day
    }
  >
    <mesh scale={100}>
      <sphereGeometry args={[1, 32, 16]} />
      <meshBasicMaterial color={palette.skyTop} side={BackSide} />
    </mesh>
    <Lightformer
      form="circle"
      color={palette.sun}
      intensity={palette.isNight ? 2 : 6}
      position={[SUN[0] * 2, SUN[1] * 2, SUN[2] * 2]}
      scale={14}
      target={[0, 0, 0]}
    />
    <Lightformer
      form="rect"
      color={palette.skyHorizon}
      intensity={1.4}
      position={[-SUN[0] * 2, 8, -SUN[2] * 2]}
      scale={[60, 12, 1]}
      target={[0, 0, 0]}
    />
    <Lightformer
      form="rect"
      color={palette.grass}
      intensity={0.6}
      position={[0, -30, 0]}
      rotation-x={Math.PI / 2}
      scale={[120, 120, 1]}
    />
  </Environment>
);

// Sky, fog, image-based light, and a classic three-light rig: the sun as
// key (with soft shadows), a cool rim light from behind and the sky fill.
const WorldAtmosphere = ({
  palette,
  shadows,
  shadowMapSize,
}: WorldAtmosphereProps) => {
  const light = palette.isNight ? VISUAL.light.night : VISUAL.light.day;
  const sunRef = useRef<DirectionalLight>(null);
  const skyRef = useRef<HemisphereLight>(null);
  const rimRef = useRef<DirectionalLight>(null);

  // Clouds dim the sun more than the sky light.
  useFrame(() => {
    const dim = MathUtils.lerp(
      1,
      VISUAL.weather.overcastLight,
      weatherMix.overcast,
    );
    if (sunRef.current) {
      sunRef.current.intensity = light.sun * dim * dim;
    }
    if (rimRef.current) {
      rimRef.current.intensity = light.rim * dim;
    }
    if (skyRef.current) {
      skyRef.current.intensity = light.hemisphere * (0.4 + dim * 0.6);
    }
  });

  return (
    <>
      <SkyDome palette={palette} />
      <SkyLight palette={palette} />
      <directionalLight
        ref={rimRef}
        position={[-SUN[0], SUN[1] * 0.6, -SUN[2]]}
        color={palette.skyTop}
        intensity={light.rim}
      />
      <fog attach="fog" args={[palette.fog, VISUAL.fog.near, VISUAL.fog.far]} />
      <hemisphereLight
        ref={skyRef}
        args={[palette.sun, palette.groundLight, light.hemisphere]}
      />
      <directionalLight
        ref={sunRef}
        position={VISUAL.light.sunPosition}
        color={palette.sun}
        intensity={light.sun}
        castShadow={shadows}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-radius={VISUAL.shadows.radius}
        shadow-bias={VISUAL.shadows.bias}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[
            -SHADOW_EXTENT,
            SHADOW_EXTENT,
            SHADOW_EXTENT,
            -SHADOW_EXTENT,
            1,
            90,
          ]}
        />
      </directionalLight>
    </>
  );
};

export default WorldAtmosphere;
