import reactRecommended from '@tiny-codes/code-style-all-in-one/eslint/react-easy-recommended';
import storybook from 'eslint-plugin-storybook';

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
        'no-restricted-imports': [
          'error',
          {
            paths: [
              // ---------- hooks barrel ----------
              {
                name: '../hooks',
                message:
                  "Import from the specific hook file, e.g., '../../hooks/useRefFunction', not the hooks barrel.",
              },
              { name: '../hooks/index', message: 'Import from the specific hook file, not the hooks barrel.' },
              {
                name: '../../hooks',
                message:
                  "Import from the specific hook file, e.g., '../../hooks/useRefFunction', not the hooks barrel.",
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
              {
                name: '../../../../utils/index',
                message: 'Import from the specific utility file, not the utils barrel.',
              },
              // ---------- Lexical sub-barrel ----------
              { name: '../Lexical', message: 'Import from the specific Lexical module file, not the Lexical barrel.' },
              {
                name: '../Lexical/index',
                message: 'Import from the specific Lexical module file, not the Lexical barrel.',
              },
              {
                name: '../../Lexical',
                message: 'Import from the specific Lexical module file, not the Lexical barrel.',
              },
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
  }),
  ...storybook.configs['flat/recommended'],
];
