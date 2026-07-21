# Post-1.0 Strategic Roadmap — @cyberlz/react-date-range

> **Status: exploratory planning only — not a commitment.**
> This document captures a candidate direction for the `1.x` line and beyond.
> Nothing here is a promised feature or release date. Items require separate
> scoping, review, and maintainer decision before becoming release phases.

---

## Guiding principles

- **Bugfixes stay separate.** Upstream bugs, a11y gaps, and TypeScript/doc issues are
  addressed in `1.0.x` maintenance regardless of any roadmap phase.
- **No new framework wrappers before a framework-agnostic core.** Any Vue/Svelte/Solid
  wrapper is only viable after extracting `@cyberlz/date-range-core` (see 2.x/Labs).
- **Composition before skins.** Visual variants (classic, booking, dashboard, etc.)
  only become maintainable after the base Calendar exposes stable state hooks,
  recipe-level docs, and app-friendly styling escape hatches.
- **Tailwind is optional, not required.** The library should become easier to style
  from Tailwind apps, but Tailwind must not become a required runtime or build-time
  dependency for every consumer.

---

## Maintenance track (runs in parallel)

### 1.0.x — Maintenance

- Reproducible upstream audit bugs from
  [issue #2](https://github.com/sokaluis/react-date-range/issues/2):
  - `findNextRangeIndex` guard for non-array `ranges`
  - null `startDate` / `endDate` handling so empty ranges do not mark every day in range
- Small accessibility improvements (ARIA, keyboard, focus) — core labels/states completed in PR `707cdd1`: Calendar grid `aria-label` + `aria-roledescription`, DefinedRange `aria-pressed`, InputRangeField `aria-labelledby`, DateDisplay `role="group"`, DateRangePicker `role="region"` + `false` opt-out. Live region work is split by ownership: Calendar announces committed month/year navigation via `ariaLabels.liveRegionMonthYear`; DateRange announces committed selections via `ariaLabels.liveRegionSelection`. RTL style support and cross-month `selectablePassive` UX are complete.
- Nice-to-have findings from issue #2, only after bugfixes:
  - ~~(selected range label UX — implemented in main; target 1.2.0)~~ Shipped in `1.2.0` as `Range.label` + `DateDisplay` per-range group.
- TypeScript strict-mode pass and JSDoc sweep
- Documentation corrections and examples

---

## Documentation & adoption track (runs in parallel)

This track supports adoption. It does not block `1.0.x` bugfixes or product work,
but it should happen before asking external users to evaluate the library.

### Public landing page / demo

**✅ Deployed — see [docs-adoption change (2026-07-11)](.).**

Live URL: <https://sokaluis.github.io/react-date-range/>

Completed direction — docs/demo only, no runtime API change.

- Promote the existing [`demo/`](../demo/) into a public landing-page baseline
- Deploy a small GitHub Pages site with install command, live `<DateRangePicker />`, and links to npm/GitHub
- Keep the landing honest: maintained fork, stable `1.4.x` on npm `latest`, roadmap candidates are exploratory
- Add the public demo URL to `README.md` once deployed

### Full library documentation

**✅ Complete — component reference lives in [`docs/components/`](components/).**

- Component docs for `Calendar`, `DateRange`, `DateRangePicker`, `DefinedRange`, and exported helpers
- Props tables backed by `src/index.d.ts`, with examples for common use cases
- Migration guide from upstream kept current with package releases
- Styling/customization guide covering CSS imports, theme CSS, CSS variables, and slot/className plans
- Accessibility guide for keyboard navigation, ARIA expectations, and known follow-up work
- Troubleshooting page for SSR, CJS/ESM imports, date-fns locales, and bundler integration

---

## Evolution track (sequential)

### 1.1 — Ergonomics

Candidate direction — requires separate spec.

- ~~`DateRangeInput` / `DatePickerInput` components (or props) for standalone input triggering~~ Shipped in `1.2.0`.
- Modern presets / shortcuts panel (Yesterday, Last 7 days, This month, etc.)
- Clear / Apply / Cancel footer with explicit gesture
- Form-friendly API (integration patterns for React Hook Form, Formik, etc.)

### 1.2 — Configurable UI Foundation

**✅ Complete — tagged as `v1.3.0`, documented with a GitHub Release, and superseded by the 1.4 responsive/fluid line.**
See `docs/roadmap-gap-analysis.md` for completed feature table.

- Toggle header elements (month, year, navigation arrows)
- Selected date display customization
- Today affordance configuration
- 1 vs 2+ calendar layouts
- Scroll orientation (book/horizontal vs vertical)
- Stable `className`/`style` slots per component region
- CSS token surface for colors, spacing, radius

This foundation now unlocks the `1.5` Styling DX / composition track.

### 1.3 / 1.4 — Responsive / Mobile

**✅ Complete — `v1.4.0` is published on npm as the current stable line.**

Delivered responsive fluid layouts, container-width-aware month stacking, configurable
input popovers, and real-world demo examples.

- Mobile fullscreen / sheet mode
- Responsive layout modes for Calendar and DateRangePicker
- Touch improvements (swipe, gesture support) remain a future enhancement.

### 1.5 — shadcn-inspired Styling DX / Composition

Candidate direction — next recommended roadmap track. This is inspired by
shadcn/ui's composable Calendar model, but it is **not** a `react-day-picker`
rewrite and does **not** make Tailwind mandatory.

- Recipe-first docs: basic Calendar, date range picker, popover, presets,
  disabled dates, mobile, travel booking, brand theming, and custom day content.
- Reduce the need for consumers to import the full `styles.css` when they only
  need structural behavior plus their own styling.
- Keep `styles.css` as the backward-compatible default import.
- Promote `theme/variables.css` as the preferred theme-variable surface;
  `theme/tokens.css` remains a compatibility alias.
- Add explicit `data-rdr-*` day/range states so host apps can target stable
  state attributes instead of internal class names.
- Evolve `dayContentRenderer` in a backward-compatible way so renderers can
  receive useful day state (`today`, `selected`, `rangeStart`, `rangeMiddle`,
  `rangeEnd`, `disabled`, `passive`, `preview`, etc.).
- Publish Tailwind-first recipes/examples that use `classNames`, `uiSlots`,
  CSS variables, and `data-rdr-*` states without requiring Tailwind globally.
- Clarify the styling hierarchy: base CSS, theme variables, props (`color`,
  `rangeColors`), `classNames`, `uiSlots`, and host-app CSS/Tailwind overrides.

### 1.6 — Templates / Skins

Candidate direction — requires `1.5` Styling DX and state hooks first. Not started
until the styling API is stable.

Potential directions (not exhaustive or committed):

- Classic — flat, familiar, minimal
- Simple — clean, reduced chrome
- Booking — travel/calendar feel with prominent date highlights
- Dashboard — dense, utility-focused
- Mobile — touch-first, full-width

### 1.7 — Advanced Rules

Candidate direction — requires separate spec.

- Disabled date rules (callback-based, not only array)
- Min / max range length (number of days)
- Business days mode and holiday calendar support
- Validation hooks (onChange validation, range constraints)

### Future / v2 — Modern facade or headless mode

Candidate direction — only after the `1.x` compatibility surface is stable.

- Optional facade inspired by DayPicker/shadcn mental model:
  `mode`, `selected`, `onSelect`, `numberOfMonths`.
- Possible headless or Tailwind-first mode if real consumers need it.
- No immediate migration to `react-day-picker`; that remains a high-cost rewrite
  with compatibility risk.

---

## 2.x / Labs (exploratory)

### Framework-agnostic core

Long-horizon direction. No work begins until the `1.x` evolution track is stable.

- `@cyberlz/date-range-core` — pure logic, no React dependency
  (date arithmetic, range math, constraint evaluation, i18n date formatting)
- Framework-specific wrappers: React (current), Vue, Svelte, Solid, etc.
- Date adapter system (plug-in date library; initially date-fns, potentially others)

---

## Competitive landscape (inspiration, not endorsement)

These libraries informed the direction above. Listing is for context; specific
features or APIs are not implied to be copied or replicated.

| Library | Notable inputs |
|---------|----------------|
| react-day-picker | Hook-based API, CSS class conventions, date constraint model |
| MUI X Date Pickers | Slot-based composition, field components, validation layer |
| Mantine | CSS variables theming, hook-based controls, preset ranges |
| shadcn/ui + Radix | Primitive composition, className/data-state styling, accessibility defaults, Tailwind-friendly recipes |
| Ant Design | Form integration patterns, preset ranges, range picker variants |
| Kendo UI / DevExtreme / Syncfusion / PrimeReact | Enterprise feature coverage (business days, disabled rules, validation hooks) |

This is directional context only. Implementation decisions are made on a
case-by-case basis during spec for each phase.

---

## Next steps

- Each `1.x` phase needs a separate spec before becoming a committed release phase.
- The next recommended spec candidate is `1.5` shadcn-inspired Styling DX / Composition.
- The 2.x/Labs track is aspirational and depends on 1.x evolution track completion.
- Bugfixes and maintenance continue in parallel regardless of roadmap phase.
- See `docs/roadmap-gap-analysis.md` for completed vs open roadmap state.
