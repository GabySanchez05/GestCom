import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker multi-stage standalone build
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
