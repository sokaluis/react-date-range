import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['cjs', 'esm'],
  clean: true,
  dts: false,
  bundle: true,
  splitting: false,
  sourcemap: false,
  minify: false,
  external: [
    'react',
    'react-dom',
    'prop-types',
    'classnames',
    'react-list',
    'shallow-equal',
    'date-fns',
    /^date-fns\//,
  ],
  esbuildOptions(options) {
    options.loader = {
      '.js': 'jsx',
    };
  },
});
