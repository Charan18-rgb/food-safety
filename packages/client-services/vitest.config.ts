import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts', 'tests/**/*.test.ts']
  }
});

