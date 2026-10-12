import type { MetadataRoute } from 'next';

import { ROUTE_WORLD, SITE_URL, to2d } from '@/lib/routes';

type SitemapEntry = MetadataRoute.Sitemap[number];

const page = (
  path: string,
  changeFrequency: SitemapEntry['changeFrequency'],
  priority: number,
): SitemapEntry => ({
  url: `${SITE_URL}${path}`,
  lastModified: new Date(),
  changeFrequency,
  priority,
});

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    page('', 'yearly', 1),
    page(to2d(), 'yearly', 1),
    page(ROUTE_WORLD, 'monthly', 0.9),
    page(to2d('/dashboard'), 'yearly', 0.5),
    page(to2d('/projects'), 'monthly', 0.8),
    page(to2d('/blog'), 'monthly', 0.5),
    page(to2d('/learn'), 'monthly', 0.8),
    page(to2d('/about'), 'monthly', 0.8),
    page(to2d('/contact'), 'monthly', 0.8),
  ];
}
