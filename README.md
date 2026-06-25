# @cyberlz/react-date-range

> Maintained fork/rescue of [`react-date-range`](https://github.com/hypeserver/react-date-range).
> **Phase 0 / Alpha — planning workspace.**

---

## What is this?

This is a **personal open-source initiative** to rescue and modernize `react-date-range`,
a popular React date range picker that has been [archived by its original maintainer](https://github.com/hypeserver/react-date-range).

**Not affiliated** with the original maintainers, any commercial project, or any company.
This workspace exists on a personal machine for convenience; it carries no branding or
association beyond what is stated here.

## Why?

`react-date-range` has **2,600+ GitHub stars**, **700+ forks**, and broad real-world usage,
but the upstream repository is read-only and no longer maintained. Open issues include:

- React 19 compatibility (#661, #662)
- date-fns v3/v4 compatibility (#649, #663, #667)
- TypeScript improvements (#260, #439, #513)
- Accessibility (#373, #415, #416)
- React 18 StrictMode scroll bugs (#577, #653)

There are community forks, but **none clearly active in 2026** with a published React 19 fix.
This project aims to fill that gap.

## Goal

A **modern, maintained, production-ready** date range picker for React that:

- Works with **React 18 and 19** without warnings or workarounds
- Is **fully typed** (TypeScript-first)
- Has a **modern build** (ESM + CJS, tree-shakeable, no side-effect imports)
- Is **SSR-safe**
- **Preserves the existing API** so current users can upgrade without rewrites
- Eventually supports **two visual skins**: the classic robust `react-date-range` look
  and a simpler, composable alternative

## Current phase

| Phase | Status |
|-------|--------|
| **Phase 0** — Audit & planning | In progress |
| **Phase 1** — Compatible rescue | Not started |
| **Phase 2** — Stylability | Not started |
| **Phase 3** — Core refactor | Not started |
| **Phase 4** — Dual skins | Not started |

**There is no stable release yet.** This is a planning/exploration workspace.
See [`docs/fork-roadmap.md`](docs/fork-roadmap.md) for the full plan.

## Alpha 0/1 priorities

1. **React 19 compatibility** — resolve peer dependency warnings, fix JSX/type issues
2. **TypeScript** — add or improve type definitions from `@types/react-date-range`
3. **Build modernization** — proper ESM/CJS dual output, tree-shaking
4. **SSR / import safety** — no `window` references at module scope
5. **Backward compatibility** — keep the existing component API

## Alpha build pipeline (current)

Package build produces consumable `dist/` output:

```bash
npm run build          # tsup (JS) + sass (CSS) + types copy
```

**Output:**
| File | Purpose |
|------|---------|
| `dist/index.mjs` | ESM bundle (bundlers, `import`) |
| `dist/index.js` | CJS bundle (Node.js `require`) |
| `dist/styles.css` | Compiled CSS (import separately) |
| `dist/index.d.ts` | TypeScript declarations |
| `dist/theme/default.css` | Default theme CSS |

**Consumer import (JS/TS/TSX):**
```js
import { DateRangePicker } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
```

**Consumer import (CJS):**
```js
const { DateRangePicker } = require('@cyberlz/react-date-range');
require('@cyberlz/react-date-range/styles.css');
```

No custom Vite/esbuild loaders required — the compiled output is plain JS/CSS.

**Smoke-test fixtures:**
- `spikes/consumer-js/` — JS consumer importing compiled output
- `spikes/consumer-tsx/` — TSX consumer with type validation (`tsc --noEmit`)
- `spikes/tree-shaking/` — Tree-shaking analysis (Calendar-only vs DateRangePicker)

> ⚠️ **Tree-shaking limitation**: Current `bundle: true` produces a single-file output; all exports are always included (~57 KB fixed). `"sideEffects": ["*.css"]` is set to protect CSS imports. Fix planned for Beta 1.0 (`bundle: false`). See [`spikes/tree-shaking/README.md`](spikes/tree-shaking/README.md).

### Not in scope for Alpha 0/1

- New visual skins or Tailwind theming
- Deep architectural refactors
- Breaking API changes
- New features

## License

Upstream is [MIT](https://github.com/hypeserver/react-date-range/blob/main/LICENSE).
This workspace currently uses MIT as a placeholder — **verify and preserve the upstream
license before publishing**. See [`NOTICE.md`](NOTICE.md).

## Navigation

- [`docs/research.md`](docs/research.md) — Consolidated investigation: upstream status, issues, PRs, fork landscape
- [`docs/fork-roadmap.md`](docs/fork-roadmap.md) — Full phase plan (0–4)
- [`docs/alpha-plan.md`](docs/alpha-plan.md) — Alpha 0/1 checklist and acceptance criteria
- [`docs/npm-publishing.md`](docs/npm-publishing.md) — npm publishing process, costs, visibility
