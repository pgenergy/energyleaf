import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["@node-rs/argon2", "@energyleaf/proto"],
};

export default nextConfig;
