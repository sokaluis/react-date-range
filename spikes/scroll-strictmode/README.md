# Spike: Scroll + StrictMode

> Reproduce/verify upstream issues [#577] and [#653] in `react-date-range-modern`.

## Purpose

Determine whether `DateRange` and `DateRangePicker` with `scroll={{ enabled: true }}`
render correctly under React 19's `<StrictMode>` — and whether the upstream bugs
(blank render, partial render `months + 1`, broken infinite scroll) reproduce in
our modernized fork.

**What's tested:**
- `<DateRange />` + `scroll={{ enabled: true, calendarHeight: 420 }}`
- `<DateRangePicker />` + `scroll={{ enabled: true, calendarHeight: 420 }}`
- Both rendered inside and outside `<StrictMode>` on the same page

## Setup

```bash
cd spikes/scroll-strictmode
npm install       # install React 19 + Vite + deps
npm run typecheck # tsc --noEmit
npm run dev       # start dev server (http://localhost:5173)
```

## Versions

| Package | Version |
|---------|---------|
| React | 19.2.7 |
| @types/react | 19.2.17 |
| TypeScript | 5.8.x |
| Vite | 6.x |
| react-date-range-modern | `file:../..` (built dist/) |

## What to observe

When `npm run dev` is running, open the browser and check:

### ✅ Expected behavior (non-StrictMode)
- Both DateRange and DateRangePicker render with visible months
- Scroll works (swipe/scrollwheel on the `.infiniteMonths` container)
- Months scroll infinitely within the `minDate`–`maxDate` range
- Selecting dates updates the display correctly

### 🔴 Bug symptoms (#577, #653)
- **Blank render**: The calendar area is empty — no months visible
- **Partial render**: Only a few months visible instead of infinite scroll
- **Crash/error**: Console shows `TypeError: Cannot read properties of null` from `this.list.scrollTo`
- **Stale focus**: Focused month doesn't match the selected date after interaction

### Console logging
- Each `onChange` event logs to console with `[label] onChange:` prefix
- StrictMode may show "double render" warnings in React DevTools

## Results

> **Status**: Two-round fix applied. Crash eliminated (round 1). 1926 offset fixed (round 2). Manual browser verification pending.

| Scenario | Renders? | Scroll works? | Console errors? | Notes |
|----------|----------|---------------|-----------------|-------|
| DateRange + StrictMode | ✅ | ⬜ | ⬜ | Fix #2 applied (Jun 2026) — manual browser check pending |
| DateRangePicker + StrictMode | ✅ | ⬜ | ⬜ | Fix #2 applied (Jun 2026) — manual browser check pending |
| DateRange + non-StrictMode | ⬜ | ⬜ | ⬜ | Manual browser check pending |
| DateRangePicker + non-StrictMode | ⬜ | ⬜ | ⬜ | Manual browser check pending |

**Code-level verification performed (round 2):**
- ✅ Root cause identified: ReactList's `updateScrollParent` skips re-adding the scroll listener after StrictMode double-mount when `scrollParent` DOM reference is unchanged — plus stale `cachedScrollPosition` from first mount causes `getVisibleRange()` to return wrong indices
- ✅ Fix applied: `focusToDate` and `handleScroll` now call `this.list.updateFrameAndClearCache()` to clear stale cache and force ReactList recalculation
- ✅ 15 Jest tests pass (Calendar StrictMode scroll safety suite — 5 new tests for updateFrameAndClearCache)
- ✅ `npm run build` succeeds — fix confirmed in `dist/index.mjs` and `dist/index.js`
- ✅ `npm run typecheck` passes in spike — 0 TypeScript errors
- ✅ `npx vite build` in spike — compiles successfully (345 modules)

**To complete manual verification:**
```bash
cd spikes/scroll-strictmode
npm install
npm run dev
# Open http://localhost:5173 in browser
# Observe the 4 panels (2 StrictMode + 2 non-StrictMode)
# StrictMode panels should now show months around 2026 (not 1926)
# Check console for any errors
```

## Root cause analysis

### Crash (round 1 — fixed Nov 2026)

The `Calendar` component uses `react-list` for virtualization when `scroll.enabled === true`.
In `componentDidMount`, it schedules a `setTimeout` to scroll to the focused date:

```js
componentDidMount() {
  if (this.props.scroll.enabled) {
    setTimeout(() => this.focusToDate(this.state.focusedDate));
  }
}
```

Under React StrictMode double-mount:
1. First mount → `setTimeout` 1 scheduled
2. Unmount → `this.list` ref nulled, no cleanup of timer
3. Second mount → `setTimeout` 2 scheduled
4. Timer 1 fires → `this.list` is null → `TypeError` crash
5. Timer 2 fires → works correctly (if timer 1's crash didn't disrupt)

**Additionally**: `Calendar` has no `componentWillUnmount` to clear the timer.
`react-list` itself handles cleanup correctly, but the wrapping Calendar does not.

### 1926 offset (round 2 — fixed Jun 2026)

After round 1 eliminated the crash, manual browser testing revealed a deeper bug:
Under StrictMode the calendar rendered correctly but STAYED at index 0 (months from 1926
instead of scrolling to 2026). The root cause is in ReactList's internal scroll listener
management:

1. **First mount**: ReactList.componentDidMount → `updateScrollParent()` →
   `scrollParent.addEventListener('scroll', updateFrameAndClearCache)`
2. **StrictMode unmount**: ReactList.componentWillUnmount →
   `scrollParent.removeEventListener('scroll', updateFrameAndClearCache)` ✓
3. **StrictMode remount**: ReactList.componentDidMount → `updateScrollParent()` →
   **`if (prev === this.scrollParent) return;`** → listener NOT re-added ✗
4. Calendar calls `this.list.scrollTo(1200)` → DOM scrolls to position ~288000px →
   scroll event fires → Calendar's `onScroll` handler fires but `this.list.getVisibleRange()`
   returns `[undefined, undefined]` because ReactList's state still reflects `from=0, size=~4`
   (rendered items 0..4 are at translate(0,0), far above the viewport at scrollTop=288000)
5. Additionally, `getScrollPosition()` returns a stale `cachedScrollPosition` (~0)
   from the first mount, causing `getStartAndEnd()` and `getVisibleRange()` to compute
   wrong values even if called

Net effect: the DOM scroll container moves to the correct position but ReactList
never re-renders items for that scroll position. The user sees either empty space
or the initial 1926 items (depending on exact scroll behavior).

## Fixes applied

### Round 1 (Nov 2026): Crash prevention

**What was changed in `src/components/Calendar/index.js`:**

1. **`componentDidMount`**: Store the timer ID → `this._focusTimer = setTimeout(...)`
2. **`componentWillUnmount`** (new): Clear the timer → `clearTimeout(this._focusTimer)`
3. **`focusToDate`**: Null guard → `if (!this.list) return;` (safety net)
4. **`updateShownDate`**: Null guard → `this.list ? this.list.getVisibleRange().length : props.months`
5. **`handleScroll`**: Null guard → `if (!this.list) return;`

### Round 2 (Jun 2026): Virtual scroll offset fix

**What was changed in `src/components/Calendar/index.js`:**

1. **`focusToDate`**: After `this.list.scrollTo(targetMonthIndex)`, call
   `this.list.updateFrameAndClearCache()` (behind typeof guard) to clear
   ReactList's stale `cachedScrollPosition` and force recalculation of the
   visible range.

2. **`handleScroll`**: Before `this.list.getVisibleRange()`, call
   `this.list.updateFrameAndClearCache()` to ensure ReactList's internal
   state reflects the current DOM scroll position — critical when ReactList's
   native scroll listener was lost due to StrictMode's double-mount cycle.

**Why this is narrow and safe:**
- `updateFrameAndClearCache` is ReactList's own public method, used internally
  by its scroll/resize handlers — we're invoking the same recalculation path
- The `typeof` guard ensures compatibility with any ReactList version
- In non-StrictMode (production), ReactList's native listener already handles
  scroll events, so our call is a fast no-op (state unchanged → no re-render)
- Both changes are additive: existing behavior is preserved for all non-scroll
  paths and non-StrictMode scroll paths

## Related

- [`../../docs/alpha-plan.md`](../../docs/alpha-plan.md) — Alpha 0 acceptance criteria (#577/#653 listed)
- [`../../src/components/Calendar/index.js`](../../src/components/Calendar/index.js) — Calendar with scroll logic
- Upstream issues: [#577](https://github.com/hypeserver/react-date-range/issues/577), [#653](https://github.com/hypeserver/react-date-range/issues/653)

[#577]: https://github.com/hypeserver/react-date-range/issues/577
[#653]: https://github.com/hypeserver/react-date-range/issues/653
