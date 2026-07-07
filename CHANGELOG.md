# Changelog

All notable changes to this fork are documented here.
Published as `@cyberlz/react-date-range` on npm.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For upstream release history (up to `2.0.1`), see [`CHANGELOG.upstream.md`](CHANGELOG.upstream.md).

---

## [Unreleased]

---

## [1.1.0] — 2026-07-07

### Accessibility

- **Calendar grid**: `role="grid"` root now has `aria-label="Calendar"` and `aria-roledescription="month grid"` by default. Both are customizable via `ariaLabels.calendar` and `ariaLabels.calendarRoleDescription`.
- **DefinedRange static ranges**: preset buttons now expose `aria-pressed="true|false"` reflecting the active selection state.
- **InputRangeField**: number-of-days inputs are now programmatically named via `aria-labelledby`, sourced from the rendered label text. Customizable via `ariaLabels.inputRangeField`.
- **DateDisplay**: wrapper now has `role="group"` with `aria-label="Selected date range"` (customizable via `ariaLabels.dateDisplay`). Per-input start/end labels are preserved.
- **DateRangePicker**: wrapper now has `role="region"` with `aria-label="Date range picker"` by default. Opt out by setting `ariaLabels.dateRangePicker === false`.
- `.rdrDay` day buttons now expose a visible `:focus-visible` keyboard focus
  ring while keeping mouse-click focus visually clean.
- `.rdrNextPrevButton` nav arrow buttons now show a visible `:focus-visible`
  keyboard focus ring while keeping mouse-click focus visually clean.
- `.rdrMonthAndYearPickers select` dropdowns now show a visible `:focus-visible`
  keyboard focus ring while keeping mouse-click focus visually clean.
- `.rdrStaticRange` preset buttons now show a visible `:focus-visible` keyboard
  focus ring while keeping mouse-click focus visually clean.
- `.rdrInputRangeInput` start/end inputs now show a visible `:focus-visible`
  keyboard focus ring while keeping mouse-click focus visually clean.
- **Calendar live region**: a stable `aria-live="polite"` region outside the virtualized
  scroll container announces committed month and year navigation changes (month picker,
  year picker, prev/next arrows). Hover, drag movement, drag end, date selection, and
  scroll do **not** announce from Calendar itself.
- **DateRange live region**: committed DateRange selections now announce through a polite,
  atomic live region after range normalization. Customize the spoken copy with
  `ariaLabels.liveRegionSelection`. Hover, preview, and drag-move updates do **not**
  announce.
- **RTL support**: Calendar and DateRangePicker now support additive `dir="rtl"`
  rendering with an `rdrRtl` class hook, mirrored navigation glyphs, horizontal month
  row reversal, and logical range-edge styles. Keyboard arrow behavior is intentionally
  not mirrored.

### Added

- **Cross-month passive-day selection**: `selectablePassive` is now available as an
  opt-in Calendar/DateRange prop. When enabled and scroll virtualization is off,
  adjacent-month passive cells become clickable and keyboard-reachable. Scroll-enabled
  calendars intentionally keep the original passive-cell guard.
- **Demo coverage**: the Vite demo now includes manual QA panels for a11y live regions,
  labeled Calendar controls, cross-month `selectablePassive`, scroll-guard behavior,
  and RTL Calendar/DateRangePicker examples.

### Fixed

