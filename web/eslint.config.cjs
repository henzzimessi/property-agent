const vue = require("eslint-plugin-vue");
const vueParser = require("vue-eslint-parser");
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.{js,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  prettier,
];
