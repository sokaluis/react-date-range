# Migrating from `react-date-range` upstream

> `@cyberlz/react-date-range` is the maintained drop-in fork for `react-date-range@2.0.1`. `v1.4.0` is the current stable release on npm `latest`. `1.0.0-rc.0` remains available on the historical `rc` tag.

## TL;DR

`@cyberlz/react-date-range` is a community-maintained fork of `hypeserver/react-date-range` targeting React 18/19 compatibility, first-party TypeScript types, modern build tooling, additive accessibility/RTL improvements, input-trigger picker components (`DatePickerInput`, `DateRangeInput`), configurable responsive/fluid layouts, and configurable UI slots/tokens. Install `@cyberlz/react-date-range` in place of `react-date-range@2.0.1`; plain install resolves to the current stable `1.4.0` from npm `latest`. If you were using `prop-types` or `react-list` as runtime dependencies, or deep-importing `react-date-range/dist/locale`, see [What you need to do](#what-you-need-to-do).

---

## What changed

### Removed runtime dependencies

The following packages were runtime dependencies of upstream `react-date-range@2.0.1` and are **no longer shipped** in this fork:

| Removed package | Reason | Replacement |
|-----------------|--------|-------------|
| `prop-types` | Was used for runtime PropTypes validation. Fork ships first-party TypeScript types instead (`src/index.d.ts`). | `@cyberlz/react-date-range` ships TypeScript types — no runtime `prop-types` needed. Drop `prop-types` from your `dependencies` if you added it solely for this package. |
| `react-list` | Was used for the Calendar scroll container. Removed in Slice 17; Calendar uses native scrolling. | No replacement — the scroll container is native browser scrolling. |
| `src/locale/index.js` | Was a deep-importable locale bundle (`react-date-range/dist/locale/index.cjs`). Deprecated; locale should be handled via `date-fns` directly. | Use `date-fns/locale` directly (e.g., `import { enUS } from 'date-fns/locale'`). |

### Compilation improvements

The fork uses [`tsdown`](https://github.com/yyongjae/tsdown) for compilation, which produces both ESM and CJS outputs from a single TypeScript source:

- **Dual output**: `dist/index.mjs` (ESM) + `dist/index.cjs` (CJS). Your bundler picks the correct format automatically.
- **React 18 + 19**: Peer dependency is `react: ">=17"` with `tsx` JSX transform. Both React 18 and React 19 are verified via `tsc --noEmit` in `spikes/react-19-ts/`.
- **First-party TypeScript**: All component props, utility types, and helper functions are typed in `src/index.d.ts` (345 LOC). No `@types/react-date-range` needed.
- **Tree-shaking verified**: Importing only `Calendar` yields ~41 KB; full `DateRangePicker` is ~58 KB (verified in `spikes/react-19-ts/`).

### Behavior fixes (silent — may surface latent consumer bugs)

These upstream bugs were fixed in this fork. They are "silent" fixes because existing correct usage is unaffected, but code that was working around the bugs may now behave differently:

| Upstream issue | What happened | Fix evidence |
|----------------|---------------|--------------|
| [#658](https://github.com/hypeserver/react-date-range/issues/658) — `DateRange.updatePreview` temporal dead zone | Upstream could crash with `ReferenceError: Cannot access 'color' before initialization` when `color` prop was undefined. | Hooks migration in Slice 11 organically fixed this. Regression lock-in test at commit `eaf0bf3`. |
| [#664](https://github.com/hypeserver/react-date-range/issues/664) / [#663](https://github.com/hypeserver/react-date-range/issues/663) — `addYears is not a function` | date-fns v4 changed default export syntax. Fork ships `date-fns: ^3.0.0` and all internal imports use named-export syntax. | Lock-in audit test at commit `b9ee316`. |
| [#607](https://github.com/hypeserver/react-date-range/issues/607) — `disabledDates` crash on non-array | Passing `disabledDates={null}` or a single `Date` to `<Calendar>` or directly to `<DateRange>` could crash. | Runtime array guard added at both Calendar `ForwardedCalendar.resolvedProps` boundary (commit `82736b0`) and DateRange component boundary. Both guards use a frozen empty-array constant for `useMemo`/`useCallback` referential stability. |

### API additions (type-only)

The following are type-only additions — they do not appear in the runtime barrel (`src/index.js`) and do not change runtime behavior:

| Addition | Type | Notes |
|---------|------|-------|
| `DateInputProps` interface | `type` | 13 keys including `minDate`, `maxDate`, `disabledDates`, `value`, `onChange`, `onFocus`, `onBlur`, `dateDisplayFormat`, `readOnly`, `disabled`, `placeholder`, `ariaLabel`, `className`. |
| `DateInput` function declaration | `type` | Type-only declaration for the `DateInput` component. Not exported from `src/index.js` runtime barrel — import it only for TypeScript type annotations. |

---

## What you need to do

In most cases, **no code changes are required**. `@cyberlz/react-date-range` keeps the upstream component API compatible for the `1.x` line. Stable installs use plain npm latest:

```bash
npm install @cyberlz/react-date-range
```

If you encounter issues, check the following:

1. **Replace the package**: `npm install @cyberlz/react-date-range`. Use `@rc` only if you explicitly need the historical `1.0.0-rc.0` validation build.
2. **Drop `prop-types` if unused**: If `prop-types` was in your `dependencies` solely because `react-date-range` required it, remove it. First-party TypeScript types are included.
3. **Replace `src/locale` deep-imports**: If your code imports `react-date-range/dist/locale/index.cjs` or similar deep paths, replace with `date-fns/locale` directly:
   ```ts
   // Before
   import { enUS } from 'react-date-range/dist/locale/index.cjs';

   // After
   import { enUS } from 'date-fns/locale';
   ```
4. **No other changes needed**: All public component props, event signatures, and return types are unchanged.

For the full list of changes, see the [CHANGELOG](../CHANGELOG.md) `1.0.x`, `1.1.x`, `1.2.x`, `1.3.x`, and `1.4.x` entries.

---

## Limitations

| Limitation | Status | Notes |
|------------|--------|-------|
| `strict: true` in `tsconfig.json` | ✅ Enabled (Slice 16) | `checkJs: true` is deferred to `1.0.x`. Source-level JSDoc typed-comments enforcement also deferred. |
| Calendar-boundary guard for `disabledDates` | ✅ Resolved | Both `<Calendar>` and `<DateRange>` boundaries normalize `disabledDates` via a frozen empty-array guard. Direct `<DateRange disabledDates={null} />` no longer crashes (upstream #607). |
| Source JSDoc typed-comments | Deferred | Enforcing TSDoc on all source symbols is a `1.0.y` concern. |

---

## Roadmap

For the full release plan and current maintenance status, see [`docs/fork-roadmap.md`](./fork-roadmap.md). Future visual redesign ideas are not committed release phases yet.

---

## See also

- [CHANGELOG](../CHANGELOG.md) — full release history including upstream history
- [Upstream Issue Tracker](./upstream-issue-tracker.md) — tracked upstream bugs, their resolution status, and evidence
- [Fork Roadmap](./fork-roadmap.md) — stable-line status and future planning policy
