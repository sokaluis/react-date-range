# Fork Roadmap — @cyberlz/react-date-range

> High-level phase plan for the maintained fork. Detailed completed refactor slices
> live in [`refactor-roadmap.md`](refactor-roadmap.md).

---

## Current release meaning

`1.0.0` is the first stable release under the updated checkpoint definition:

> **Stable = internal refactor complete, public API frozen, no breaking changes planned.**

Slices 1–21 are complete: all upstream bugs fixed, strict TypeScript enabled,
`react-list`/`prop-types`/`src/locale` removed, coverage gaps closed, navigation
and role-based accessibility verified, and documentation fully swept. Phase 2
stylability is intentionally **deferred to `0.2.0`**. It remains additive (CSS
variables, `className` pass-through, styling API) and is not expected to break
existing `1.x` consumers.

## Phase status

| Phase | Goal | Status | Release target |
|-------|------|--------|----------------|
| Phase 0 — Audit & planning | Understand upstream, risks, publishing, and source provenance | ✅ Complete | Done before first alpha |
| Phase 1 — Compatible rescue | Drop-in React 18/19 + TypeScript-compatible package | ✅ Complete | `0.1.0-alpha.0`–`0.1.0-alpha.2` |
| **Phase 3 — Core refactor (completed)** | Function components, tooling, tests, tree-shaking | ✅ Complete | `0.1.0-beta.0` |
| **1.0.0 — Stable release** | Bug fixes, strict TypeScript, upstream parity, docs sweep | ✅ Complete | `1.0.0` |
| Phase 2 — Stylability | CSS variables, `className` pass-through, documented styling API | ⏳ Deferred | `0.2.0` |
| Phase 4 — Dual skins | Classic + simple visual experiences on one core | ⏳ Future | TBD |

---

## Phase 0 — Audit & Planning ✅

**Goal**: Understand the codebase, community, and risks before implementation.

Key outputs:

- [`research.md`](research.md) — upstream status and ecosystem research.
- [`source-provenance.md`](source-provenance.md) — npm `react-date-range@2.0.1` import record.
- [`npm-publishing.md`](npm-publishing.md) — npm scope and publishing notes.
- [`upstream-issue-tracker.md`](upstream-issue-tracker.md) — upstream issues/PRs mapped to fork status.

---

## Phase 1 — Compatible Rescue ✅

**Goal**: Ship a drop-in replacement that works with React 18/19 and TypeScript
without changing the existing API.

Delivered:

- First-party TypeScript declarations.
- React 18/19 peer dependency support.
- ESM + CJS package output.
- SSR import safety.
- Critical upstream fixes for date-fns peer guard, color TDZ crash, and StrictMode scroll behavior.
- Initial npm prereleases under `@cyberlz/react-date-range@alpha`.

---

## Phase 2 — Stylability ⏳ deferred to `0.2.0`

**Goal**: Make the library easier to style without specificity fights.

Planned additive work:

- Extract CSS variables / design tokens.
- Support `className` pass-through where missing.
- Document the styling API.
- Prepare for dual-skin architecture without implementing the second skin yet.

This is **not** part of `0.1.0-beta.0`.

---

## Phase 3 — Core Refactor ✅

**Goal**: Modernize internals without changing the public API.

Completed in Slices 1–21:

- Slices 1–11: all class components migrated to function components and hooks.
- Slices 12–17: `defaultProps` removal, `DateInput` hooks, upstream bug fixes (TDZ, addYears, disabledDates), strict TypeScript, dependency modernization (`react-list`/`prop-types`/`src/locale` removed).
- Slices 21: coverage gaps closed, navigation and role-based accessibility verified.
- Slice 22: documentation sweep and `docs/migration-from-upstream.md` added.
- Real tree-shaking via `tsdown` + `unbundle: true` + multi-entry glob.
- Sass migrated to `@use`.
- Root `tsconfig.json` and ESLint flat config added.
- Tests migrated from `react-test-renderer` to `@testing-library/react`.

---

## Phase 4 — Dual Skins ⏳ future

**Goal**: Ship two visual experiences from one core.

- **Classic skin**: familiar `react-date-range` look, polished and maintained.
- **Simple skin**: minimal, composable style closer to `react-day-picker`.

Stretch goals remain future work: RTL support, mobile-first variants, and deeper

---

## Future Ideas — Multi-framework Strategy

Only revisit after the React package has a stable API, a separated core, and real
usage that justifies the maintenance surface.
