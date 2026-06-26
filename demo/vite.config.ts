import { fileURLToPath, URL } from 'node:url';

import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

const librarySourcePattern = /\/react-date-range-modern\/src\/.*\.js$/;

export default defineConfig({
  plugins: [
    {
      name: 'react-date-range-local-jsx',
      async transform(code, id) {
        if (!librarySourcePattern.test(id)) {
          return null;
        }

        return transformWithEsbuild(code, id, {
          loader: 'jsx',
        });
      },
    },
    react(),
  ],
  resolve: {
    alias: [
      {
        find: '@cyberlz/react-date-range/styles.css',
        replacement: fileURLToPath(new URL('../src/styles.scss', import.meta.url)),
      },
      {
        find: '@cyberlz/react-date-range/theme/default.css',
        replacement: fileURLToPath(new URL('../src/theme/default.scss', import.meta.url)),
      },
      {
        find: '@cyberlz/react-date-range',
        replacement: fileURLToPath(new URL('../src/index.js', import.meta.url)),
      },
    ],
  },
});
