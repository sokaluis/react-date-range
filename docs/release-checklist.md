# Release Checklists — `v1.1.0` (published) · `v1.1.1` (tag exists; npm publish pending OTP)

> **`v1.1.0` is published** on npm `latest`. `v1.1.1` tag exists at commit `843b09b`
> but npm publish is pending OTP (one-time password). Do not re-tag.
> See [`docs/npm-publishing.md`](npm-publishing.md) for the full publishing guide.

---

## Before publishing `v1.1.1` (tag `v1.1.1` exists at `843b09b`; npm publish pending OTP)

- [x] **Doc sweep complete** (for v1.1.0): all doc files reflect Slices 13–21 + RTL + cross-month UX + multi-range labels cumulative state.
- [x] **v1.1.0 published**: `1.1.x` stable line on npm `latest`.
- [x] **v1.1.1 tag exists**: tag `v1.1.1` at commit `843b09b`, npm publish pending OTP.
- [ ] **npm OTP publish**: run `npm publish --tag latest --access public` with OTP if 2FA is enabled on the npm account.
- [ ] **Verify dist-tags after publish**:
  ```bash
  npm view @cyberlz/react-date-range@latest version   # → 1.1.1
  npm view @cyberlz/react-date-range@rc version       # → 1.0.0-rc.0 (unchanged)
  ```

---

## Before tagging (historical — v1.0.0 / v1.1.0 done)

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
- [x] **v1.0.0 stable published**.
- [x] **v1.1.0 published**.

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

## Publishing v1.1.1 (tag exists; pending npm OTP)

> See [`release-flow.md`](release-flow.md) for the full git/tag/GitHub/npm flow.

- [ ] Ensure OTP device is available if npm account has 2FA enforcement.
- [ ] Publish with latest tag:
  ```bash
  npm publish --tag latest --access public
  ```
  If OTP required: `npm publish --tag latest --access public --otp=XXXXXX`
- [ ] Verify dist-tags:
  - `npm view @cyberlz/react-date-range@latest version` → `1.1.1`
  - `npm view @cyberlz/react-date-range@rc version` → `1.0.0-rc.0` (rc stays available)
- [ ] Verify registry install:
  ```bash
  mkdir /tmp/registry-test && cd /tmp/registry-test
  npm init -y
  npm install @cyberlz/react-date-range
  ```

## Post-publish (v1.1.1)

- [ ] GitHub Release created from `CHANGELOG.md` entry for `1.1.1`.
- [ ] README npm install guidance checked after dist-tags settle.
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
