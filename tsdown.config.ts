import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/*.{js,jsx}', '!src/**/*.test.js', '!src/locale/**'],
  format: ['cjs', 'esm'],
  clean: true,
  dts: false,
  unbundle: true,
  loader: { '.js': 'jsx' },
  deps: {
    neverBundle: [
      'react',
      'react-dom',
      '@tanstack/react-virtual',
      'prop-types',
      'classnames',
      'shallow-equal',
      'date-fns',
      /^date-fns\//,
    ],
  },
});
