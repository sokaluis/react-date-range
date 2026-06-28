# Release Checklist — `0.1.0-beta.0`

> Canonical release checklist for the first beta release.
> Last published prerelease before this checkpoint: `0.1.0-alpha.3`.
> Do not tag or publish until this checklist is complete.

---

## Before tagging

- [x] **Name decision**: `@cyberlz/react-date-range` (npm scoped).
- [x] **Repository**: `package.json` `repository.url` points to `sokaluis/react-date-range`.
- [x] **Author**: `Luis Azocar <lazocar.dev@gmail.com>`.
- [x] **License notice**: upstream MIT license preserved; fork attribution in `NOTICE.md`.
- [x] **CHANGELOG.md**: entry for `0.1.0-beta.0` documents the beta scope redefinition.
- [x] **`package.json` fields prepared**:
  - `version`: `0.1.0-beta.0`
  - `main`: `dist/index.cjs`
  - `module`: `dist/index.mjs`
  - `types`: `dist/index.d.ts`
  - `sideEffects`: `["*.css"]`
  - `peerDependencies`: React 18/19 + date-fns 3
- [ ] **Release verification**: run the approved release checks before tagging.
- [ ] **`npm pack --dry-run`** shows only expected package files.

## Before publishing

- [ ] CI is green on the commit being tagged.
- [ ] `npm run lint` passes.
- [ ] `npm run type-check` passes.
- [ ] `npm run test:ci` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` produces clean JS/CSS/types output.
- [ ] Tree-shaking analyzer still reports real delta:
  - Calendar-only: ~41 KB
  - DateRangePicker: ~58 KB
  - Delta: ~17 KB
- [ ] Spike typechecks/import checks pass after a fresh root build:
  ```bash
  cd spikes/react-18-ts         && npm ci && npm run typecheck
  cd spikes/react-19-ts         && npm ci && npm run typecheck
  cd spikes/consumer-tsx        && npm ci && npm run typecheck
  cd spikes/scroll-strictmode   && npm ci && npm run typecheck
  cd spikes/ssr-import          && npm ci && npm test
  cd spikes/consumer-js         && npm ci && npm run build
  ```
- [ ] Smoke-install from npm registry in clean React 18 and React 19 projects.
- [ ] Demo page reviewed locally if needed.

## Publishing

> See [`release-flow.md`](release-flow.md) for the full git/tag/GitHub/npm flow.

- [ ] Tag: `git tag v0.1.0-beta.0 && git push origin v0.1.0-beta.0`
- [ ] Publish with beta tag:
  ```bash
  npm publish --tag beta --access public
  ```
- [ ] Optionally move `alpha` to the same version for the current prerelease channel:
  ```bash
  npm dist-tag add @cyberlz/react-date-range@0.1.0-beta.0 alpha
  ```
- [ ] Verify dist-tags:
  - `npm view @cyberlz/react-date-range@beta version` → `0.1.0-beta.0`
  - `npm view @cyberlz/react-date-range@alpha version` → `0.1.0-beta.0` if the optional move was done
  - `latest` remains pinned to the first published version until stable release.
- [ ] Verify registry install:
  ```bash
  mkdir /tmp/registry-test && cd /tmp/registry-test
  npm init -y
  npm install @cyberlz/react-date-range@beta
  ```

## Post-publish

- [ ] GitHub Release created from `CHANGELOG.md` beta entry and marked pre-release.
- [ ] README npm install guidance checked after dist-tags settle.
- [ ] Add/update npm package and release links if needed.
- [ ] Monitor issues for regressions in tree-shaking, CJS import, and styling compatibility.

---

## Demo page checklist (deferred)

The live docs/demo site remains deferred. See [`docs-site-plan.md`](docs-site-plan.md).

| Item | Status | Notes |
|------|--------|-------|
| Minimal demo app | ✅ | `demo/` exists |
| API docs / migration notes | 🔲 | Required before public landing deploy |
| Deploy | 🔲 | Vercel/Netlify/GitHub Pages later |
| README link | 🔲 | Add once live |

---

## Simulating CI locally

Run only when verification is explicitly approved:

```bash
npm ci
npm run lint
npm run type-check
npm run test:ci
npm test
npm run build
```
