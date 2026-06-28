import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
