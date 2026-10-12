'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';

import { CLOUDS } from '../../config/props';
import { VISUAL } from '../../config/visual';
import { useEffectsEnabled } from '../../hooks/use-effects-enabled';
import { groupByModel } from './group-by-model';
import InstancedModel from './instanced-model';

// Clouds slowly circle the islands when effects are on.
const WorldClouds = () => {
  const groupRef = useRef<Group>(null);
  const effects = useEffectsEnabled();
  const clouds = useMemo(() => groupByModel(CLOUDS), []);

  useFrame((_, delta) => {
    if (groupRef.current && effects) {
      groupRef.current.rotation.y += delta * VISUAL.effects.cloudDriftSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {clouds.map(([model, instances]) => (
        <InstancedModel
          key={model}
          kit="core"
          model={model}
          instances={instances}
        />
      ))}
    </group>
  );
};

export default WorldClouds;
