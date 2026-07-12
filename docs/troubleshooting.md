# Troubleshooting

Known integration issues and their fixes. For version-specific migration notes, see [`docs/migration-from-upstream.md`](./migration-from-upstream.md). For a full install-and-evaluate walkthrough, see [`docs/evaluation-guide.md`](./evaluation-guide.md).

---

## SSR — popover hydration mismatch

`DateRange` and `DateRangePicker` render stable picker HTML on the server. `DatePickerInput` and `DateRangeInput` guard browser APIs with `typeof window/document !== 'undefined'` checks.

A hydration mismatch is most likely when the popover is open on one render and closed on the other. The practical fix is to keep popover state closed initially (`defaultOpen={false}` or controlled `open={false}`) and open it after hydration.

If your framework has known issues with mixed SSR/client renders, dynamic import with `ssr: false` is a workaround:

```tsx
// Next.js (pages router)
import dynamic from 'next/dynamic';

const DateRangePicker = dynamic(
  () => import('@cyberlz/react-date-range').then((m) => m.DateRangePicker),
  { ssr: false }
);
```

`Calendar` is SSR-safe and renders without popover chrome.

---

## ESM / CJS import shape

The package emits both ESM (`.mjs`) and CJS (`.cjs`) bundles.

| Bundler / runtime | Use |
|-------------------|-----|
| Vite, Webpack 5, esbuild, Rollup | ESM (`dist/index.mjs`) |
| Node.js `require()` | CJS (`dist/index.cjs`) |

Named imports work in both modes:

```ts
// ESM
import { DateRangePicker } from '@cyberlz/react-date-range';

// CJS
const { DateRangePicker } = require('@cyberlz/react-date-range');
```

Do not use `require('@cyberlz/react-date-range/dist/locale/...')` — that deep-import path is no longer shipped. Use `date-fns/locale` directly for locale objects.

---

## Vite — missing default export warning

If Vite logs `The requested module '@cyberlz/react-date-range' does not provide a default export`, the fix is to use named imports instead:

```ts
// Wrong — no default export exists
import DateRangePicker from '@cyberlz/react-date-range';

// Correct — all exports are named
import { DateRangePicker } from '@cyberlz/react-date-range';
```

This is not a Vite configuration issue.

---

## Webpack 5 — module federation

If using Webpack Module Federation with a React 18 host, ensure the host does not bundle `react` separately:

```js
// webpack.config.js (host)
new ModuleFederationPlugin({
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
});
```

Missing `singleton: true` causes hook errors when the host and remote disagree on the `react` instance.

---

## Next.js App Router — client component boundary

Next.js App Router requires interactive components to live behind a client component boundary. Mark the wrapper with `'use client'` and import the package normally:

```tsx
// app/daterange-picker.tsx
'use client';

import { DateRangePicker } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';

export default function DateRangePickerWrapper() {
  return <DateRangePicker />;
}
```

Do not import the interactive picker directly in a Server Component. If your app still has hydration issues because of surrounding state, use `next/dynamic` with `ssr: false` as an app-level workaround, not as the library's default requirement.

---

## date-fns locale import path

The package declares `date-fns@^3.0.0` as a peer dependency. Locale imports use the `date-fns/locale` named exports:

```tsx
import { enUS } from 'date-fns/locale';
import { DateRangePicker } from '@cyberlz/react-date-range';

<DateRangePicker locale={enUS} />;
```

Do **not** use the removed `react-date-range/dist/locale` deep-import path. That bundle is not shipped by this package.

If you are migrating from upstream `react-date-range@2.x`, replace `require('react-date-range/dist/locale/{lang}')` with `require('date-fns/locale/{lang}')` from `date-fns@^3.0.0`.

---

## Peer dependencies

The package declares these peer dependencies:

| Package | Required version | Notes |
|---------|-----------------|-------|
| `react` | `^18.0.0 \|\| ^19.0.0` | React 17 is not supported |
| `react-dom` | `^18.0.0 \|\| ^19.0.0` | |
| `date-fns` | `^3.0.0` | `date-fns@2` is not supported |

If you see peer dependency warnings, install the correct version:

```bash
npm install react@^19 react-dom@^19 date-fns@^3
```

---

## `Range.label` is not rendering as HTML

`Range.label` is intentionally rendered as plain text only. No HTML is injected, making it XSS-safe by design. `Range.label` does not accept HTML and will always render as text.

---

## `DatePickerInput` or `DateRangeInput` does not open

These components open on a user gesture by default (click, Enter, Space on the trigger). They also support fully-controlled `open` + `onOpenChange` for programmatic control:

```tsx
const [open, setOpen] = useState(false);

<DateRangeInput
  open={open}
  onOpenChange={setOpen}
  // ...
/>
```

Set `open={true}` to open programmatically — no user gesture required.

`DateRangePicker` is different: it renders the picker surface directly and has no popover/open-state API. Use `DateRangeInput` when you need a trigger + popover range picker.

---

## See also

- [Migration from upstream](./migration-from-upstream.md)
- [Evaluation guide](./evaluation-guide.md)
- [Component reference](./components/README.md)
