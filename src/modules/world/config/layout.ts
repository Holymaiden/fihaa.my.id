import type { WorldStationId } from '@/lib/content/types';

// Placement of the islands, in world units. Layout only, no content.

export type Vec3 = readonly [number, number, number];

export interface IslandLayout {
  position: Vec3;
  // Rings of hex tiles around the centre tile.
  rings: number;
}

// KayKit hex tiles are 2 units across the flat sides (pointy side on z).
export const HEX_WIDTH = 2;
const HEX_SIZE = HEX_WIDTH / Math.sqrt(3);

// Local x/z centres of every tile within `rings` of the centre.
export const hexTilePositions = (rings: number): [number, number][] => {
  const tiles: [number, number][] = [];
  for (let q = -rings; q <= rings; q++) {
    for (let r = -rings; r <= rings; r++) {
      if (Math.abs(q + r) <= rings) {
        tiles.push([HEX_WIDTH * (q + r / 2), HEX_SIZE * 1.5 * r]);
      }
    }
  }
  return tiles;
};

// Rough outer radius of an island, for the rock underneath and the ring.
export const islandRadius = ({ rings }: IslandLayout): number =>
  HEX_WIDTH * rings + HEX_SIZE * 0.9;

export interface StationLayout extends IslandLayout {
  // Camera position relative to the station when it is selected.
  cameraOffset: Vec3;
}

export interface CameraView {
  position: Vec3;
  target: Vec3;
}

export const GUILD_LAYOUT: IslandLayout = {
  position: [0, 0, 0],
  rings: 3,
};

export const HOME_VIEW: CameraView = {
  position: [26, 22, 34],
  target: [0, -1, 0],
};

// The hidden vault sits under the guild island, so it can't be seen from
// the home view.
export const STATION_LAYOUT: Record<WorldStationId, StationLayout> = {
  projects: { position: [-18, 1.5, 6], rings: 2, cameraOffset: [-5, 5, 12] },
  skills: { position: [-9, 3.5, -18], rings: 2, cameraOffset: [-4, 6, 13] },
  experience: { position: [12, 2.5, -17], rings: 2, cameraOffset: [5, 5, 12] },
  contact: { position: [19, 0.5, 7], rings: 2, cameraOffset: [6, 5, 11] },
  secret: { position: [0, -19, 0], rings: 1, cameraOffset: [0, 2, 10] },
};

// The camera looks this far above the station's island top.
export const STATION_FOCUS_HEIGHT = 1.5;

// Narrow (portrait) screens see less, so the camera backs off.
export const NARROW_VIEW_ZOOM = 2;

// Shifts the framed point so it is not hidden behind the station panel
// (right side on wide screens, bottom sheet on narrow ones).
export const PANEL_FOCAL_OFFSET: Record<'wide' | 'narrow', Vec3> = {
  wide: [3.2, 0, 0],
  narrow: [0, 4.5, 0],
};

export const homeView = (zoom = 1): CameraView => ({
  position: [
    HOME_VIEW.target[0] + (HOME_VIEW.position[0] - HOME_VIEW.target[0]) * zoom,
    HOME_VIEW.target[1] + (HOME_VIEW.position[1] - HOME_VIEW.target[1]) * zoom,
    HOME_VIEW.target[2] + (HOME_VIEW.position[2] - HOME_VIEW.target[2]) * zoom,
  ],
  target: HOME_VIEW.target,
});

export const stationView = (id: WorldStationId, zoom = 1): CameraView => {
  const { position } = STATION_LAYOUT[id];
  const cameraOffset = STATION_LAYOUT[id].cameraOffset.map(
    (value) => value * zoom,
  );
  const target: Vec3 = [
    position[0],
    position[1] + STATION_FOCUS_HEIGHT,
    position[2],
  ];

  return {
    position: [
      target[0] + cameraOffset[0],
      target[1] + cameraOffset[1],
      target[2] + cameraOffset[2],
    ],
    target,
  };
};
