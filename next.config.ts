import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google profile images
      'avatars.githubusercontent.com', // GitHub profile images (for future use)
      'pbs.twimg.com', // Twitter profile images (for future use)
    ],
  },
};

export default nextConfig;
