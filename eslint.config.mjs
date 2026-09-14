import reactRecommended from '@tiny-codes/code-style-all-in-one/eslint/react-recommended';
import storybook from 'eslint-plugin-storybook';

const noRestrictedImports = {
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
};

export default [
  {
    name: 'react-easy/ignores',
    ignores: ['node_modules/**', 'es/**', 'lib/**', 'src/components/tmp/**'],
  },
  ...reactRecommended.map((config) => {
    return {
      ...config,
      rules: {
        ...config.rules,
        'react/react-in-jsx-scope': 0,
        'react/no-array-index-key': 'error',
        'react/prop-types': 0,
        '@eslint-community/eslint-comments/no-restricted-disable': 0,
        'no-redeclare': 0, // TS 函数重载（overload signatures）被核心规则误报，TS 编译器本身会校验重复声明
        'no-restricted-imports': ['error', noRestrictedImports],
        // react-hooks v7 recommended-latest 新增的激进规则，react-easy 原配置（v2）未启用，保持原行为
        'react-hooks/refs': 0,
        'react-hooks/set-state-in-effect': 0,
        'react-hooks/set-state-in-render': 0,
        'react-hooks/immutability': 0,
        'react-hooks/void-use-memo': 0,
        'react-hooks/use-memo': 0,
        'react-hooks/preserve-manual-memoization': 0,
        'react-hooks/config': 0,
        'react-hooks/error-boundaries': 0,
        'react-hooks/gating': 0,
        'react-hooks/globals': 0,
        'react-hooks/purity': 0,
        'react-hooks/static-components': 0,
        'react-hooks/unsupported-syntax': 0,
        'react-hooks/incompatible-library': 0,
      },
    };
  }),
  ...storybook.configs['flat/recommended'],
];
