# Build Output

## What `tsup` does in this project

[tsup](https://tsup.egoist.dev) is a zero-config TypeScript/JavaScript bundler powered by [esbuild](https://esbuild.github.io/). In this project, it is the core build tool.

### Role

| Concern | Without tsup | With tsup |
|---------|-------------|-----------|
| JSX in `.js` files | Consumers need custom Vite/esbuild loaders | JSX compiled to `createElement()`/`jsx()` calls — plain JS output |
| Format support | Source only (no usable ESM/CJS) | Produces both `dist/index.mjs` (ESM) and `dist/index.js` (CJS) |
| Bundling | N/A | Single-file bundles, no internal import resolution for consumers |
| External deps | N/A | `react`, `react-dom`, `date-fns`, etc. kept external (correct peer dep handling) |

### Configuration (tsup.config.ts)

```ts
export default defineConfig({
  entry: ['src/index.js'],
  format: ['cjs', 'esm'],       // dual output
  bundle: true,                  // single file per format
  splitting: false,              // no code splitting for library
  external: ['react', 'react-dom', 'prop-types', 'classnames', 'react-list', 'shallow-equal', 'date-fns', /^date-fns\//],
  esbuildOptions(options) {
    options.loader = { '.js': 'jsx' };  // treat .js as JSX (upstream convention)
  },
});
```

### Output files

| File | Format | Use |
|------|--------|-----|
| `dist/index.mjs` | ESM | Bundlers: Vite, Next.js, Webpack (via `"module"` or `"exports.import"`) |
| `dist/index.js` | CJS | Node.js `require()`, legacy bundlers (via `"main"` or `"exports.require"`) |
| `dist/index.d.ts` | TypeScript declarations | `tsc` type-checking for consumers (copied from `src/index.d.ts`) |
| `dist/styles.css` | CSS | Compiled from Sass; imported by consumers via `import "@cyberlz/react-date-range/styles.css"` |
| `dist/theme/default.css` | CSS | Default theme CSS; imported separately |

### How local package imports work

Local consumers in `spikes/` import the package exactly like a published npm
package:

```ts
import { DateRangePicker } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
```

The difference is only where npm gets the package from. Instead of downloading it
from the npm registry, each local spike uses a `file:` dependency:

```json
{
  "dependencies": {
    "@cyberlz/react-date-range": "file:../.."
  }
}
```

After running `npm install`, npm creates a local package entry under the consumer's
`node_modules/`:

```txt
spikes/consumer-tsx/node_modules/@cyberlz/react-date-range
```

Then the consumer's bundler reads this package's `package.json` and follows the
same fields a real npm install would use:

```json
{
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css",
    "./theme/default.css": "./dist/theme/default.css"
  }
}
```

Resolution by consumer type:

| Consumer | Runtime file | Type file |
|----------|--------------|-----------|
| ESM / Vite / TSX | `dist/index.mjs` | `dist/index.d.ts` |
| CJS / `require()` | `dist/index.js` | `dist/index.d.ts` |
| CSS import | `dist/styles.css` | N/A |

This is why `npm run build` must run before validating local consumers: the local
install resolves to `dist/`, not to raw `src/`.

The goal is for `file:../..` local installs and future npm installs to behave the
same way. If a local consumer needs custom Vite loaders, the package is not ready
to publish.

### Build pipeline

```bash
npm run build
# → tsup (JS bundle: .mjs + .js)
# → sass (CSS: styles.css + theme/default.css)  
# → cp src/index.d.ts dist/index.d.ts (types)
```

> **Note**: `tsup` does NOT generate `.d.ts` files (configured with `dts: false`).
> Types are maintained manually in `src/index.d.ts` and copied to `dist/` during build.
> This avoids the complexity of `tsup`'s experimental `dts` plugin (which uses Rollup
> under the hood and often breaks on mixed JS/TS codebases).

### Why tsup and not Rollup directly?

- **JSX-in-.js**: The upstream source uses `.js` with JSX. tsup's `esbuildOptions.loader` override (`{ '.js': 'jsx' }`) handles this trivially.
- **Simplicity**: tsup wraps esbuild with sensible defaults for library bundles.
- **Speed**: esbuild is fast (build takes ~13ms).
- **Dual format**: `format: ['cjs', 'esm']` produces both in one pass.

### Why not tsup's `dts` plugin?

tsup's experimental `dts: true` uses Rollup under the hood and often breaks on:
- Mixed JS/TS codebases
- Module augmentation patterns
- Complex type re-exports

Manual `.d.ts` management is simpler and more reliable for this project's current scope.

### Tree-shaking limitation

**Current state**: `bundle: true` produces a single-file output (`dist/index.mjs`, 1613 lines, ~57 KB). All 7 named exports are always included regardless of which ones the consumer imports. Bundlers cannot tree-shake within the single file due to top-level class declarations that reference `React.Component`.

| What you import | What you actually get | Bundle size |
|-----------------|----------------------|-------------|
| `{ Calendar }` | All 7 exports | 56,074 bytes |
| `{ DateRangePicker }` | All 7 exports | 56,128 bytes |
| `{ DateRange }` | All 7 exports | ~56 KB |

**Why**: `var DayCell = class extends React.Component { ... }` has module-scope side effects; esbuild/Rollup conservatively keep all declarations within the file.

**Impact**: ~57 KB fixed overhead (gzipped ~15 KB). Acceptable for Alpha 0/1.

**`sideEffects` field**: Package declares `"sideEffects": ["*.css"]` — CSS files have observable side effects (style injection). The JS bundle cannot claim `false` while it remains a single file with class declarations.

**Planned fix (Beta 1.0)**: Switch to `bundle: false` in tsup to produce per-module output, then set `"sideEffects": false` to allow module-level tree-shaking.

See [`spikes/tree-shaking/README.md`](../spikes/tree-shaking/README.md) for full analysis.
