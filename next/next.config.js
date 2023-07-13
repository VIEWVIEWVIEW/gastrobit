/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['pages', 'utils', 'components', 'layouts', 'types'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@freenow/react-polygon-editor"], // force transpile of react-polygon-editor so we remove fs/path from the bundle
  webpack: (config) => {
    config.resolve.fallback = { path: false, fs: false }; // required for react-polygon-editor. FS is not available in the browser :D

    return config;
  },
}

module.exports = nextConfig
