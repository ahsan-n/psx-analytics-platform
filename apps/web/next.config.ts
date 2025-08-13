import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
  transpilePackages: ['@stock-analytics/api-client'],
};

export default nextConfig;
