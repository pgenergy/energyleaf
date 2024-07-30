import "./src/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@energyleaf/ui", "@energyleaf/mail", "@react-email/components", "@react-email/render"],
    webpack: (config) => {
        config.externals.push("@node-rs/argon2", "@node-rs/bcrypt", "jsdom", "canvas", "@aws-sdk/client-s3", "mathjs");
        return config;
    },
};

export default nextConfig;
