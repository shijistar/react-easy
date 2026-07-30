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
    'react/prop-types': 0,
    '@tiny-codes/react-hooks/rules-of-hooks': ['error'],
    '@tiny-codes/react-hooks/exhaustive-deps': ['error'],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          // ---------- hooks barrel ----------
          {
            name: '../hooks',
            message: "Import from the specific hook file, e.g., '../../hooks/useRefFunction', not the hooks barrel.",
          },
          { name: '../hooks/index', message: 'Import from the specific hook file, not the hooks barrel.' },
          {
            name: '../../hooks',
            message: "Import from the specific hook file, e.g., '../../hooks/useRefFunction', not the hooks barrel.",
          },
          { name: '../../hooks/index', message: 'Import from the specific hook file, not the hooks barrel.' },
          { name: '../../../hooks', message: 'Import from the specific hook file, not the hooks barrel.' },
          { name: '../../../hooks/index', message: 'Import from the specific hook file, not the hooks barrel.' },
          { name: '../../../../hooks', message: 'Import from the specific hook file, not the hooks barrel.' },
          { name: '../../../../hooks/index', message: 'Import from the specific hook file, not the hooks barrel.' },
          // ---------- components barrel ----------
          {
            name: '../components',
            message:
              "Import from the specific component file, e.g., '../components/ConfigProvider', not the components barrel.",
          },
          {
            name: '../components/index',
            message: 'Import from the specific component file, not the components barrel.',
          },
          {
            name: '../../components',
            message:
              "Import from the specific component file, e.g., '../../components/ConfigProvider', not the components barrel.",
          },
          {
            name: '../../components/index',
            message: 'Import from the specific component file, not the components barrel.',
          },
          {
            name: '../../../components',
            message: 'Import from the specific component file, not the components barrel.',
          },
          {
            name: '../../../components/index',
            message: 'Import from the specific component file, not the components barrel.',
          },
          {
            name: '../../../../components',
            message: 'Import from the specific component file, not the components barrel.',
          },
          {
            name: '../../../../components/index',
            message: 'Import from the specific component file, not the components barrel.',
          },
          // ---------- utils barrel ----------
          {
            name: '../utils',
            message: "Import from the specific utility file, e.g., '../utils/color', not the utils barrel.",
          },
          { name: '../utils/index', message: 'Import from the specific utility file, not the utils barrel.' },
          {
            name: '../../utils',
            message: "Import from the specific utility file, e.g., '../../utils/color', not the utils barrel.",
          },
          { name: '../../utils/index', message: 'Import from the specific utility file, not the utils barrel.' },
          { name: '../../../utils', message: 'Import from the specific utility file, not the utils barrel.' },
          { name: '../../../utils/index', message: 'Import from the specific utility file, not the utils barrel.' },
          { name: '../../../../utils', message: 'Import from the specific utility file, not the utils barrel.' },
          { name: '../../../../utils/index', message: 'Import from the specific utility file, not the utils barrel.' },
          // ---------- Lexical sub-barrel ----------
          { name: '../Lexical', message: 'Import from the specific Lexical module file, not the Lexical barrel.' },
          {
            name: '../Lexical/index',
            message: 'Import from the specific Lexical module file, not the Lexical barrel.',
          },
          { name: '../../Lexical', message: 'Import from the specific Lexical module file, not the Lexical barrel.' },
          {
            name: '../../Lexical/index',
            message: 'Import from the specific Lexical module file, not the Lexical barrel.',
          },
          {
            name: '../../../Lexical',
            message: 'Import from the specific Lexical module file, not the Lexical barrel.',
          },
          {
            name: '../../../Lexical/index',
            message: 'Import from the specific Lexical module file, not the Lexical barrel.',
          },
        ],
      },
    ],
  },
};
