# Alpha Plan — Phase 0/1

> Detailed checklist for Alpha 0 (internal spike) and Alpha 1 (public alpha).
> See [`fork-roadmap.md`](fork-roadmap.md) for the full phase overview.
> See [`upstream-issue-tracker.md`](upstream-issue-tracker.md) for the canonical upstream issue status tracker.

---

## Alpha 0 — Internal Spike

**Objective**: Prove React 18/19 + TypeScript compatibility in a local workspace.
No npm publish yet.

### Prerequisites

- [x] External investigation complete
- [x] Fork roadmap defined
- [x] Upstream source (npm `2.0.1`) imported into workspace
  - See [`source-provenance.md`](source-provenance.md) for full import record
- [x] `package.json` updated with real name, peer deps, and scripts
  - Peer deps narrowed to `react: ^18.0.0 || ^19.0.0`, `react-dom: ^18.0.0 || ^19.0.0`
- [x] `LICENSE` copied from upstream with original copyright preserved

### Spike acceptance criteria

### Official React support matrix

Alpha 0/1 should make compatibility explicit instead of inheriting the very broad
peer dependency range from upstream.

| React version | Alpha support target | Notes |
|---------------|----------------------|-------|
| React 19 | ✅ Officially tested | `spikes/react-19-ts/` — `tsc --noEmit` passes (0 errors) and Vite dev starts. Primary modernization goal. |
| React 18 | ✅ Officially tested | `spikes/react-18-ts/` — `tsc --noEmit` passes (0 errors) and Vite dev starts. Required baseline for real adoption and migration safety. |
| React 17 | Not promised yet | May work, but only becomes official after CI/runtime coverage proves it. |
| React 16 and older | Not supported | Avoid carrying obsolete compatibility debt from upstream. |

Recommended initial peer dependency range:

