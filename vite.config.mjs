import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  server: { host: 'localhost', port: 8080, strictPort: true },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
