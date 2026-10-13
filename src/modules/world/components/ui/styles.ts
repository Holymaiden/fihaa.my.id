// Shared look of the HTML layer over the 3D world: frosted glass panels and
// round buttons, light/dark aware.
export const GLASS =
  'border border-white/50 bg-light/75 shadow-lg shadow-black/10 backdrop-blur-md dark:border-white/10 dark:bg-dark/70 dark:shadow-black/40';

export const ICON_BUTTON = `${GLASS} flex h-10 w-10 items-center justify-center rounded-full text-lg text-neutral-700 transition hover:text-accent focus-visible:outline-2 focus-visible:outline-accent dark:text-neutral-200`;

export const PILL_BUTTON = `${GLASS} inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-neutral-800 transition hover:text-accent focus-visible:outline-2 focus-visible:outline-accent dark:text-neutral-100`;
