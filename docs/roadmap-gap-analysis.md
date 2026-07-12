# Roadmap Gap Analysis — @cyberlz/react-date-range

> **Status: exploratory — requires separate spec before implementation.**
> This document captures what is not yet planned or resolved.
> It supplements `docs/post-1.0-roadmap.md`, which covers the high-level phase sequence.

---

## Current state

| Item | Status | Notes |
|------|--------|-------|
| Public landing/demo | ✅ Deployed | <https://sokaluis.github.io/react-date-range/> |
| Public demo URL in README | ✅ Done | |
| 1.2.x stable line | ✅ Published as `1.2.2` | Corrected after `1.2.1` shipped stale `dist/` |
| Full component docs | 🔲 Open | Only open checklist item in `docs-site-plan.md` |
| Configurable UI foundation | 🔲 Not specced | User raised in memory #11130 |
| Responsive/mobile (1.3) | 🔲 Not specced | |
| Styling system (1.4) | 🔲 Not specced | Depends on configurable UI foundation |
| Advanced rules (1.6) | 🔲 Not specced | |
| 2.x Labs | 🔲 Exploratory | |

---

## Already done

- Core `DateRangePicker` + `Calendar` + `DefinedRange` components
- Input-trigger pickers (`DateRangeInput`, `DatePickerInput`) — shipped in `1.2.0`
- Selected range label (`Range.label` + `DateDisplay` per-range group) — shipped in `1.2.0`
- Accessibility baseline (ARIA grid labels, live regions, focus management)
- CSS import system (theme + date-picker CSS)
- Local date-fns locale support
- SSR compatibility
- Bugfix track (`1.0.x` maintenance)

---

## Immediate docs gap

**Full component docs** — the only remaining open item in `docs/docs-site-plan.md`.

Scope: `Calendar`, `DateRange`, `DateRangePicker`, `DefinedRange`, exported helpers.
Props tables sourced from `src/index.d.ts`. Examples for common use cases.

This is the next execution candidate before any product/API design work begins.

---

## Configurable UI foundation (not yet specced)

User has expressed interest in configurable base UI features. These require a
separate API design spec before implementation — they are listed here for
tracking and discovery.

| Feature | Description |
|---------|-------------|
| Toggle header elements | Show/hide month, year, navigation arrows independently |
| Selected date display | Customize how the selected date(s) are shown |
| Today affordance | Configurable today indicator/highlight |
| Calendar count | 1 vs 2 calendars (or more) in `DateRangePicker` |
| Scroll orientation | Book/horizontal vs vertical scroll for multi-calendar layouts |
| Stable styling slots | `className`/`style` per slot (header, footer, day cell, nav arrows, etc.) |
| CSS token surface | Design tokens for colors, spacing, radius — prerequisite for `1.5` skins |

**Constraints:**
- Slots/tokens must be stable before skins (1.4) can be built cleanly
- Configurable UI foundation should be specced as its own phase, likely between `1.1` ergonomics and `1.3` responsive/mobile
- These items are exploratory until a spec is written and reviewed

---

## Responsive / Mobile (1.3 — exploratory)

Requires separate spec.

- Mobile fullscreen / sheet mode
- Responsive layout modes for Calendar and DateRangePicker
- Touch improvements (swipe, gesture support)

---

## Styling system (1.4 — exploratory)

Requires configurable UI foundation to be specced first.

- CSS custom properties (design tokens) for colors, spacing, radius
- `className`/`style` support by slot
- Size variants (compact, comfortable, spacious)
- Icon slots for nav arrows, clear button

---

## Advanced Rules (1.6 — exploratory)

Requires separate spec.

- Disabled date rules (callback-based, not only array)
- Min / max range length
- Business days mode and holiday calendar support
- Validation hooks

---

## Out of scope / Non-goals

- New framework wrappers before `@cyberlz/date-range-core` (2.x/Labs)
- Skins/templates before tokens/slots are stable
- Framework-specific wrappers (Vue, Svelte, Solid) before core extraction
- Features not covered by a reviewed spec

---

## Relationship to other docs

- `docs/post-1.0-roadmap.md` — high-level phase sequence (1.1 → 1.2 → 1.3 → …)
- `docs/docs-site-plan.md` — adoption assets and full docs checklist
- `docs/roadmap-gap-analysis.md` (this file) — gap tracking and configurable UI details
