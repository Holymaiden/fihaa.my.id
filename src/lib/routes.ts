/** URL kanonik situs (domain tetap fihaa.my.id). */
export const SITE_URL = 'https://fihaa.my.id';

/** Prefix portfolio 2D. */
export const ROUTE_2D = '/2d';

/** Dunia 3D. */
export const ROUTE_WORLD = '/world';

/** Path internal 2D, mis. `to2d('/projects')` → `/2d/projects`, `to2d()` → `/2d`. */
export const to2d = (path = '/'): string =>
  path === '/' ? ROUTE_2D : `${ROUTE_2D}${path}`;

/** Kebalikan `to2d`: `/2d/blog/x` → `/blog/x`, `/2d` → `/`. */
export const stripRoute2d = (pathname: string): string => {
  if (pathname === ROUTE_2D) {
    return '/';
  }

  return pathname.startsWith(`${ROUTE_2D}/`)
    ? pathname.slice(ROUTE_2D.length)
    : pathname;
};
