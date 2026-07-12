# DateRange

Two-input date range selector — manages a `Range[]` via `onChange(rangesByKey: RangeKeyDict)`.

**Source:** `src/index.d.ts` lines 366–375 (`DateRangeProps`). Extends [`CalendarProps`](./calendar.md) (omits `onChange`).

---

## Example

```tsx
import * as React from 'react';
import { DateRange } from '@cyberlz/react-date-range';
import type { Range } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';

function RangeSelector() {
  const [ranges, setRanges] = React.useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  return (
    <DateRange
      ranges={ranges}
      onChange={(rangesByKey) => setRanges([rangesByKey.selection])}
    />
  );
}
```

---

## Props

> `DateRangeProps` extends [`CalendarProps`](./calendar.md) (omitting `onChange`).
> All inherited prop defaults are identical to `CalendarProps` unless noted below.
>
> **Required** = no default and no `?` in the type.

### DateRange-own Props

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `onChange` | `((rangesByKey: RangeKeyDict) => void) \| undefined` | none | no |
| `moveRangeOnFirstSelection` | `boolean \| undefined` | `false` | no |
| `retainEndDateOnFirstSelection` | `boolean \| undefined` | `false` | no |

### Inherited Props (from `CalendarProps`)

All other props are inherited verbatim from `CalendarProps`. See [`calendar.md`](./calendar.md#props) for the full table. Notable props for range mode:

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `ranges` | `Range[] \| undefined` | `[]` | Range slots; see [`Range`](./types.md#range) |
| `displayMode` | `'dateRange' \| 'date' \| undefined` | `'date'` | `DateRange` forces `'dateRange'` internally |
| `focusedRange` | `RangeFocus \| undefined` | `[0, 0]` | `[rangeIndex, 0\|1]` |
| `rangeColors` | `string[] \| undefined` | `['#3d91ff', '#3ecf8e', '#fed14c']` | |
| `showDateDisplay` | `boolean \| undefined` | `true` | Shows start/end date display row |
| `dragSelectionEnabled` | `boolean \| undefined` | `true` | Click-and-drag to select a range |
| `editableDateInputs` | `boolean \| undefined` | `false` | Allows typing dates in the display inputs |
| `disabledDates` | `Date[] \| undefined` | `[]` | Disabled dates cannot be selected |
| `classNames` | `ClassNames \| undefined` | `{}` | CSS class overrides |
| `scroll` | `ScrollOptions \| undefined` | `{ enabled: false }` | Virtualized month scrolling |
| `showPreview` | `boolean \| undefined` | `true` | Shows in-progress range preview on hover |
| `onPreviewChange` | `((previewDate?: Date) => void) \| undefined` | none | Called as the mouse hovers over dates |

For the complete inherited prop table, see [`calendar.md`](./calendar.md#props).

---

## Gotchas

- **`moveRangeOnFirstSelection`**: When `false` (default), dragging from day A to day B selects `[A, B]` as a fixed range. When `true`, the range "moves" so the start stays pinned to the first selected day — useful for sticky-start range adjustment.
- **`retainEndDateOnFirstSelection`**: When `false` (default), the first click in a new selection sets only the start date and clears the end date. When `true`, the previously selected end date is retained as a starting point for the next range — useful for quickly chaining range selections.
- **`onChange` signature**: `DateRangeProps['onChange']` receives `RangeKeyDict` (a `Record<string, Range>`), **not** a single `Range` or `Date`. This differs from `CalendarProps['onChange']` which receives a single `Date`.
- **`ranges` keying**: Each range slot is identified by its `key` property. `onChange` returns a `RangeKeyDict` keyed by those `key` values. Unkeyed ranges use fallback keys like `range1`, `range2`, ….

---

## See also

- [Component hub](./README.md)
- [Shared types](./types.md) — `Range`, `RangeKeyDict`, `RangeFocus`, `Preview`, `ClassNames`, `StaticRange`, `InputRange`
- [`CalendarProps`](./calendar.md) — full inherited prop table
- [Getting started](../getting-started.md) — install, CSS imports, tree-shaking, SSR
- [Controlled state](../integrations/controlled-state.md) — `onChange`, `ranges`, `focusedRange` patterns
- [Accessibility setup](../integrations/accessibility-setup.md) — `ariaLabels`, live regions
