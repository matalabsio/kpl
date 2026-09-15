import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js "N" indicator in development
  devIndicators: false,
  // Avoid AVIF quirks that can invert some PNGs on Vercel image CDN
  images: {
    formats: ["image/webp"],
  },
};

export default nextConfig;
