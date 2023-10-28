import "./src/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@energyleaf/ui"],
};

export default nextConfig;
