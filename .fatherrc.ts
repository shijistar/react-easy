import { defineConfig } from 'father';

export default defineConfig({
  cjs: {
    input: 'src',
    output: 'lib',
    platform: 'node',
  },
  esm: {
    input: 'src',
    output: 'es',
    platform: 'browser',
  },
  sourcemap: true,
});
