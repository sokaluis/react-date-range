# Release Checklist — `v1.2.2` (prepared)

> **Status.** `v1.2.1` was tagged, pushed, and published, but is superseded
> because it was published without rebuilt `dist/` artifacts. `v1.2.2` is
> prepared as the corrective patch for the same Calendar scroll fixes plus
> adoption docs/demo updates, with regenerated `dist/`. npm publish remains a
> manual maintainer step. The agent does not request OTP and does not run
> `npm publish`.
>
> See [`docs/npm-publishing.md`](npm-publishing.md) for the publishing guide and
> [`docs/release-flow.md`](release-flow.md) for the full git/tag/npm pipeline.

---

## Before tagging `v1.2.2`

- [x] **`package.json` version**: `1.2.2`.
- [x] **`package-lock.json`** root package version: `1.2.2`.
- [x] **`demo/package.json`** dependency: `@cyberlz/react-date-range: "file:.."` for local demo validation.
- [x] **`CHANGELOG.md`** has a `## [1.2.2]` section explaining the rebuilt
      `dist/` corrective release for the `1.2.1` Calendar scroll fixes.
- [x] **`README.md`** includes quick links to the evaluation guide and
      integration snippets.
- [x] **Doc sweep**: adoption docs, demo landing copy, release checklist, and
      release flow reflect the local `1.2.2` preparation and note `1.2.1` was
      superseded without claiming npm `latest` has moved before maintainer
      publish.
- [ ] CI is green on the commit being tagged.
- [x] `npm run build` passes and regenerates `dist/`.
- [x] `dist/` inspection confirms the Calendar scroll fixes are present in the
      generated CSS and JS artifacts.
- [x] `npm run type-check` passes.
- [x] Demo `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run test:ci` passes.
- [x] `npm test -- --runInBand` passes.
- [x] `git diff --check` exits clean (no conflict markers / whitespace).
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

## Tagging `v1.2.2`

> Tagging is a separate step from npm publish. See
> [`docs/release-flow.md`](release-flow.md) for the full git/tag/GitHub flow.

```bash
# Dry-run only — performed by the maintainer
git tag v1.2.2
git push origin v1.2.2
```

- [ ] **Git tag** `v1.2.2` created and pushed to `origin`.

---

## Publishing `v1.2.2` (manual — maintainer)

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
  - `npm view @cyberlz/react-date-range@latest version` → `1.2.2` after manual publish
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
  Confirm `version` is `1.2.2`, `dist-tags.latest` is `1.2.2`, and the
  `readme` field reflects the 1.2.x features plus the adoption docs links.
- [ ] Maintainer refreshes the demo `package-lock.json` integrity hashes:
  ```bash
  cd demo && npm install
  ```
   (Required because the demo's `package-lock.json` may need registry integrity
   hashes after the package is published.)

---

## Post-publish (`v1.2.2`)

- [ ] GitHub Release created from `CHANGELOG.md` entry for `1.2.2`.
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
