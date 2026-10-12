'use client';

import { useMemo } from 'react';

import type { WorldStationId } from '@/lib/content/types';

import type { CoreModelName } from '../../assets/kits.generated';
import type { IslandLayout } from '../../config/layout';
import {
  GUILD_LAYOUT,
  hexTilePositions,
  islandRadius,
  STATION_LAYOUT,
} from '../../config/layout';
import type { CorePlacement } from '../../config/props';
import { CLOUDS, DECOR } from '../../config/props';
import type { WorldPalette } from '../../hooks/use-world-palette';
import { useWorldStore } from '../../store/world-store';
import type { InstanceTransform } from './instanced-model';
import InstancedModel from './instanced-model';
import IslandRock from './island-rock';

interface WorldIslandsProps {
  stations: WorldStationId[];
  palette: WorldPalette;
}

type IslandId = WorldStationId | 'guild';

interface Island {
  id: IslandId;
  layout: IslandLayout;
}

const toWorld = (
  { model, position, rotationY, scale }: CorePlacement,
  { position: origin }: IslandLayout,
) => ({
  model,
  position: [
    origin[0] + position[0],
    origin[1] + position[1],
    origin[2] + position[2],
  ] as const,
  rotationY,
  scale,
});

const groupByModel = (placements: CorePlacement[]) => {
  const groups = new Map<CoreModelName, InstanceTransform[]>();
  for (const { model, ...transform } of placements) {
    groups.set(model, [...(groups.get(model) ?? []), transform]);
  }
  return [...groups.entries()];
};

// Hex tiles, rock undersides, scenery and clouds of every island. Tiles and
// scenery are instanced, so the whole lot costs a handful of draw calls.
const WorldIslands = ({ stations, palette }: WorldIslandsProps) => {
  const openStation = useWorldStore((state) => state.openStation);
  const closeStation = useWorldStore((state) => state.closeStation);
  const setHoveredStation = useWorldStore((state) => state.setHoveredStation);

  const islands = useMemo<Island[]>(
    () => [
      { id: 'guild', layout: GUILD_LAYOUT },
      ...stations.map((id) => ({ id, layout: STATION_LAYOUT[id] })),
    ],
    [stations],
  );

  const { tiles, tileOwners } = useMemo(() => {
    const transforms: InstanceTransform[] = [];
    const owners: IslandId[] = [];
    for (const { id, layout } of islands) {
      for (const [x, z] of hexTilePositions(layout.rings)) {
        transforms.push({
          position: [
            layout.position[0] + x,
            layout.position[1],
            layout.position[2] + z,
          ],
        });
        owners.push(id);
      }
    }
    return { tiles: transforms, tileOwners: owners };
  }, [islands]);

  const decor = useMemo(
    () =>
      groupByModel(
        islands.flatMap(({ id, layout }) =>
          id === 'secret'
            ? []
            : DECOR[id].map((placement) => toWorld(placement, layout)),
        ),
      ),
    [islands],
  );

  const clouds = useMemo(() => groupByModel(CLOUDS), []);

  const handleTileClick = (index: number) => {
    const owner = tileOwners[index];
    if (owner === 'guild') {
      closeStation();
    } else {
      openStation(owner);
    }
  };

  const handleTileHover = (index: number | null) => {
    const owner = index === null ? null : tileOwners[index];
    setHoveredStation(owner === 'guild' ? null : owner);
  };

  return (
    <group>
      <InstancedModel
        kit="core"
        model="hex_grass"
        instances={tiles}
        onInstanceClick={handleTileClick}
        onInstanceHover={handleTileHover}
      />
      {islands.map(({ id, layout }) => (
        <IslandRock
          key={id}
          position={layout.position}
          radius={islandRadius(layout)}
          color={id === 'secret' ? palette.secret : palette.islandSide}
        />
      ))}
      {[...decor, ...clouds].map(([model, instances]) => (
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

export default WorldIslands;
