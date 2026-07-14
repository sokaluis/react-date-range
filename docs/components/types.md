# Shared Types

> Stable since 1.2.x. All types below are verbatim from `src/index.d.ts`.

## `Range`

Shape of a single date range slot. Multiple ranges can coexist; `key` identifies each one in `RangeKeyDict`.

```ts
export interface Range {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  color?: string | undefined;
  key?: string | undefined;
  autoFocus?: boolean | undefined;
  disabled?: boolean | undefined;
  showDateDisplay?: boolean | undefined;
  /** Human-readable slot name rendered above the start/end inputs and exposed as the per-range group accessible name. */
  label?: string | undefined;
}
```

| Prop | Type | Notes |
|------|------|-------|
| `startDate` | `Date \| undefined` | |
| `endDate` | `Date \| undefined` | |
| `color` | `string \| undefined` | CSS color used for this range's selection |
| `key` | `string \| undefined` | Identifier used in `RangeKeyDict` |
| `autoFocus` | `boolean \| undefined` | |
| `disabled` | `boolean \| undefined` | Prevents selection in this range |
| `showDateDisplay` | `boolean \| undefined` | |
| `label` | `string \| undefined` | Per-range accessible name; plain text, XSS-safe |

---

## `RangeKeyDict`

Map of `key → Range`. Returned by `onChange` in `DateRange`, `DateRangePicker`, `DateRangeInput`, and `DefinedRange`.

```ts
export interface RangeKeyDict {
  [key: string]: Range;
}
```

---

## `RangeFocus`

Tuple `[rangeIndex, rangeStep]` identifying which range and which date (start=0, end=1) is focused for keyboard navigation.

```ts
export type RangeFocus = [number, 0 | 1];
```

| Position | Type | Meaning |
|----------|------|---------|
| `[0]` | `number` | Index into the `ranges` array |
| `[1]` | `0 \| 1` | `0` = start date focused, `1` = end date focused |

---

## `Preview`

Readonly subset of `Range` used for the hover / in-progress selection preview.

```ts
export type Preview = Pick<Range, 'startDate' | 'endDate' | 'color'>;
```

---

## `ClassNames`

All CSS class-name overrides supported by every component that accepts them. Unspecified keys fall back to package defaults.

```ts
export interface ClassNames {
  dateRangeWrapper?: string | undefined;
  calendarWrapper?: string | undefined;
  dateDisplay?: string | undefined;
  dateDisplayItem?: string | undefined;
  dateDisplayItemActive?: string | undefined;
  dateDisplayLabel?: string | undefined;
  datePickerInputWrapper?: string | undefined;
  datePickerInputTrigger?: string | undefined;
  datePickerInputPopover?: string | undefined;
  dateRangeInputWrapper?: string | undefined;
  dateRangeInputTrigger?: string | undefined;
  dateRangeInputPopover?: string | undefined;
  monthAndYearWrapper?: string | undefined;
  monthAndYearPickers?: string | undefined;
  liveRegion?: string | undefined;
  nextPrevButton?: string | undefined;
  month?: string | undefined;
  weekDays?: string | undefined;
  weekDay?: string | undefined;
  days?: string | undefined;
  day?: string | undefined;
  dayNumber?: string | undefined;
  dayPassive?: string | undefined;
  dayToday?: string | undefined;
  dayStartOfWeek?: string | undefined;
  dayEndOfWeek?: string | undefined;
  daySelected?: string | undefined;
  dayDisabled?: string | undefined;
  dayStartOfMonth?: string | undefined;
  dayEndOfMonth?: string | undefined;
  dayWeekend?: string | undefined;
  dayStartPreview?: string | undefined;
  dayInPreview?: string | undefined;
  dayEndPreview?: string | undefined;
  dayHovered?: string | undefined;
  dayActive?: string | undefined;
  inRange?: string | undefined;
  endEdge?: string | undefined;
  startEdge?: string | undefined;
  prevButton?: string | undefined;
  nextButton?: string | undefined;
  selected?: string | undefined;
  months?: string | undefined;
  monthPicker?: string | undefined;
  yearPicker?: string | undefined;
  dateDisplayWrapper?: string | undefined;
  definedRangesWrapper?: string | undefined;
  staticRanges?: string | undefined;
  staticRange?: string | undefined;
  inputRanges?: string | undefined;
  inputRange?: string | undefined;
  inputRangeInput?: string | undefined;
  dateRangePickerWrapper?: string | undefined;
  staticRangeLabel?: string | undefined;
  staticRangeSelected?: string | undefined;
  monthName?: string | undefined;
  infiniteMonths?: string | undefined;
  monthsVertical?: string | undefined;
  monthsHorizontal?: string | undefined;
  rtl?: string | undefined;
}
```

