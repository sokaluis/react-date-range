# Build Output

## What `tsdown` does in this project

[`tsdown`](https://tsdown.dev) is the current JavaScript build tool. It replaced
`tsup` in Slice 6 because `tsdown` can emit an unbundled multi-entry library while
preserving `export { default as X } from` syntax that modern bundlers need for real
tree-shaking.

### Role

| Concern | Current behavior |
|---------|------------------|
| JSX source | `.js` and `.jsx` source is compiled to plain JS output. |
| Format support | Emits ESM (`.mjs`) and CJS (`.cjs`). |
| Tree-shaking | `unbundle: true` + multi-entry glob preserves per-component modules. |
| External deps | React, react-dom, date-fns, classnames, shallow-equal, @tanstack/react-virtual are never bundled. |
| Types | `src/index.d.ts` is copied to `dist/index.d.ts`. |

### Configuration (`tsdown.config.ts`)

```ts
export default defineConfig({
  entry: ['src/**/*.{js,jsx}', '!src/**/*.test.js', '!src/locale/**'],
  format: ['cjs', 'esm'],
  clean: true,
  dts: false,
  unbundle: true,
  loader: { '.js': 'jsx' },
  deps: {
    neverBundle: ['react', 'react-dom', '@tanstack/react-virtual', 'classnames', 'shallow-equal', 'date-fns', /^date-fns\//],
  },
});
```

> **Note:** `react-list` was removed in Slice 17 (no longer shipped in bundle).
> `src/locale/**` is excluded from the entry glob — locale is sourced directly from `date-fns/locale`.

### Output files

| File | Format | Use |
|------|--------|-----|
| `dist/index.mjs` | ESM barrel | Bundlers via `exports.import` / `module` |
| `dist/index.cjs` | CJS barrel | Node/CommonJS via `exports.require` / `main` |
| `dist/components/<Component>/index.{mjs,cjs}` | ESM/CJS modules | Preserved component modules for tree-shaking |
| `dist/index.d.ts` | Type declarations | Copied from `src/index.d.ts` |
| `dist/styles.css` | CSS | Main compiled styles |
| `dist/theme/default.css` | CSS | Default theme |
| `dist/theme/variables.css` | CSS | Optional CSS custom properties (preferred) |
| `dist/theme/tokens.css` | CSS | Alias for `variables.css` (backwards-compatible) |

### Package resolution

Consumers import the package as they would from npm:

```ts
import { DateRangePicker } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
```

The relevant package fields are:

```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css",
    "./theme/default.css": "./dist/theme/default.css",
    "./theme/variables.css": "./dist/theme/variables.css",
    "./theme/tokens.css": "./dist/theme/tokens.css"
  }
}
```

### Build pipeline

```bash
npm run build
# → tsdown (JS: .mjs + .cjs, unbundled multi-entry)
# → sass (CSS: styles.css + theme/default.css)
# → cp src/index.d.ts dist/index.d.ts (types)
```

`tsdown` does not generate declarations here (`dts: false`). Types are maintained
manually in `src/index.d.ts` and copied during build.

### Tree-shaking status

Tree-shaking is real as of Slice 6. Verified with
`spikes/tree-shaking/analyze.mjs`:

| Consumer import | Output size |
|-----------------|-------------|
| `import { Calendar }` | ~41 KB |
| `import { DateRangePicker }` | ~58 KB |
| **Delta** | **~17 KB** |

`package.json#sideEffects` remains `["*.css"]` so CSS imports are preserved while
JS modules stay tree-shakeable.

See [`spikes/tree-shaking/README.md`](../spikes/tree-shaking/README.md) for the
full empirical analysis.
