import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        preview: resolve(__dirname, 'preview.html'),
        gann: resolve(__dirname, 'gann.html'),
        historia: resolve(__dirname, 'historia.html'),
        manifesto: resolve(__dirname, 'manifesto.html'),
        components: resolve(__dirname, 'components.html'),
      },
    },
  },
});
