import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: [
        'src/hooks/use*.ts',
        'src/hooks/use*.tsx',
        'src/hooks/style/useSplitter.ts',
        'src/utils/AudioPlayer.ts',
        'src/utils/base64.ts',
        'src/utils/color.ts',
        'src/utils/crypto.ts',
        'src/utils/math.ts',
        'src/utils/stream.ts',
        'src/utils/string.ts',
        'src/utils/StreamDownloader/index.ts',
        'src/utils/StreamDownloader/StreamDownloadError.ts',
      ],
      exclude: ['src/hooks/useUserMedia.tsx'],
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
