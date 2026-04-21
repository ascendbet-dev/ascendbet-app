import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rptniegggrrcgwerhspp.supabase.co",
      },
    ],
  },
};

export default nextConfig;