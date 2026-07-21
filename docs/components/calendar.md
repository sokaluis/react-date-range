# Calendar

Bare calendar month view — single-date or range selection, no input chrome.

**Source:** `src/index.d.ts` `CalendarProps`.

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

> Mirrored from `src/index.d.ts` (`CalendarProps`).
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
| `headerConfig` | `HeaderConfig \| undefined` | `{ month: true, year: true, navigation: true }` | no |
| `focusedRange` | `RangeFocus \| undefined` | `[0, 0]` | no |
| `initialFocusedRange` | `RangeFocus \| undefined` | none | no |
| `locale` | `Locale \| undefined` | `en-US` from `date-fns/locale` | no |
| `layout` | `'reference' \| 'auto' \| 'mobile' \| 'desktop' \| undefined` | `'reference'` | no |
| `maxDate` | `Date \| undefined` | 20 years after today | no |
| `minDate` | `Date \| undefined` | 100 years before today | no |
| `mobileBreakpoint` | `number \| undefined` | `768` | no |
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
| `todayAffordance` | `'highlight' \| 'label' \| 'off' \| undefined` | `'highlight'` | no |
| `uiSlots` | `UiSlots \| undefined` | `{}` | no |
| `weekdayDisplayFormat` | `string \| undefined` | `'E'` | no |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| undefined` | none | no |
| `widthMode` | `'content' \| 'fluid' \| undefined` | `'content'` | no |

---

## Responsive layout

Responsive layout is opt-in. Existing calendars keep the current stable reference rendering until you pass `layout`.

```tsx
<Calendar
  layout="auto"
  date={date}
  onChange={setDate}
/>
```

| Mode | Behavior |
|------|----------|
| `reference` / omitted / invalid | Existing rendering. |
| `auto` | Starts as `reference`, then applies mobile at `(max-width: mobileBreakpoint)`. |
| `mobile` | Adds `rdrCalendarWrapperResponsive`; multiple months stack vertically. |
| `desktop` | Keeps non-mobile behavior. |

`mobileBreakpoint` only affects `layout="auto"` and defaults to `768`.

`scroll.enabled` keeps the existing virtualized geometry and bypasses responsive layout handling.

---

## Fluid width

`widthMode` is independent from `layout`. Use `"fluid"` when the calendar should fill available container width instead of shrinking to intrinsic content size:

```tsx
<Calendar
  widthMode="fluid"
  date={date}
  onChange={setDate}
/>
```

| Mode | Behavior |
|------|----------|
| `content` / omitted | Intrinsic inline-flex sizing; wrapper grows to content. |
| `fluid` | Wrapper and month grid fill available width; month cells distribute evenly. |

- Works with any `layout` mode.
- With `layout="auto"`, non-scroll horizontal calendars with multiple months protect readability: if the container is narrower than `months * --rdr-calendar-month-min-width`, the months stack vertically instead of compressing.
- `--rdr-calendar-month-min-width` defaults to `400px` and can be overridden on the calendar root or an ancestor.
- `layout="desktop"` is the explicit escape hatch: it keeps horizontal months even when the container is narrow.
- Modal input calendars (`DatePickerInput`, `DateRangeInput` with `popoverPlacement="responsive"`) use internal fluid sizing automatically.
- Does not affect scroll/virtualized calendar geometry.

---

## Header and Today controls

Use `headerConfig` to hide the default header pieces independently:

```tsx
<Calendar
  headerConfig={{ year: false, navigation: false }}
  todayAffordance="label"
/>
```

- `headerConfig.month`, `headerConfig.year`, and `headerConfig.navigation` each default to `true` when omitted.
- If all three are `false`, the Calendar removes the header wrapper instead of leaving empty chrome.
- `navigation: false` hides the previous/next buttons only. Date cells keep their keyboard navigation behavior.
- `todayAffordance="highlight"` keeps the default today styling.
- `todayAffordance="label"` keeps the date number and adds visible `Today` text.
- `todayAffordance="off"` removes the visible today styling/label but still keeps `aria-current="date"` on the current date.

---

## Stable UI slots

Use `uiSlots` when you need additive host classes or inline styles on locked calendar zones without replacing `classNames`:

```tsx
<Calendar
  uiSlots={{
    root: { className: 'booking-calendar' },
    header: { style: { borderBottom: '1px solid #e5e7eb' } },
    day: { className: 'booking-day' },
    dayToday: { style: { outline: '2px solid currentColor' } },
  }}
/>
```

- Slot classes append to the package classes; they do not replace `classNames`.
- Slot styles merge after library inline styles for that zone.
- Locked Calendar slots include `root`, `header`, `monthYear`, `monthPicker`, `yearPicker`, `nav`, `navPrev`, `navNext`, `months`, `month`, `weekdays`, `weekDay`, `days`, `day`, `dayToday`, `dateDisplay`, and `dateDisplayItem`.
- Non-applicable keys such as `definedRanges` are ignored by `Calendar` and never forwarded to the DOM as unknown attributes.

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
- **`direction`**: Controls multi-month layout. `vertical` stacks months top-to-bottom; `horizontal` arranges them left-to-right.
- **`navigatorRenderer`**: Receives `changeShownDate` with four modes — `'set'`, `'setYear'`, `'setMonth'`, and `'monthOffset'`. Use this to replace the default prev/next arrows with custom controls.
- **`headerConfig` with `navigatorRenderer`**: A custom `navigatorRenderer` owns its own chrome. The built-in `headerConfig` controls apply to the default header renderer.
- **`uiSlots` vs. `classNames`**: `classNames` still overrides the package CSS-module class map. `uiSlots` is additive and is safer for app-level styling because it appends a host class and/or inline style to stable zones.

---

## See also

- [Component hub](./README.md)
- [Shared types](./types.md) — `Range`, `RangeKeyDict`, `RangeFocus`, `Preview`, `ClassNames`, `UiSlots`, `UiSlotKey`, `AriaLabelsShape`, `ScrollOptions`, `DateInputProps`
- [Getting started](../getting-started.md) — install, CSS imports, tree-shaking, SSR
- [Controlled state](../integrations/controlled-state.md) — `onChange`, `ranges`, `date` patterns
- [Accessibility setup](../integrations/accessibility-setup.md) — `ariaLabels`, live regions
- [RTL integration](../integrations/rtl.md) — `dir` prop, RTL layout
