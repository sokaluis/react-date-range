# Changelog

All notable changes to this fork are documented here.
Published as `@cyberlz/react-date-range` on npm.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For upstream release history (up to `2.0.1`), see [`CHANGELOG.upstream.md`](CHANGELOG.upstream.md).

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
  `@use`/`@forward` planned for Phase 2.
