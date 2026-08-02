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
          include: ['test/components/**/*.test.ts*', 'test/hooks/**/*.test.ts*', 'test/utils/**/*.test.ts*'],
          exclude: ['test/browser/**/*.test.ts*', 'test/utils/**/*.browser.test.ts*'],
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
          include: ['test/browser/**/*.test.ts*', 'test/utils/**/*.browser.test.ts*'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/components/**/*.ts*', 'src/hooks/**/use*.ts*', 'src/utils/**/*.ts*'],
      exclude: ['src/components/tmp/*.tsx', 'src/hooks/useUserMedia.tsx'],
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
