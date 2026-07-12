# DefinedRange

Preset ranges + custom numeric input ranges sidebar. Can be used standalone or inside `DateRangePicker`.

**Source:** `src/index.d.ts` lines 394–431 (`DefinedRangeProps`, `StaticRange`, `InputRange`, `createStaticRanges`, `defaultStaticRanges`, `defaultInputRanges`).

---

## Example

```tsx
import * as React from 'react';
import { DefinedRange, defaultStaticRanges, defaultInputRanges } from '@cyberlz/react-date-range';
import type { Range } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';

function PresetSidebar() {
  const [ranges, setRanges] = React.useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  return (
    <DefinedRange
      ranges={ranges}
      staticRanges={defaultStaticRanges}
      inputRanges={defaultInputRanges}
      onChange={(rangesByKey) => setRanges([rangesByKey.selection])}
    />
  );
}
```

---

## Props

> Mirrored verbatim from `src/index.d.ts` (`DefinedRangeProps`, lines 394–422).
> **Required** = no default and no `?` in the type.

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `className` | `string \| undefined` | none | no |
| `focusedRange` | `RangeFocus \| undefined` | `[0, 0]` | no |
| `footerContent` | `React.ReactNode \| undefined` | none | no |
| `headerContent` | `React.ReactNode \| undefined` | none | no |
| `inputRanges` | `InputRange[] \| undefined` | `defaultInputRanges` | no |
| `onChange` | `((rangesByKey: RangeKeyDict) => void) \| undefined` | none | no |
| `onPreviewChange` | `((preview?: Preview) => void) \| undefined` | none | no |
| `rangeColors` | `string[] \| undefined` | `['#3d91ff', '#3ecf8e', '#fed14c']` | no |
| `ranges` | `Range[] \| undefined` | `[]` | no |
| `renderStaticRangeLabel` | `((staticRange: StaticRange) => React.ReactNode) \| undefined` | none | no |
| `staticRanges` | `StaticRange[] \| undefined` | `defaultStaticRanges` | no |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| undefined` | none | no |

### `StaticRange` shape

Used by `staticRanges`. See [`types.md#staticrange`](./types.md#staticrange) for the full interface.

### `InputRange` shape

Used by `inputRanges`. See [`types.md#inputrange`](./types.md#inputrange) for the full interface.

---

## `createStaticRanges` gotcha

```tsx
import { createStaticRanges } from '@cyberlz/react-date-range';
import { endOfQuarter, startOfQuarter } from 'date-fns';

// isSelected is optional in createStaticRanges input
const myRanges = createStaticRanges([
  {
    label: 'This quarter',
    range: () => ({
      startDate: startOfQuarter(new Date()),
      endDate: endOfQuarter(new Date()),
    }),
    // isSelected: NOT REQUIRED HERE — createStaticRanges provides a default
  },
]);
```

`createStaticRanges` (line 429–431 in `src/index.d.ts`) accepts `Array<Optional<StaticRange, 'isSelected'>>` — `isSelected` is **optional** in the input array. The function fills in a default `isSelected` that always returns `false`. If you omit `isSelected` in your static range objects, they will never appear selected. Always provide `isSelected` if you want the preset button to reflect the current range state:

```tsx
import { isSameDay, subDays } from 'date-fns';

const myRanges = createStaticRanges([
  {
    label: 'Last 7 days',
    range: () => ({
      startDate: subDays(new Date(), 6),
      endDate: new Date(),
    }),
    isSelected: (range) =>
      isSameDay(range.startDate, subDays(new Date(), 6)) &&
      isSameDay(range.endDate, new Date()),
  },
]);
```

---

## Built-in exports

| Export | Type | Description |
|--------|------|-------------|
| `defaultStaticRanges` | `StaticRange[]` | Built-in presets: Today, Yesterday, Last 7 days, Last 30 days, This month, Last month |
| `defaultInputRanges` | `InputRange[]` | Built-in inputs: "Last x days", "Next x days" |
| `createStaticRanges` | `(ranges) => StaticRange[]` | Factory for custom `StaticRange` arrays |

---

## Gotchas

- **`createStaticRanges` + `isSelected`**: The default `isSelected` always returns `false`. You **must** provide your own `isSelected` function for presets to reflect selection state, unless you only need the label display.
- **`staticRanges` + `inputRanges` defaults**: Both default to the built-in sets. To use only custom presets, pass an empty array `[]` and provide your own `staticRanges`.
- **`onPreviewChange` receives `Preview`**: In `DefinedRange`, `onPreviewChange` receives a `Preview` object (`{ startDate, endDate, color }`), not a raw `Date`. This differs from `CalendarProps.onPreviewChange` which receives a `Date`.
- **`focusedRange`**: Format `[rangeIndex, 0 | 1]`. `0` = start date focused, `1` = end date focused. Controls which date step keyboard navigation targets.
- **`weekStartsOn`**: Forwarded into the default static ranges (e.g., "This week" uses it to determine week boundaries). Has no effect on custom `staticRanges` unless your custom `range` function uses it.
- **`renderStaticRangeLabel`**: Replaces the default label rendering for all static ranges. Receives the `StaticRange` object; return any React node.

---

## See also

- [Component hub](./README.md)
- [Shared types](./types.md) — `Range`, `RangeKeyDict`, `RangeFocus`, `Preview`, `ClassNames`, `StaticRange`, `InputRange`
- [`DateRangePicker`](./date-range-picker.md) — `DefinedRange` composed with `DateRange`
- [Getting started](../getting-started.md) — install, CSS imports, tree-shaking, SSR
- [Controlled state](../integrations/controlled-state.md) — `onChange`, `ranges`, `focusedRange` patterns
