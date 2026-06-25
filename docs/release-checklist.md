# Release Checklist — `0.1.0-alpha.1`

> Canonical pre-publish checklist for the second public alpha release.
> No other file duplicates this — refer here for every publish.

---

## Before tagging

- [x] **Name decision**: `@cyberlz/react-date-range` (npm scoped). See
  `docs/npm-publishing.md` for scope rationale and `docs/release-flow.md`
  for the full git/npm release pipeline.
- [x] **Repository**: `package.json` `repository.url` set to the actual GitHub repo URL.
- [x] **Author**: `package.json` `author` field filled (`Luis Azocar <lazocar.dev@gmail.com>`).
- [x] **License notice**: `LICENSE` includes original upstream copyright **plus**
  a new copyright line for fork modifications. See `NOTICE.md`.
- [x] **CHANGELOG.md**: Entry for `0.1.0-alpha.1` is complete and accurate.
- [x] **`package.json` fields verified**:
  - `name`, `version`, `description`, `license`, `keywords`
  - `main`, `module`, `types`, `style`, `exports`
  - `files` — only `dist/` and `src/index.d.ts` (no source, tests, config)
  - `sideEffects` — `["*.css"]`
  - `peerDependencies` — `react`, `react-dom`, `date-fns` ranges are correct
- [x] **`npm pack --dry-run`** shows the expected files and no surprises.
- [x] **`dist/` is build-fresh**: `rm -rf dist && npm run build` produces output
  identical to what CI would build.

## Before publishing

- [ ] CI is green on the commit being tagged.
- [x] `npm run test:ci` passes locally (Calendar + DateRange tests, 25 tests).
- [ ] Spike typechecks pass:
  ```bash
  # Run each from repo root after `npm ci && npm run build` at root
  cd spikes/react-18-ts    && npm ci && npm run typecheck
  cd spikes/react-19-ts    && npm ci && npm run typecheck
  cd spikes/consumer-tsx   && npm ci && npm run typecheck
  cd spikes/scroll-strictmode && npm ci && npm run typecheck
  cd spikes/ssr-import     && npm ci && npm test
  cd spikes/consumer-js    && npm ci && npm run build
  ```
- [ ] Smoke-install in a clean project — React 18 and React 19:
  ```bash
  # React 18 + Vite + TS (tsc --noEmit + vite build)
  npm install @cyberlz/react-date-range@alpha react@18 react-dom@18 date-fns@^3.6.0

  # React 19 + Vite + TS (tsc --noEmit + vite build)
  npm install @cyberlz/react-date-range@alpha react@^19.2.7 react-dom@^19.2.7 date-fns@^3.6.0
  ```
  Both resolved from `https://registry.npmjs.org/` (not `file:`).
- [ ] Demo page reviewed (local `npm run dev` in a spike fixture or dedicated
  demo app). See "Demo page" section below.

## Publishing

> See [`docs/release-flow.md`](release-flow.md) for the complete git/tag/GitHub/npm
> pipeline, dist-tag management, and first-time setup.

- [x] Tag: `git tag v0.1.0-alpha.1 && git push --tags`
- [x] Publish with alpha tag:
  ```bash
  npm publish --tag alpha --access public
  ```
- [x] Verify on npm: `npm view @cyberlz/react-date-range@alpha version` → `0.1.0-alpha.1`.
- [x] `latest` dist-tag checked: npm keeps `latest` pointing to the first published
  version when there is no stable version yet. Current state: `alpha` → `0.1.0-alpha.1`, `latest` → `0.1.0-alpha.0`;
  keep install examples on `@alpha` until a stable release exists.
- [ ] Verify install from registry:
  ```bash
  mkdir /tmp/registry-test && cd /tmp/registry-test
  npm init -y
  npm install @cyberlz/react-date-range@alpha
  ```
  Expected: resolves from `https://registry.npmjs.org/@cyberlz/react-date-range/-/react-date-range-0.1.0-alpha.1.tgz` with clean typecheck + build for both React 18 and React 19 projects.

## Post-publish

- [ ] Add/update npm package link in README if the release notes require it.
- [ ] Add CI badge to README:
  ```markdown
  ![CI](https://github.com/sokaluis/react-date-range/actions/workflows/ci.yml/badge.svg)
  ```
- [ ] Comment on relevant upstream issues with a link to the published package.
  Be respectful — reference the fork as a maintenance effort, not a replacement.
- [ ] Announce in community channels (r/reactjs, Reactiflux, etc.) if desired.
- [ ] Monitor npm downloads and GitHub issues for the first 30 days.

---

## Demo page checklist (no deploy yet)

A live demo is **not required** for alpha publish, but having one ready before
the first stable release builds trust.

> **Landing/Vercel timing:** See [`docs-site-plan.md`](docs-site-plan.md) for the
> full decision on when to deploy a Vercel landing page and what it should include.

| Item | Status | Notes |
|------|--------|-------|
| Choose hosting | 🔲 | Vercel (free, auto-deploy from GitHub), Netlify, or GitHub Pages |
| Create demo app | ✅ | Simple Vite + React app importing the package and rendering `<DateRangePicker />` — see `demo/` |
| Verify local dev | ✅ | `cd demo && npm run dev` — typecheck and build pass |
| Deploy | 🔲 | Hook up to chosen platform |
| Add link to README | 🔲 | Badge or link under "Demo" section |

---

## Simulating CI locally

If you cannot push to GitHub Actions, run the equivalent checks manually:

```bash
# 1. Root package
npm ci
npm run build
npm run test:ci

# 2. Spikes (requires root build first)
(cd spikes/react-18-ts       && npm ci && npm run typecheck)
(cd spikes/react-19-ts       && npm ci && npm run typecheck)
(cd spikes/consumer-tsx      && npm ci && npm run typecheck)
(cd spikes/scroll-strictmode && npm ci && npm run typecheck)
(cd spikes/ssr-import        && npm ci && npm test)
(cd spikes/consumer-js       && npm ci && npm run build)
```

All commands should exit 0. The spike `npm ci` calls require internet access
(first time) but are cached locally after that.

## Running the demo locally

```bash
cd demo
npm ci       # fresh install, resolves @cyberlz/react-date-range from npm registry
npm run dev  # Vite dev server — default http://localhost:5173
```

Or for a production-like check:

```bash
cd demo
npm ci
npm run typecheck  # tsc --noEmit
npm run build      # vite build
npm run preview    # serve the built output
```

The demo imports `@cyberlz/react-date-range` from `https://registry.npmjs.org/` (verified in `demo/package-lock.json`).
