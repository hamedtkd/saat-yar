import type { NextConfig } from "next";

const repositoryBase = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: repositoryBase,
  assetPrefix: repositoryBase || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
