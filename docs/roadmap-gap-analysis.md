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
| 1.4.x stable line | ✅ Release checkpoint prepared | Responsive/fluid release target; publish/tag are maintainer actions |
| Full component docs | ✅ Complete | Component reference live at `docs/components/` |
| Configurable UI foundation | ✅ Complete | Stable UI slots, opt-in tokens, and demo coverage prepared for `1.3.0` |
| Responsive/mobile | ✅ Complete for 1.4.0 | `widthMode`, input popovers, breakpoints, and fluid month stacking |
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

~~**Full component docs** — the only remaining open item in `docs/docs-site-plan.md`.~~ ✅ Complete.

Component reference is live at `docs/components/README.md`. The next open execution
candidate is the **Configurable UI foundation** track, which requires a separate API design
spec before implementation (see below).

---

## Configurable UI foundation (complete — `1.3.0`)

Foundation complete, tagged as `v1.3.0`, documented with a GitHub Release, and
now superseded by the `1.4.x` stable target. Stable UI slots,
`className`/`style` per slot, and opt-in CSS token surface are all in place. This
foundation now unlocks the Styling System / Skins track.

| Feature | Status |
|---------|--------|
| Toggle header elements | ✅ Shipped |
| Selected date display | ✅ Shipped |
| Today affordance | ✅ Shipped |
| Calendar count (1 vs 2+) | ✅ Shipped |
| Scroll orientation | ✅ Shipped |
| Stable styling slots | ✅ Shipped |
| CSS token surface | ✅ Shipped (opt-in `tokens.css`) |

---

## Responsive / Mobile (complete — `1.4.0`)

Release checkpoint prepared. The remaining Styling System / Skins foundation is the
recommended next execution candidate after `1.4.0` handoff.

- Configurable modal/responsive input popovers
- Responsive/fluid layout modes for Calendar and DateRangePicker
- Touch improvements (swipe, gesture support)

---

## Styling system (unscheduled — candidate for future)

Base `uiSlots` and `tokens.css` are available from `1.3.0`. Remaining work
includes higher-level styling API, size variants, and skin/template system.

- Size variants (compact, comfortable, spacious)
- Icon slots for nav arrows, clear button
- Skin/template system (classic, booking, dashboard, etc.)

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
