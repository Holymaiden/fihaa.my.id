'use client';

import type { ThreeEvent } from '@react-three/fiber';

import { GUILD_LAYOUT } from '../../config/layout';
import { GUILD_PROPS } from '../../config/props';
import { useWorldStore } from '../../store/world-store';
import KitModel from './kit-model';

// The guild castle in the middle. Clicking it goes back to the overview.
const GuildHall = () => {
  const closeStation = useWorldStore((state) => state.closeStation);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    closeStation();
  };

  return (
    <group position={GUILD_LAYOUT.position} onClick={handleClick}>
      {GUILD_PROPS.map((placement, index) => (
        <KitModel key={index} kit="core" placement={placement} />
      ))}
    </group>
  );
};

export default GuildHall;
