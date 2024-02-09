import "./src/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@energyleaf/ui", "@energyleaf/mail"],
};

export default nextConfig;
