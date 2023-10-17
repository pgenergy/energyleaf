/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig*/
/** @typedef  {import("prettier").Config} PrettierConfig*/
/** @typedef  {{ tailwindConfig: string }} TailwindConfig*/

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
    arrowParens: "always",
    printWidth: 120,
    singleQuote: false,
    jsxSingleQuote: false,
    semi: true,
    trailingComma: "all",
    tabWidth: 4,
    plugins: [require.resolve("@ianvs/prettier-plugin-sort-imports"), require.resolve("prettier-plugin-tailwindcss")],
    tailwindConfig: "./packages/tailwindcss",
    importOrderTypeScriptVersion: "4.4.0",
    importOrder: [
        "^(react/(.*)$)|^(react$)|^(react-native(.*)$)",
        "^(next/(.*)$)|^(next$)",
        "^(expo(.*)$)|^(expo$)",
        "<THIRD_PARTY_MODULES>",
        "",
        "^@energyleaf/(.*)$",
        "",
        "^~/utils/(.*)$",
        "^~/components/(.*)$",
        "^~/styles/(.*)$",
        "^~/(.*)$",
        "^[./]",
    ],
};

module.exports = config;
