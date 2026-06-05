import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next.config.js
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },

};

export default nextConfig;
