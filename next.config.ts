import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["@node-rs/argon2", "@energyleaf/proto"],
    reactCompiler: true,
    output: "standalone",
    async headers() {
        return [
            {
                source: "/:path*{/}?",
                headers: [{ key: "X-Accel-Buffering", value: "no" }],
            },
        ];
    },
};

export default nextConfig;
