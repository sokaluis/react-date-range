# Docs Site Plan — Landing, Demo & Full Documentation

> **Status: ready to plan.** `@cyberlz/react-date-range@1.2.x` is the stable line on npm
> `latest` (`1.2.2` published, corrected after `1.2.1` shipped stale `dist/`). The local demo
> resolves to local source during development so landed-but-unpublished changes can be validated.
> The current adoption asset is a small public landing/demo site, followed by full component
> documentation.

---

## Quick path

1. Use the existing `demo/` Vite app as the public demo baseline.
2. Add landing copy around the demo: value proposition, install command, migration link, GitHub/npm links.
3. Deploy to GitHub Pages from `demo/`. ✅
4. Add the public demo URL to `README.md`. ✅
5. Expand into full documentation: component props, examples, styling, accessibility, troubleshooting.
6. Announce externally only after the landing URL and core docs are reachable.

---

## Why now?

| Previous risk | Current state |
|---------------|---------------|
| Package was pre-release | `1.2.x` is stable on npm `latest` (`1.2.2` published) |
| Demo might drift from package source | `demo/` resolves `@cyberlz/react-date-range` to local `src/` during development and is type-checked |
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
| Stable status badge | `1.2.x stable · maintained fork · React 18/19 · input-trigger pickers` |
| Migration from upstream | Link to `docs/migration-from-upstream.md` |
| Core docs links | README, changelog, roadmap, GitHub release |
| npm / GitHub links | npm package, repository, issue tracker |

---

## Full documentation scope

Full docs should grow after the landing baseline, not before it.

| Area | Scope |
|------|-------|
| Getting started | Install, CSS imports, minimal usage |
| Components | `Calendar`, `DateRange`, `DateRangePicker`, `DefinedRange`, `DatePickerInput`, `DateRangeInput` |
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
- Live URL: <https://sokaluis.github.io/react-date-range/>

---

## Timing decision

| Milestone | Landing status |
|-----------|---------------|
| `1.0.0` stable published | ✅ Done (2026-06-29) |
| `1.2.x` stable line on npm | ✅ Done (`1.2.2` published on npm `latest`) |
| Local demo validates current source | ✅ Ready to reuse as baseline |
| Landing copy + GitHub Pages workflow ready | ✅ Deploy |
| Public demo URL live | ✅ Added to README |
| Full docs expanded | Announce more broadly |

---

## Checklist

- [x] Consumer smoke test passes (`tsc --noEmit` + `vite build` on clean projects)
- [x] Minimal demo validated — `demo/`, local source alias, typecheck ✅, build ✅
- [x] Migration notes written — see `docs/migration-from-upstream.md`
- [x] Roadmap written — see `docs/post-1.0-roadmap.md`
- [x] Landing copy added to `demo/` — hero + Before/After panel in `demo/src/main.tsx`, quick-links in `README.md` (docs-adoption, 2026-07-11)
- [x] GitHub Pages workflow added
- [x] Landing page deployed with stable status badge — <https://sokaluis.github.io/react-date-range/>
- [x] Public demo URL added to `README.md`
- [x] Full component docs written

## Next step

Adoption track is complete. The next open work is the **Configurable UI foundation**
track, which requires a separate API design spec. See `docs/roadmap-gap-analysis.md`.
