# Getting Started

Install, CSS imports, and a minimal working snippet — everything you need to render a live picker in under five minutes.

---

## Install

```bash
npm install @cyberlz/react-date-range
```

Requires `react@^18.0.0 || ^19.0.0`, `react-dom@^18.0.0 || ^19.0.0`, and `date-fns@^3.0.0`.

---

## CSS imports

Add **both** CSS files before any component code. Place them once, above the fold (e.g. in `index.html` or your root layout).

```css
@import "@cyberlz/react-date-range/styles.css";
@import "@cyberlz/react-date-range/theme/default.css";
```

Or as JavaScript imports at your app entry point:

```js
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';
```

Both are required. `styles.css` provides the structural layout; `theme/default.css` provides the default visual theme.

---

## Named ESM imports

All exports are **named** — no default export. Import only what you use.

```ts
import { Calendar } from '@cyberlz/react-date-range';
import { DateRange } from '@cyberlz/react-date-range';
import { DateRangePicker } from '@cyberlz/react-date-range';
import { DefinedRange } from '@cyberlz/react-date-range';
import { DatePickerInput } from '@cyberlz/react-date-range';
import { DateRangeInput } from '@cyberlz/react-date-range';
```

Do not import the default export — it does not exist.

---

## SSR

`Calendar` is fully SSR-safe.

`DateRange` and `DateRangePicker` render a stable picker surface on the server. `DatePickerInput` and `DateRangeInput` guard browser API access (`window`/`document`) with `typeof`-of-undefined checks. None of these components require `ssr: false` by default.

If you encounter hydration mismatches with input components, the likely cause is open/closed popover state differing between server and client renders. Keep popover state closed initially (`defaultOpen={false}` or `open={false}`) and let user interaction or client-side hydration drive the first open.

For SSR frameworks with known hydration issues, dynamic import with `ssr: false` is a practical workaround:

```tsx
// Next.js (pages router)
import dynamic from 'next/dynamic';

const DateRangePicker = dynamic(
  () => import('@cyberlz/react-date-range').then((m) => m.DateRangePicker),
  { ssr: false }
);
```

For server-rendered static pages, `Calendar` renders without popover chrome.

---

## End-to-end snippet

```tsx
import * as React from 'react';
import { DateRangePicker } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';

function App() {
  const [ranges, setRanges] = React.useState([
    { startDate: new Date(), endDate: new Date(), key: 'selection' },
  ]);

  return (
    <DateRangePicker
      ranges={ranges}
      onChange={(rangesByKey) => setRanges([rangesByKey.selection])}
    />
  );
}
```

This renders a controlled range picker. For the full controlled-state pattern, see [`docs/integrations/controlled-state.md`](./integrations/controlled-state.md).

---

## Next steps

- Full evaluation guide: [`docs/evaluation-guide.md`](./evaluation-guide.md)
- Component reference: [`docs/components/README.md`](./components/README.md)
- Migration from upstream: [`docs/migration-from-upstream.md`](./migration-from-upstream.md)
