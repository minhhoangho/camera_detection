const path = require('path');

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  eslint: {
    dirs: ['src'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname)],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [768, 1024, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/image/upload/**',
      },
    ],
    domains: ['example.com'],
  },
  experimental: {
    esmExternals: false,
    outputStandalone: true,
  },
  poweredByHeader: false,
  headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  webpack(webpackConfig) {
    // https://formatjs.io/docs/guides/advanced-usage#react-intl-without-parser-40-smaller
    webpackConfig.resolve.alias['@formatjs/icu-messageformat-parser'] =
      '@formatjs/icu-messageformat-parser/no-parser';
    return webpackConfig;
  },
};

module.exports = config;
