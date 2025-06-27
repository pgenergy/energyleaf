/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
	singleQuote: false,
	tabWidth: 4,
	printWidth: 120,
	useTabs: true,
	semi: true,
	trailingComma: "es5",
	plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
};

export default config;
