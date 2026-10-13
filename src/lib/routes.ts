export const SITE_URL = 'https://fihaa.my.id';

export const ROUTE_2D = '/2d';

export const ROUTE_WORLD = '/world';

// to2d('/projects') -> '/2d/projects', to2d() -> '/2d'
export const to2d = (path = '/'): string =>
  path === '/' ? ROUTE_2D : `${ROUTE_2D}${path}`;

// '/2d/blog/x' -> '/blog/x', '/2d' -> '/'
export const stripRoute2d = (pathname: string): string => {
  if (pathname === ROUTE_2D) {
    return '/';
  }

  return pathname.startsWith(`${ROUTE_2D}/`)
    ? pathname.slice(ROUTE_2D.length)
    : pathname;
};
