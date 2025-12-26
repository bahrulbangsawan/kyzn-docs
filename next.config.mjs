import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.kyzn.life',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:path*.mdx',
        destination: '/llms.mdx/:path*',
      },
    ];
  },
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Ignore @vercel/og and WASM files completely to reduce bundle size
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^@vercel\/og$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /next\/dist\/compiled\/@vercel\/og\/.*\.wasm$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /next\/dist\/compiled\/@vercel\/og\/.*\.ttf\.bin$/,
        })
      );
      
      // Also externalize to be safe
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@vercel/og');
      } else {
        config.externals = [config.externals, '@vercel/og'];
      }
    }
    return config;
  },
};

export default withMDX(config);
