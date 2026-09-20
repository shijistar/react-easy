import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';
import type { RollupLog } from 'rollup';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['./docs/**/*.mdx', './stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  docs: {
    defaultName: 'API',
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // `exclude` replaces the plugin default, so the stories exclusion is repeated here.
      exclude: [
        '**/*.stories.tsx',
        // The components barrel only re-exports (`export { default as X } from './X'`). For that
        // syntax react-docgen-typescript resolves the runtime target to the reserved word `default`
        // and appends `default.__docgenInfo = ...`, which is a syntax error that breaks the build.
        // Nothing is lost by skipping it: each component's own file is still processed and carries
        // the `__docgenInfo` that the re-export forwards.
        '**/src/components/index.tsx',
      ],
    },
  },
  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      build: {
        rollupOptions: {
          onwarn(warning: RollupLog, defaultHandler: (warning: string | RollupLog) => void) {
            if (shouldIgnoreUseClientWarning(warning)) {
              return;
            }
            defaultHandler(warning);
          },
        },
      },
    });
  },
};

export default config;

function shouldIgnoreUseClientWarning(warning: RollupLog) {
  return (
    warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
    typeof warning.message === 'string' &&
    warning.message.includes('"use client"')
  );
}
