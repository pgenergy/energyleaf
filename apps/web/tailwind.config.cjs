const baseConfig = require("@energyleaf/tailwindcss").default;

/** @type {import('tailwindcss/tailwind-config')} */
const config = {
    content: [...baseConfig.content, "../../packages/ui/src/**/*.{ts,tsx}"],
    presets: [baseConfig],
};

module.exports = config;
