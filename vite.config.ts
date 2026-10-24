import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import preact from '@preact/preset-vite';
import path from 'node:path';

export default defineConfig({
  plugins: [tailwindcss(), preact()],
  resolve: {
    alias: {
      react: path.resolve('node_modules/preact/compat'),
      'react-dom': path.resolve('node_modules/preact/compat'),
      'react/jsx-runtime': path.resolve('node_modules/preact/jsx-runtime'),
    },
  },
  build: {
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'preact',
              test: /node_modules[\\/](preact|@preact)[\\/]/,
              priority: 30,
            },
            {
              name: 'prism-core',
              test: /node_modules[\\/]prismjs[\\/]prism(?:\.min)?\.js$/,
              priority: 20,
            },
          ],
        },
      },
    },
  },
});
