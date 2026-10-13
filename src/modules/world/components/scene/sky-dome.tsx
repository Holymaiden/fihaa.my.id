'use client';

import { useMemo } from 'react';
import { BackSide, Color } from 'three';

import { VISUAL } from '../../config/visual';
import type { WorldPalette } from '../../hooks/use-world-palette';

interface SkyDomeProps {
  palette: WorldPalette;
}

const vertexShader = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Three-stop vertical gradient: bottom -> horizon -> top.
const fragmentShader = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 horizonColor;
  uniform vec3 bottomColor;
  varying vec3 vDirection;
  void main() {
    float h = vDirection.y;
    vec3 color = h > 0.0
      ? mix(horizonColor, topColor, smoothstep(0.0, 0.6, h))
      : mix(horizonColor, bottomColor, smoothstep(0.0, 0.5, -h));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

// Procedural gradient sky: no texture to download.
const SkyDome = ({ palette }: SkyDomeProps) => {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new Color(palette.skyTop) },
      horizonColor: { value: new Color(palette.skyHorizon) },
      bottomColor: { value: new Color(palette.skyBottom) },
    }),
    [palette.skyTop, palette.skyHorizon, palette.skyBottom],
  );

  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[VISUAL.sky.radius, 24, 12]} />
      <shaderMaterial
        side={BackSide}
        depthWrite={false}
        fog={false}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
};

export default SkyDome;
