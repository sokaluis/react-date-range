# Refactor Roadmap — @cyberlz/react-date-range

> Historical checklist for the internal refactor that led to `1.0.0-rc.0`.
> All Slices 1–22 are complete. See [`fork-roadmap.md`](fork-roadmap.md) for the
> current phase plan.

---

## Current status (2026-06-29)

| Item | Status |
|------|--------|
| Current checkpoint | `1.4.0` published as the current stable release after responsive fluid sizing and configurable input popovers; v1.1.1 tag exists at `843b09b` (historical, never promoted). `rc` points to `1.0.0-rc.0`. |
| Public API | Stable for the `1.x` line; no breaking changes planned |
| Internal refactor | ✅ Complete — Slices 1–21 done; Slice 22 docs sweep complete |
| Tree-shaking | ✅ Verified: ~41 KB Calendar-only / ~58 KB DateRangePicker (~17 KB delta) |
| Build | ✅ `tsdown` with multi-entry glob + `unbundle: true` |
| Tests | ✅ `@testing-library/react` harness wired |
| Type-check / lint | ✅ Root `tsconfig.json` and ESLint flat config wired |
| Sass | ✅ `@use` migration complete |
| Strict TypeScript | ✅ `strict: true` enabled; `checkJs` deferred to `1.0.x` |
| Next phase | No committed post-1.0 roadmap yet; future ideas need a separate spec before becoming release phases. |

---

## Completed slices

| Slice | Status | Summary |
|-------|--------|---------|
| 1 — `DateInput` validation | ✅ | Editable date inputs respect `minDate`, `maxDate`, and `disabledDates`. |
| 2 — `DateDisplay` extraction | ✅ | Date display/editing logic extracted from `Calendar`. |
| 3 — `Calendar` hooks migration | ✅ | Main calendar migrated from class internals to hooks. |
| 4 — `Month` / `DayCell` hooks | ✅ | Leaf calendar components migrated to functions/hooks. |
| 5 — `DateRange` / `DefinedRange` / `DateRangePicker` hooks | ✅ | Range components migrated via `stacked-to-main` chain. |
| 6 — Real tree-shaking | ✅ | `tsup` → `tsdown`; multi-entry unbundled output verified empirically. |
| 7 — Sass `@use` | ✅ | Removed Sass `@import` usage for Dart Sass 3.0 readiness. |
| 8 — Root `tsconfig.json` | ✅ | `npm run type-check` now has a real project config. |
| 9 — ESLint | ✅ | Flat config with React and React Hooks plugins wired. |
| 10/10b — Testing-library + `.jsx` cleanup | ✅ | Migrated tests to `@testing-library/react`; fixed JSX-in-`.js` Vite issue by renaming JSX files to `.jsx`; removed obsolete Vite plugin cleanup. |
| 11 — `DateDisplay` / `InputRangeField` hooks | ✅ | Final class components migrated to functions/hooks. |
| 13 — `defaultProps` removal | ✅ | `defaultProps` on `forwardRef` removed in favor of destructuring defaults (React 18+ deprecation). |
| 14 — `DateInput` hooks migration | ✅ | DateInput migrated from PureComponent class to function component with React hooks (useState, useEffect, useCallback). |
| 15 — Upstream bug fixes | ✅ | `disabledDates` array guard (#607); `DateRange.updatePreview` TDZ-safe color fallback (#658); date-fns ESM named-export interop (#664/#663). |
| 16 — Strict TypeScript | ✅ | `tsconfig.json` `strict: true` enabled; `checkJs: true` deferred to `1.0.x`; source JSDoc pass deferred to `1.0.y`. |
| 17 — Dependency modernization | ✅ | `react-list`, `prop-types`, and `src/locale/index.js` removed from build output; `classnames` and `shallow-equal` remain. |
| 21 — Coverage + a11y | ✅ | Coverage gaps closed; navigation and role-based accessibility verified (keyboard focus, ARIA roles). |
| 22 — Documentation sweep | ✅ | All 13 doc files updated to reflect cumulative Slices 13–21 state; new `docs/migration-from-upstream.md` added. |

---

## Next slice

No post-1.0 implementation slice is committed in this roadmap. Visual redesign,
styling API, or theming ideas should be captured as proposals first, then promoted
only after scope, compatibility impact, and maintainer priority are clear.

---

## What not to do in `1.x`

- ❌ Breaking component API changes.
- ❌ Replacing date-fns.
- ❌ New feature expansion such as time picker.
- ❌ Treating speculative visual redesign ideas as committed release phases.
- ❌ Publishing/tagging without the release checklist.

---

## References

| Document | Purpose |
|----------|---------|
| [`fork-roadmap.md`](fork-roadmap.md) | Current phase plan and beta semantics |
| [`build-output.md`](build-output.md) | Build output and tree-shaking details |
| [`release-checklist.md`](release-checklist.md) | Canonical release checklist |
| [`release-flow.md`](release-flow.md) | Tag/npm/GitHub release policy |
| [`upstream-issue-tracker.md`](upstream-issue-tracker.md) | Upstream issue mapping |
