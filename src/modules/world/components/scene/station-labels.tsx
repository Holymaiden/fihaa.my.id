'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import { Vector3 } from 'three';

import type { WorldStation } from '@/lib/content/types';

import { labelAnchor } from '../../config/island';
import { useWorldStore } from '../../store/world-store';
import { STATION_ICONS } from '../ui/station-icons';
import { GLASS } from '../ui/styles';

interface StationLabelsProps {
  stations: WorldStation[];
}

// Labels on the far side of the island fade out (sides stay visible).
const FACING_THRESHOLD = -0.35;
// Keep labels under the cards and panels of the HTML layer.
const LABEL_Z: [number, number] = [12, 10];

const position = new Vector3();
const toCamera = new Vector3();

const StationLabel = ({ station }: { station: WorldStation }) => {
  const anchorRef = useRef<Group>(null);
  const labelRef = useRef<HTMLButtonElement>(null);
  const openStation = useWorldStore((state) => state.openStation);
  const setHoveredStation = useWorldStore((state) => state.setHoveredStation);
  const Icon = STATION_ICONS[station.id];

  useFrame(({ camera }) => {
    const anchor = anchorRef.current;
    const label = labelRef.current;
    if (!anchor || !label) {
      return;
    }
    let visible = true;
    // The castle label is always in view; rim labels only on the near side.
    if (station.id !== 'profile') {
      anchor.getWorldPosition(position).setY(0).normalize();
      toCamera.copy(camera.position).setY(0).normalize();
      visible = position.dot(toCamera) > FACING_THRESHOLD;
    }
    label.style.opacity = visible ? '1' : '0';
    label.style.pointerEvents = visible ? 'auto' : 'none';
  });

  return (
    <group ref={anchorRef} position={labelAnchor(station.id)}>
      <Html center zIndexRange={LABEL_Z}>
        <button
          ref={labelRef}
          type="button"
          // The dock is the keyboard route; these are for pointer users.
          tabIndex={-1}
          onClick={() => openStation(station.id)}
          onPointerEnter={() => setHoveredStation(station.id)}
          onPointerLeave={() => setHoveredStation(null)}
          className={`${GLASS} group flex items-center gap-1.5 whitespace-nowrap rounded-full py-0.5 pl-0.5 pr-2.5 text-2xs font-medium md:gap-2 md:py-1 md:pl-1 md:pr-3 md:text-sm text-neutral-800 transition-opacity duration-300 hover:text-accent dark:text-neutral-100`}
        >
          <span
            aria-hidden
            className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-light transition group-hover:scale-110 md:h-7 md:w-7"
          >
            <Icon />
          </span>
          {station.label}
        </button>
      </Html>
    </group>
  );
};

// Floating name tags over each place on the island (hidden while a place
// is open, so only its card shows).
const StationLabels = ({ stations }: StationLabelsProps) => {
  const activeStation = useWorldStore((state) => state.activeStation);
  if (activeStation) {
    return null;
  }
  return (
    <>
      {stations
        .filter((station) => station.id !== 'secret')
        .map((station) => (
          <StationLabel key={station.id} station={station} />
        ))}
    </>
  );
};

export default StationLabels;
