# Calendar

Bare calendar month view — single-date or range selection, no input chrome.

**Source:** `src/index.d.ts` lines 152–258.

---

## Example

```tsx
import * as React from 'react';
import { Calendar } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';

function SingleDatePicker() {
  const [date, setDate] = React.useState<Date>();

  return (
    <Calendar
      date={date}
      onChange={(d) => setDate(d)}
    />
  );
}
```

---

## Props

> Mirrored verbatim from `src/index.d.ts` (`CalendarProps`, lines 152–258).
> **Required** = no default and no `?` in the type.

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `ariaLabels` | `AriaLabelsShape \| undefined` | `{}` | no |
| `calendarFocus` | `'forwards' \| 'backwards' \| undefined` | `'forwards'` | no |
| `className` | `string \| undefined` | none | no |
| `classNames` | `ClassNames \| undefined` | `{}` | no |
| `color` | `string \| undefined` | `#3d91ff` | no |
| `date` | `Date \| undefined` | none | no |
| `dateDisplayFormat` | `string \| undefined` | `'MMM d, yyyy'` | no |
| `dayContentRenderer` | `((date: Date) => React.ReactNode) \| undefined` | none | no |
| `dayDisplayFormat` | `string \| undefined` | `'d'` | no |
| `direction` | `'vertical' \| 'horizontal' \| undefined` | `'vertical'` | no |
| `dir` | `'ltr' \| 'rtl' \| undefined` | inherit | no |
| `disabledDates` | `Date[] \| undefined` | `[]` | no |
| `disabledDay` | `((date: Date) => boolean) \| undefined` | `() => {}` | no |
| `displayMode` | `'dateRange' \| 'date' \| undefined` | `'date'` | no |
| `dragSelectionEnabled` | `boolean \| undefined` | `true` | no |
| `editableDateInputs` | `boolean \| undefined` | `false` | no |
| `endDatePlaceholder` | `string \| undefined` | `'Continuous'` | no |
| `fixedHeight` | `boolean \| undefined` | `false` | no |
| `focusedRange` | `RangeFocus \| undefined` | `[0, 0]` | no |
| `initialFocusedRange` | `RangeFocus \| undefined` | none | no |
| `locale` | `Locale \| undefined` | `en-US` from `date-fns/locale` | no |
| `maxDate` | `Date \| undefined` | 20 years after today | no |
| `minDate` | `Date \| undefined` | 100 years before today | no |
| `monthDisplayFormat` | `string \| undefined` | `'MMM yyyy'` | no |
| `months` | `number \| undefined` | `1` | no |
| `navigatorRenderer` | `((currFocusedDate: Date, changeShownDate: (value: Date \| number \| string, mode?: 'set' \| 'setYear' \| 'setMonth' \| 'monthOffset') => void, props: CalendarProps) => React.JSX.Element) \| undefined` | none | no |
| `onChange` | `((date: Date) => void) \| undefined` | none | no |
| `onPreviewChange` | `((previewDate?: Date) => void) \| undefined` | none | no |
| `onRangeFocusChange` | `((newFocusedRange: RangeFocus) => void) \| undefined` | none | no |
| `onShownDateChange` | `((date: Date) => void) \| undefined` | none | no |
| `preventSnapRefocus` | `boolean \| undefined` | `false` | no |
| `preview` | `Preview \| undefined` | none | no |
| `rangeColors` | `string[] \| undefined` | `['#3d91ff', '#3ecf8e', '#fed14c']` | no |
| `ranges` | `Range[] \| undefined` | `[]` | no |
| `scroll` | `ScrollOptions \| undefined` | `{ enabled: false }` | no |
| `selectablePassive` | `boolean \| undefined` | `false` | no |
| `showDateDisplay` | `boolean \| undefined` | `true` | no |
| `showMonthAndYearPickers` | `boolean \| undefined` | `true` | no |
| `showMonthArrow` | `boolean \| undefined` | `true` | no |
| `showPreview` | `boolean \| undefined` | `true` | no |
| `shownDate` | `Date \| undefined` | none | no |
| `startDatePlaceholder` | `string \| undefined` | `'Early'` | no |
| `updateRange` | `((newRange: Range) => void) \| undefined` | none | no |
| `weekdayDisplayFormat` | `string \| undefined` | `'E'` | no |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| undefined` | none | no |

---

## DateDisplay and DateInput contract

`DateInput` is **not** a public runtime export. It is an internal component used by `DateDisplay` when `editableDateInputs={true}` is set on `CalendarProps`. Its props are documented as `DateInputProps` on the [shared types page](./types.md#dateinputprops).

Do not import `DateInput` at runtime — it is type-only for consumers who need to type-check custom `editableDateInputs` renderers.

---

## Gotchas

- **`date` + `onChange`**: The public `CalendarProps` type exposes `onChange?: (date: Date) => void`. Use `date` for single-date selection.
- **`ranges` + `updateRange`**: Range-mode state is represented by `ranges?: Range[]`; `updateRange?: (newRange: Range) => void` is the typed callback for range updates.
- **`editableDateInputs`**: Enables inline text editing in the date display row. Requires `showDateDisplay`. The actual input rendering is handled by the internal `DateInput` component — see [DateInputProps](./types.md#dateinputprops).
- **`scroll` / infinite months**: Set `scroll={{ enabled: true }}` for virtualized month loading. When disabled, set `selectablePassive={true}` to allow selecting neighbour-month cells without scrolling.
- **`direction`**: Controls multi-month layout. `vertical` (default, line 172 in `src/index.d.ts`) stacks months top-to-bottom; `horizontal` arranges them left-to-right.
- **`navigatorRenderer`** (line 210–219 in `src/index.d.ts`): Receives `changeShownDate` with four modes — `'set'`, `'setYear'`, `'setMonth'`, and `'monthOffset'`. Use this to replace the default prev/next arrows with custom controls.

---

## See also

- [Component hub](./README.md)
- [Shared types](./types.md) — `Range`, `RangeKeyDict`, `RangeFocus`, `Preview`, `ClassNames`, `AriaLabelsShape`, `ScrollOptions`, `DateInputProps`
- [Getting started](../getting-started.md) — install, CSS imports, tree-shaking, SSR
- [Controlled state](../integrations/controlled-state.md) — `onChange`, `ranges`, `date` patterns
- [Accessibility setup](../integrations/accessibility-setup.md) — `ariaLabels`, live regions
- [RTL integration](../integrations/rtl.md) — `dir` prop, RTL layout
