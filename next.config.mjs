import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const basePath = isPages ? "/cheongyak-pass" : "";

const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: isPages ? "/cheongyak-pass" : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: { unoptimized: true },
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.alias["@"] = path.join(__dirname, "src");
    return config;
  },
};

export default nextConfig;

