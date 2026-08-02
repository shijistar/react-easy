import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./test/setup.ts'],
          include: [
            'test/components/**/*.test.ts',
            'test/components/**/*.test.tsx',
            // 'test/hooks/**/*.test.ts',
            // 'test/hooks/**/*.test.tsx',
            // 'test/utils/**/*.test.ts',
            // 'test/utils/**/*.test.tsx',
          ],
          exclude: ['test/**/*.browser.test.ts', 'test/**/*.browser.test.tsx'],
        },
      },
      {
        test: {
          name: 'browser',
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          globals: true,
          include: [
            'test/browser/**/*.test.ts',
            'test/browser/**/*.test.tsx',
            'test/utils/**/*.browser.test.ts',
            'test/utils/**/*.browser.test.tsx',
          ],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: [
        'src/components/**/*.ts*',
        // 'src/hooks/**/use*.ts*',
        // 'src/utils/**/*.ts*'
      ],
      exclude: [
        'src/components/index.tsx',
        'src/components/Lexical/index.ts',
        'src/components/Iconfont/index.tsx',
        'src/components/VirtualTextViewer/types.ts',
        'src/components/tmp/*.tsx',
        'src/hooks/index.ts',
        'src/hooks/useUserMedia.tsx',
        'src/utils/index.ts',
        'src/utils/StreamDownloader/types.ts',
        'src/components/VirtualTextViewer/types.ts',
      ],
      reporter: ['text', 'html', 'json-summary', 'clover', 'json', 'lcov'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
