import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const LIB_SRC = path.resolve(__dirname, '../../src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-date-range-modern': LIB_SRC,
    },
  },
  // Tell esbuild to treat .js files from the library as JSX
  esbuild: {
    include: /\.(js|jsx)$/,
    exclude: [],
    loader: 'jsx',
  },
  optimizeDeps: {
    include: ['react-date-range-modern'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Allow SCSS imports from the library's src directory
      },
    },
  },
});
