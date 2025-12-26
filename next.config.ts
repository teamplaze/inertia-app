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
  experimental: {
    // This flag is required to use forbidden() and unauthorized() in Server Components
    authInterrupts: true,
  },
};

export default nextConfig;