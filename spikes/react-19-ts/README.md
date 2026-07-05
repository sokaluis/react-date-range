# Spike: React 19 + TypeScript Compatibility

> Minimal Vite + React 19 + TypeScript fixture that imports `@cyberlz/react-date-range`
> source directly and runs `tsc --noEmit` to reproduce/verify upstream issues #661/#662.

## Purpose

Determine whether the upstream `react-date-range@2.0.1` source code — and specifically
the existing community types `@types/react-date-range@1.4.10` — work with React 19's
stricter JSX element typing WITHOUT first-party TypeScript declarations.

Reproduce/verify upstream issues:
- [#661] `DateRange cannot be used as a JSX component`
- [#662] JSX type errors

## Setup

```bash
cd spikes/react-19-ts
npm install       # install React 19 + TypeScript + Vite
npm run typecheck # tsc --noEmit
npm run dev       # start dev server (http://localhost:5173)
```

## Versions

| Package | Version |
|---------|---------|
| TypeScript | 5.9.3 |
| react | 19.2.7 |
| @types/react | 19.2.17 |
| Vite | 6.4.3 |
| @vitejs/plugin-react | 4.3.0 |

## What this tests

- **JSX component typing**: Do `DateRangePicker`, `DateRange`, and `Calendar` pass
  React 19's `JSX.ElementType` check?
- **`Range` type strictness**: Are first-party `Range` and `RangeKeyDict` types
  compatible with controlled-state patterns?
- **SCSS type declarations**: Does `tsc` handle `.scss` imports without errors?
- **Component prop spread**: Do typed prop objects `<DateRange {...props} />` pass?
- **Class component compatibility**: Do `React.Component` / `React.PureComponent`
  class types work with React 19's changed `JSX` namespace?

## Results

| Check | Expected | Actual |
|-------|----------|--------|
| `npm install` succeeds | ✅ No peer dep conflicts | ✅ 90 packages, 0 vulnerabilities |
| `tsc --noEmit` passes | ✅ 0 errors | ✅ **Passed — 0 errors** with first-party types |
| `npm run dev` starts | ✅ Vite compiles and serves | ✅ Passed — Vite starts; only Sass `@import` deprecation warnings |
| `<DateRangePicker />` typed props | ✅ No type error | ✅ Passed — first-party `DateRangePickerProps` |
| `<DateRange />` typed props | ✅ No type error | ✅ Passed — first-party `DateRangeProps` |
| `<Calendar />` typed props | ✅ No type error | ✅ Passed — first-party `CalendarProps` |
| `Range` type in useState | ⚠️ `startDate` is `Date \| undefined` | ✅ Working — `useState<Range>()` handles the optional fields |
| SCSS imports typecheck | ✅ No error | ✅ Handled by `declare module '*.scss'` in library's `src/index.d.ts` |

### Key finding: First-party types work with React 19

**Phase 1 (community types)**: `tsc --noEmit` passed with `@types/react-date-range@1.4.10`
re-exported via a spike-only shim. Issues #661/#662 did NOT reproduce — the community
types declare components as `React.Component<Props>`, which are compatible with
React 19's `JSX.ElementType`.

**Phase 2 (first-party types)**: `tsc --noEmit` passes with library-owned
`src/index.d.ts`. The spike no longer depends on `@types/react-date-range` or any
spike-only type shim. Types are resolved from the package's `types` field via
`tsconfig.json` `paths` mapping.

### What changed from Phase 1 to Phase 2

- **Removed** spike-only type shim from `spikes/react-19-ts/src/types/`
- **Removed** `@types/react-date-range` from spike `devDependencies`
- **Added** `src/index.d.ts` to the library — first-party type declarations based on community types shape
- **Added** `"types": "src/index.d.ts"` to root `package.json`
- **Added** `@types/react` to library `devDependencies` (needed for `.d.ts` imports to resolve)

## Blockers and findings

### 1. No JSX component type errors (confirmed with first-party types)

**Finding**: Both community types and first-party types declare components as
`React.Component<Props>` class components, which are compatible with React 19's
`JSX.ElementType`. The upstream issues #661/#662 likely arise when:

- `@types/react` v18 and v19 are both present (dual-package hazard)
- The consumer uses `React.FC`-style types that React 19 removed `children` from
- Or the library has NO types at all (raw `.js` import)

For our fork, this means:
- Class components (`extends React.Component`) are safe for React 19 JSX
- The primary TypeScript blocker was **missing first-party `.d.ts` files**, not
  a fundamental JSX incompatibility

### 2. TypeScript resolution: `.d.ts` imports resolve from library `node_modules`

When a `.d.ts` file inside the library's `src/` imports from `react` or `date-fns`,
TypeScript resolves those imports from the library's own `node_modules`, not the
consumer's. This means the library must have `@types/react` in its `devDependencies`
for consumers to type-check against the library's declarations.

### 3. `Range.startDate` is optional

The `Range` interface has `startDate?: Date | undefined` and `endDate?: Date | undefined`.
This is correct for the library's actual behavior (ranges can have undefined dates)
but requires consumers to handle the optionality when using `useState<Range>()`.

### 4. Vite dev needs TSX + JS JSX transform config

The library source currently contains JSX in `.js` files, and this spike contains
TSX in `src/main.tsx`. The dev fixture works after configuring Vite's esbuild
loader to include `.js`, `.jsx`, `.ts`, and `.tsx` with `loader: 'tsx'`.

This is acceptable for the spike, but the published package should ship compiled
output so consumers do not need custom Vite config.

### 5. Vite production build passes

`npm run build` now passes with the current fixture configuration. Earlier
iterations exposed a Vite `build-import-analysis` limitation around `.js` files
containing JSX, but the current alias/include setup covers the production build.

## Fixture structure

```
spikes/react-19-ts/
├── index.html              # Vite entry point
├── package.json            # React 19 + TypeScript deps (no @types/react-date-range)
├── tsconfig.json           # strict, jsx: react-jsx, bundler resolution
├── vite.config.ts          # JSX loader for library .js files
├── README.md               # This file
└── src/
    └── main.tsx            # Three fixtures: DateRangePicker, DateRange, Calendar
```

## Next steps

- [x] Create first-party `.d.ts` types in `src/` — done (`src/index.d.ts`)
- [x] Add `@types/react@18` compatibility test — done (`../react-18-ts/`)
- [x] Verify Vite dev runtime for React 19 TS — starts with only Sass `@import` warnings
- [ ] Test in a monorepo / dual-package-hazard scenario to reproduce #661/#662
- [ ] Produce compiled package output so consumers do not need JSX-in-`.js` Vite config
- [ ] Modernize Sass/build output so consumers do not see deprecated `@import` warnings

## Related

- [`../../docs/alpha-plan.md`](../../docs/alpha-plan.md) — Alpha 0 acceptance criteria
- [`../react-19/`](../react-19/) — JS-only runtime spike
- [`../../src/index.d.ts`](../../src/index.d.ts) — First-party type declarations
- [`../../src/`](../../src/) — Library source
- Upstream issues: [#661](https://github.com/hypeserver/react-date-range/issues/661), [#662](https://github.com/hypeserver/react-date-range/issues/662)

[#661]: https://github.com/hypeserver/react-date-range/issues/661
[#662]: https://github.com/hypeserver/react-date-range/issues/662
