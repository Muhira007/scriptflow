import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "better-auth",
    "@better-auth/core",
    "@better-auth/drizzle-adapter",
    "drizzle-orm",
    "pg",
  ],
};

export default nextConfig;
