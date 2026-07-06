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
- **Skins require tokens/slots first.** Visual variants (classic, booking, dashboard, etc.)
  cannot be built cleanly until the styling API and slot system from `1.3` are in place.

---

## Maintenance track (runs in parallel)

### 1.0.x — Maintenance

- Reproducible upstream audit bugs from
  [issue #2](https://github.com/sokaluis/react-date-range/issues/2):
  - `weekStartsOn` propagation into `DefinedRange` static ranges
  - `findNextRangeIndex` guard for non-array `ranges`
  - null `startDate` / `endDate` handling so empty ranges do not mark every day in range
- Small accessibility improvements (ARIA, keyboard, focus) — core labels/states completed in PR `707cdd1`: Calendar grid `aria-label` + `aria-roledescription`, DefinedRange `aria-pressed`, InputRangeField `aria-labelledby`, DateDisplay `role="group"`, DateRangePicker `role="region"` + `false` opt-out. Live region (month/year) completed in PR `a11y-live-announce` — a polite `aria-live` region announces committed month/year navigation; selection announcements are deferred. Remaining: `aria-live` selection announcements, RTL, cross-month UX.
- Nice-to-have findings from issue #2, only after bugfixes:
  - visible focus indicators for nav arrows, selects, and day buttons
  - selected range label UX exploration
- TypeScript strict-mode pass and JSDoc sweep
- Documentation corrections and examples

---

## Documentation & adoption track (runs in parallel)

This track supports adoption. It does not block `1.0.x` bugfixes or product work,
but it should happen before asking external users to evaluate the library.

### Public landing page / demo

Candidate direction — docs/demo only, no runtime API change.

- Promote the existing [`demo/`](../demo/) into a public landing-page baseline
- Deploy a small GitHub Pages site with install command, live `<DateRangePicker />`, and links to npm/GitHub
- Keep the landing honest: maintained fork, stable `1.0.0`, roadmap candidates are exploratory
- Add the public demo URL to `README.md` once deployed

### Full library documentation

Candidate direction — requires docs inventory and examples.

- Component docs for `Calendar`, `DateRange`, `DateRangePicker`, `DefinedRange`, and exported helpers
- Props tables backed by `src/index.d.ts`, with examples for common use cases
- Migration guide from upstream kept current with package releases
- Styling/customization guide covering CSS imports, theme CSS, future CSS variables, and slot/className plans
- Accessibility guide for keyboard navigation, ARIA expectations, and known follow-up work
- Troubleshooting page for SSR, CJS/ESM imports, date-fns locales, and bundler integration

---

## Evolution track (sequential)

### 1.1 — Ergonomics

Candidate direction — requires separate spec.

- `DateRangeInput` / `DatePickerInput` components (or props) for standalone input triggering
- Modern presets / shortcuts panel (Yesterday, Last 7 days, This month, etc.)
- Clear / Apply / Cancel footer with explicit gesture
- Form-friendly API (integration patterns for React Hook Form, Formik, etc.)

### 1.2 — Responsive / Mobile

Candidate direction — requires separate spec.

- Mobile fullscreen / sheet mode
- Responsive layout modes for Calendar and DateRangePicker
- Touch improvements (swipe, gesture support)

### 1.3 — Styling System

Candidate direction — requires separate spec.

- CSS custom properties (design tokens) for colors, spacing, radius
- `className` / `style` support by slot (header, footer, day cell, etc.)
- Size variants (compact, comfortable, spacious)
- Icon slots for nav arrows, clear button, etc.

### 1.4 — Templates / Skins

Candidate direction — requires `1.3` tokens/slots foundation first. Not started until
the styling API is stable.

Potential directions (not exhaustive or committed):

- Classic — flat, familiar, minimal
- Simple — clean, reduced chrome
- Booking — travel/calendar feel with prominent date highlights
- Dashboard — dense, utility-focused
- Mobile — touch-first, full-width

### 1.5 — Advanced Rules

Candidate direction — requires separate spec.

- Disabled date rules (callback-based, not only array)
- Min / max range length (number of days)
- Business days mode and holiday calendar support
- Validation hooks (onChange validation, range constraints)

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
| shadcn/ui + Radix | Primitive composition, className slot pattern, accessibility defaults |
| Ant Design | Form integration patterns, preset ranges, range picker variants |
| Kendo UI / DevExtreme / Syncfusion / PrimeReact | Enterprise feature coverage (business days, disabled rules, validation hooks) |

This is directional context only. Implementation decisions are made on a
case-by-case basis during spec for each phase.

---

## Next steps

- Each `1.x` phase needs a separate spec before becoming a committed release phase.
- Landing page and full docs need their own small docs/demo plan before deployment.
- The 2.x/Labs track is aspirational and depends on 1.x evolution track completion.
- Bugfixes and maintenance continue in parallel regardless of roadmap phase.
