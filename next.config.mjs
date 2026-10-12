import createMDX from '@next/mdx';

// Sections that used to live at the root and now live under /2d.
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

  // Image.tsx renders with quality={100}; Next 16 only allows listed values.
  images: {
    qualities: [75, 100],
  },

  // Keep old links working.
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
