# Spike: React 19 Compatibility

> Minimal Vite + React 19 test app that imports `@cyberlz/react-date-range` source directly.

## Purpose

Determine whether the upstream `react-date-range@2.0.1` source code works with React 19
without modifications. Identifies real blockers vs. theoretical concerns.

## Setup

```bash
cd spikes/react-19
npm install       # install React 19 + Vite + library deps
npm run dev       # start dev server (http://localhost:5173)
```

## What this tests

- **JSX compilation**: Does the library's JSX (compiled by Vite via `@vitejs/plugin-react`) work with React 19's JSX transform?
- **Class component rendering**: Do `Component`/`PureComponent` classes render without errors?
- **prop-types**: Do PropTypes warnings appear in React 19 dev mode?
- **Callback refs**: Do `ref={t => (this.x = t)}` patterns work with React 19's new ref cleanup?
- **StrictMode**: Double-render behavior in React 19 StrictMode — any visual or state issues?
- **SCSS imports**: Can Vite process the library's SCSS files directly?

## Expected outcomes

| Check | Expected | Actual |
|-------|----------|--------|
| `npm install` succeeds | ✅ No peer dependency conflicts | ✅ Passed — 83 packages installed, 0 vulnerabilities. |
| `npm run dev` starts | ✅ Vite compiles and serves | ✅ Passed after JSX loader fixes. Vite starts on `http://localhost:5173/`. |
| `<DateRangePicker />` renders | ✅ Calendar UI appears without errors | ✅ Calendar renders in browser. |
| No console errors | ✅ Clean console (except PropTypes warnings in dev) | ✅ Browser console only shows Vite connection, React DevTools suggestion, and expected `Selected range` logs. Terminal shows Dart Sass `@import` deprecation warnings from upstream SCSS. |
| Range interaction works | ✅ Selecting start/end dates updates controlled state | ✅ Passed after fixture was made controlled with `useState`; `onChange` emits expected `selection.startDate` and `selection.endDate`. |
| StrictMode no crash | ✅ No double-mounting issues | ✅ No visible crash during basic render + range interaction under `<StrictMode>`. Needs deeper scroll/ref testing later. |
| SCSS loads correctly | ✅ Styled calendar with proper theme | ⚠️ SCSS compiles, but uses deprecated Sass `@import`; migrate later, not a React 19 blocker. |

## Blockers found

_(Fill in after running the spike)_

### Current status: FIRST TOOLING BLOCKER FOUND

The first `npm run dev` execution reached Vite but failed before React runtime
because upstream source keeps JSX inside `.js` files. Vite's dependency optimizer
uses esbuild and needs an explicit `.js` → `jsx` loader for this linked package.

Fixed in `vite.config.js`:

```js
esbuild: {
  include: /\.(js|jsx)$/,
  exclude: [],
  loader: 'jsx',
},

optimizeDeps: {
  include: ['@cyberlz/react-date-range'],
  esbuildOptions: {
    loader: {
      '.js': 'jsx',
    },
  },
}
```

Next run:

1. Install dependencies: `cd spikes/react-19 && npm install`
2. Run dev server: `npm run dev`
3. Open browser at http://localhost:5173
4. Check browser console for errors/warnings
5. Update the "Actual" column above

### Potential issues to watch for

1. **`react-list` package**: Unmaintained since 2019. May have runtime issues with React 19.
2. **Callback ref cleanup**: React 19 calls ref cleanup on every render. The `ref={t => (this.dateRange = t)}` pattern may trigger unexpected null assignments.
3. **Error boundaries**: React 19 changed error handling. Class component error boundaries still work.
4. **`defaultProps`**: On function components, deprecated in React 19. But this library uses class components — unaffected.
5. **Sass `@import` deprecation**: Upstream styles compile today, but Dart Sass 3.0 will remove `@import`. Track this for build modernization, not Alpha 0 React runtime compatibility.

### First runtime observation

The first browser run rendered the calendar and emitted no React/browser console
errors. The initial fixture looked like it had odd range behavior because it
logged `onChange` but did not store the selected range back into React state.
The fixture now uses controlled state with `useState` so interaction testing is
meaningful.

After that fix, range interaction works: selecting a start date and end date
updates the controlled `selection` object and logs the expected dates in the
browser console. This validates basic React 19 render + interaction, but does
not yet cover TypeScript, SSR import safety, scroll virtualization, or deeper
callback-ref behavior.

## Next steps after spike

- If spike passes → proceed to Alpha 0 acceptance criteria
- If spike fails → document exact error, fix in `src/`, re-test

## Related

- [`../../docs/alpha-plan.md`](../../docs/alpha-plan.md) — Alpha 0 acceptance criteria
- [`../../docs/source-provenance.md`](../../docs/source-provenance.md) — Where the code came from
- Upstream issues: [#661](https://github.com/hypeserver/react-date-range/issues/661), [#662](https://github.com/hypeserver/react-date-range/issues/662)
