import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/react-date-range/',
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@cyberlz/react-date-range/styles.css', replacement: resolve(__dirname, '../src/styles.scss') },
      { find: '@cyberlz/react-date-range/theme/default.css', replacement: resolve(__dirname, '../src/theme/default.scss') },
      { find: '@cyberlz/react-date-range', replacement: resolve(__dirname, '../src/index.js') },
    ],
  },
});
