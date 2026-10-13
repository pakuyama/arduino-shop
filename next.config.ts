import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 관리자 상품 이미지 업로드 (최대 5MB)
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: [
      // 관리자가 업로드한 상품 이미지 (Supabase Storage)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
