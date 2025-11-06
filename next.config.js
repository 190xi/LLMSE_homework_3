/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Optimize for production
  reactStrictMode: true,
  swcMinify: true,
  // Configure image optimization
  images: {
    domains: [],
    unoptimized: false,
  },
};

module.exports = nextConfig;
