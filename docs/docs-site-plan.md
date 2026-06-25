# Docs Site Plan — Landing & Vercel

> **Lead:** Do NOT deploy a landing page yet. Build it when the alpha is validated
> by a real consumer, a minimal demo exists, and API docs are written.
> Target Vercel; launch the landing BEFORE seeking external users.

---

## Quick path

1. Validate alpha in a clean consumer project (`npm install @cyberlz/react-date-range@alpha`) → ✅ done (2026-06-25)
2. Build a minimal demo (Vite + React, single-page `<DateRangePicker />`)
3. Write API docs and migration notes from upstream
4. Deploy to Vercel (free tier, auto-deploy from GitHub)
5. **Then** announce in community channels

---

## Why wait?

| Risk of early landing | Mitigation by waiting |
|-----------------------|-----------------------|
| Landing looks polished but the package has unknown bugs | Consumer smoke test catches issues first |
| Demo page silently broken — no one tested it in isolation | Minimal demo built and validated before landing |
| Users arrive, can't find API docs, leave | Docs written before go-live |
| Wasted effort: landing content rewritten after alpha feedback | Write content once, when the API is stable |
| False signal of "production-ready" | Landing labeled clearly as alpha/pre-release |

---

## What the landing page should include

| Section | Content |
|---------|---------|
| Hero + install command | `npm install @cyberlz/react-date-range@alpha` |
| Live demo (embedded) | `<DateRangePicker />` with interactive ranges |
| API reference | Props table, examples, Range type |
| Migration from upstream | Diff: what changed, what's compatible, what's new |
| Alpha status badge | Clear "Alpha — not production-ready yet" banner |
| GitHub link | `sokaluis/react-date-range` |

---

## Vercel setup (when ready)

```bash
# 1. Create demo/ dir at repo root with a standalone Vite+React app
# 2. Add vercel.json:
{
  "buildCommand": "cd demo && npm install && npm run build",
  "outputDirectory": "demo/dist",
  "installCommand": null
}
# 3. Connect repo to Vercel dashboard
# 4. Set root directory to demo/
```

---

## Timing decision

| Milestone | Landing status |
|-----------|---------------|
| Alpha published | ❌ Don't deploy |
| Consumer smoke test passed (current) | ❌ Don't deploy yet |
| Minimal demo built + API docs drafted | ✅ Deploy to Vercel |
| External announcement | Landing must be live |

---

## Checklist

- [x] Consumer smoke test passes (`tsc --noEmit` + `vite build` on clean project) — React 18 ✅ and React 19 ✅, resolved from `https://registry.npmjs.org/`
- [ ] Minimal demo built (single-page Vite app importing `<DateRangePicker />`)
- [ ] API docs written (props table, examples, migration notes)
- [ ] Vercel connected to GitHub repo
- [ ] Landing page deployed with alpha badge
- [ ] Link added to README.md under "Demo"

## Next step

Complete the demo app. See `docs/release-checklist.md` → "Demo page checklist".
