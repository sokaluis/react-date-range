# Release Checklist — `0.1.0-alpha.0`

> Canonical pre-publish checklist for the first public alpha release.
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
- [x] **CHANGELOG.md**: Entry for `0.1.0-alpha.0` is complete and accurate.
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

- [x] CI is green on the commit being tagged.
- [x] `npm run test:ci` passes locally (Calendar + DateRange tests, 21 tests).
- [x] Spike typechecks pass:
  ```bash
  # Run each from repo root after `npm ci && npm run build` at root
  cd spikes/react-18-ts    && npm ci && npm run typecheck
  cd spikes/react-19-ts    && npm ci && npm run typecheck
  cd spikes/consumer-tsx   && npm ci && npm run typecheck
  cd spikes/scroll-strictmode && npm ci && npm run typecheck
  cd spikes/ssr-import     && npm ci && npm test
  cd spikes/consumer-js    && npm ci && npm run build
  ```
- [ ] Smoke-install in a clean project:
  ```bash
  mkdir /tmp/smoke-test && cd /tmp/smoke-test
  npm init -y
  npm install ../path/to/react-date-range
  node -e "const m = require('@cyberlz/react-date-range'); console.log(Object.keys(m))"
  ```
- [ ] Demo page reviewed (local `npm run dev` in a spike fixture or dedicated
  demo app). See "Demo page" section below.

## Publishing

> See [`docs/release-flow.md`](release-flow.md) for the complete git/tag/GitHub/npm
> pipeline, dist-tag management, and first-time setup.

- [x] Tag: `git tag v0.1.0-alpha.0 && git push --tags`
- [x] Publish with alpha tag:
  ```bash
  npm publish --tag alpha --access public
  ```
- [x] Verify on npm: `npm view @cyberlz/react-date-range@alpha version`
- [ ] Remove accidental `latest` dist-tag if present:
  ```bash
  npm dist-tag rm @cyberlz/react-date-range latest
  ```
- [ ] Verify install from registry:
  ```bash
  mkdir /tmp/registry-test && cd /tmp/registry-test
  npm init -y
  npm install @cyberlz/react-date-range@alpha
  ```

## Post-publish

- [x] Add npm package link to README.
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

| Item | Status | Notes |
|------|--------|-------|
| Choose hosting | 🔲 | Vercel (free, auto-deploy from GitHub), Netlify, or GitHub Pages |
| Create demo app | 🔲 | Simple Vite + React app importing the package and rendering `<DateRangePicker />` |
| Verify local dev | 🔲 | `npm run dev` in demo dir and play with the component |
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
