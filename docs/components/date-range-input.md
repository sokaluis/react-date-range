# DateRangeInput

Single-range popover input with read-only trigger. Opens a `DateRange` popover on user gesture (click or Enter/Space key). Supports custom display formatting via `formatter` or `format`.

**Source:** `src/index.d.ts` lines 302–360 (`DateRangeInputRef`, `DateRangeInputProps`).

---

## Example

```tsx
import * as React from 'react';
import { DateRangeInput } from '@cyberlz/react-date-range';
import type { Range, RangeKeyDict } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';

function RangeInput() {
  const [ranges, setRanges] = React.useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  return (
    <DateRangeInput
      ranges={ranges}
      onChange={(rangesByKey: RangeKeyDict) => setRanges([rangesByKey.selection])}
      placeholder="Select date range"
    />
  );
}
```

`DateRangeInput` is controlled via `ranges`. The popover opens on click or keyboard (Enter/Space) and closes after an end-date is selected (unless `closeOnEndSelection={false}`).

---

## Ref

```tsx
import * as React from 'react';
import { DateRangeInput } from '@cyberlz/react-date-range';
import type { DateRangeInputRef } from '@cyberlz/react-date-range';

function WithRef() {
  const ref = React.useRef<DateRangeInputRef>(null);

  return (
    <>
      <DateRangeInput ref={ref} />
      <button onClick={() => ref.current?.focus()}>Focus input</button>
    </>
  );
}
```

`DateRangeInputRef` (`src/index.d.ts` lines 302–305):

| Method | Description |
|--------|-------------|
| `focus()` | Focuses the trigger input |
| `getTriggerEl()` | Returns the trigger `<input>` element or `null` |

---

## Props

> Mirrored verbatim from `src/index.d.ts` (`DateRangeInputProps`, lines 307–356).
> **Required** = no default and no `?` in the type.

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `ranges` | `Range[] \| undefined` | none | no |
| `onChange` | `((rangesByKey: RangeKeyDict) => void) \| undefined` | none | no |
| `open` | `boolean \| undefined` | internal | no |
| `defaultOpen` | `boolean \| undefined` | `false` | no |
| `onOpenChange` | `((open: boolean) => void) \| undefined` | none | no |
| `closeOnEndSelection` | `boolean \| undefined` | `true` | no |
| `triggerPlaceholder` | `string \| undefined` | none | no |
| `formatter` | `((range: { startDate?: Date \| undefined; endDate?: Date \| undefined }) => string) \| undefined` | none | no |
| `format` | `string \| undefined` | `'yyyy-MM-dd'` | no |
| `rangeKey` | `string \| undefined` | `'selection'` | no |
| `calendarProps` | `Omit<DateRangeProps, 'ranges' \| 'onChange' \| 'moveRangeOnFirstSelection' \| 'retainEndDateOnFirstSelection' \| 'classNames' \| 'className' \| 'disabledDates'> \| undefined` | none | no |
| `popoverLabel` | `string \| undefined` | `'Select date range'` | no |
| `popoverPlacement` | `'anchor' \| 'modal' \| 'responsive' \| undefined` | `'anchor'` | no |
| `mobileBreakpoint` | `number \| undefined` | `calendarProps.mobileBreakpoint`, then `768` | no |
| `ariaLabels` | `{ trigger?: string \| undefined; popover?: string \| undefined; } \| undefined` | `{}` | no |
| `disabled` | `boolean \| undefined` | `false` | no |
| `classNames` | `Partial<ClassNames> \| undefined` | `{}` | no |
| `className` | `string \| undefined` | none | no |
| `dir` | `'ltr' \| 'rtl' \| undefined` | inherit | no |

### Popover placement

`popoverPlacement` controls where the calendar popover appears. Default is `'anchor'` — the popover positions itself relative to the trigger input.

```tsx
<DateRangeInput
  popoverPlacement="responsive"
  mobileBreakpoint={640}
  ranges={ranges}
  onChange={handleChange}
/>
```

| Value | Behavior |
|-------|----------|
| `anchor` / omitted | Popover anchored to the trigger input. |
| `modal` | Popover always centered in the viewport. |
| `responsive` | `anchor` above `mobileBreakpoint`, `modal` at or below it. |

- `mobileBreakpoint` defaults to `calendarProps.mobileBreakpoint`, then `768`.
- Modal popover calendars use internal fluid sizing so they don't get compressed.
- Modal placement uses core library behavior, not demo-only styling.
- Popover width is capped by CSS variables, not props: `--rdr-date-range-input-popover-anchor-max-width` and `--rdr-date-range-input-popover-modal-max-width` default to `52rem` (about 832px), then fall back to the generic `--rdr-input-popover-anchor-max-width` / `--rdr-input-popover-modal-max-width` variables if set.

### `calendarProps`

`calendarProps` forwards into the underlying `DateRange`. `ranges`, `onChange`, `moveRangeOnFirstSelection`, `retainEndDateOnFirstSelection`, `classNames`, `className`, and `disabledDates` are owned by `DateRangeInput` and are omitted from the forwarded props:

```tsx
<DateRangeInput
  ranges={ranges}
  onChange={handleChange}
  calendarProps={{
    months: 2,
    direction: 'horizontal',
    layout: 'auto',
    widthMode: 'fluid',
    dragSelectionEnabled: false,
    shownDate: new Date(2024, 0, 1),
  }}
/>
```

---

## Gotchas

- **`format` vs `formatter`**: `formatter` overrides `format` entirely. If you provide a custom `formatter`, the `format` string is ignored. Use `formatter` for full control over the display string; use `format` for simple date-fns pattern formatting.
- **Single range only**: `DateRangeInput` manages one range. If `ranges` contains more than one entry, extra ranges are ignored and a console warning is emitted in development. Use `DateRange` directly for multi-range UIs.
- **`closeOnEndSelection` defaults to `true`**: The popover closes after the user selects an end date. Set `closeOnEndSelection={false}` to keep it open after a selection.
- **`rangeKey` defaults to `'selection'`**: The range in `ranges` is matched by `key === rangeKey`. If your range object uses a different `key`, pass the matching `rangeKey` prop.
- **User-gesture default**: In normal uncontrolled usage, the popover opens on click or keyboard (Enter/Space) on the trigger input. If you control `open` yourself, keep SSR in mind and only open from client-side state.
- **SSR / hydration**: The popover uses `createPortal` into `document.body`. On server render, `mounted` starts `false` and the popover is not rendered. After hydration, uncontrolled usage renders the popover after a user gesture.

---

## See also

- [Component hub](./README.md)
- [Shared types](./types.md) — `Range`, `RangeKeyDict`, `RangeFocus`, `Preview`, `ClassNames`
- [`DateRangeProps`](./date-range.md) — all `calendarProps` forwarded keys
- [`DatePickerInput`](./date-picker-input.md) — single-date variant
- [Getting started](../getting-started.md) — install, CSS imports, tree-shaking, SSR
- [Accessibility setup](../integrations/accessibility-setup.md) — `ariaLabels`, `dir`, live regions
