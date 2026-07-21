# Release Checklist — `v1.4.0`

> **Status.** `v1.4.0` is the minor-release checkpoint for responsive fluid
> calendars and configurable input-popover placement. The local build has
> regenerated `dist/`. Tagging and npm publishing are still maintainer actions.

See [`docs/npm-publishing.md`](npm-publishing.md) for publishing guidance and
[`docs/release-flow.md`](release-flow.md) for the full git/tag/npm pipeline.

---

## Before tagging `v1.4.0`

- [x] **`package.json` version**: `1.4.0`.
- [x] **`package-lock.json`** root package version: `1.4.0`.
- [x] **`demo/package.json`** dependency: `@cyberlz/react-date-range: "file:.."`.
- [x] **`CHANGELOG.md`** has a `## [1.4.0]` section covering fluid sizing,
      popover placement, mobile breakpoints, CSS width guards, and demo updates.
- [x] **`README.md`** and release documentation describe `1.4.0` as the stable
      release target for the npm package README.
- [ ] CI is green on the release commit.
- [x] `npm run build` passes and regenerates `dist/`.
- [x] `dist/` inspection confirms generated public API/types and CSS outputs.
- [x] `npm run type-check` passes.
- [x] `npm test -- --runInBand` passes.
- [x] `rtk git diff --check` exits clean (no whitespace errors).
- [x] `npm pack --dry-run` confirms the package includes `dist/` and declarations.
- [ ] `npm run lint` passes.
- [ ] Demo `npm run typecheck` passes.
- [ ] Smoke-install from npm registry in clean React 18 and React 19 projects
      (after `npm publish`).

---

## Tagging `v1.4.0` (maintainer)

> Tagging is separate from npm publish and has not been performed.

- [ ] Commit the release checkpoint on `main`.
- [ ] Push the release commit and wait for CI.
- [ ] Create and push `v1.4.0`.
- [ ] Create the GitHub Release from the `CHANGELOG.md` entry.

---

## Publishing `v1.4.0` (manual — maintainer)

> **The agent does NOT run `npm publish` and does NOT request OTP.**

- [ ] Publish with the `latest` tag:
  ```bash
  npm publish --tag latest --access public
  ```
- [ ] Verify `npm view @cyberlz/react-date-range@latest version` returns `1.4.0`.
- [ ] Verify `npm view @cyberlz/react-date-range@rc version` still returns `1.0.0-rc.0`.
- [ ] Smoke-install the registry package and confirm the npm README matches this repo.

---

## Post-publish

- [ ] Confirm npm `latest` resolves to `1.4.0`.
- [ ] Monitor responsive layout, narrow multi-month calendar, and input-popover
      placement regressions.
