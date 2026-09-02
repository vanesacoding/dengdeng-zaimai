import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryName = "dengdeng-zaimai";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  ...(isGitHubPages ? {
    output: "export" as const,
    basePath: `/${repositoryName}`,
    assetPrefix: `/${repositoryName}/`,
    trailingSlash: true,
    images: { unoptimized: true },
  } : {}),
};

export default nextConfig;
