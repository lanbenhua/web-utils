module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    // 'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "no-console": "off",
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "consistent-return": "off",
    "no-bitwise": "off",
    "lines-between-class-members": "off",
    "no-underscore-dangle": "off",
    "no-plusplus": "off"
  },
};
