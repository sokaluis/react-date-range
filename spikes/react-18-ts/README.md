# Spike: React 18 + TypeScript Compatibility

> Minimal Vite + React 18 + TypeScript fixture that imports `react-date-range-modern`
> source directly and runs `tsc --noEmit` to validate first-party type declarations
> work with `@types/react@18`.

## Purpose

Prove that `react-date-range-modern`'s first-party TypeScript declarations
(`src/index.d.ts`) are compatible with React 18 types — not just React 19.
This is critical for the supported React range `^18.0.0 || ^19.0.0` in
the library's peer dependencies.

## Setup

```bash
cd spikes/react-18-ts
npm install       # install React 18 + TypeScript + Vite
npm run typecheck # tsc --noEmit
npm run dev       # start dev server (http://localhost:5173)
```

## Versions

| Package | Version |
|---------|---------|
| TypeScript | 5.9.3 |
| react | 18.3.1 |
| @types/react | 18.3.31 |
| @types/react-dom | 18.3.7 |
| Vite | 6.4.3 |
| @vitejs/plugin-react | 4.3.0 |

## What this tests

- **JSX component typing**: Do `DateRangePicker`, `DateRange`, and `Calendar` pass
  `@types/react@18`'s JSX element type check?
- **`Range` type strictness**: Are first-party `Range` and `RangeKeyDict` types
  compatible with `useState<Range>()` patterns?
- **SCSS type declarations**: Does `tsc` handle `.scss` imports without errors?
- **React 18 vs 19 dual-package-hazard**: Do the same `.d.ts` declarations work
  for both `@types/react@18` and `@types/react@19`?

## Results

| Check | Expected | Actual |
|-------|----------|--------|
| `npm install` succeeds | ✅ No peer dep conflicts | ✅ 90 packages, 0 vulnerabilities |
| `tsc --noEmit` passes | ✅ 0 errors | ✅ **Passed — 0 errors** with first-party types |
| `npm run dev` starts | ✅ Vite compiles and serves | ✅ Passed — Vite starts; only Sass `@import` deprecation warnings |
| `<DateRangePicker />` typed props | ✅ No type error | ✅ Passed |
| `<DateRange />` typed props | ✅ No type error | ✅ Passed |
| `<Calendar />` typed props | ✅ No type error | ✅ Passed |
| `Range` type in useState | ✅ Handles optional fields | ✅ Working |
| SCSS imports typecheck | ✅ No error | ✅ Passed |

## Key finding: React 18 `refs` incompatibility (fixed)

### Initial failure (3 errors)

The first-party types originally declared components as class types:

```ts
export class DateRangePicker extends React.Component<DateRangePickerProps> {}
```

This passed with `@types/react@19` but **failed with `@types/react@18`** (3 errors).
React 18's `Component` type has a required `refs` property that React 19 removed.
When a consumer with `@types/react@18` resolves the library's `.d.ts`, the
`React.Component` reference is evaluated against React 18 types, making `refs`
required — and the runtime class doesn't explicitly satisfy it.

### Fix: function declarations

```ts
export function DateRangePicker(props: DateRangePickerProps): React.JSX.Element;
```

Declaring components as functions avoids the `Component` type constraint entirely
while remaining valid JSX for both React 18 and React 19. The runtime is still
a class component; only the type declaration changed.

### Dual-package-hazard awareness

This fix prevents a class of dual-package-hazard errors where a `.d.ts` file's
`React.Component` reference resolves against the *consumer's* `@types/react`
version rather than the *library's*. Function declarations are immune to this
because `FunctionComponent` doesn't carry legacy instance constraints.

## Fixture structure

```
spikes/react-18-ts/
├── index.html              # Vite entry point
├── package.json            # React 18 + TypeScript deps
├── tsconfig.json           # strict, jsx: react-jsx, bundler resolution
├── vite.config.ts          # JSX loader for library .js files
├── README.md               # This file
└── src/
    └── main.tsx            # Three fixtures: DateRangePicker, DateRange, Calendar
```

## Next steps

- [x] Create first-party `.d.ts` types — done (`src/index.d.ts`)
- [x] Fix React 18 `refs` incompatibility — function declarations avoid the constraint
- [x] Verify runtime rendering in dev server (`npm run dev`) — Vite starts; Sass `@import` warnings remain
- [ ] Add CI matrix that type-checks against both `@types/react@18` and `@types/react@19`
- [ ] Test StrictMode / scroll behavior on React 18 (#577, #653)
- [ ] Modernize Sass/build output so consumers do not see deprecated `@import` warnings

## Related

- [`../../docs/alpha-plan.md`](../../docs/alpha-plan.md) — Alpha 0 acceptance criteria
- [`../react-19-ts/`](../react-19-ts/) — React 19 TypeScript spike
- [`../react-19/`](../react-19/) — JS-only runtime spike
- [`../../src/index.d.ts`](../../src/index.d.ts) — First-party type declarations
