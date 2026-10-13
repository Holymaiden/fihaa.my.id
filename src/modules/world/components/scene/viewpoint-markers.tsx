'use client';

import { Html, useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Mesh } from 'three';
import { AdditiveBlending, Color, ShaderMaterial } from 'three';

import { islandHeight } from '../../config/island';
import { isWalkable } from '../../config/viewpoint-search';
import type { ScenicViewpointId, ViewpointId } from '../../config/viewpoints';
import {
  EXPLORE_ORDER,
  isStationViewpoint,
  viewpointGround,
} from '../../config/viewpoints';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import { GLASS } from '../ui/styles';
import { interaction } from './interaction';
import { isDrag } from './pointer';
import { setUniforms } from './shader-utils';

interface ViewpointMarkersProps {
  palette: WorldPalette;
  scenicNames: Record<ScenicViewpointId, string>;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// A soft glowing ring with a pulse travelling outwards.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uHover;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float ring = smoothstep(0.08, 0.0, abs(d - 0.72));
    float pulse = fract(uTime * 0.6);
    float wave = smoothstep(0.1, 0.0, abs(d - pulse)) * (1.0 - pulse);
    float core = smoothstep(0.35, 0.0, d) * 0.35;
    float alpha = (ring * 0.9 + wave * 0.6 + core) * (0.75 + uHover * 0.5);
    gl_FragColor = vec4(uColor * (1.0 + uHover), alpha * smoothstep(1.0, 0.9, d));
  }
`;

const LABEL_Z: [number, number] = [11, 10];
const MARKER_SIZE = 1.8;

const Marker = ({
  id,
  palette,
  name,
}: {
  id: ViewpointId;
  palette: WorldPalette;
  name: string | null;
}) => {
  const goTo = useWorldStore((state) => state.goTo);
  const [hovered, setHovered] = useState(false);
  const effects = useEffectsEnabled();
  useCursor(hovered);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color() },
          uHover: { value: 0 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    setUniforms(material, { uColor: palette.marker, uHover: hovered ? 1 : 0 });
  }, [material, palette.marker, hovered]);

  useFrame(({ clock }) => {
    setUniforms(material, { uTime: effects ? clock.elapsedTime : 0.4 });
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (isDrag(event)) {
      return;
    }
    event.stopPropagation();
    goTo(id);
  };

  const [x, y, z] = viewpointGround(id);

  return (
    <group position={[x, y + 0.06, z]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        material={material}
        onClick={handleClick}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[MARKER_SIZE, MARKER_SIZE]} />
      </mesh>
      {name && (
        <Html center position={[0, 1.1, 0]} zIndexRange={LABEL_Z}>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => goTo(id)}
            className={`${GLASS} whitespace-nowrap rounded-full px-3 py-1 text-2xs font-medium text-neutral-800 transition hover:text-accent dark:text-neutral-100 md:text-xs`}
          >
            {name}
          </button>
        </Html>
      )}
    </group>
  );
};

// A small ring under the pointer while exploring: you can walk there.
const GroundCursor = ({ palette }: { palette: WorldPalette }) => {
  const meshRef = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color() },
          uHover: { value: 0 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    setUniforms(material, { uColor: palette.marker });
  }, [material, palette.marker]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const { touch } = interaction;
    const walkable = isWalkable(touch.x, touch.z);
    mesh.visible = touch.strength > 0.2 && walkable;
    mesh.position.set(touch.x, islandHeight(touch.x, touch.z) + 0.08, touch.z);
    setUniforms(material, { uTime: clock.elapsedTime });
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      raycast={() => null}
    >
      <planeGeometry args={[0.9, 0.9]} />
    </mesh>
  );
};

// Glowing rings on the ground in explore mode: click one to walk there.
// Station labels already name the station spots; scenic spots get a tag.
const ViewpointMarkers = ({ palette, scenicNames }: ViewpointMarkersProps) => {
  const mode = useWorldStore((state) => state.mode);
  const viewpoint = useWorldStore((state) => state.viewpoint);
  if (mode !== 'explore') {
    return null;
  }
  return (
    <>
      <GroundCursor palette={palette} />
      {EXPLORE_ORDER.filter((id) => id !== viewpoint).map((id) => (
        <Marker
          key={id}
          id={id}
          palette={palette}
          name={isStationViewpoint(id) ? null : scenicNames[id]}
        />
      ))}
    </>
  );
};

export default ViewpointMarkers;
