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
      const emptyModulePath = require.resolve('./src/lib/empty-module.js');
      
      // Use aliases to replace @vercel/og dependencies
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        '@vercel/og': emptyModulePath,
      };
      
      // Replace all variations of @vercel/og imports (including absolute paths and WASM files)
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /@vercel\/og/,
          emptyModulePath
        ),
        new webpack.NormalModuleReplacementPlugin(
          /next\/dist\/compiled\/@vercel\/og/,
          emptyModulePath
        ),
        new webpack.NormalModuleReplacementPlugin(
          /.*@vercel\/og.*\.wasm/,
          emptyModulePath
        ),
        new webpack.NormalModuleReplacementPlugin(
          /.*@vercel\/og.*\.ttf\.bin/,
          emptyModulePath
        ),
        // Catch absolute paths that might be embedded
        new webpack.NormalModuleReplacementPlugin(
          /.*\/node_modules\/next\/dist\/compiled\/@vercel\/og/,
          emptyModulePath
        )
      );
    }
    return config;
  },
};

export default withMDX(config);
