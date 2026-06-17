import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Separate Vite build for the browser extension content script.
 * Outputs a self-contained IIFE to dist/content.js.
 * Run after the main build: vite build --config vite.config.content.ts
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/functions/const.ts'),
      name: 'BranchPandaContent',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
