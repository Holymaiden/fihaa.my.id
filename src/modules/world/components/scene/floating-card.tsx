'use client';

import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

import type { WorldContent } from '@/lib/content/types';

import { NARROW_MAX_WIDTH } from '../../config/camera';
import { cardAnchor } from '../../config/island';
import { useWorldStore } from '../../store/world-store';
import StationCard from '../station-card';

interface FloatingCardProps {
  content: WorldContent;
}

const CARD_Z: [number, number] = [15, 13];

// On wide screens the card of the open place hangs beside it in the world. Small screens use the bottom sheet in the HUD instead.
const FloatingCard = ({ content }: FloatingCardProps) => {
  const activeStation = useWorldStore((state) => state.activeStation);
  const detailsOpen = useWorldStore((state) => state.detailsOpen);
  const isNarrow = useThree((state) => state.size.width < NARROW_MAX_WIDTH);
  const station = content.stations.find((item) => item.id === activeStation);

  if (!station || detailsOpen || isNarrow) {
    return null;
  }

  return (
    <group position={cardAnchor(station.id)}>
      <Html zIndexRange={CARD_Z}>
        {/* Callout: a dot on the place, a line, then the card. */}
        <div className="flex -translate-x-1.5 -translate-y-1/2 items-center">
          <span
            aria-hidden
            className="h-3 w-3 shrink-0 rounded-full bg-accent ring-4 ring-accent/30"
          />
          <span aria-hidden className="h-0.5 w-10 shrink-0 bg-accent/70" />
          <StationCard station={station} content={content} variant="floating" />
        </div>
      </Html>
    </group>
  );
};

export default FloatingCard;
