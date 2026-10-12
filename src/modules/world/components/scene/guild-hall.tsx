'use client';

import type { ThreeEvent } from '@react-three/fiber';

import { GUILD_PROPS } from '../../config/props';
import { useWorldStore } from '../../store/world-store';
import { onGround } from './island-frame';
import KitModel from './kit-model';
import { isDrag } from './pointer';

const PLACED = GUILD_PROPS.map(onGround);

// The guild castle in the middle. Clicking it goes back to the overview.
const GuildHall = () => {
  const closeStation = useWorldStore((state) => state.closeStation);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (isDrag(event)) {
      return;
    }
    event.stopPropagation();
    closeStation();
  };

  return (
    <group onClick={handleClick}>
      {PLACED.map((placement, index) => (
        <KitModel key={index} kit="core" placement={placement} />
      ))}
    </group>
  );
};

export default GuildHall;
