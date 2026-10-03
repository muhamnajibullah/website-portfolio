import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: { args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'] },
  },
  webServer: [
    {
      command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173',
      cwd: 'apps/web',
      url: 'http://127.0.0.1:4173',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4174',
      cwd: 'apps/cms',
      url: 'http://127.0.0.1:4174',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5175',
      cwd: 'apps/cms',
      url: 'http://127.0.0.1:5175',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_SUPABASE_URL: 'http://127.0.0.1:54545',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_e2e_only',
      },
    },
  ],
});
