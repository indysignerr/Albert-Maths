import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export -> deployed on Cloudflare Pages.
  // Server-side work (LLM proxy) lives in `functions/api/*` as Pages Functions.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
