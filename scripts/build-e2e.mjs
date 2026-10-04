import { spawnSync } from 'node:child_process';

// Browser fixtures must not query the configured production CMS, even with local .env files.
const result = spawnSync('pnpm', ['build'], {
  shell: process.platform === 'win32',
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_SUPABASE_URL: '',
    VITE_SUPABASE_PUBLISHABLE_KEY: '',
    VITE_SITE_URL: 'http://127.0.0.1:4173',
  },
});
process.exit(result.status ?? 1);
