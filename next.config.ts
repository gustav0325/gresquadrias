import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // AVIF quando o navegador aceita, WebP como alternativa
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
  },
};

export default nextConfig;