- `disabledDates` prop: added runtime array guard at the `<DateRange>` component boundary to prevent crashes when consumers pass `null`, a single `Date`, or other non-array values directly to `<DateRange>` (upstream #607). Mirrors the existing Calendar boundary guard using a frozen empty-array constant for `useMemo`/`useCallback` referential stability. Direct `<DateRange disabledDates={null} />` is now safe without wrapping in `<Calendar>`.
- `DefinedRangeProps.weekStartsOn` TypeScript declaration now matches the strict
  `0 | 1 | 2 | 3 | 4 | 5 | 6` weekday union used by Calendar-related props.

---

## [1.0.1] — 2026-07-05

Patch release for the first post-1.0 maintenance fix.

### Fixed

- `DefinedRange` static weekly ranges now honor `weekStartsOn` for `This Week`
  and `Last Week`, including selected-state detection. This fixes the case where
  consumers using Monday/Saturday week starts still saw Sunday-based static range
  math.

---

## [1.0.0-rc.0] — 2026-06-29

First release candidate. All internal refactor slices (13–22) completed; public API stable since `0.1.0-beta.0`. Consumer validation window open before promoting to `1.0.0` stable.

> **Install:** `npm install @cyberlz/react-date-range@rc`
> **Migrating from upstream?** See [`docs/migration-from-upstream.md`](docs/migration-from-upstream.md).

### Added

- Documentation sweep: existing docs updated to reflect Slices 13–21 cumulative state; new `docs/migration-from-upstream.md` added; public API byte-identical to `0.1.0-beta.0` (Slice 22).
- `src/index.d.ts`: `DateInputProps` interface (13 keys, alphabetical) and `DateInput`
  function declaration added as type-only contracts. `DateInput` is NOT exported from
  `src/index.js` runtime barrel — this is a type-only surface addition per obs #8626.
  Defaults: `readOnly=true`, `disabled=false`, `dateDisplayFormat='MMM D, YYYY'`,
  `disabledDates=[]`.

### Changed

- `tsconfig.json`: `strict: true` now enabled. `checkJs: true` explicitly deferred to
  `1.0.x` per Option X user directive (m0123) — source JSDoc pass (REQ-TS-004) is
  also a `1.0.y` concern. Tests remain excluded via `**/*.test.js` and are unchanged
  (91/91 green).
- DateInput: migrated from PureComponent class to function component with React hooks (useState, useEffect, useCallback). No public API change. Per-method destructuring defaults preserved (Slice 13). Tests rewritten to @testing-library/react (82/82 green).

### Fixed

- `disabledDates` prop: added runtime array guard at Calendar boundary to prevent crashes when consumers pass `null`, a single `Date`, or other non-array values (upstream #607). Guard uses a frozen empty-array constant to preserve `useMemo`/`useCallback` referential stability. Regression test covers null, single-Date, and valid-array paths (3 new Calendar tests).
- `DateRange.updatePreview` color fallback chain: verified TDZ-safe — regression lock-in test confirms `color` is resolved before `setPreview` (upstream #658, already organically fixed by hooks migration in Slice 11).
- `date-fns` ESM interop: verified all source-tree imports use named-import syntax; zero `_dateFns` wrapper references exist. Build config (`tsdown.config.ts`) externalizes `date-fns`. Regression lock-in audit test added (upstream #664/#663).

> **Known limitation**: direct `<DateRange disabledDates={null} />` (NOT wrapped in `<Calendar />`) bypasses the Calendar-boundary guard and may still crash. Consumers should always wrap DateRange in Calendar. A future slice may add a guard at the DateRange boundary.

---

## [1.0.0] — 2026-06-29

Stable release. `1.0.0-rc.0` was validated through consumer spikes (React 18/19, SSR CJS+ESM, tree-shaking) and demo build/typecheck. This commit finalizes stable metadata; npm publish and git tag to follow.

### Added

- CHANGELOG, README, and doc metadata updated to reflect `1.0.0` stable. Install guidance now says `npm install @cyberlz/react-date-range` (no tag) post-publish.

### Documentation

- All "stable pending / Slice 25 pending" wording updated to "stable — this commit prepares metadata; publish/latest-promotion to follow".
- `docs/migration-from-upstream.md` install instructions updated to reflect stable target.
- `docs/release-checklist.md`, `docs/release-flow.md`, `docs/fork-roadmap.md`, `docs/refactor-roadmap.md` all updated to remove "pending Slice 25" references.

> **rc.0 consumers**: `npm install @cyberlz/react-date-range@1.0.0-rc.0` remains valid and unchanged. After npm publish, `latest` will point to `1.0.0` and plain `npm install @cyberlz/react-date-range` will resolve to stable.

---

## [0.1.0-beta.0] — 2026-06-28

First beta release. Internal refactor complete (Slices 1–11): all components migrated to function + hooks, real tree-shaking verified (41KB Calendar-only / 58KB DateRangePicker), build migrated to `tsdown`, Sass `@use` ready for Dart Sass 3.0, ESLint and TypeScript check wired, tests migrated to `@testing-library/react`. Public API unchanged.

> **Beta scope (redefined)**: This beta is "internal refactor done, public API frozen". Visual redesign ideas are intentionally not part of the beta/stable commitment; they require a separate proposal before becoming release work.

### Added

- All class components migrated to function components with hooks.
- Real tree-shaking via `tsdown` with multi-entry glob + `unbundle: true` (verified empirically with `spikes/tree-shaking/analyze.mjs`).
- ESLint flat config with `eslint-plugin-react` and `eslint-plugin-react-hooks`.
- Root `tsconfig.json` so `npm run type-check` is meaningful.
- `jest.setup.js` for `@testing-library/jest-dom` matchers.
- Slice 1 (`DateInput` validation), Slice 2 (`DateDisplay` extraction), Slice 3 (Calendar hooks), Slice 4 (Month/DayCell hooks), Slice 5 (DateRange/DefinedRange/DateRangePicker hooks via `stacked-to-main` chain), Slice 6 (tree-shaking real), Slice 7 (Sass `@use`), Slice 8 (root tsconfig), Slice 9 (ESLint), Slice 10/10b (testing-library + `.jsx` rename + Vite plugin cleanup), Slice 11 (DateDisplay/InputRangeField hooks).

### Changed

- Build tool: `tsup` → `tsdown` (same author, drop-in replacement; preserves `export { default as X } from` syntax needed for tree-shaking).
- Build pipeline now emits `dist/index.cjs` + `dist/index.mjs` (was `dist/index.js` + `dist/index.mjs`); `package.json#main` and `exports["."].require` updated.
- `package.json#sideEffects`: `["*.css"]` (unchanged but verified against the new build output).
- `defaultProps` on `forwardRef` removed in favor of destructuring defaults (React 18+ deprecation).

### Fixed

- `DefinedRange` runtime crash with `Cannot read properties of undefined (reading 'map')` when consumers pass `staticRanges` undefined.
- `package.json#main` mismatch with `tsdown` output (ssr-import CJS spike).
- Vite's `build-import-analysis` failure on `.js` files containing JSX (root-cause fix: rename to `.jsx`).
- Calendar `react-hooks/exhaustive-deps` warnings on `useMemo` deps (2 pre-existing warnings deferred; non-blocking).

### Commits included

- `f0b8561` refactor: migrate DateDisplay and InputRangeField to function components
- `3936cb6` fix(build): point package.json main/exports to dist/index.cjs
- `9bf6bf1` fix(DefinedRange): use destructuring defaults instead of defaultProps
- `34b07e0` test+build: migrate to testing-library + rename JSX files to .jsx
- `b5b2c5f` build: add eslint flat config + react/react-hooks plugins; fix display warnings
- `3ad605e` build: add root tsconfig.json so npm run type-check works
- `5af9826` docs: update README to reflect 0.1.0-alpha.3 state (tsdown + tree-shaking)
- `14429ce` docs(tree-shaking): update spike to reflect real tree-shaking post-slice 6
- `6c77d5d` chore: prepare 0.1.0-alpha.3 release metadata
- `8791e13` style: migrate sass @import to @use for dart-sass 3.0
- `e2eb84d` docs: mark tree-shaking slice complete, propose tooling debt
- `e141852` build: migrate from tsup to tsdown for real tree-shaking
- `9f991ea` docs: mark daterange hooks slice complete
- `1a5755f` refactor: migrate daterangepicker to hooks
- `a34f3f4` refactor: migrate definedrange to hooks
- `c8ebd65` refactor: migrate daterange to hooks
- `3323607` refactor: migrate month and daycell to hooks

---

## [0.1.0-alpha.3] — 2026-06-28

Fourth alpha release: full class-to-function migration, real tree-shaking, and Sass `@use` modernization.

### Added

- Real tree-shaking: migrated build from `tsup` to `tsdown` with `unbundle: true` and multi-entry glob. Each component is now emitted as its own file (`dist/components/<Component>/index.{cjs,mjs}`).
- Tree-shaking analyzer in `spikes/tree-shaking/analyze.mjs` with structural symbol assertions and 5KB minimum-delta check.

### Changed

- `Month`, `DayCell`, `DateRange`, `DefinedRange`, and `DateRangePicker` migrated from class components to function components with hooks. `DayCell` uses `useState` for `hover`/`active`; the daterange components use `forwardRef` + `useImperativeHandle` to preserve the `DateRange` → `DateRangePicker` imperative coupling.
- `tsup` removed from devDependencies; `tsdown` added.
- Build config now uses `tsdown` with `unbundle: true`, multi-entry glob (`src/**/*.{js,jsx}` excluding tests), and `deps.neverBundle` for React/prop-types/date-fns.
- Sass `src/styles.scss` migrated from `@import` to `@use` with `as *` (Dart Sass 3.0 readiness). Output CSS is byte-identical.

### Fixed

- `dist/index.{cjs,mjs}` now preserves the `export { default as X } from` re-export syntax, allowing bundlers to tree-shake unused components. Confirmed empirically: `import { Calendar } from '@cyberlz/react-date-range'` resolves to ~41KB vs ~58KB for `import { DateRangePicker }` (17KB tree-shakeable delta).
- Sass `@import` deprecation warnings removed from build output (Dart Sass 3.0 will remove `@import`).

### Warnings / Technical debt (still pending)

- `react-test-renderer` deprecation noise in test output (planned migration to `@testing-library/react`).
- Root `tsconfig.json` not present; `npm run type-check` exits 1 with TypeScript help.
- ESLint config not wired (`npm run lint` not runnable).
- `DateDisplay` and `InputRangeField` still class components (out of scope for this slice).

### Commits included since `0.1.0-alpha.2`

- `3323607` Slice 4: `Month`/`DayCell` to hooks
- `c8ebd65` Slice 5a: `DateRange` to hooks
- `a34f3f4` Slice 5b: `DefinedRange` to hooks
- `1a5755f` Slice 5c: `DateRangePicker` to hooks
- `e141852` Slice 6: `tsup` → `tsdown` migration
- `8791e13` Slice 7: Sass `@import` → `@use`

---

## [0.1.0-alpha.2] — 2026-06-26

Third alpha release: Calendar hooks migration and ReactList ESM/CJS interop fix.

### Added

- Calendar behavior safety net and demo verification aids.
- Demo now resolves local source (`file:`) for manual QA and has QA logs disabled by default.

### Changed

- Calendar migrated from class internals to hooks in chained slices, preserving behavior.

### Fixed

- ReactList ESM/CJS interop for Vite/browser path.

### Warnings / Technical debt

- `react-test-renderer` deprecation noise in test output (planned migration to `@testing-library/react`).
- Sass `@import` deprecation warnings in build output (later resolved by the `@use` migration).
- Root lint/typecheck tooling debt: `npm run lint` and `npm run type-check` are not yet wired into CI.

---

## [0.1.0-alpha.1] — 2026-06-25

Second alpha release: DateInput validation and DateDisplay extraction.

### Added

- `DateInput` validation for `minDate`, `maxDate`, and `disabledDates`. The editable
  date input (when `editableDateInputs={true}`) now respects the same constraints as
  the visual grid, rejecting out-of-range dates before passing them to `onChange`.
- `DateDisplay` component extracted from `Calendar.renderDateDisplay()`. Reduces
  `Calendar` complexity and enables independent testing of the date-display/editing
  logic.

### Changed

- `Calendar.renderDateDisplay()` now passes `minDate`, `maxDate`, and `disabledDates`
  to `DateInput` so the input respects the same constraints as the grid.

---

## [0.1.0-alpha.0] — 2026-06-25

First public alpha release. Drop-in replacement for `react-date-range@2.0.1` with
React 18/19 compatibility, TypeScript types, modern build pipeline, and critical
bug fixes.

### Added

- First-party TypeScript declarations (`src/index.d.ts`, 345 LOC) covering all
  exported components, props, utility types, and helper functions.
- ESM + CJS dual build via tsup.
- Compiled CSS output (Sass → CSS) so consumers do not need SCSS loaders.
- `package.json` `exports` map (`.`, `./styles.css`, `./theme/default.css`).
- `"sideEffects": ["*.css"]` to protect CSS imports from tree-shaking.
- React 18 + TypeScript spike (`spikes/react-18-ts/`).
- React 19 + TypeScript spike (`spikes/react-19-ts/`).
- Consumer JS/TSX smoke-test fixtures (`spikes/consumer-js/`, `spikes/consumer-tsx/`).
- SSR import safety fixture (`spikes/ssr-import/`).
- Scroll StrictMode spike (`spikes/scroll-strictmode/`) with Vite + React 19 fixtures.
- Tree-shaking analysis spike (`spikes/tree-shaking/`) — limitation documented.
- 15 Jest tests for Calendar scroll safety (including StrictMode guards).
- CI workflow (`.github/workflows/ci.yml`) — build, tests, and spike typechecks.
- Canonical release checklist (`docs/release-checklist.md`).

### Changed

- Peer dependencies narrowed to `react: ^18.0.0 || ^19.0.0`, `react-dom: ^18.0.0 || ^19.0.0`, `date-fns: ^3.0.0`.
- Components declared as function declarations in `.d.ts` for React 18/19 dual
  compatibility (avoids `refs` constraint on `React.Component`).

### Fixed

- [#577](https://github.com/hypeserver/react-date-range/issues/577) / [#653](https://github.com/hypeserver/react-date-range/issues/653):
  Scroll crash in React 18/19 StrictMode. Two root causes:
  1. Stale `setTimeout` in `Calendar.componentDidMount` → crash on unmounted ref.
     Fixed with timer cleanup in `componentWillUnmount` + null guards.
  2. ReactList stale `cachedScrollPosition` after StrictMode double-mount.
     Fixed with `this.list.updateFrameAndClearCache()` (typeof guard).
- [#654](https://github.com/hypeserver/react-date-range/pull/654):
  date-fns v4 guard — peer dep pinned to `^3.0.0` to prevent silent breakage.
- [#665](https://github.com/hypeserver/react-date-range/pull/665):
  Fix color `ReferenceError` (TDZ self-reference) in `DateRange/index.js`.
- [#508](https://github.com/hypeserver/react-date-range/pull/508):
  `focusedRange` end-date handling — regression test added; path already works.

### Known limitations

- **Tree-shaking**: Current `bundle: true` produces single-file output; all exports
  are always included (~57 KB). Fix planned for Beta 1.0 (`bundle: false`).
  See `spikes/tree-shaking/README.md`.
- **Sass `@import` deprecation**: Build emits deprecation warnings. Migration to
  `@use`/`@forward` was planned as follow-up work and later resolved.
