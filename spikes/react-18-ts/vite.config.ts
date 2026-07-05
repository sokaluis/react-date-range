import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const LIB_SRC = path.resolve(__dirname, '../../src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@cyberlz/react-date-range': LIB_SRC,
    },
  },
  // Tell esbuild to transform both the spike TSX entry and the library's .js JSX.
  // If this only includes .js/.jsx, Vite import-analysis sees raw JSX in .tsx files.
  esbuild: {
    include: /\.(js|jsx|ts|tsx)$/,
    exclude: [],
    loader: 'tsx',
  },
  optimizeDeps: {
    include: ['@cyberlz/react-date-range'],
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
