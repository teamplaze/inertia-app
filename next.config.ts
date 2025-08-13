import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oxnvcrwrhswpgqfmrhzo.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      
      {
        protocol: 'https',
        hostname: 'afnrmkdjxpzjoxhnfdxv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;