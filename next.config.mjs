import createMDX from '@next/mdx';

// Bagian portfolio 2D yang dulu berada di root dan kini di bawah /2d.
// Daftar URL lama: docs/migrasi/00-audit.md §8.
const LEGACY_2D_SECTIONS = [
  'about',
  'blog',
  'contact',
  'dashboard',
  'learn',
  'novel',
  'projects',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],

  // Redirect permanen (308) URL lama → /2d/...; query string ikut terbawa.
  async redirects() {
    return LEGACY_2D_SECTIONS.map((section) => ({
      source: `/${section}/:path*`,
      destination: `/2d/${section}/:path*`,
      permanent: true,
    }));
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }

    return config;
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
