const baseConfig = require("@energyleaf/tailwindcss").default;
const { addDynamicIconSelectors } = require("@iconify/tailwind");

/** @type {import('tailwindcss/tailwind-config')} */
const config = {
    content: [...baseConfig.content, "../../packages/ui/src/**/*.{ts,tsx}"],
    presets: [baseConfig],
    plugins: [
        // Iconify plugin
        addDynamicIconSelectors(),
    ],
};

module.exports = config;
