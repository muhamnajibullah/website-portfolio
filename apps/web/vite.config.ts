import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  ssr: { noExternal: [/^@portfolio\//] },
  build: { manifest: true, sourcemap: false, chunkSizeWarningLimit: 650 },
  server: { strictPort: true },
  preview: { strictPort: true },
});
