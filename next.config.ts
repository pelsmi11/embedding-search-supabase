import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
    serverActions: {
      bodySizeLimit: 50 * 1024 * 1024, // 50 MB en bytes
    },
  },
};

export default nextConfig;
