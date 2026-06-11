import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  transpilePackages: ["leaflet", "react-leaflet"],
  allowedDevOrigins: [
    ".space-z.ai",
  ],
};

export default nextConfig;
