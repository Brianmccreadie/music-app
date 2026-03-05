import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use static export only for mobile builds (Capacitor)
  ...(process.env.STATIC_EXPORT === "true" ? { output: "export" as const } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
