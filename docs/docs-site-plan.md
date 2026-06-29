# Docs Site Plan — Landing, Demo & Full Documentation

> **Status: ready to plan.** `@cyberlz/react-date-range@1.0.0` is live on npm
> `latest`, the local demo consumes the stable package, and migration notes exist.
> The next adoption asset is a small public landing/demo site, followed by full
> component documentation.

---

## Quick path

1. Use the existing `demo/` Vite app as the public demo baseline.
2. Add landing copy around the demo: value proposition, install command, migration link, GitHub/npm links.
3. Deploy to GitHub Pages from `demo/`.
4. Add the public demo URL to `README.md`.
5. Expand into full documentation: component props, examples, styling, accessibility, troubleshooting.
6. Announce externally only after the landing URL and core docs are reachable.

---

## Why now?

| Previous risk | Current state |
|---------------|---------------|
| Package was pre-release | `1.0.0` is stable on npm `latest` |
| Demo might not install the real package | `demo/` resolves `@cyberlz/react-date-range@1.0.0` from npm and builds |
| Migration path was unclear | `docs/migration-from-upstream.md` exists |
| Roadmap could overpromise | `docs/post-1.0-roadmap.md` marks future work as exploratory |

The landing page is now useful: it can show a stable maintained fork without
pretending future roadmap candidates are already committed features.

---

## Landing page content

| Section | Content |
|---------|---------|
| Hero + install command | `npm install @cyberlz/react-date-range` |
| Live demo | Interactive `<DateRangePicker />` from `demo/` |
| Stable status badge | `1.0.0 stable · maintained fork · React 18/19` |
| Migration from upstream | Link to `docs/migration-from-upstream.md` |
| Core docs links | README, changelog, roadmap, GitHub release |
| npm / GitHub links | npm package, repository, issue tracker |

---

## Full documentation scope

Full docs should grow after the landing baseline, not before it.

| Area | Scope |
|------|-------|
| Getting started | Install, CSS imports, minimal usage |
| Components | `Calendar`, `DateRange`, `DateRangePicker`, `DefinedRange` |
| Props reference | Props tables sourced from `src/index.d.ts` |
| Examples | Basic range, static ranges, disabled dates, locale, controlled state |
| Styling | CSS files, theme overrides, future tokens/slots roadmap |
| Accessibility | Keyboard navigation, ARIA behavior, known follow-up work |
| Migration | Upstream compatibility, removed deps, behavioral fixes |
| Troubleshooting | SSR, ESM/CJS, bundlers, date-fns locales |

---

## GitHub Pages setup

The demo is deployed by `.github/workflows/pages-demo.yml`.

- Vite uses `base: '/react-date-range/'`, matching the GitHub Pages project path.
- The workflow installs `demo/` dependencies, runs `npm run typecheck`, builds the demo,
  and publishes `demo/dist` through GitHub Pages Actions.
- The expected URL is `https://sokaluis.github.io/react-date-range/` once Pages is enabled
  for GitHub Actions in the repository settings.

---

## Timing decision

| Milestone | Landing status |
|-----------|---------------|
| `1.0.0` stable published | ✅ Ready to plan |
| Local demo validates npm stable | ✅ Ready to reuse as baseline |
| Landing copy + GitHub Pages workflow ready | ✅ Deploy |
| Public demo URL live | Add link to README |
| Full docs expanded | Announce more broadly |

---

## Checklist

- [x] Consumer smoke test passes (`tsc --noEmit` + `vite build` on clean projects)
- [x] Minimal demo built and validated — `demo/`, npm stable, typecheck ✅, build ✅
- [x] Migration notes written — see `docs/migration-from-upstream.md`
- [x] Roadmap written — see `docs/post-1.0-roadmap.md`
- [ ] Landing copy added to `demo/`
- [x] GitHub Pages workflow added
- [ ] Landing page deployed with stable status badge
- [ ] Public demo URL added to `README.md`
- [ ] Full component docs written

## Next step

Enable GitHub Pages from Actions in repository settings if it is not already enabled,
then let the workflow deploy `demo/`. Full documentation can grow from the same public
entry point without blocking `1.0.x` bugfix work.
