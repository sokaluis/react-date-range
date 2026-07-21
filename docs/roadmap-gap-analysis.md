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
| 1.4.x stable line | ✅ Published | `v1.4.0` is the current npm `latest` stable line |
| Full component docs | ✅ Complete | Component reference live at `docs/components/` |
| Configurable UI foundation | ✅ Complete | Stable UI slots, opt-in theme variables, and demo coverage |
| Responsive/mobile | ✅ Complete for 1.4.0 | `widthMode`, input popovers, breakpoints, and fluid month stacking |
| Styling DX / Composition (1.5) | 🔲 Not specced | Next recommended track; shadcn-inspired, Tailwind-first optional |
| Templates / Skins (1.6) | 🔲 Not specced | Depends on 1.5 state hooks and styling hierarchy |
| Advanced rules (1.7) | 🔲 Not specced | |
| 2.x Labs | 🔲 Exploratory | |

---

## Already done

- Core `DateRangePicker` + `Calendar` + `DefinedRange` components
- Input-trigger pickers (`DateRangeInput`, `DatePickerInput`) — shipped in `1.2.0`
- Selected range label (`Range.label` + `DateDisplay` per-range group) — shipped in `1.2.0`
- Accessibility baseline (ARIA grid labels, live regions, focus management)
- CSS import system (theme + date-picker CSS)
- Preferred theme variable import: `theme/variables.css` (`theme/tokens.css` remains a compatibility alias)
- Local date-fns locale support
- SSR compatibility
- Bugfix track (`1.0.x` maintenance)

---

## Immediate docs gap

~~**Full component docs** — the only remaining open item in `docs/docs-site-plan.md`.~~ ✅ Complete.

Component reference is live at `docs/components/README.md`. The next open execution
candidate is the **Styling DX / Composition** track, which requires a separate API
design spec before implementation (see below).

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
| CSS token surface | ✅ Shipped (preferred `theme/variables.css`; `theme/tokens.css` compatibility alias) |

---

## Responsive / Mobile (complete — `1.4.0`)

Published as the current stable line. The remaining Styling DX / Composition work is
the recommended next execution candidate after the `1.4.0` handoff.

- Configurable modal/responsive input popovers
- Responsive/fluid layout modes for Calendar and DateRangePicker
- Touch improvements (swipe, gesture support)

---

## Styling DX / Composition (1.5 — next candidate)

Base `uiSlots`, `classNames`, `styles.css`, and `theme/variables.css` are already
available. Remaining work should make the styling model easier to consume without
forcing every app to import the full global stylesheet or adopt Tailwind.

- Recipe-first docs inspired by shadcn/ui Calendar patterns.
- Explicit `data-rdr-*` states for day/range styling.
- Backward-compatible richer day renderer state.
- Smaller/clearer CSS import story: keep `styles.css` as legacy default, promote
  `theme/variables.css`, and document host-app overrides.
- Tailwind-first examples and recipes, but no Tailwind hard dependency.
- Clear styling precedence across base CSS, variables, props, `classNames`,
  `uiSlots`, and host CSS/Tailwind.

---

## Templates / Skins (1.6 — future candidate)

Requires the `1.5` Styling DX / Composition track first.

- Size variants (compact, comfortable, spacious)
- Icon slots for nav arrows, clear button
- Skin/template system (classic, booking, dashboard, mobile, etc.)

---

## Advanced Rules (1.7 — exploratory)

Requires separate spec.

- Disabled date rules (callback-based, not only array)
- Min / max range length
- Business days mode and holiday calendar support
- Validation hooks

---

## Out of scope / Non-goals

- New framework wrappers before `@cyberlz/date-range-core` (2.x/Labs)
- Tailwind as a required dependency for all consumers
- `react-day-picker` rewrite before a dedicated compatibility spec
- Skins/templates before Styling DX / Composition is stable
- Framework-specific wrappers (Vue, Svelte, Solid) before core extraction
- Features not covered by a reviewed spec

---

## Relationship to other docs

- `docs/post-1.0-roadmap.md` — high-level phase sequence and future candidates
- `docs/docs-site-plan.md` — adoption assets and full docs checklist
- `docs/roadmap-gap-analysis.md` (this file) — gap tracking and configurable UI details
