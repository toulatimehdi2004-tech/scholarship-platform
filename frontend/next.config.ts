import type { NextConfig } from "next";

const isStaticExport =
  process.env.NODE_ENV === "production" ||
  process.env.BUILD_STATIC === "true" ||
  Boolean(process.env.NEXT_PUBLIC_BASE_PATH);

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: {
    unoptimized: true,
  },
  ...(isStaticExport
    ? {}
    : {
        skipTrailingSlashRedirect: true,
        async rewrites() {
          return [
            {
              source: "/api/:path*/",
              destination: "http://127.0.0.1:8000/api/:path*/",
            },
            {
              source: "/api/:path*",
              destination: "http://127.0.0.1:8000/api/:path*/",
            },
          ];
        },
      }),
};

export default nextConfig;
