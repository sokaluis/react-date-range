# Refactor Roadmap — @cyberlz/react-date-range

> Historical checklist for the internal refactor that led to `0.1.0-beta.0`.
> All Slices 1–11 are complete. See [`fork-roadmap.md`](fork-roadmap.md) for the
> current phase plan.

---

## Current status (2026-06-28)

| Item | Status |
|------|--------|
| Current checkpoint | `0.1.0-beta.0` prepared |
| Public API | Stable for the `0.1.x` line; no breaking changes planned |
| Internal refactor | ✅ Complete — Slices 1–11 done |
| Tree-shaking | ✅ Verified: ~41 KB Calendar-only / ~58 KB DateRangePicker (~17 KB delta) |
| Build | ✅ `tsdown` with multi-entry glob + `unbundle: true` |
| Tests | ✅ `@testing-library/react` harness wired |
| Type-check / lint | ✅ Root `tsconfig.json` and ESLint flat config wired |
| Sass | ✅ `@use` migration complete |
| Next phase | Phase 2 stylability for `0.2.0` |

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

---

## Next slice

The next work is **Phase 2 stylability** for `0.2.0`:

- CSS variables / design tokens.
- `className` pass-through where missing.
- Public styling API documentation.

This work should be additive and preserve the stable `0.1.x` public API.

---

## What not to do in `0.1.x`

- ❌ Breaking component API changes.
- ❌ Replacing date-fns.
- ❌ New feature expansion such as time picker.
- ❌ Dual-skin architecture before Phase 2 styling primitives are in place.
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
