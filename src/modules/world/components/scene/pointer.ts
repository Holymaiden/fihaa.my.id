import type { ThreeEvent } from '@react-three/fiber';

// Pixels the pointer may move and still count as a click (not a drag that
// turns the island).
export const CLICK_TOLERANCE = 6;

export const isDrag = (event: ThreeEvent<MouseEvent>): boolean =>
  event.delta > CLICK_TOLERANCE;

// When the last drag that turned the island ended, so the click that ends a
// drag on empty sky doesn't also close the panel.
export const lastDrag = { endedAt: 0 };

export const endedDragJustNow = (): boolean =>
  performance.now() - lastDrag.endedAt < 300;

// Cursor over the canvas (a helper so effects don't assign to the
// renderer's element directly).
export const setCanvasCursor = (element: HTMLElement, cursor: string) => {
  element.style.cursor = cursor;
};
