import { defineConfig } from 'vitest/config';
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    include: ['tests/unit/**/*.test.ts', 'supabase/tests/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
