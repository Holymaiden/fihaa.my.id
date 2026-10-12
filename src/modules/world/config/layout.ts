import type { WorldStationId } from '@/lib/content/types';

// Placement of the islands, in world units. Layout only, no content.

export type Vec3 = readonly [number, number, number];

export interface IslandLayout {
  position: Vec3;
  radius: number;
}

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
  radius: 7,
};

export const HOME_VIEW: CameraView = {
  position: [26, 22, 34],
  target: [0, -1, 0],
};

// The hidden vault sits under the guild island, so it can't be seen from
// the home view.
export const STATION_LAYOUT: Record<WorldStationId, StationLayout> = {
  projects: { position: [-17, 1.5, 5], radius: 4, cameraOffset: [-5, 5, 11] },
  skills: { position: [-8, 3.5, -16], radius: 4.5, cameraOffset: [-4, 5, 12] },
  experience: {
    position: [11, 2.5, -15],
    radius: 4,
    cameraOffset: [5, 5, 11],
  },
  contact: { position: [17, 0.5, 7], radius: 4, cameraOffset: [6, 5, 10] },
  secret: { position: [0, -17, 0], radius: 3, cameraOffset: [0, 1.5, 11] },
};

// The camera looks this far above the station's island top.
export const STATION_FOCUS_HEIGHT = 1.5;

// Narrow (portrait) screens see less, so the camera backs off.
export const NARROW_VIEW_ZOOM = 2;

// Shifts the framed point so it is not hidden behind the station panel
// (right side on wide screens, bottom sheet on narrow ones).
export const PANEL_FOCAL_OFFSET: Record<'wide' | 'narrow', Vec3> = {
  wide: [3.2, 0, 0],
  narrow: [0, 3, 0],
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
