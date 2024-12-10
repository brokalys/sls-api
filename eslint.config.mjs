import prettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: [
      '**/.git/',
      '**/.serverless/',
      '**/node_modules/',
      '**/coverage/',
    ],
  },
  {
    plugins: {
      prettier,
    },

    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },

    rules: {
      'prettier/prettier': 'error',
    },
  },
];
