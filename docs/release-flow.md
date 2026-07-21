# Release Flow — Git, Tags, GitHub & npm

> Canonical reference for the full release pipeline.
> Linked from [`release-checklist.md`](release-checklist.md) and [`npm-publishing.md`](npm-publishing.md).
> **All commands are documentation/dry-run only.** Do not execute commit/tag/publish
> until the release checklist is complete.

---

## Prerequisites

- [ ] GitHub repository created at `https://github.com/sokaluis/react-date-range`
- [ ] Git initialized locally in this directory (`git init && git checkout -b main`)
- [x] `package.json` `private: true` **removed** before first publish
  - `private: true` prevents accidental `npm publish` — safety guard during development
  - ⚠️ **Publishing is NOT happening now.** `private` is removed so the metadata
    is release-ready, but no tag, npm publish, or GitHub Release has been executed.
- [x] `package.json` `author` field filled
- [ ] npm logged in: `npm login` (verify with `npm whoami`)

---

## Branch & commit conventions

| Rule | Value |
|------|-------|
| Default branch | `main` |
| Commit style | [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`) |
| Pre-commit | Tests pass locally, lint clean |

**Commit message examples:**
```
feat: add first-party TypeScript declarations
fix: resolve StrictMode scroll crash in Calendar
chore: bump peer deps for React 19
docs: add release flow documentation
```

---

## Tag naming

| Release type | Tag format | Example |
|-------------|------------|---------|
| Alpha | `v{version}-alpha.{n}` | `v0.1.0-alpha.1` |
| Beta | `v{version}-beta.{n}` | `v0.1.0-beta.0` |
| RC | `v{version}-rc.{n}` | `v1.0.0-rc.0` |
| Stable | `v{version}` | `v1.4.0` |

**Current npm stable:** `v1.3.0` is published on npm `latest`; `v1.1.1` tag
exists at commit `843b09b` (historical, never promoted to npm `latest`).

**Prepared release:** `v1.4.0` is a local release checkpoint for responsive fluid
layouts and input-popover placement. It is not tagged or published yet.

**Release metadata target:** `v1.4.0`
- `package.json` version: `1.4.0`
- npm `latest`: `1.3.0` until the maintainer publishes `1.4.0`

The `package.json` `version` field **must match** the tag version exactly.

**First alpha tag:** `v0.1.0-alpha.0`
- `package.json` version: `0.1.0-alpha.0` (update before tagging)

**Second alpha tag:** `v0.1.0-alpha.1`
- `package.json` version: `0.1.0-alpha.1` (update before tagging)
- npm dist-tag: `alpha`

**Third alpha tag:** `v0.1.0-alpha.2`
- `package.json` version: `0.1.0-alpha.2` (update before tagging)
- npm dist-tag: `alpha`

**First beta tag:** `v0.1.0-beta.0`
- `package.json` version: `0.1.0-beta.0` (update before tagging)
- npm dist-tag: `beta`
- optional: move `alpha` to `0.1.0-beta.0` so existing prerelease users receive the newest checkpoint

---

## Release order

```
commit → CI green → tag → GitHub Release → npm publish → verify dist-tags
```

### Step 1 — Prepare commit

1. Ensure all changes are committed on `main`
2. Push: `git push origin main`
3. Wait for CI to pass (`.github/workflows/ci.yml`)

### Step 2 — Tag

```bash
# Dry-run only — do NOT execute without explicit approval
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1
```

**Third alpha tag (published):** `v0.1.0-alpha.2`
- `package.json` version: `0.1.0-alpha.2` (update before tagging)
- npm dist-tag: `alpha`

**First beta tag (published):** `v0.1.0-beta.0`
- `package.json` version: `0.1.0-beta.0`
- npm dist-tag: `beta`

**Current RC tag (published):** `v1.0.0-rc.0`
- `package.json` version: `1.0.0-rc.0`
- npm dist-tag: `rc`

**v1.1.0 published:** `v1.1.0`
- `package.json` version: `1.1.0`
- npm dist-tag: `latest`

**v1.1.1 tag exists; npm publish never executed:** `v1.1.1`
- `package.json` version: `1.1.1` (commit `843b09b`)
- npm dist-tag: not promoted — superseded by `v1.2.0`

**v1.2.0 published on npm `latest`:** `v1.2.0`
- `package.json` version: `1.2.0`
- npm dist-tag: `latest` (at publish time)

**v1.2.1 published, superseded:** `v1.2.1`
- `package.json` version: `1.2.1`
- npm dist-tag: published, but superseded because `dist/` was not rebuilt before publish

**v1.2.2 published, superseded:** `v1.2.2`
- `package.json` version: `1.2.2`
- npm dist-tag: previous stable on `latest`, superseded by `v1.3.0`

**v1.3.0 published:** `v1.3.0`
- `package.json` version: `1.3.0`
- npm dist-tag: `latest`

**v1.4.0 prepared locally:** `v1.4.0`
- `package.json` version: `1.4.0`
- npm dist-tag: not yet published; `latest` remains `1.3.0`

### Step 3 — GitHub Release

Create a release on GitHub:
- Tag: `v0.1.0-alpha.1`
- Title: `v0.1.0-alpha.1 — Second Public Alpha`
- Body: relevant section from `CHANGELOG.md`
- Mark as pre-release (for alpha/beta/rc)

### Step 4 — npm publish

```bash
# Dry-run only — do NOT execute without explicit approval
npm publish --tag alpha --access public
```

**Why `--tag alpha`:**
- Does NOT touch the `latest` dist-tag
- Users must opt in: `npm install @cyberlz/react-date-range@alpha`
- `latest` stays on the last stable release; `alpha` is for testers

For `0.1.0-beta.0`, use `npm publish --tag beta --access public`. The `beta`
tag exists for the first beta checkpoint. If desired, move `alpha` to the same
version after publishing so `@alpha` continues to mean "newest prerelease" while
`@beta` marks the beta channel explicitly.

> First-time scoped publishes can leave `latest` pointing at the first version
> even when publishing with `--tag alpha`, because npm needs a default tag while
> there is no stable version. Keep all docs/examples on `@alpha` until a stable
> release exists, then move `latest` intentionally.

**Why `--access public`:**
- Scoped packages (`@cyberlz/*`) are private by default on npm
- `--access public` (or `publishConfig.access: "public"` in `package.json`) makes it public

---

## npm dist-tags

| Dist-tag | Points to | Audience |
|----------|-----------|----------|
| `latest` | `1.3.0` | Default npm installs |
| `alpha` | `0.1.0-alpha.3` (legacy) | Existing testers: `npm install @cyberlz/react-date-range@alpha` |
| `beta` | `0.1.0-beta.0` (legacy) | Early adopters: `npm install @cyberlz/react-date-range@beta` |
| `rc` | `1.0.0-rc.0` (stable anchor for pre-1.0 testers) | Pre-release validation: `npm install @cyberlz/react-date-range@rc` |

**Managing dist-tags:**
```bash
# Check current dist-tags
npm dist-tag ls @cyberlz/react-date-range

# Move a tag (e.g., point alpha to the first beta after publish)
npm dist-tag add @cyberlz/react-date-range@0.1.0-beta.0 alpha

# Promote a patch to latest after publish, if needed
npm dist-tag add @cyberlz/react-date-range@1.3.0 latest
```

---

## Version consistency

| Source | Example | Must match |
|--------|---------|------------|
| `package.json` → `version` | `1.4.0` | Git tag |
| Git tag | `v1.4.0` | `package.json` version (minus `v` prefix) |
| GitHub Release tag | `v1.4.0` | Git tag |
| npm version (registry) | `1.4.0` | `package.json` version after publish |

**Order matters:** update `package.json` version → commit → tag → push → publish.

---

## First-time setup checklist

- [ ] Create GitHub repo: `sokaluis/react-date-range` (public)
- [ ] Initialize git locally:
  ```bash
  # Dry-run only
  git init
  git checkout -b main
  git add .
  git commit -m "chore: initial commit — react-date-range fork"
  git remote add origin git@github.com:sokaluis/react-date-range.git
  git push -u origin main
  ```
- [ ] Enable GitHub Actions (on by default for public repos)
- [ ] Verify CI passes on `main`
- [x] Remove `private: true` from `package.json`
- [x] Fill `author` in `package.json`
- [x] Add copyright line to `LICENSE` (see `NOTICE.md`)
- [ ] Run full release checklist: [`release-checklist.md`](release-checklist.md)
- [ ] Tag and publish (step 2–4 above)

---

## Quick reference

```bash
# View package on npm (read-only, safe)
npm view @cyberlz/react-date-range

# View specific version
npm view @cyberlz/react-date-range@alpha version

# Dry-run pack (safe, no publish)
npm pack --dry-run

# Who am I logged in as
npm whoami
```
