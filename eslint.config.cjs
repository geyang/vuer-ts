module.exports = [
  { ignores: [ "dist/" ] },
  {
    files: [
      "/vuer/**/*.jsx",
      "/vuer/**/*.tsx",
    ],
    languageOptions: {
      globals: { browser: true, es2020: true },
      parser: require("@typescript-eslint/parser"),
    },
    plugins: {
      "react-refresh": require("eslint-plugin-react-refresh"),
      "@emotion": require("@emotion/eslint-plugin"),
      "@eslint": require("@eslint-recommended/eslint-config"),
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      "react-hooks": require("eslint-plugin-react-hooks"),
      "prettier": require("prettier"),
    },
    rules: {
      // "@emotion/jsx-import": "error",
      // "@emotion/pkg-renaming": "error",
      "react-refresh/only-export-components": "off",
      "indent": [ "error", 2 ],
      "object-curly-spacing": [ "error", "always" ],
      "array-bracket-spacing": [ "error", "always" ],
    },
  }
]