# Release Checklist — `v1.3.0` (published)

> **Status.** `v1.3.0` is published as the Configurable UI Foundation release:
> additive UI slots, opt-in CSS design tokens, and demo token styling fixes.
> npm `latest` points to `1.3.0`. The agent did not request OTP and did not run
> `npm publish`; publish was handled by the maintainer.
>
> See [`docs/npm-publishing.md`](npm-publishing.md) for the publishing guide and
> [`docs/release-flow.md`](release-flow.md) for the full git/tag/npm pipeline.

---

## Before tagging `v1.3.0`

- [x] **`package.json` version**: `1.3.0`.
- [x] **`package-lock.json`** root package version: `1.3.0`.
- [x] **`demo/package.json`** dependency: `@cyberlz/react-date-range: "file:.."` for local demo validation.
- [x] **`CHANGELOG.md`** has a `## [1.3.0]` section covering UI slots, tokens,
      docs/demo coverage, and the demo token styling fix.
- [x] **`README.md`** reflects the `1.3.x` stable line and includes
      `dist/theme/tokens.css` in the build output table.
- [x] **Doc sweep**: release checklist, release flow, npm publishing notes, and
      stable-line docs reflect published `1.3.0` on npm `latest`.
- [ ] CI is green on the commit being tagged.
- [x] `npm run build` passes and regenerates `dist/`.
- [x] `dist/` inspection confirms public API/types and CSS outputs are present,
      including `dist/theme/tokens.css`.
- [ ] `npm run type-check` passes.
- [ ] Demo `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run test:ci` passes.
- [x] `npm test` passes.
- [x] `git diff --check` exits clean (no conflict markers / whitespace).
- [x] `npm pack --dry-run` confirms the package includes `dist/`,
      `dist/theme/default.css`, `dist/theme/tokens.css`, and declarations.
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
- [ ] Smoke-install from npm registry in clean React 18 and React 19 projects
      (after `npm publish`).

---

## Tagging `v1.3.0`

> Tagging is a separate step from npm publish. See
> [`docs/release-flow.md`](release-flow.md) for the full git/tag/GitHub flow.

```bash
# Dry-run only — performed by the maintainer
git tag v1.3.0
git push origin v1.3.0
```

 - [x] **Git tag** `v1.3.0` created and pushed to `origin`.

---

## Publishing `v1.3.0` (manual — maintainer)

> **The agent does NOT run `npm publish` and does NOT request OTP.**
> This checklist section is for the maintainer. Use the same OTP device as
> previous releases if 2FA is enabled on the npm account.

- [x] Maintainer publishes with the `latest` tag:
  ```bash
  npm publish --tag latest --access public
  ```
  If OTP is required: `npm publish --tag latest --access public --otp=XXXXXX`
- [x] Maintainer verifies dist-tags:
  - `npm view @cyberlz/react-date-range@latest version` → `1.3.0`
  - `npm view @cyberlz/react-date-range@rc version` → `1.0.0-rc.0` (rc stays available)
- [ ] Maintainer verifies registry install:
  ```bash
  mkdir /tmp/registry-test && cd /tmp/registry-test
  npm init -y
  npm install @cyberlz/react-date-range
  ```
- [ ] Maintainer verifies the npm README is in sync with the repo README:
  ```bash
  npm view @cyberlz/react-date-range@latest readme version dist-tags --json
  ```
  Confirm `version` is `1.3.0`, `dist-tags.latest` is `1.3.0`, and the
  `readme` field reflects the 1.3.x UI customization surface.
- [ ] Maintainer refreshes the demo `package-lock.json` integrity hashes:
  ```bash
  cd demo && npm install
  ```
   (Required because the demo's `package-lock.json` may need registry integrity
   hashes after the package is published.)

---

## Post-publish (`v1.3.0`)

- [ ] GitHub Release created from `CHANGELOG.md` entry for `1.3.0`.
- [ ] README npm install guidance checked after dist-tags settle.
- [ ] Monitor issues for regressions in tree-shaking, CJS import, styling
      compatibility, `theme/tokens.css`, and `classNames` / `styles` slot hooks.

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
