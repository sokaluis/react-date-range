# Research — react-date-range Ecosystem

> **Date:** Pre-implementation research, June 2026.
> Consolidated evidence from external investigation (June 2026).
> All links point to [`hypeserver/react-date-range`](https://github.com/hypeserver/react-date-range)
> unless noted otherwise.

---

## Upstream status

| Signal | Finding |
|--------|---------|
| Repository | **Archived / read-only** |
| GitHub stars | ~2,621 |
| GitHub forks | ~705 |
| Open issues | ~239 |
| Last GitHub release | `1.4.0` on 2021-09-11 |
| Latest npm version | `2.0.1` published 2024-04-22 |
| npm weekly downloads | High (exact figure varies; library still widely used) |
| Peer deps (npm) | `date-fns: 3.0.6 \|\| >=3.0.0`, `react: ^0.14 \|\| ^15.0.0-rc \|\| >=15.0` |

**Key takeaway**: The npm package `2.0.1` was published over 2 years after the last
GitHub release. The repo is archived, meaning no further upstream releases are expected.

---

## Key issues

### React compatibility

| Issue | Description | Relevance |
|-------|------------|-----------|
| [#661](https://github.com/hypeserver/react-date-range/issues/661) | React 19 peer dependency / compatibility | **Critical** — blocks React 19 adoption |
| [#662](https://github.com/hypeserver/react-date-range/issues/662) | JSX component type issues with React 19 | **Critical** — type errors in strict mode |
| [#604](https://github.com/hypeserver/react-date-range/issues/604) | JSX/component type issues (earlier report) | Related to #662 |
| [#577](https://github.com/hypeserver/react-date-range/issues/577) | Scroll issues in React 18 StrictMode | Runtime risk |
| [#653](https://github.com/hypeserver/react-date-range/issues/653) | Infinite scroll in StrictMode | Runtime risk |

### date-fns compatibility

| Issue | Description |
|-------|------------|
| [#649](https://github.com/hypeserver/react-date-range/issues/649) | date-fns v3/v4 compatibility |
| [#663](https://github.com/hypeserver/react-date-range/issues/663) | date-fns v4 import changes |
| [#667](https://github.com/hypeserver/react-date-range/issues/667) | date-fns v4 breaking changes |

### Maintenance & community

| Issue | Description |
|-------|------------|
| [#590](https://github.com/hypeserver/react-date-range/issues/590) | Maintenance / takeover discussion |
| [#260](https://github.com/hypeserver/react-date-range/issues/260) | TypeScript support request |
| [#439](https://github.com/hypeserver/react-date-range/issues/439) | TypeScript types improvement |
| [#513](https://github.com/hypeserver/react-date-range/issues/513) | TypeScript strict mode issues |
| [#373](https://github.com/hypeserver/react-date-range/issues/373) | Accessibility / keyboard navigation |
| [#415](https://github.com/hypeserver/react-date-range/issues/415) | Accessibility improvements |
| [#416](https://github.com/hypeserver/react-date-range/issues/416) | ARIA roles and labels |

---

## Notable open PRs

| PR | Description | Value for fork |
|----|------------|----------------|
| [#654](https://github.com/hypeserver/react-date-range/pull/654) | date-fns v4 guard / compatibility | **High** — likely first cherry-pick |
| [#665](https://github.com/hypeserver/react-date-range/pull/665) | Fix color `ReferenceError` regression | **High** — runtime bugfix |
| [#669](https://github.com/hypeserver/react-date-range/pull/669) | RTL styles | Medium — useful for i18n |
| [#508](https://github.com/hypeserver/react-date-range/pull/508) | `focusedRange` end-date handling | Medium — UX improvement |
| [#539](https://github.com/hypeserver/react-date-range/pull/539) | `DateInput` min/max validation | Medium — correctness |
| [#470](https://github.com/hypeserver/react-date-range/pull/470) | Time picker support | Low — scope expansion |
| [#495](https://github.com/hypeserver/react-date-range/pull/495) | Cross-month range selection | Low — edge case |

---

## Fork landscape

> **Caution**: The following observations are based on GitHub/npm metadata as of June 2026.
> Each fork may have evolved since. Verify before relying on any of them.

| Fork / Package | npm | Notes |
|---------------|-----|-------|
| `iroomitapp/react-date-range` | `@iroomit/react-date-range@3.2.3` | Most notable fork. TypeScript port, React 17/18 peer deps. Last publish 2024-03-20. ~17 stars, ~9 forks. **Not clearly active in 2026**, but useful for studying TypeScript/date-fns v3 patterns. |
| `herii/react-date-range` | `@herii/react-date-range@2.1.2` | Smaller fork. Last publish 2024-12-23. |
| `react-date-range-headless` | `react-date-range-headless@1.2.7` | Headless UI variant. Low adoption, appears old. |
| `react-date-range-dayjs` | `react-date-range-dayjs@1.1.5` | Replaces date-fns with Day.js. Divergent path — not directly useful for this fork. |

**Key takeaway**: None of the existing forks appear actively maintained in 2026
with a published React 19 fix. There is a clear gap.

---

## Summary of findings

- **Upstream is dead** — archived, no maintainer, no future releases.
- **The library is still widely used** — significant npm downloads, 2.6k stars.
- **Modernization debt is concentrated** in React 19, TypeScript, date-fns v4, and build tooling.
- **Community has attempted fixes** (open PRs like #654, #665) but no one merged them upstream.
- **Existing forks are partial and mostly inactive** — opportunity to become the definitive maintained fork.
- **Phase 0 should focus on types, React 19, build, and SSR**, not on feature expansion or visual redesign.
