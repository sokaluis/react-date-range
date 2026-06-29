# Release Checklists — `rc.0` (done) · `1.0.0` stable (metadata prepared; npm publish pending)

> **`1.0.0-rc.0` publishing is complete** (2026-06-29, `rc` dist-tag).
> The below checklist is split: items done for `rc.0` are marked ✅;
> items for `v1.0.0` stable are pending npm publish (stable metadata is prepared in this commit).
> Do not tag or publish stable until the stable section is complete.

---

## Before tagging `v1.0.0` stable (this commit prepares metadata; npm publish pending)

- [ ] **Doc sweep complete**: all 13 doc files updated to reflect Slices 13–21 cumulative state; `docs/migration-from-upstream.md` written.
- [ ] **Migration guide live**: `docs/migration-from-upstream.md` added; link placed in README.md install block and in `docs/npm-publishing.md` §At launch.
- [ ] **All 5 Slice-15 bug regressions locked**: `#607` disabledDates guard, `#658` TDZ color fallback, `#664/#663` date-fns ESM interop — all have regression tests.
- [ ] **Strict TypeScript + a11y in place**: `tsconfig.json` `strict: true` enabled; `checkJs` deferred to `1.0.x`; navigation and role-based accessibility verified (Slice 21).
- [ ] **`src/index.js` byte-identical** vs `df17998` (public API unchanged since alpha).
- [ ] **`src/index.d.ts` additive-only diff** vs `df17998` (only +33/−1 from Slice 16, no new modifications).
- [ ] **Release verification**: run the approved release checks before tagging.
- [ ] **`npm pack --dry-run`** shows only expected package files.

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

## Before publishing (pending for stable)

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

## Publishing (pending for stable; rc.0 already published)

> See [`release-flow.md`](release-flow.md) for the full git/tag/GitHub/npm flow.

- [ ] Tag: `git tag -a v1.0.0 -m "Release v1.0.0 stable" && git push origin v1.0.0`
- [ ] Publish with latest tag:
  ```bash
  npm publish --tag latest --access public
  ```
- [ ] Verify dist-tags:
  - `npm view @cyberlz/react-date-range@latest version` → `1.0.0`
  - `npm view @cyberlz/react-date-range@rc version` → `1.0.0-rc.0` (rc stays available)
- [ ] Verify registry install:
  ```bash
  mkdir /tmp/registry-test && cd /tmp/registry-test
  npm init -y
  npm install @cyberlz/react-date-range
  ```

## Post-publish (pending for stable; rc.0 done)

- [ ] GitHub Release created from `CHANGELOG.md` stable entry (not pre-release).
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
