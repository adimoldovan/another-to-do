import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../public/build',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/app.js',
      output: {
        entryFileNames: 'bundle.js',
        assetFileNames: 'bundle.[ext]',
      },
    },
  },
  server: {
    port: 8080,
  },
});
