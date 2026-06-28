# Fork Roadmap — @cyberlz/react-date-range

> High-level phase plan for the maintained fork. Detailed completed refactor slices
> live in [`refactor-roadmap.md`](refactor-roadmap.md).

---

## Current release meaning

`0.1.0-beta.0` is the first beta under the updated checkpoint definition:

> **Beta = internal refactor done, public API frozen for the `0.1.x` line.**

Slices 1–11 are complete: all components have been migrated to function components
with hooks, build output has real tree-shaking, Sass uses `@use`, ESLint and
TypeScript checking are wired, and tests use `@testing-library/react`.

Phase 2 stylability is intentionally **deferred to `0.2.0`**. It remains additive
(CSS variables, `className` pass-through, styling API) and is not expected to break

## Phase status

| Phase | Goal | Status | Release target |
|-------|------|--------|----------------|
| Phase 0 — Audit & planning | Understand upstream, risks, publishing, and source provenance | ✅ Complete | Done before first alpha |
| Phase 1 — Compatible rescue | Drop-in React 18/19 + TypeScript-compatible package | ✅ Complete | `0.1.0-alpha.0`–`0.1.0-alpha.2` |
| Phase 2 — Stylability | CSS variables, `className` pass-through, documented styling API | ⏳ Deferred | `0.2.0` |
| Phase 3 — Core refactor | Function components, tooling, tests, tree-shaking | ✅ Complete | `0.1.0-beta.0` |
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

Completed in Slices 1–11:

- All class components migrated to function components and hooks.
- Real tree-shaking via `tsdown` + `unbundle: true` + multi-entry glob.
- Sass migrated to `@use`.
- Root `tsconfig.json` and ESLint flat config added.
- Tests migrated from `react-test-renderer` to `@testing-library/react`.
- `defaultProps` on `forwardRef` removed in favor of destructuring defaults.

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
