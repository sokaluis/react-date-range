# @cyberlz/react-date-range

> Maintained fork/rescue of [`react-date-range`](https://github.com/hypeserver/react-date-range).
> **Current channel**: `1.0.0-rc.0` is published under the `rc` dist-tag (`npm install @cyberlz/react-date-range@rc`). `v1.0.0` stable is the upcoming release — see [Dist-tag policy](#dist-tag-policy) below.

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

## Install

```bash
npm install @cyberlz/react-date-range
```

```js
import { DateRangePicker } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';
```

> **Migrating from `react-date-range` upstream?** See [`docs/migration-from-upstream.md`](docs/migration-from-upstream.md).

## Goal

A **modern, maintained, production-ready** date range picker for React that:

- Works with **React 18 and 19** without warnings or workarounds
- Is **fully typed** (TypeScript-first)
- Has a **modern build** (ESM + CJS, real tree-shaking, no side-effect imports)
- Is **SSR-safe**
- **Preserves the existing API** so current users can upgrade without rewrites
- Eventually supports **two visual skins**: the classic robust `react-date-range` look
  and a simpler, composable alternative

## Current phase

| Phase | Status |
|-------|--------|
| **Phase 0** — Audit & planning | Complete |
| **Phase 1** — Compatible rescue | Complete |
| **Phase 2** — Stylability | Deferred to `0.2.0` |
| **Phase 3** — Core refactor | Complete (Slices 1–21 done) |
| **Phase 4** — Dual skins | Not started |

**`@cyberlz/react-date-range@1.0.0-rc.0`** is the current release candidate (`rc` dist-tag).
**`v1.0.0` stable** is the next release target (pending Slice 25). See
[`docs/fork-roadmap.md`](docs/fork-roadmap.md) for the full plan and
[`docs/refactor-roadmap.md`](docs/refactor-roadmap.md) for incremental refactor slices.

## Dist-tag policy

npm has three relevant dist-tags for this package:

- **`latest`** — currently points to `0.1.0-alpha.0`. Will be promoted to `1.0.0` stable after Slice 25.
- **`rc`** — points to `1.0.0-rc.0`. Current release candidate for pre-release validation: `npm install @cyberlz/react-date-range@rc`.
- **`beta`** — points to `0.1.0-beta.0`. Legacy prerelease channel.

After `1.0.0` stable, all consumers use `npm install @cyberlz/react-date-range` (no tag). See
[`docs/migration-from-upstream.md`](docs/migration-from-upstream.md) for upgrade instructions.
See [`docs/release-flow.md`](docs/release-flow.md#npm-dist-tags) for the full policy.

## Beta build pipeline (current)

Package build produces consumable `dist/` output:

```bash
npm run build          # tsdown (JS, multi-entry + unbundle) + sass (CSS) + types copy
```

**Output:**
| Path | Purpose |
|------|---------|
| `dist/index.mjs` | ESM barrel (bundlers, `import`) |
| `dist/index.cjs` | CJS barrel (Node.js `require`) |
| `dist/components/<Component>/index.{mjs,cjs}` | Per-component sub-modules (preserved by multi-entry glob for real tree-shaking) |
| `dist/styles.css` | Compiled CSS (import separately) |
| `dist/index.d.ts` | TypeScript declarations |
| `dist/theme/default.css` | Default theme CSS |

**Consumer import (ESM / TSX):**
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

### Tree-shaking

Tree-shaking works since `0.1.0-alpha.3` and remains part of `1.0.0-rc.0`. The build uses `tsdown` with `unbundle: true` and a
multi-entry glob, so each component is emitted as its own file and bundlers can drop unused
exports. Verified empirically with `spikes/tree-shaking/analyze.mjs`:

| Consumer import | Output size |
|-----------------|-------------|
| `import { Calendar }` | ~41 KB |
| `import { DateRangePicker }` | ~58 KB |
| **Delta** | **+17 KB** (real tree-shaking) |

CJS consumers do not benefit equally (CJS is not tree-shakeable by design); ESM + modern
bundlers (Vite, Webpack 5, esbuild, Rollup) get the full benefit.

### Not in scope for `0.1.x`

- Breaking API changes
- Phase 2 stylability work (planned for `0.2.0`)
- New visual skins or Tailwind theming
- New features

## License

Upstream is [MIT](https://github.com/hypeserver/react-date-range/blob/main/LICENSE).
This workspace currently uses MIT as a placeholder — **verify and preserve the upstream
license before publishing**. See [`NOTICE.md`](NOTICE.md).

## Navigation

- [`docs/research.md`](docs/research.md) — Consolidated investigation: upstream status, issues, PRs, fork landscape
- [`docs/fork-roadmap.md`](docs/fork-roadmap.md) — Full phase plan (0–4)
- [`docs/refactor-roadmap.md`](docs/refactor-roadmap.md) — Completed internal refactor slices
- [`docs/build-output.md`](docs/build-output.md) — Build pipeline and tree-shaking details
- [`docs/release-checklist.md`](docs/release-checklist.md) — Canonical release checklist
- [`docs/release-flow.md`](docs/release-flow.md) — Tag/npm/GitHub pipeline and dist-tag policy
- [`docs/npm-publishing.md`](docs/npm-publishing.md) — npm publishing process, costs, visibility
- [`docs/docs-site-plan.md`](docs/docs-site-plan.md) — Landing page & Vercel timing recommendation

## Links

- npm: <https://www.npmjs.com/package/@cyberlz/react-date-range>
- GitHub Releases: <https://github.com/sokaluis/react-date-range/releases>
- CHANGELOG: <https://github.com/sokaluis/react-date-range/blob/main/CHANGELOG.md>
