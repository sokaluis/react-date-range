# Evaluation Guide

> Five minutes to a working `<DateRangePicker />` — no prior knowledge of this fork assumed.

## Value proposition

`@cyberlz/react-date-range` is a community-maintained fork of `react-date-range@2.0.1` targeting React 18/19, first-party TypeScript types, and additive accessibility/RTL improvements. Install and render in under five minutes.

---

## Install

```bash
npm install @cyberlz/react-date-range
```

> **Versioning:** the version above tracks npm `latest` and `package.json` as the source of truth. The current stable line is **1.4.x**.

Requires: `react@^18.0.0 || ^19.0.0`, `react-dom@^18.0.0 || ^19.0.0`, `date-fns@^3.0.0`.

---

## CSS import

```css
/* Pick one — default theme is all you need for a first render */
@import "@cyberlz/react-date-range/styles.css";
/* or the named export if your bundler prefers it */
@import "@cyberlz/react-date-range/dist/styles.css";
```

If you use a CSS reset, make sure it does not globally hide `[class*="drp"]` day cells — the component relies on scoped class names.

---

## Minimal usage

```tsx
import { DateRangePicker } from "@cyberlz/react-date-range";
import "@cyberlz/react-date-range/styles.css";

function App() {
  const [range, setRange] = useState({ startDate: undefined, endDate: undefined });

  return (
    <DateRangePicker
      onChange={(r) => setRange(r.range1)}
      ranges={[range]}
    />
  );
}
```

`range1` is the default key. `onChange` receives the full `RangeMap` object; pick `r.range1` for the default slot. See [`docs/integrations/controlled-state.md`](./integrations/controlled-state.md) for the full controlled-state pattern.

---

## Swap from upstream

If you currently use `react-date-range@2.0.1`:

```bash
# Replace the package — the component API is compatible for the 1.x line
npm install @cyberlz/react-date-range
```

**What changes:**

| Before | After |
|--------|-------|
| `react-date-range` | `@cyberlz/react-date-range` |
| `prop-types` runtime dep | Not needed — first-party TypeScript types included |
| Deep `dist/locale` imports | Use `date-fns/locale` directly |
| `date-fns@^2` | `date-fns@^3.0.0` (named exports only; default export no longer works) |

See [`docs/migration-from-upstream.md`](./migration-from-upstream.md) for the full list of silent behavior fixes and removed runtime dependencies.

---

## Gotchas

### SSR (Next.js, Remix, etc.)

`DateRangePicker` uses `window` and DOM APIs internally. Import dynamically with `ssr: false` or use the `onlyPicker` wrapper pattern:

```tsx
// Next.js pages router
import dynamic from "next/dynamic";

const DateRangePicker = dynamic(
  () => import("@cyberlz/react-date-range").then((m) => m.DateRangePicker),
  { ssr: false }
);
```

### date-fns locales

Pass a `date-fns` locale object via the `locale` prop on `<Calendar>` or `<DateRangePicker>`:

```tsx
import { enUS } from "date-fns/locale";
import { DateRangePicker } from "@cyberlz/react-date-range";

<DateRangePicker locale={enUS} />;
```

Do not use the removed `react-date-range/dist/locale` deep-import path — that bundle is no longer shipped.

### Tree-shaking

The barrel (`@cyberlz/react-date-range`) is tree-shakeable. Importing only what you use reduces bundle size:

```tsx
// Full ~58 KB
import { DateRangePicker } from "@cyberlz/react-date-range";

// Calendar only ~41 KB
import { Calendar } from "@cyberlz/react-date-range";
```

---

## React 18 / 19

Requires **React 18 or 19**. React 17 is not supported. If you are on React 17, upgrade before installing.

For context on what this fork adds over upstream, see [`docs/migration-from-upstream.md`](./migration-from-upstream.md).

---

## Next steps

- Controlled-state pattern: [`docs/integrations/controlled-state.md`](./integrations/controlled-state.md)
- Form integration: [`docs/integrations/form-submit.md`](./integrations/form-submit.md)
- RTL / `dir="rtl"`: [`docs/integrations/rtl.md`](./integrations/rtl.md)
- Accessibility setup: [`docs/integrations/accessibility-setup.md`](./integrations/accessibility-setup.md)
- Static presets: [`docs/integrations/static-presets.md`](./integrations/static-presets.md)
