# Upstream Issue Tracker

> Tracking upstream `hypeserver/react-date-range` issues and PRs against this fork.
> Each entry records the upstream topic, fork status, resolution evidence, and target release.
> Updated as work progresses through prerelease phases.

---

## Resolved in Fork

Issues/PRs that required code changes and have been implemented + verified in this fork.

| # | Upstream Topic | Fork Status | Resolution / Evidence | Target Release | Notes |
|---|----------------|-------------|----------------------|----------------|-------|
| [#661](https://github.com/hypeserver/react-date-range/issues/661) | React 19 peer dependency / compatibility | ✅ Resolved | First-party `src/index.d.ts` + `@types/react@19` — `tsc --noEmit` passes in `spikes/react-19-ts/`. Issue was dual-package-hazard / missing types, not fundamental JSX incompatibility. | Alpha 0.1 | See `spikes/react-19-ts/README.md`. |
| [#662](https://github.com/hypeserver/react-date-range/issues/662) | JSX component type issues with React 19 | ✅ Resolved | Same as #661 — community types declare components as `React.Component<Props>` (class components), compatible with React 19 `JSX.ElementType`. First-party types cover this. | Alpha 0.1 | See `spikes/react-19-ts/README.md`. |
| [#604](https://github.com/hypeserver/react-date-range/issues/604) | JSX/component type issues (earlier report) | ✅ Resolved | Same root cause as #662 — resolved by first-party types. | Alpha 0.1 | Earlier duplicate of #662. |
| [#260](https://github.com/hypeserver/react-date-range/issues/260) | TypeScript support request | ✅ Resolved | First-party `src/index.d.ts` (345 LOC) exported via `package.json` `"types"` field. All component props, utility types, and helper functions typed. | Alpha 0.1 | See `spikes/react-19-ts/README.md` for type analysis. |
| [#439](https://github.com/hypeserver/react-date-range/issues/439) | TypeScript types improvement | ✅ Resolved | First-party types based on community `@types/react-date-range` shape, with React 18/19 compatibility fixes (function declarations instead of `React.Component` to avoid `refs` constraint). | Alpha 0.1 | See `spikes/react-18-ts/README.md`. |
| [#513](https://github.com/hypeserver/react-date-range/issues/513) | TypeScript strict mode issues | ✅ Resolved | First-party types validated against both React 18 and React 19 TypeScript fixtures — `tsc --noEmit` passes (0 errors) in both. | Alpha 0.1 | Dual-package-hazard verified. |
| [#654](https://github.com/hypeserver/react-date-range/pull/654) | date-fns v4 guard / compatibility | ✅ Resolved | Cherry-picked — peer dep narrowed to `date-fns: ^3.0.0` in `package.json`. Prevents silent breakage with date-fns v4. | Alpha 0.1 | Upstream PR not merged; applied directly to fork. |
| [#665](https://github.com/hypeserver/react-date-range/pull/665) | Fix color `ReferenceError` (TDZ self-reference) | ✅ Resolved | Cherry-picked — fallback `|| color` in `DateRange/index.js` resolves temporal dead zone crash when `color` prop is undefined. | Alpha 0.1 | Upstream PR not merged; applied directly to fork. |
| [#508](https://github.com/hypeserver/react-date-range/pull/508) | `focusedRange` end-date handling | ✅ Resolved | Existing logic verified — path already works correctly. Regression test added in `DateRange/index.test.js` to prevent future breakage. | Alpha 0.1 | No code change needed; test-only addition. |
| [#577](https://github.com/hypeserver/react-date-range/issues/577) | Scroll issues in React 18 StrictMode | ✅ Resolved | Two root causes fixed: (1) stale `setTimeout` in `Calendar.componentDidMount` → crash on unmounted `this.list` ref; fixed with timer cleanup in `componentWillUnmount` + null guards. (2) ReactList stale `cachedScrollPosition` after StrictMode double-mount; fixed with `this.list.updateFrameAndClearCache()` (typeof guard). 15 Jest tests pass. User manually verified via browser smoke test in spike fixture. | Alpha 0.1 | See `spikes/scroll-strictmode/README.md`. |
| [#653](https://github.com/hypeserver/react-date-range/issues/653) | Infinite scroll in StrictMode | ✅ Resolved | Same fix as #577 — both issues share the same root cause (StrictMode double-mount + ReactList cache staleness). Verified together. | Alpha 0.1 | See `spikes/scroll-strictmode/README.md`. |
| [#539](https://github.com/hypeserver/react-date-range/pull/539) | `DateInput` min/max typed validation | ✅ Resolved | Editable `DateInput` now rejects values outside `minDate`/`maxDate` and dates in `disabledDates`, matching calendar grid constraints. | Alpha 0.1 | Covered by Slice 1. |
| [#658](https://github.com/hypeserver/react-date-range/issues/658) | `DateRange.updatePreview` temporal dead zone | ✅ Resolved | Hooks migration (Slice 11) organically fixed TDZ — `color` resolved before `setPreview`. Regression lock-in test at commit `eaf0bf3`. | Alpha 0.1 | Covered by Slice 15. |
| [#664](https://github.com/hypeserver/react-date-range/issues/664) | date-fns v4 `addYears is not a function` ( CRA/Webpack) | ✅ Resolved | All source-tree imports use named-export syntax; zero `_dateFns` wrapper references. Build config externalizes `date-fns`. Lock-in audit test at commit `b9ee316`. | Alpha 0.1 | Covered by Slice 15. |
| [#663](https://github.com/hypeserver/react-date-range/issues/663) | date-fns v4 import changes (CRA/Webpack smoke) | ✅ Resolved | Same root fix as #664 — peer dep narrowed to `date-fns: ^3.0.0` prevents v4 import hazard. | Alpha 0.1 | Covered by Slice 15; see also #664. |
| [#607](https://github.com/hypeserver/react-date-range/issues/607) | `disabledDates` prop crash on non-array | ✅ Resolved | Runtime array guard added at Calendar `ForwardedCalendar.resolvedProps` boundary (commit `82736b0`) AND at DateRange component boundary. Both guards use frozen empty-array constant for referential stability. Fix at commit `82736b0` (Calendar) + follow-up guard at DateRange boundary. | Alpha 0.1 | Covered by Slice 15 WU-1 + direct-DateRange follow-up. |
| [#373](https://github.com/hypeserver/react-date-range/issues/373) | Accessibility / keyboard navigation | ✅ Resolved (focus-visible pass) | Visible keyboard focus indicators added for day cells (commit `fd17f9a`) and the remaining tracked controls in this pass: nav arrows, month/year selects, static ranges, and input-range inputs. | Post-1.0 maintenance | DateInput and custom `renderStaticRange` controls are not part of the upstream #373 tracker row and remain separate future audit candidates if needed. |
| [#415](https://github.com/hypeserver/react-date-range/issues/415) | Accessibility improvements | ✅ Resolved (core labels + live regions) | Calendar grid `aria-label` + `aria-roledescription`, InputRangeField `aria-labelledby`, DateDisplay `role="group"` + group label, DateRangePicker `role="region"` + label + `false` opt-out, and committed selection announcements. Covered by PR `707cdd1` (`feat(a11y): add core labels and states`) plus live-region follow-ups. | Post-1.0 maintenance | Month/year announcements live in Calendar via `ariaLabels.liveRegionMonthYear`; selection announcements live in DateRange via `ariaLabels.liveRegionSelection`. |
| [#416](https://github.com/hypeserver/react-date-range/issues/416) | ARIA roles and labels | ✅ Resolved (core labels + live regions) | DefinedRange static range `aria-pressed`, Calendar grid `aria-roledescription`, DateRangePicker region semantics, additive `ariaLabels` type keys, and polite/atomic DateRange selection live region. | Post-1.0 maintenance | Hover, preview, drag movement, and scroll remain intentionally silent to avoid over-announcement. |
| `a11y-live-announce` (PR) | Month/year `aria-live` announcements | ✅ Resolved | Stable `aria-live="polite"` / `aria-atomic="true"` region outside virtualized scroll container. Announces committed month/year navigation (month picker, year picker, prev/next arrows). Hover, drag movement, drag end, selection, and scroll do not announce from Calendar. Customizable via `ariaLabels.liveRegionMonthYear`. Additive `ClassNames.liveRegion`. | Post-1.0 maintenance | Follows upstream #415/#416 core labels work. Selection announcements completed separately in DateRange via `ariaLabels.liveRegionSelection`. |
| `a11y-selection-live-announce` (PR) | DateRange selection `aria-live` announcements | ✅ Resolved | DateRange renders a polite, atomic live region and updates it only after `calcNewSelection` returns the committed normalized range. Customizable via `ariaLabels.liveRegionSelection`; DateRangePicker forwards the key through its existing `ariaLabels` prop. | Post-1.0 maintenance | Real rendered DayCell hover path verified silent; hover, preview, and drag movement do not announce. |
| [#669](https://github.com/hypeserver/react-date-range/pull/669) | RTL styles | ✅ Resolved | Additive `dir?: 'ltr' | 'rtl'` API, `ClassNames.rtl` / `rdrRtl` hook, logical date-range edge styles, RTL navigation glyph mirroring, and horizontal month row reversal. | Post-1.0 maintenance | `navigatorRenderer` remains consumer-owned for custom RTL chevrons/alignment. |

---

## Verified — No Code Change Needed

Issues where investigation confirmed existing behavior is correct, or the issue is environmental/config-related rather than a code bug.

| # | Upstream Topic | Fork Status | Evidence | Notes |
|---|----------------|-------------|----------|-------|
| [#649](https://github.com/hypeserver/react-date-range/issues/649) | date-fns v3/v4 compatibility | ✅ Verified | Peer dep guard (#654) addresses this. No additional code changes needed beyond narrowing peer to `^3.0.0`. | Covered by #654 resolution. |

---

## Pending — Future phases

Issues acknowledged for the fork roadmap but not yet implemented. Scheduled for upcoming phases.

| # | Upstream Topic | Planned Phase | Reason / Approach |
|---|----------------|---------------|-------------------|
| [#495](https://github.com/hypeserver/react-date-range/pull/495) | Cross-month range selection UX | Future UX proposal | Edge-case UX improvement. Low priority compared to core compatibility. |

---

## Deferred / Out of Scope

Issues that are explicitly not planned for this fork, either because they expand scope beyond the fork's mission or are better addressed elsewhere.

| # | Upstream Topic | Decision | Reason |
|---|----------------|----------|--------|

| [#470](https://github.com/hypeserver/react-date-range/pull/470) | Time picker support | ❌ Out of scope | Feature expansion — changes component API. Fork mission is compatibility and maintenance, not new features. |
| [#590](https://github.com/hypeserver/react-date-range/issues/590) | Maintenance / takeover discussion | 📝 Docs only | Upstream repo is archived. This fork IS the maintenance effort. No code change needed — status documented in `research.md` and `fork-roadmap.md`. |

---

## Summary

| Category | Count |
|----------|-------|
| Resolved in fork | 20 |
| Verified (no code change) | 1 |
| Pending future phases | 1 |
| Deferred / Out of scope | 2 |
| **Total tracked** | **24** |
