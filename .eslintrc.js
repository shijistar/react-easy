module.exports = {
  extends: [
    './node_modules/@tiny-codes/code-style-all-in-one/eslint/config/react-recommended',
    'plugin:@tiny-codes/react-hooks/recommended',
    'plugin:storybook/recommended',
  ],
  rules: {
    'react/no-array-index-key': 'error',
    'react-hooks/exhaustive-deps': 0,
    'react-hooks/rules-of-hooks': 0,
    '@tiny-codes/react-hooks/rules-of-hooks': ['error'],
    '@tiny-codes/react-hooks/exhaustive-deps': ['error'],
  },
};
