// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    // Remove barra final se existir
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://vivae.onrender.com').replace(/\/+$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;