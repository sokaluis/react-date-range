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
      'prop-types',
      'classnames',
      'react-list',
      'shallow-equal',
      'date-fns',
      /^date-fns\//,
    ],
  },
});
