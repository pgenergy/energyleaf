const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

module.exports = {
    extends: [
        "@vercel/style-guide/eslint/node",
        "@vercel/style-guide/eslint/browser",
        "@vercel/style-guide/eslint/typescript",
        "@vercel/style-guide/eslint/react",
        "@vercel/style-guide/eslint/next",
        "eslint-config-turbo",
    ].map(require.resolve),
    parserOptions: {
        project,
    },
    globals: {
        React: true,
        JSX: true,
    },
    settings: {
        "import/resolver": {
            typescript: {
                project,
            },
        },
    },
    ignorePatterns: ["node_modules/", "dist/"],
    // add rules configurations here
    rules: {
        "import/no-default-export": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "import/order": "off",
        "import/no-extraneous-dependencies": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/naming-convention": "off",
        "import/no-duplicates": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "react/no-unescaped-entities": "off",
    },
};
