import type { StorybookConfig } from '@storybook/react-vite';
import type { RollupLog } from 'rollup';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['./docs/**/*.mdx', './stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  docs: {
    defaultName: 'API',
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
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