```json
{
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

Do not widen this range unless the test matrix proves it.

#### 1. React 19 compatibility

- [x] Install React 19 in a test app that imports the library
- [x] Render `<DateRangePicker />` without console errors during basic browser test
- [x] Verify JSX component type issues (#661, #662) are resolved
  - ✅ `tsc --noEmit` passes with `@types/react-date-range@1.4.10` + `@types/react@19.2.17`
  - The community types declare components as `React.Component<Props>` (class components), which are compatible with React 19's `JSX.ElementType`
  - #661/#662 likely occur in dual-package-hazard scenarios or when types are missing entirely — not a fundamental JSX incompatibility
  - See [`spikes/react-19-ts/README.md`](../spikes/react-19-ts/README.md) for full findings
- [x] Verify StrictMode scroll issues (#577, #653) do not regress
  - ✅ Round 1 (Nov 2026): Root cause identified — `Calendar.componentDidMount()` schedules a `setTimeout` that calls `this.list.scrollTo()`.
    In StrictMode double-mount, the first instance's timer fires after unmount when `this.list` ref is null → `TypeError`.
    Fix: store timer ID, clear in `componentWillUnmount`, null guards in `focusToDate`/`updateShownDate`/`handleScroll`.
  - ✅ Round 2 (Jun 2026): Visual smoke test discovered remaining bug — calendar rendered but showed 1926 months instead of 2026.
    Deeper root cause: ReactList's `updateScrollParent()` skips re-adding the scroll listener after StrictMode double-mount
    when `scrollParent` DOM reference is unchanged. Combined with stale `cachedScrollPosition` from first mount,
    `getVisibleRange()` returns wrong indices after `scrollTo()`.
    Fix: `focusToDate` and `handleScroll` now call `this.list.updateFrameAndClearCache()` (behind typeof guard)
    to clear stale cache and force ReactList recalculation.
  - ✅ Spike at [`spikes/scroll-strictmode/`](../spikes/scroll-strictmode/) — Vite + React 19 + StrictMode/non-StrictMode fixtures.
  - ✅ 15 Jest tests for Calendar scroll safety (all pass) — 10 original + 5 new for updateFrameAndClearCache.
  - ✅ User manually verified fix via browser smoke test in `spikes/scroll-strictmode/` fixture (React 19 + StrictMode/non-StrictMode).
  - See [`spikes/scroll-strictmode/README.md`](../spikes/scroll-strictmode/README.md) for full findings.
- [x] Code audit completed — all components use class components, no known React-19-breaking APIs
- [x] Spike skeleton created at `spikes/react-19/` with Vite + React 19 dev setup
- [x] Spike executed for basic render + controlled range interaction — `spikes/react-19/README.md` has current status
- [x] Add TypeScript fixture to reproduce/verify JSX component type issues (#661, #662)
  - ✅ Fixture created at `spikes/react-19-ts/` — Vite + React 19 + TypeScript 5.9
  - ✅ `DateRangePicker`, `DateRange`, and `Calendar` all pass JSX component typing
  - ✅ `useState<Range>()` works with optional `startDate`/`endDate` fields
  - ✅ First-party `.d.ts` created at `src/index.d.ts` — spike validates against it (0 errors)
  - ✅ `@types/react-date-range` removed from spike — no longer needed
- [x] Verify React 19 TypeScript runtime fixture starts in Vite dev
  - ✅ `spikes/react-19-ts/` starts with no `vite:import-analysis` error after including `.ts/.tsx` in the esbuild loader
  - ⚠️ Sass emits `@import` deprecation warnings from `src/styles.scss`; this is build/CSS modernization debt, not a React blocker
- [x] Add deeper StrictMode/scroll fixture for virtualized months (#577, #653)
  - ✅ Fixture created at [`spikes/scroll-strictmode/`](../spikes/scroll-strictmode/)

#### 2. TypeScript

- [x] Study `@types/react-date-range` — what it covers, what it misses
  - ✅ Reviewed full type declarations (340 LOC): covers all props, exports, and class shapes
  - Gaps identified: `Range.startDate`/`endDate` are optional but not marked as possibly-undefined in some contexts; no generic `Ref` support; `navigatorRenderer` return type uses `React.JSX.Element`
  - See [`spikes/react-19-ts/README.md`](../spikes/react-19-ts/README.md) for analysis
- [ ] Study `@iroomit/react-date-range` TypeScript port — patterns to adopt or avoid
- [x] Merge or rewrite types so `tsc --noEmit` passes on the library itself
  - ✅ Fixture `tsc --noEmit` passes with re-exported community types
  - ✅ First-party `.d.ts` created at `src/index.d.ts` based on community types shape (345 LOC)
  - ✅ `package.json` `types` field points to `src/index.d.ts`
  - ✅ Spike validates against first-party types (`@types/react-date-range` removed from deps)
  - See [`../spikes/react-19-ts/README.md`](../spikes/react-19-ts/README.md) for full results
- [x] Export types from package entry point
  - ✅ All component props (`DateRangePickerProps`, `DateRangeProps`, `CalendarProps`, `DefinedRangeProps`) exported
  - ✅ Utility types (`Range`, `RangeKeyDict`, `RangeFocus`, `Preview`, `StaticRange`, `InputRange`, etc.) exported
  - ✅ `defaultStaticRanges`, `defaultInputRanges`, `createStaticRanges` typed and exported
- [x] Validate first-party types against React 18 (dual-package-hazard check)
  - ✅ Spike created at `spikes/react-18-ts/` — Vite + React 18 + TypeScript 5.9
  - ✅ `tsc --noEmit` passes (0 errors) after fixing `React.Component` → function declarations in `src/index.d.ts`
  - ✅ Vite dev starts with no `vite:import-analysis` error after including `.ts/.tsx` in the esbuild loader
  - ⚠️ Sass emits the same `@import` deprecation warnings from `src/styles.scss`
  - Fix: React 18's `Component` requires `refs`; function declarations avoid the constraint and are valid JSX for both React 18 and 19
  - See [`../spikes/react-18-ts/README.md`](../spikes/react-18-ts/README.md) for full findings

#### 3. Build modernization

- [x] Produce compiled package output so consumers do not need custom Vite loaders for JSX-in-`.js`
  - ✅ `tsup` bundle: JSX compiled to `createElement`/`jsx()` calls; consumers import plain JS
  - ✅ Output: ESM (`dist/index.mjs`) + CJS (`dist/index.js`)
- [x] Modernize Sass pipeline or ship compiled CSS to avoid exposing deprecated `@import` warnings to consumers
  - ✅ Sass compiled to CSS via `sass` CLI; consumers import `dist/styles.css` (no SCSS exposed)
  - ⚠️ Sass `@import` deprecation warnings still emitted during build; use `@use`/`@forward` migration later
- [x] Choose build tool: Rollup (most control) or tsup (simpler, esbuild-based)
  - ✅ Chose `tsup` — handled JSX-in-`.js` cleanly with `esbuildOptions.loader` override
- [x] Produce ESM output (`.mjs` or `"type": "module"` with `.js`)
  - ✅ `dist/index.mjs` (ESM) via tsup `format: ['esm']`
- [x] Produce CJS output for backward compatibility
  - ✅ `dist/index.js` (CJS) via tsup `format: ['cjs']`
- [x] Configure `package.json` exports map (`"."`, `"./styles.css"`, etc.)
  - ✅ Conditional exports: `"."` (ESM/CJS + types), `"./styles.css"`, `"./theme/default.css"`
  - ✅ `main`, `module`, `types`, `style` fields set
- [x] Verify consumers can import without custom Vite loaders
  - ✅ Smoke-test fixtures: `spikes/consumer-js/` (JS) and `spikes/consumer-tsx/` (TSX)
  - ✅ Both start Vite dev cleanly — no `vite:import-analysis` errors, no custom esbuild loaders
  - ✅ `tsc --noEmit` passes for TSX consumer (0 errors)
- [x] Cherry-pick upstream PR #654: date-fns v4 guard — peer dep pinned to `^3.0.0`
- [x] Cherry-pick upstream PR #665: fix color `ReferenceError` self-reference (TDZ) in `DateRange/index.js`
- [x] Investigate upstream PR #508: `focusedRange={[0,1]}` end-date handling — path already works; regression test added
- [x] Resolve StrictMode scroll issues (#577, #653)
  - ✅ Root cause: stale `setTimeout` in `Calendar.componentDidMount` → crash on unmounted `this.list` ref
  - ✅ Fix: `componentWillUnmount` clears timer + null guards in `focusToDate`, `updateShownDate`, `handleScroll`
  - ✅ 10 Jest tests + spike at `spikes/scroll-strictmode/` — typecheck, build, and test all pass
- [x] Verify tree-shaking works (no side-effect barrel imports)
  - ⚠️ **Tree-shaking NO funciona** con `bundle: true` — todos los exports se incluyen siempre (57 KB fijos)
  - ✅ `"sideEffects": ["*.css"]` agregado a `package.json` — protege imports de CSS
  - 🔜 Fix real requiere `bundle: false` en tsup + `sideEffects: false` (planificado para Beta 1.0)
  - Ver [`../spikes/tree-shaking/README.md`](../spikes/tree-shaking/README.md) para análisis completo

#### 4. SSR / import safety

- [x] Audit all module-scope references to `window`, `document`, `navigator`
  - ✅ Zero module-scope DOM/browser references in src/ or dist/
  - `grep` across src/ and dist/ confirms no `window`, `document`, or `navigator`
- [x] Guard or lazy-init browser-only code
  - ✅ No guards needed — all DOM access happens inside React class component methods (render-time)
  - The package is import-safe out of the box
- [x] Verify `import "@cyberlz/react-date-range"` does not throw in Node.js (SSR context)
  - ✅ `spikes/ssr-import/` — ESM (`dist/index.mjs`) and CJS (`dist/index.js`) both import cleanly
  - Exports verified: Calendar, DateRange, DateRangePicker, DefinedRange, createStaticRanges, defaultInputRanges, defaultStaticRanges
- [x] Verify `import "@cyberlz/react-date-range/styles.css"` can be imported without side effects
  - ✅ CSS is bundler-only; documented in spike README
  - Node does not natively understand CSS; SSR frameworks (Next.js, Remix) handle CSS via their own bundler pipelines

#### 5. Backward compatibility

- [x] Component names unchanged (`DateRange`, `DateRangePicker`, `Calendar`)
- [x] Prop API unchanged (same names, same types)
- [x] Default styles unchanged (CSS classes and selectors preserved)
- [x] date-fns as the date library (no swap to Day.js/luxon)

---

## What to cherry-pick / study first

### From upstream PRs

| Priority | PR | Reason | Status |
|----------|----|--------|--------|
| **1st** | [#654](https://github.com/hypeserver/react-date-range/pull/654) | date-fns v4 guard — unblocks modern date-fns | ✅ Applied — peer dep `^3.0.0` in `package.json` |
| **2nd** | [#665](https://github.com/hypeserver/react-date-range/pull/665) | Fix color `ReferenceError` — runtime crash fix | ✅ Applied — `|| color` TDZ fixed in `DateRange/index.js` |
| **3rd** | [#508](https://github.com/hypeserver/react-date-range/pull/508) | `focusedRange` end-date handling | ✅ Verified + test added — path already works; regression test in `DateRange/index.test.js` |

> Full upstream issue tracking: [`docs/upstream-issue-tracker.md`](upstream-issue-tracker.md)

### From iroomit fork

Study [`iroomitapp/react-date-range`](https://github.com/iroomitapp/react-date-range)
and [`@iroomit/react-date-range@3.2.3`](https://www.npmjs.com/package/@iroomit/react-date-range) for:

- How they structured TypeScript types (good patterns to adopt)
- How they handled date-fns v3 peer deps
- What they changed in the build pipeline
- What issues their users still report (lessons for us)

**Do not fork iroomit directly.** It's inactive and has its own divergence.
Use it as a study reference only.

---

## What to avoid in Alpha 0/1

- ❌ Replacing CSS with Tailwind (Phase 2+)
- ❌ Changing component API (breaks drop-in compatibility)
- ❌ Adding new components or features
- ❌ Swapping date-fns for another library
- ❌ Removing or renaming existing CSS class names
- ❌ Large-scale refactors (keep diff small and reviewable)

---

## Alpha 1 — Public Alpha (prep phase)

**Objective**: First npm publish with `alpha` tag. Real users can test.

**Status**: Prep work done. Publish blocked on name/repo decision (see below).

### Release checklist

- [x] Alpha 0 acceptance criteria fully met
- [x] Choose final package name and npm scope (**resolved**: `@cyberlz/react-date-range`.
- [x] Verify upstream license attribution — `NOTICE.md` and `LICENSE` in place;
  needs author copyright line addition before publish (see `NOTICE.md` line 22)
- [x] Set up automated CI — `.github/workflows/ci.yml`: build, tests (21 passing),
  spike typechecks (5 critical TS fixtures + SSR import safety)
- [x] Write `CHANGELOG.md` — fork changelog created with all Alpha 0 fixes and
  known limitations documented
- [x] Release checklist created — `docs/release-checklist.md` (canonical, covers
  pre-tag, pre-publish, publish, post-publish, demo, and local CI simulation)
- [x] Author/repo fields in `package.json` filled (`Luis Azocar <lazocar.dev@gmail.com>`, `sokaluis/react-date-range`)
- [ ] Publish `0.1.0-alpha.0` to npm with `--tag alpha`
- [ ] Test install in a clean project: `npm install @cyberlz/react-date-range@alpha`
- [ ] Announce in relevant community channels (upstream issues, Reddit, etc.)

### Demo page (no deploy yet)

- [ ] Set up demo page (simple Vite/Next.js app or Storybook)
- See `docs/release-checklist.md` → "Demo page checklist"

### npm publishing notes

See [`npm-publishing.md`](npm-publishing.md) for costs, visibility strategy,
and semver conventions. See [`release-checklist.md`](release-checklist.md) for
the canonical publish workflow.
