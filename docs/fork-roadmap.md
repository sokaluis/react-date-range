# Fork Roadmap — @cyberlz/react-date-range

> High-level phase plan. Each phase has its own detailed checklist.
> See [`alpha-plan.md`](alpha-plan.md) for Phase 0/1 specifics.

---

## Phase 0 — Audit & Planning (current)

**Goal**: Understand the codebase, the community, and the risks before writing code.

### Deliverables

- [x] External investigation (upstream status, issues, PRs, fork landscape)
- [x] Consolidated research document (`research.md`)
- [x] Phase roadmap (this document)
- [x] Alpha 0/1 acceptance criteria (`alpha-plan.md`)
- [x] npm publishing research (`npm-publishing.md`)
- [ ] Fork upstream source into this workspace
- [ ] Read-through of core modules (Calendar, DateRange, DateRangePicker, styles, date-fns usage)
- [ ] Audit bundle size and tree-shaking potential
- [ ] List all `window` / `document` references (SSR blockers)
- [ ] Identify deprecated React patterns (legacy context, findDOMNode, string refs, etc.)

### Decisions to make

- Package name (final, publishable)
- npm scope (user vs org)
- Git hosting strategy (GitHub org? personal account?)
- Target date for first alpha publish

---

## Phase 1 — Compatible Rescue (Alpha 0 → Alpha 1)

**Goal**: Ship a drop-in replacement that works with React 19 and TypeScript,
without breaking the existing API.

### Alpha 0 (internal spike)

| # | Task | Acceptance |
|---|------|-----------|
| 1 | Fork upstream source at `v2.0.1` (npm) into `src/` | Source builds with current deps |
| 2 | Cherry-pick date-fns v4 fix from PR #654 | No date-fns import errors |
| 3 | Cherry-pick color bugfix from PR #665 | No `ReferenceError` on color |
| 4 | Reproduce React 19 JSX/type issue (#661/#662) in a test app | Issue confirmed, test case saved |
| 5 | Fix React 19 type compatibility | Test app renders without type errors |
| 6 | Pin React 19 as peer dependency (`>=18.0.0`) | `npm ls` shows no peer warnings |
| 7 | Add/merge TypeScript types (study `@types/react-date-range` and iroomit fork) | `tsc --noEmit` passes |
| 8 | Replace any `window`/`document` module-scope refs with safe guards | SSR import doesn't throw |

### Alpha 1 (public alpha)

| # | Task | Acceptance |
|---|------|-----------|
| 1 | Set up build tooling (likely Rollup or tsup) | ESM + CJS output, correct `package.json` exports |
| 2 | Publish `0.1.0-alpha.0` to npm with `alpha` tag | `npm install` works, basic render works |
| 3 | Write minimal CHANGELOG.md | Covers what changed from upstream |
| 4 | Add basic CI: lint, type-check, build | GitHub Actions workflow |
| 5 | Set up demo/storybook or simple example page | Visual verification possible |

### Non-goals for Phase 1

- New visual design or Tailwind theming
- Component API changes
- New features (time picker, etc.)
- Accessibility overhaul (beyond fixing regressions)
- Removing default styles

---

## Phase 2 — Stylability (Beta)

**Goal**: Make the library stylable without fighting specificity wars.

- Extract CSS variables / design tokens
- Support `className` pass-through on all components
- Document the styling API
- Optional: CSS Modules or vanilla-extract as internal approach
- Prepare for dual-skin architecture (but do not implement the second skin yet)

---

## Phase 3 — Core Refactor

> **Detailed slice-by-slice plan**: [`refactor-roadmap.md`](refactor-roadmap.md).
> Start there when resuming refactor work.

**Goal**: Modernize internals without changing the public API.

- Migrate to functional components + hooks (if any class components remain)
- Remove deprecated React patterns
- Improve accessibility (ARIA, keyboard nav) based on issues #373/#415/#416
- Reduce bundle size through tree-shaking and code splitting
- Improve test coverage

---

## Phase 4 — Dual Skins

**Goal**: Ship two visual experiences from one core.

- **Classic skin**: the familiar `react-date-range` look, polished and maintained
- **Simple skin**: a minimal, composable style closer to `react-day-picker`
- Both skins share the same component API and core logic

### Stretch goals

- RTL support (PR #669 as starting point)
- Mobile-first responsive variants
- Theming / design token customization

---

## Future Ideas — Multi-framework Strategy

**Goal**: Explore whether the project can become more than a React-only package
after the React fork is stable.

This is intentionally **not** part of Alpha 0/1. Multi-framework support only
makes sense after the React version has proven product-market fit and the core
logic is cleanly separated from presentation.

Possible directions:

| Direction | What it means | Notes |
|-----------|---------------|-------|
| Framework-agnostic core | Extract calendar/range logic into a shared package | Best long-term architecture if Vue/Angular support becomes real. |
| Vue adapter | Build Vue components on top of the shared core | Likely first non-React adapter if demand exists. |
| Angular adapter | Build Angular components/forms integration on top of the shared core | Higher maintenance cost; should come after Vue or clear demand. |
| Web Components / Stencil | Ship framework-agnostic UI components | Interesting for broad reach, but introduces its own styling/events tradeoffs. |
| Astro examples | Provide Astro integration examples/docs | Useful for docs/demos and partial hydration; not a replacement for framework adapters. |

Decision rule: do not promise multi-framework support until the project has a
stable React API, a separated core, and enough usage to justify the maintenance
surface.
