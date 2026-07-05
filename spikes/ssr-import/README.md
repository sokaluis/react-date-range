# SSR / Import Safety Spike

**Goal**: Verify that importing `@cyberlz/react-date-range` in Node.js does NOT crash
due to module-scope access to browser-only globals (`window`, `document`, `navigator`).

This is **import safety**, not full SSR rendering. If the module imports cleanly
then it is safe to use in SSR contexts (Next.js, Remix, etc.) because the actual
DOM access happens at render time inside React class components, which SSR frameworks
either skip or handle gracefully.

## Tests

| Test | Command | What it checks |
|------|---------|---------------|
| ESM import | `node esm-import.mjs` | `import()` from `dist/index.mjs` |
| CJS require | `node cjs-require.cjs` | `require()` from `dist/index.js` |

## Prerequisites

```bash
# From project root:
npm run build    # produces dist/index.mjs + dist/index.js
cd spikes/ssr-import
npm install      # symlinks @cyberlz/react-date-range -> ../..
```

## Run

```bash
cd spikes/ssr-import
npm test
# or individually:
npm run test:cjs
npm run test:esm
```

## CSS Import Note

`import "@cyberlz/react-date-range/styles.css"` is a **bundler-only** import, not a
Node raw import. Node does not natively understand CSS files. SSR frameworks
(Next.js, Remix) handle CSS through their own bundler pipelines. This spike does
not test CSS imports in Node — it is outside the scope of import safety.