| Prop | Type | Component area |
|------|------|----------------|
| `dateRangeWrapper` | `string \| undefined` | `DateRange` root |
| `calendarWrapper` | `string \| undefined` | `Calendar` root |
| `dateDisplay` | `string \| undefined` | Date display row |
| `dateDisplayItem` | `string \| undefined` | Individual start/end display |
| `dateDisplayItemActive` | `string \| undefined` | Focused display item |
| `dateDisplayLabel` | `string \| undefined` | Label text between inputs |
| `datePickerInputWrapper` | `string \| undefined` | `DatePickerInput` root |
| `datePickerInputTrigger` | `string \| undefined` | Trigger button |
| `datePickerInputPopover` | `string \| undefined` | Popover container |
| `dateRangeInputWrapper` | `string \| undefined` | `DateRangeInput` root |
| `dateRangeInputTrigger` | `string \| undefined` | Trigger button |
| `dateRangeInputPopover` | `string \| undefined` | Popover container |
| `monthAndYearWrapper` | `string \| undefined` | Picker header |
| `monthAndYearPickers` | `string \| undefined` | Month/year select containers |
| `liveRegion` | `string \| undefined` | `aria-live` region |
| `nextPrevButton` | `string \| undefined` | Nav buttons |
| `month` | `string \| undefined` | Month container |
| `weekDays` | `string \| undefined` | Weekday header row |
| `weekDay` | `string \| undefined` | Individual weekday label |
| `days` | `string \| undefined` | Day grid container |
| `day` | `string \| undefined` | Day cell |
| `dayNumber` | `string \| undefined` | Day number text |
| `dayPassive` | `string \| undefined` | Out-of-month day |
| `dayToday` | `string \| undefined` | Today's date |
| `dayStartOfWeek` | `string \| undefined` | First day of week |
| `dayEndOfWeek` | `string \| undefined` | Last day of week |
| `daySelected` | `string \| undefined` | Selected day |
| `dayDisabled` | `string \| undefined` | Disabled day |
| `dayStartOfMonth` | `string \| undefined` | First day of month |
| `dayEndOfMonth` | `string \| undefined` | Last day of month |
| `dayWeekend` | `string \| undefined` | Weekend day |
| `dayStartPreview` | `string \| undefined` | Preview range start |
| `dayInPreview` | `string \| undefined` | In-preview day |
| `dayEndPreview` | `string \| undefined` | Preview range end |
| `dayHovered` | `string \| undefined` | Hovered day |
| `dayActive` | `string \| undefined` | Active/focused day |
| `inRange` | `string \| undefined` | Day inside selected range |
| `endEdge` | `string \| undefined` | Range end marker |
| `startEdge` | `string \| undefined` | Range start marker |
| `prevButton` | `string \| undefined` | Previous nav button |
| `nextButton` | `string \| undefined` | Next nav button |
| `selected` | `string \| undefined` | Selected state |
| `months` | `string \| undefined` | Multi-month container |
| `monthPicker` | `string \| undefined` | Month picker overlay |
| `yearPicker` | `string \| undefined` | Year picker overlay |
| `dateDisplayWrapper` | `string \| undefined` | Date display container |
| `definedRangesWrapper` | `string \| undefined` | `DefinedRange` sidebar |
| `staticRanges` | `string \| undefined` | Static presets container |
| `staticRange` | `string \| undefined` | Individual preset |
| `inputRanges` | `string \| undefined` | Numeric inputs container |
| `inputRange` | `string \| undefined` | Individual numeric range input |
| `inputRangeInput` | `string \| undefined` | Numeric input field |
| `dateRangePickerWrapper` | `string \| undefined` | `DateRangePicker` root |
| `staticRangeLabel` | `string \| undefined` | Preset label |
| `staticRangeSelected` | `string \| undefined` | Selected preset |
| `monthName` | `string \| undefined` | Month name in picker |
| `infiniteMonths` | `string \| undefined` | Infinite scroll container |
| `monthsVertical` | `string \| undefined` | Vertical layout |
| `monthsHorizontal` | `string \| undefined` | Horizontal layout |
| `rtl` | `string \| undefined` | RTL variant root |

