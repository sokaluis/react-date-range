# Source Provenance — @cyberlz/react-date-range

> Record of where the upstream source came from and what was imported.

---

## Upstream source

| Field | Value |
|-------|-------|
| **Original package** | `react-date-range` |
| **Version imported** | `2.0.1` |
| **Source** | npm registry — `npm pack react-date-range@2.0.1` |
| **npm publish date** | ~2024 (package metadata last updated before repository archival) |
| **Upstream repo** | [hypeserver/react-date-range](https://github.com/hypeserver/react-date-range) (archived/read-only as of 2025+) |
| **Upstream license** | MIT (see [`LICENSE`](../LICENSE)) |
| **Upstream contributors** | Burak Can, Mehmet Kamil Morcay, Kamyar Ghasemlou, Engin Semih Basmacı, Onur Kerimov |
| **Import date** | 2026-06-24 |
| **Import method** | Downloaded tarball from npm, extracted `package/src/`, `package/LICENSE`, `package/CHANGELOG.md` |

### Imported files

```
src/                          # Full upstream source (plain JS + SCSS)
  index.js                    # Barrel exports
  styles.js                   # CSS class name map (rdr* prefix)
  styles.scss                 # Main stylesheet
  utils.js                    # Calendar/range utilities
  defaultRanges.js            # Predefined range definitions
  accessibility/index.js      # ARIA labels shape (PropTypes)
  components/
    Calendar/index.js          # Main calendar (PureComponent, ~620 lines)
    Calendar/index.scss
    Calendar/README.md
    DateRange/index.js         # Date range wrapper (Component)
    DateRange/index.scss
    DateRange/README.md
    DateRangePicker/index.js   # Combined picker (Component)
    DateRangePicker/index.scss
    DateRangePicker/README.md
    DayCell/index.js           # Individual day cell (Component)
    DayCell/index.scss
    DefinedRange/index.js      # Predefined range sidebar (Component)
    DefinedRange/index.scss
    DefinedRange/README.md
    InputRangeField/index.js   # Days-up-to-today input (Component)
    Month/index.js             # Month grid renderer (PureComponent)
  locale/index.js              # i18n locale support
  theme/default.scss           # Default theme
LICENSE                        # MIT license with original copyright lines
CHANGELOG.upstream.md          # Upstream release changelog
```

### Files NOT imported (intentionally)

| File | Reason |
|------|--------|
| `.eslintignore` | Will configure our own ESLint |
| `.prettierrc` | Will configure our own Prettier |
| `jest.config.js` | Will configure our own Jest |
| `setupTests.js` | Will configure our own test setup |
| `dist/` | Will rebuild from our own toolchain |
| `CONTRIBUTING.md` | Will write our own when accepting PRs |

---

## Upstream dependency snapshot

From the original `package.json` at `v2.0.1`:

```json
{
  "dependencies": {
    "classnames": "^2.2.6",
    "prop-types": "^15.7.2",
    "react-list": "^0.8.13",
    "shallow-equal": "^1.2.1"
  },
  "peerDependencies": {
    "date-fns": "3.0.6 || >=3.0.0",
    "react": "^0.14 || ^15.0.0-rc || >=15.0"
  }
}
```

**What we changed in peerDependencies:**
- Narrowed `react` from `^0.14 || ^15.0.0-rc || >=15.0` → `^18.0.0 || ^19.0.0`
- Added explicit `react-dom` peer at `^18.0.0 || ^19.0.0`
- Kept `date-fns` peer range unchanged (`3.0.6 || >=3.0.0`)

---

## Known mismatches & risks

| # | Observation | Risk |
|---|-------------|------|
| 1 | Upstream uses class components only — no hooks | Low. React 19 still supports class components. |
| 2 | Uses `prop-types` for runtime validation | Low. Still works, but generates warnings differently in React 19. |
| 3 | Uses callback refs (`ref={t => (this.x = t)}`) | Medium. React 19 changed cleanup timing for callback refs. Needs testing. |
| 4 | Uses `react-list` (unmaintained package since 2019) | Medium. May need replacement in future. Still works for now. |
| 5 | `defaultRanges.js` calls `new Date()` in module scope | Low. Side effect on import — dates are fixed relative to import time. |
| 6 | SCSS requires build step (PostCSS/autoprefixer) | Low. Standard for the ecosystem. |
| 7 | No TypeScript types included | Medium. Need to merge `@types/react-date-range` or create our own. |
| 8 | Tests use Enzyme (React 16 adapter) | High. Must migrate to React Testing Library for React 18/19 compatibility. |

---

## License attribution

Upstream license is MIT. The original `LICENSE` file has been copied to the repo root.
See [`NOTICE.md`](../NOTICE.md) for attribution requirements before publishing.
