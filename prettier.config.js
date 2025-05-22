/** @type {import("prettier").Config} */
module.exports = {
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "^@repo/(.*)$",
    "^[.][.]/",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  plugins: [
    require.resolve("@ianvs/prettier-plugin-sort-imports"),
    /**
     * **NOTE** tailwind plugin must come last!
     * @see https://github.com/tailwindlabs/prettier-plugin-tailwindcss#compatibility-with-other-prettier-plugins
     */
    require.resolve("prettier-plugin-tailwindcss"),
  ],
  semi: true,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "always",
};