---

## `UiSlots`

Stable additive UI slots for host classes and inline styles. `Calendar`, `DateRange`, and `DateRangePicker` accept this map.

```ts
export type UiSlotKey =
  | 'root'
  | 'header'
  | 'monthYear'
  | 'monthPicker'
  | 'yearPicker'
  | 'nav'
  | 'navPrev'
  | 'navNext'
  | 'months'
  | 'month'
  | 'weekdays'
  | 'weekDay'
  | 'days'
  | 'day'
  | 'dayToday'
  | 'dateDisplay'
  | 'dateDisplayItem'
  | 'footer'
  | 'definedRanges';

export interface UiSlotOverride {
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}

export type UiSlots = Partial<Record<UiSlotKey, UiSlotOverride>>;
```

| Slot | Component area |
|------|----------------|
| `root` | Component root (`Calendar`, `DateRange`, or outer `DateRangePicker`) |
| `header` | Default calendar month/year header wrapper |
| `monthYear` | Month/year picker group |
| `monthPicker` | Month picker wrapper |
| `yearPicker` | Year picker wrapper |
| `nav` | Previous and next navigation buttons |
| `navPrev` | Previous navigation button |
| `navNext` | Next navigation button |
| `months` | Multi-month container |
| `month` | Individual month container |
| `weekdays` | Weekday header row |
| `weekDay` | Individual weekday label |
| `days` | Day grid container |
| `day` | Day cell button |
| `dayToday` | Today day cell button when the today highlight is visible |
| `dateDisplay` | Per-range date display group |
| `dateDisplayItem` | Individual start/end date display input wrapper |
| `footer` | Reserved footer slot; ignored where no footer zone exists |
| `definedRanges` | `DateRangePicker` preset sidebar wrapper |

Slot `className` values append to the package classes, and slot `style` values merge after library inline styles for that zone. Non-applicable slot keys are ignored and are not rendered as DOM attributes.

---

## `AriaLabelsShape`

All `ariaLabel` overrides for accessible naming of calendar elements. All fields optional.

```ts
export interface AriaLabelsShape {
  dateInput?:
    | {
        [key: string]: {
          startDate?: string;
          endDate?: string;
        };
      }
    | undefined;
  monthPicker?: string | undefined;
  yearPicker?: string | undefined;
  prevButton?: string | undefined;
  nextButton?: string | undefined;
  calendar?: string | undefined;
  calendarRoleDescription?: string | undefined;
  dateDisplay?: string | undefined;
  dateRangePicker?: string | false | undefined;
  liveRegionMonthYear?: ((date: Date) => string) | undefined;
  liveRegionSelection?: ((range: { startDate: Date; endDate: Date }) => string) | undefined;
}
```

| Prop | Type | Notes |
|------|------|-------|
| `dateInput` | `{ [key: string]: { startDate?: string; endDate?: string; } } \| undefined` | Per-range input labels |
| `monthPicker` | `string \| undefined` | Month picker accessible name |
| `yearPicker` | `string \| undefined` | Year picker accessible name |
| `prevButton` | `string \| undefined` | Previous month button |
| `nextButton` | `string \| undefined` | Next month button |
| `calendar` | `string \| undefined` | Calendar container `aria-label` |
| `calendarRoleDescription` | `string \| undefined` | Calendar `role="grid"` description |
| `dateDisplay` | `string \| undefined` | Date display row |
| `dateRangePicker` | `string \| false \| undefined` | `false` opts out of the dialog label |
| `liveRegionMonthYear` | `(date: Date) => string \| undefined` | Custom month/year announcement |
| `liveRegionSelection` | `(range: { startDate: Date; endDate: Date }) => string \| undefined` | Custom range selection announcement |

---

## `ScrollOptions`

Options for the infinite-scroll month loading feature.

```ts
export interface ScrollOptions {
  enabled?: boolean | undefined;
  calendarWidth?: number | undefined;
  calendarHeight?: number | undefined;
  longMonthHeight?: number | undefined;
  monthHeight?: number | undefined;
  monthWidth?: number | undefined;
}
```

