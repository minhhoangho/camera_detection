const path = require('path');

/**
 * @type {import('next').NextConfig}
 */
const config = {
    reactStrictMode: false,
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
        domains: ['localhost'],
    },
    experimental: {
        esmExternals: false,
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
                    {
                        key: 'Accept',
                        value: '*/*',
                    },
                    {key: 'Access-Control-Allow-Credentials', value: 'true'},
                    {key: 'Access-Control-Allow-Origin', value: '*'}, // replace this your actual origin
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value:
                            'X-CSRF-Token, X-Requested-With, Accept,  Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                    },
                ],
            },{
                source: '/api/:path*',
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
                    {
                        key: 'Accept',
                        value: '*/*',
                    },
                    // {key: 'Access-Control-Allow-Credentials', value: 'true'},
                    {key: 'Access-Control-Allow-Origin', value: '*'}, // replace this your actual origin
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value:
                            'X-CSRF-Token, X-Requested-With, Accept,  Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                    },
                ],
            }
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
