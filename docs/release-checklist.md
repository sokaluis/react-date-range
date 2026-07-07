# Release Checklist — `v1.2.0` (completed)

> **Status.** `v1.1.0` is on npm `latest`. `v1.1.1` tag exists at commit `843b09b`
> but was never promoted to `latest` (historical). `v1.2.0` is published on npm `latest`
> with `package.json` version bumped to `1.2.0`, `CHANGELOG.md` updated, and
> npm-facing README/docs swept. The npm publish was performed manually by the
> maintainer. The agent does not request OTP and does not run `npm publish`.
>
> See [`docs/npm-publishing.md`](npm-publishing.md) for the publishing guide and
> [`docs/release-flow.md`](release-flow.md) for the full git/tag/npm pipeline.

---

## Before tagging `v1.2.0`

- [x] **`package.json` version**: `1.2.0`.
- [x] **`package-lock.json`** root package version: `1.2.0`.
- [x] **`demo/package.json`** dependency: `@cyberlz/react-date-range: "file:.."` for local demo validation.
- [x] **`CHANGELOG.md`** has a `## [1.2.0]` section enumerating `Range.label`,
      `DatePickerInput`, `DateRangeInput`, demo coverage, and doc sweep.
- [x] **`README.md`** references `1.2.x` as the stable channel and documents
      `DatePickerInput`, `DateRangeInput`, `Range.label`, and the 1.1 a11y/RTL
      baseline.
- [x] **Doc sweep**: `release-flow.md`, `fork-roadmap.md`, `post-1.0-roadmap.md`,
      `refactor-roadmap.md`, `npm-publishing.md`, `migration-from-upstream.md`,
      and `docs-site-plan.md` updated to reference `1.2.x` instead of
      `v1.1.1 pending OTP`.
- [ ] CI is green on the commit being tagged.
- [ ] `npm run type-check` passes.
- [ ] Demo `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run test:ci` passes.
- [ ] `npm test` passes.
- [ ] `git diff --check` exits clean (no conflict markers / whitespace).
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

## Tagging `v1.2.0`

> Tagging is a separate step from npm publish. See
> [`docs/release-flow.md`](release-flow.md) for the full git/tag/GitHub flow.

```bash
# Dry-run only — performed by the maintainer
git tag v1.2.0
git push origin v1.2.0
```

- [ ] **Git tag** `v1.2.0` created and pushed to `origin`.

---

## Publishing `v1.2.0` (manual — maintainer)

> **The agent does NOT run `npm publish` and does NOT request OTP.**
> This checklist section is for the maintainer. Use the same OTP device as
> previous releases if 2FA is enabled on the npm account.

- [ ] Maintainer runs `npm login` (or confirms `npm whoami`) locally.
- [ ] Maintainer publishes with the `latest` tag:
  ```bash
  npm publish --tag latest --access public
  ```
  If OTP is required: `npm publish --tag latest --access public --otp=XXXXXX`
- [ ] Maintainer verifies dist-tags:
  - `npm view @cyberlz/react-date-range@latest version` → `1.2.0`
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
  Confirm `version` is `1.2.0`, `dist-tags.latest` is `1.2.0`, and the
  `readme` field reflects the 1.2.0 features (`DatePickerInput`,
  `DateRangeInput`, `Range.label`, a11y live regions, RTL,
  `selectablePassive`).
- [ ] Maintainer refreshes the demo `package-lock.json` integrity hashes:
  ```bash
  cd demo && npm install
  ```
  (Required because the demo's `package-lock.json` was bumped in lockstep with
  `package.json` but the integrity hash for `1.2.0` cannot be generated until
  the package is published.)

---

## Post-publish (`v1.2.0`)

- [ ] GitHub Release created from `CHANGELOG.md` entry for `1.2.0`.
- [ ] README npm install guidance checked after dist-tags settle.
- [ ] Monitor issues for regressions in tree-shaking, CJS import, styling
      compatibility, and the new `DatePickerInput` / `DateRangeInput` triggers.

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