| Prop | Type | Default |
|------|------|---------|
| `enabled` | `boolean \| undefined` | `false` |
| `calendarWidth` | `number \| undefined` | — |
| `calendarHeight` | `number \| undefined` | — |
| `longMonthHeight` | `number \| undefined` | — |
| `monthHeight` | `number \| undefined` | — |
| `monthWidth` | `number \| undefined` | — |

---

## `StaticRange`

A fixed preset range defined by a label and a range function. Used in the `DefinedRange` sidebar.

```ts
export interface StaticRange {
  range: (props?: DefinedRangeProps) => Preview;
  isSelected: (range: Range, props?: DefinedRangeProps) => boolean;
  label?: string | undefined;
  hasCustomRendering?: boolean | undefined;
}
```

| Prop | Type | Notes |
|------|------|-------|
| `range` | `(props?: DefinedRangeProps) => Preview` | Returns `{ startDate, endDate, color }` |
| `isSelected` | `(range: Range, props?: DefinedRangeProps) => boolean` | Whether this preset is currently selected |
| `label` | `string \| undefined` | Display text (e.g. "Last 7 days") |
| `hasCustomRendering` | `boolean \| undefined` | Opts out of default label rendering |

`defaultStaticRanges` exports a set of built-in presets (Today, Yesterday, Last 7 days, Last 30 days, This month, Last month, etc.).

---

## `InputRange`

A numeric input for quick range creation (e.g. "Last **7** days"). Used in the `DefinedRange` sidebar.

```ts
export interface InputRange {
  range: (value: number, props?: DefinedRangeProps) => Range;
  getCurrentValue: (range: Range) => string | number;
  label?: string | undefined;
}
```

| Prop | Type | Notes |
|------|------|-------|
| `range` | `(value: number, props?: DefinedRangeProps) => Range` | Converts input value to a `Range` |
| `getCurrentValue` | `(range: Range) => string \| number` | Reads current value from an existing range |
| `label` | `string \| undefined` | Display text template (e.g. "Last [x] days") |

`defaultInputRanges` exports the built-in inputs (Last x days, Next x days).

---

## `DateInputProps`

> **Type-only.** `DateInput` is **not** a public runtime export — this interface documents the internal `DateDisplay` / `editableDateInputs` contract.

Props for the internal `DateInput` component used by `DateDisplay` when `editableDateInputs` is enabled on `CalendarProps`.

```ts
export interface DateInputProps {
  ariaLabel?: string | undefined;
  className?: string | undefined;
  dateDisplayFormat?: string | undefined;
  dateOptions?: FormatOptions | undefined;
  disabled?: boolean | undefined;
  disabledDates?: Date[] | undefined;
  maxDate?: Date | undefined;
  minDate?: Date | undefined;
  onChange?: ((date: Date) => void) | undefined;
  onFocus?: ((e: React.FocusEvent<HTMLInputElement>) => void) | undefined;
  placeholder?: string | undefined;
  readOnly?: boolean | undefined;
  value?: Date | null | undefined;
}
```

| Prop | Type | Notes |
|------|------|-------|
| `ariaLabel` | `string \| undefined` | Input accessible name |
| `className` | `string \| undefined` | |
| `dateDisplayFormat` | `string \| undefined` | e.g. `"MMM d, yyyy"` |
| `dateOptions` | `FormatOptions \| undefined` | `date-fns` format options |
| `disabled` | `boolean \| undefined` | |
| `disabledDates` | `Date[] \| undefined` | |
| `maxDate` | `Date \| undefined` | |
| `minDate` | `Date \| undefined` | |
| `onChange` | `(date: Date) => void \| undefined` | |
| `onFocus` | `(e: React.FocusEvent<HTMLInputElement>) => void \| undefined` | |
| `placeholder` | `string \| undefined` | |
| `readOnly` | `boolean \| undefined` | |
| `value` | `Date \| null \| undefined` | |

**Do not import `DateInput` at runtime.** It is declared here for TypeScript consumers who need to type-check custom `editableDateInputs` renderers.

---

## See also

- [Component hub](./README.md) — full component index
- [Getting started](../getting-started.md) — install, CSS imports, SSR
- [Accessibility](../accessibility.md) — `ariaLabels`, live regions, `Range.label`
