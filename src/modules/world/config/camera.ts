import type { Vec3 } from './island';
import { ISLAND, STATION_DISTANCE, VAULT } from './island';

// Camera shots. The island turns instead of the camera orbiting, so every
// shot looks at the front (+z) of the island.

export interface CameraView {
  position: Vec3;
  target: Vec3;
}

// Before the visitor enters: far out over the cloud sea, the island small
// and hazy in the distance.
export const INTRO_VIEW: CameraView = {
  position: [-18, -14, 118],
  target: [0, 2, 0],
};

export const OVERVIEW: CameraView = {
  position: [0, 13, 34],
  target: [0, -1, 0],
};

// Close-up on the station that faces the camera, leaving room above it for
// the info card.
export const STATION_VIEW: CameraView = {
  position: [0, 7.5, STATION_DISTANCE + 14],
  target: [0, 2.4, STATION_DISTANCE - 1],
};

// The castle (profile), from the front.
export const PROFILE_VIEW: CameraView = {
  position: [0, 9, 21],
  target: [0, 5, 0],
};

// Just under the rim, looking down a little at the vault ledge.
export const VAULT_VIEW: CameraView = {
  position: [0, VAULT.height + 4, VAULT.distance + 11],
  target: [0, VAULT.height + 2.2, VAULT.distance],
};

// Narrow (portrait) screens see less, so the camera backs off: a lot for
// the whole island, less for close-ups.
export const NARROW_ZOOM = { overview: 2.05, closeUp: 1.6 } as const;
// Same breakpoint as Tailwind's md, where the panel moves to the side.
export const NARROW_MAX_WIDTH = 768;

// Moves the framed point so the open place sits beside its card (card to
// the right on wide screens, bottom sheet on narrow ones).
export const PANEL_SHIFT: Record<'wide' | 'narrow', Vec3> = {
  wide: [5.5, 0, 0],
  narrow: [0, -3.4, 0],
};

export const zoomView = ({ position, target }: CameraView, zoom: number) => ({
  position: [
    target[0] + (position[0] - target[0]) * zoom,
    target[1] + (position[1] - target[1]) * zoom,
    target[2] + (position[2] - target[2]) * zoom,
  ] as Vec3,
  target,
});

export const shiftView = ({ position, target }: CameraView, shift: Vec3) => ({
  position: [
    position[0] + shift[0],
    position[1] + shift[1],
    position[2] + shift[2],
  ] as Vec3,
  target: [
    target[0] + shift[0],
    target[1] + shift[1],
    target[2] + shift[2],
  ] as Vec3,
});

// Shadows only need to cover the island.
export const SHADOW_EXTENT = ISLAND.radius + 4;
