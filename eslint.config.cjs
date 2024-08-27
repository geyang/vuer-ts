module.exports = [
  { ignores: ['dist/'] },
  {
    files: [
      '/pages/**/*.jsx',
      '/pages/**/*.tsx',
    ],
    languageOptions: {
      globals: {
        browser: true,
        es2020: true,
      },
      parser: require('@typescript-eslint/parser'),
    },
    plugins: {
      'css-modules': require('eslint-plugin-css-modules'),
      'react-refresh': require('eslint-plugin-react-refresh'),
      '@eslint': require('@eslint-recommended/eslint-config'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      'prettier': require('prettier'),
    },
    extends: [
      'plugin:@css-modules/recommended',
      'plugin:@eslint/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
      'plugin:prettier/recommended',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
      'indent': ['error', 2],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'always'],
      'resolve-json-module': 'on',
    },
  },
];