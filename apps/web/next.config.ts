import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-9ee8a88c5e204f60bb31ce62c2b024e7.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.culyn.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
