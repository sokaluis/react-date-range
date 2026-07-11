# npm Publishing Guide

> Quick reference for publishing `@cyberlz/react-date-range` to npm.
> Not a step-by-step tutorial — covers what matters for this project specifically.
>
> For the full release pipeline (git, tags, GitHub, npm), see
> [`docs/release-flow.md`](release-flow.md).

---

## Is it easy?

Yes. Publishing to npm is straightforward:

```bash
npm login                # one-time
npm publish --tag beta   # publish current beta with beta tag
```

The harder parts are **pre-publish setup** (build, tests, CI, docs) and **post-publish
maintenance** (issues, PRs, releases).

---

## Does it cost money?

**No.** npm public packages are free. There is no cost to publish or maintain
a public package on the npm registry.

Costs to consider (optional):
- CI minutes (GitHub Actions free tier: 2,000 min/month for private repos, unlimited for public)
- Custom domain for docs site (optional, ~$10-15/year)
- Your time (the real cost)

---

## npm scope options

| Option | Package name example | Notes |
|--------|---------------------|-------|
| **Unscoped** | `react-date-range` | Simplest. Anyone can publish if name is available. |
| **User scope** | `@yourusername/react-date-range` | Namespaced under your npm user. Clear ownership. |
| **Org scope** | `@myorg/react-date-range` | Requires a free npm organization. Good if you plan a team/community. |

**Recommendation**: We chose `@cyberlz/react-date-range` — a user-scoped package.
This keeps the `react-date-range` association for SEO/import discoverability while
the `@cyberlz` scope avoids confusion with the original unmaintained package.
Scoped packages require `--access public` (or `publishConfig.access: "public"` in
`package.json`).

---

## Visibility strategy

### Before publishing

1. **Engage on upstream issues** — post in React 19 issues (#661, #662) and
   maintenance issue (#590) that a maintained fork exists. Be respectful:
   the original maintainer archived the project, not abandoned it maliciously.
2. **Star/fork upstream** — show the chain of provenance.
3. **Prepare a comparison table** — what this fork fixes vs upstream `2.0.1`.

### At launch

1. **Publish prereleases with an explicit dist-tag** so `latest` is not affected. Users opt in:
   ```bash
   npm install @cyberlz/react-date-range@beta
   ```
2. **"Migrating from react-date-range" guide** is live at [`docs/migration-from-upstream.md`](docs/migration-from-upstream.md) — drop-in byte-compatible replacement for `react-date-range@2.0.1`.
3. **Post in React communities**: r/reactjs, Reactiflux Discord, Twitter/X,
   dev.to, etc.

### Post-launch

- Respond to issues quickly (first 30 days are critical for trust)
- Tag releases properly: alpha → beta → rc → stable
- Consider [npm ads](https://www.npmjs.com/products/advertising) if you want
  extra visibility (paid, optional)

---

## Semver for this project

| Stage | Version | npm tag | Meaning |
|-------|---------|---------|---------|
| **Alpha** | `0.1.0-alpha.0` | `alpha` | Unstable, may break. Internal/test usage. |
| **Alpha checkpoint** | `0.1.0-alpha.3` | `alpha` | Refactor in progress; tree-shaking delivered. |
| **Beta** | `0.1.0-beta.0` | `beta` | Internal refactor complete, public API stable for `0.1.x`; future visual redesign ideas were left uncommitted. |
| **RC** | `1.0.0-rc.0` | `rc` | Historical release candidate. Final testing before stable. |
| **Stable** | `1.2.x` | `latest` | Production-ready. Follows semver strictly. |

For `1.2.x`: all consumers use `npm install @cyberlz/react-date-range` (no tag required).
`latest` currently points to `1.2.0`.

### Stable-line rules

- `0.x.y` releases may contain breaking changes (semver allows this).
- Use `alpha`/`beta`/`rc` tags so `latest` stays on the last stable release.
- Once `1.0.0` ships, follow strict semver: MAJOR for breaking, MINOR for features,
  PATCH for fixes.

---

## License considerations

1. **Upstream is MIT** → no copyleft obligations. You can fork, modify, and relicense
   (though keeping MIT is simplest and most community-friendly).
2. **Preserve original copyright notice** in your LICENSE file.
3. **Add your own copyright line** for modifications.
4. **Include a NOTICE or ATTRIBUTION section** acknowledging the original project
   (see `NOTICE.md` in repo root).

---

## CI / Docs / Demo expectations

For a public npm package to be taken seriously:

| Asset | Priority | Notes |
|-------|----------|-------|
| **CI badge** | High | GitHub Actions: lint + type-check + build |
| **Demo page** | High | Live example people can play with. Vercel/Netlify free tier. |
| **CHANGELOG.md** | High | Keep a human-readable log of changes |
| **API docs** | Medium | Can start with README examples, evolve to Storybook or doc site |
| **Test coverage** | Medium | At least smoke tests for core components |
| **Contributing guide** | Low | Only needed when you accept external PRs |
| **Code of Conduct** | Low | Standard for larger projects |

### Demo page options

| Tool | Effort | Output |
|------|--------|--------|
| **Vite + simple React app** | Low | Single-page demo, easy to deploy |
| **Storybook** | Medium | Component catalog, good for development too |
| **Next.js app** | Medium | SSR test + demo in one |
| **CodeSandbox link** | Minimal | Quick embeddable demo, good for launch |

---

## Quick reference: pre-publish checklist

- [ ] Source builds (ESM + CJS)
- [ ] `tsc --noEmit` passes
- [ ] Tests pass
- [ ] Lint passes
- [ ] `package.json` has correct `name`, `version`, `license`, `repository`, `exports`
- [ ] `LICENSE` file present with original + new copyright
- [ ] `NOTICE.md` or equivalent attribution
- [ ] `CHANGELOG.md` has entry for this version
- [ ] `.npmignore` or `files` field excludes source maps, tests, config
- [ ] `npm pack --dry-run` shows correct files
- [ ] Demo page deployed and working
