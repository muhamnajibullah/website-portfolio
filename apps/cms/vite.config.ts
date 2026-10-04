import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
const themeBootstrap = readFileSync(
  new URL('../../packages/ui/src/theme-bootstrap.js', import.meta.url),
  'utf8',
);
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'portfolio-theme-bootstrap',
      configureServer(server) {
        server.middlewares.use('/theme.js', (_request, response) => {
          response.setHeader('Content-Type', 'text/javascript');
          response.end(themeBootstrap);
        });
      },
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'theme.js', source: themeBootstrap });
      },
      transformIndexHtml: {
        order: 'post',
        handler: () => [{ tag: 'script', attrs: { src: '/theme.js' }, injectTo: 'head-prepend' }],
      },
    },
  ],
  server: { strictPort: true },
  preview: { strictPort: true },
  build: { sourcemap: false },
});
