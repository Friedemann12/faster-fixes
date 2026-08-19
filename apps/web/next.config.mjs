import path from "node:path";
import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  typedRoutes: true,

  // Self-contained server bundle for the Docker image; traced from the monorepo root
  // so workspace packages (@workspace/db, @workspace/ui) are included.
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),

  experimental: {
    authInterrupts: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [25, 50, 75, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },

      // No entry for the storage host: asset URLs are resolved at runtime and
      // rendered with plain <img>, never through next/image.
    ],
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
