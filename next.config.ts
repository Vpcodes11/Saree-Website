import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { qualities: [75, 90] },
  devIndicators: false,
  turbopack: { root: process.cwd() },
  async headers() {
    return [
      "/video/aira-store-v9.mp4",
      "/video/aira-store-mobile-v9.mp4",
      "/images/store-poster-v9.jpg",
      "/images/store-poster-mobile-v9.jpg",
    ].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }));
  },
};

export default nextConfig;
