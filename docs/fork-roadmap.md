# Fork Roadmap — @cyberlz/react-date-range

> High-level phase plan for the maintained fork. Detailed completed refactor slices
> live in [`refactor-roadmap.md`](refactor-roadmap.md).

---

## Current release meaning

`1.0.0-rc.0` was validated (consumer spikes passed: React 18/19, SSR CJS+ESM, tree-shaking). `1.0.0` stable was published; npm `latest` currently serves `1.3.0`. `v1.3.0` is tagged and published on npm `latest` (`v1.1.1` tag exists but was never promoted to npm).

> **Stable = internal refactor complete, public API frozen, no breaking changes planned.**

Slices 1–21 are complete: all upstream bugs fixed, strict TypeScript enabled,
`react-list`/`prop-types`/`src/locale` removed, coverage gaps closed, navigation
and role-based accessibility verified, and documentation fully swept. Future
visual redesign ideas are intentionally not tracked as committed release phases
until they have a concrete spec and maintainer decision.

## Phase status

| Phase | Goal | Status | Release target |
|-------|------|--------|----------------|
| Phase 0 — Audit & planning | Understand upstream, risks, publishing, and source provenance | ✅ Complete | Done before first alpha |
| Phase 1 — Compatible rescue | Drop-in React 18/19 + TypeScript-compatible package | ✅ Complete | `0.1.0-alpha.0`–`0.1.0-alpha.2` |
| **Phase 3 — Core refactor (completed)** | Function components, tooling, tests, tree-shaking | ✅ Complete | `0.1.0-beta.0` |
| **1.0.0 — Stable release** | Bug fixes, strict TypeScript, upstream parity, docs sweep | ✅ Complete | `1.0.0` |
| **1.1.x — Accessibility + RTL + cross-month UX** | Core labels/states, RTL layout, cross-month `selectablePassive`, multi-range labels | ✅ Complete (v1.1.0 published; v1.1.1 tag exists, never promoted to npm) | `1.1.x` |
| **1.2.x — Input-trigger pickers + range labels** | `DatePickerInput`, `DateRangeInput`, `Range.label`, shared `usePopover`, demo coverage | ✅ Published as `v1.2.0` on npm `latest`; superseded by `1.3.0` | `1.2.x` |
| **1.3.x — Configurable UI foundation** | Stable UI slots, `classNames`/`styles` hooks, opt-in CSS tokens, demo token fix | ✅ Complete, tagged as `v1.3.0`, and published on npm `latest` | `1.3.x` |

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

## Future Ideas

Only promote exploratory ideas to roadmap phases after they have a concrete spec,
reviewable scope, and real user demand that justifies the maintenance surface.
See [`post-1.0-roadmap.md`](post-1.0-roadmap.md) for the candidate direction.
