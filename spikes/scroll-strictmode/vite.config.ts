import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const LIB_DIST = path.resolve(__dirname, '../../dist');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-date-range-modern': LIB_DIST,
    },
  },
  // The built dist/ contains compiled JS (no JSX), so no esbuild override needed.
});
