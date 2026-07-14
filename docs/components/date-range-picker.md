# DateRangePicker

`DateRange` + `DefinedRange` preset sidebar + hover preview. Combines range inputs, preset ranges, and custom inputs in one composed picker.

**Source:** `src/index.d.ts` lines 437–449 (`DateRangePickerProps`). Extends [`DateRangeProps`](./date-range.md) and [`DefinedRangeProps`](./defined-range.md).

---

## Example

```tsx
import * as React from 'react';
import { DateRangePicker } from '@cyberlz/react-date-range';
import type { Range } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';

function PresetRangePicker() {
  const [ranges, setRanges] = React.useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  return (
    <DateRangePicker
      ranges={ranges}
      onChange={(rangesByKey) => setRanges([rangesByKey.selection])}
    />
  );
}
```

`DateRangePicker` renders the calendar and preset sidebar together. Use the input components (`DateRangeInput`, `DatePickerInput`) when you need a trigger + popover wrapper. `onPreviewChange` fires as the cursor hovers over dates or presets, enabling custom preview rendering.

---

## Props

> `DateRangePickerProps` extends both [`DateRangeProps`](./date-range.md) and [`DefinedRangeProps`](./defined-range.md). All inherited prop defaults are identical to the underlying components.
>
> **Required** = no default and no `?` in the type.

### DateRangePicker-own Props

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `onPreviewChange` | `((preview?: Date \| Preview) => void) \| undefined` | none | no |

### Inherited Props

`DateRangePickerProps` composes `DateRangeProps` (range selection) and `DefinedRangeProps` (preset sidebar). Key inherited props:

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `ranges` | `Range[] \| undefined` | `[]` | Range slots; see [`Range`](./types.md#range) |
| `onChange` | `((rangesByKey: RangeKeyDict) => void) \| undefined` | none | Called on range commit |
| `staticRanges` | `StaticRange[] \| undefined` | `defaultStaticRanges` | Preset range buttons |
| `inputRanges` | `InputRange[] \| undefined` | `defaultInputRanges` | Numeric "Last x days" inputs |
| `rangeColors` | `string[] \| undefined` | `['#3d91ff', '#3ecf8e', '#fed14c']` | |
| `focusedRange` | `RangeFocus \| undefined` | `[0, 0]` | `[rangeIndex, 0\|1]` |
| `showDateDisplay` | `boolean \| undefined` | `true` | Shows start/end date display row |
| `selectedDisplay` | `SelectedDisplay \| undefined` | `{ format: dateDisplayFormat, placement: 'top', separator: '' }` | Formats and positions the selected date display |
| `dragSelectionEnabled` | `boolean \| undefined` | `true` | Click-and-drag range selection |
| `disabledDates` | `Date[] \| undefined` | `[]` | Disabled dates |
| `classNames` | `ClassNames \| undefined` | `{}` | CSS class overrides |
| `uiSlots` | `UiSlots \| undefined` | `{}` | Additive stable classes/styles for picker, range, calendar, and sidebar zones |
| `showPreview` | `boolean \| undefined` | `true` | Hover preview |
| `footerContent` | `React.ReactNode \| undefined` | none | Custom content below preset sidebar |
| `headerContent` | `React.ReactNode \| undefined` | none | Custom content above preset sidebar |
| `renderStaticRangeLabel` | `((staticRange: StaticRange) => React.ReactNode) \| undefined` | none | Custom preset label renderer |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| undefined` | none | First day of week for default static ranges |

For the complete inherited prop table, see [`date-range.md`](./date-range.md#props) (for `DateRangeProps`) and [`defined-range.md`](./defined-range.md#props) (for `DefinedRangeProps`).

---

## Selected display

Use `selectedDisplay` when the preset picker needs a different selected range presentation from the default top row.

```tsx
<DateRangePicker
  ranges={ranges}
  onChange={(rangesByKey) => setRanges([rangesByKey.selection])}
  editableDateInputs
  selectedDisplay={{
    format: 'yyyy-MM-dd',
    placement: 'bottom',
    separator: ' – ',
  }}
/>
```

The option is inherited from `DateRange`: `format` defaults to `dateDisplayFormat`, `placement` defaults to `'top'`, and `separator` defaults to an empty string.

---

## `onPreviewChange` guidance

```tsx
<DateRangePicker
  onPreviewChange={(preview) => {
    // preview is Date | Preview depending on which sub-component calls it
    console.log('Hovering', preview);
  }}
/>
```

> **Type caveat** (documented in `src/index.d.ts` line 438–446): `DateRangePicker` currently passes `onPreviewChange` to both its `DateRange` and `DefinedRange` sub-components, even though those sub-components expect different types for the preview argument (`Date` vs. `Preview`). If you provide `onPreviewChange`, it must accept **both** types.
>
> To avoid type errors, widen the parameter to `Date | Preview | undefined` or use a type guard:
>
> ```tsx
> onPreviewChange={(preview) => {
>   if (preview && 'startDate' in preview) {
>     // Preview type
>   } else if (preview) {
>     // Date type
>   }
> }}
> ```

---

## Stable UI slots

`DateRangePicker` accepts the same `uiSlots` contract as `Calendar` and `DateRange`, plus picker-specific zones:

```tsx
<DateRangePicker
  uiSlots={{
    root: { className: 'booking-picker' },
    definedRanges: { style: { borderRight: '1px solid #e5e7eb' } },
    day: { className: 'booking-picker-day' },
  }}
/>
```

- `root` applies to the outer picker wrapper.
- `definedRanges` applies to the preset sidebar wrapper.
- Calendar slots such as `header`, `months`, `day`, and `dateDisplayItem` are forwarded to the inner range calendar.

---

## Gotchas

- **No trigger wrapper**: `DateRangePicker` renders the picker surface directly. Use `DateRangeInput` when you need a trigger + popover wrapper.
- **`onPreviewChange` dual-type**: The callback receives `Date | Preview` depending on which internal component calls it. Guard the parameter if you need type-specific behavior.
- **`staticRanges` + `inputRanges`**: Both default to the built-in sets (`defaultStaticRanges`, `defaultInputRanges`). Override either to provide only the presets your UI needs.
- **`rangeColors`**: Applied per-range in `ranges`; also used as defaults for the preset sidebar.
- **`DefinedRangeProps` is also inherited**: `DateRangePicker` extends both `DateRangeProps` and `DefinedRangeProps`, so it accepts both range-selection and preset-sidebar props simultaneously.
- **`uiSlots.root` isolation**: `DateRangePicker` applies `root` to the outer picker only, so the same root class does not leak onto the nested `DateRange` calendar.
- **Bottom selected display**: With `selectedDisplay.placement: 'bottom'`, the display follows the calendar grid inside the range calendar; the preset sidebar stays in its existing position.

---

## See also

- [Component hub](./README.md)
- [Shared types](./types.md) — `Range`, `RangeKeyDict`, `RangeFocus`, `Preview`, `ClassNames`, `UiSlots`, `StaticRange`, `InputRange`
- [`DateRangeProps`](./date-range.md) — range selection props
- [`DefinedRangeProps`](./defined-range.md) — preset sidebar props
- [`CalendarProps`](./calendar.md) — base calendar props
- [Getting started](../getting-started.md) — install, CSS imports, tree-shaking, SSR
- [Controlled state](../integrations/controlled-state.md) — `onChange`, `ranges` patterns
- [Accessibility setup](../integrations/accessibility-setup.md) — `ariaLabels`, live regions, `dir`
