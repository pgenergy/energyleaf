import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["@node-rs/argon2", "@energyleaf/proto"],
    reactCompiler: true,
};

export default nextConfig;
