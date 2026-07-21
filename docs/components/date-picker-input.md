# DatePickerInput

Single-date popover input with read-only trigger. Opens a `Calendar` popover on user gesture (click or Enter/Space key).

**Source:** `src/index.d.ts` lines 266–296 (`DatePickerInputProps`). The component accepts `forwardRef` but no public `DatePickerInputRef` interface is exported in `src/index.d.ts`.

> **Note:** `DatePickerInput` does not export a named ref interface in `src/index.d.ts`. The component forwards a ref internally; the ref object shape is `{ focus(): void, getTriggerEl(): HTMLInputElement | null }` but is not typed as a public export. Use `DateRangeInput` if you need a typed ref interface.

---

## Example

```tsx
import * as React from 'react';
import { DatePickerInput } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';

function SingleDateInput() {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <DatePickerInput
      date={date}
      onChange={(d) => setDate(d)}
      placeholder="Select a date"
    />
  );
}
```

`DatePickerInput` is controlled by `date` + `onChange`. The popover opens on click or keyboard (Enter/Space) by default, and closes automatically after a date is selected. `defaultOpen` only controls the initial uncontrolled popover state; it does not make the selected date uncontrolled.

---

## Props

> Mirrored verbatim from `src/index.d.ts` (`DatePickerInputProps`, lines 266–294).
> **Required** = no default and no `?` in the type.

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `date` | `Date \| null \| undefined` | none | no |
| `onChange` | `((date: Date) => void) \| undefined` | none | no |
| `open` | `boolean \| undefined` | internal | no |
| `defaultOpen` | `boolean \| undefined` | `false` | no |
| `onOpenChange` | `((open: boolean) => void) \| undefined` | none | no |
| `dateDisplayFormat` | `string \| undefined` | `'MMM d, yyyy'` | no |
| `ariaLabel` | `string \| undefined` | `'Select date'` | no |
| `popoverLabel` | `string \| undefined` | `'Choose date'` | no |
| `popoverPlacement` | `'anchor' \| 'modal' \| 'responsive' \| undefined` | `'anchor'` | no |
| `mobileBreakpoint` | `number \| undefined` | `calendarProps.mobileBreakpoint`, then `768` | no |
| `placeholder` | `string \| undefined` | none | no |
| `disabled` | `boolean \| undefined` | `false` | no |
| `calendarProps` | `Omit<CalendarProps, 'date' \| 'onChange'> \| undefined` | none | no |
| `classNames` | `Partial<ClassNames> \| undefined` | `{}` | no |
| `className` | `string \| undefined` | none | no |
| `dir` | `'ltr' \| 'rtl' \| undefined` | inherit | no |

### Popover placement

`popoverPlacement` controls where the calendar popover appears. Default is `'anchor'` — the popover positions itself relative to the trigger input.

```tsx
<DatePickerInput
  popoverPlacement="responsive"
  mobileBreakpoint={640}
  date={date}
  onChange={setDate}
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
- Popover width is capped by CSS variables, not props: `--rdr-date-picker-input-popover-anchor-max-width` and `--rdr-date-picker-input-popover-modal-max-width` default to `26rem` (about 416px), then fall back to the generic `--rdr-input-popover-anchor-max-width` / `--rdr-input-popover-modal-max-width` variables if set.

### `calendarProps`

`calendarProps` forwards into the underlying `Calendar`. `date` and `onChange` are owned by `DatePickerInput` and are omitted from the forwarded props to avoid conflicts. All other `CalendarProps` are forwarded:

```tsx
<DatePickerInput
  date={date}
  onChange={setDate}
  calendarProps={{
    minDate: new Date(2020, 0, 1),
    maxDate: new Date(2025, 11, 31),
    showPreview: false,
  }}
/>
```

---

## Gotchas

- **User-gesture default**: In normal uncontrolled usage, the popover opens on click or keyboard (Enter/Space) on the trigger input. If you control `open` yourself, keep SSR in mind and only open from client-side state.
- **SSR / hydration**: The popover uses `createPortal` into `document.body`. On server render, `mounted` starts `false` and the popover is not rendered. After hydration, the component is safe to use; uncontrolled usage renders the popover after a user gesture.
- **`date` accepts `null`**: `date` is typed as `Date | null | undefined`. Pass `null` to represent an empty selection.
- **`disabled` blocks interaction**: If `disabled` is `true`, the trigger is non-interactive. Do not rely on `disabled` to close an already controlled-open popover; close it through `open` / `onOpenChange` first.
- **No public `DatePickerInputRef`**: Unlike `DateRangeInput`, `DatePickerInput` does not export a `DatePickerInputRef` interface in `src/index.d.ts`. The component accepts a forwarded ref internally but the ref shape is not typed as a public export.

---

## See also

- [Component hub](./README.md)
- [Shared types](./types.md) — `Range`, `RangeKeyDict`, `ClassNames`
- [`CalendarProps`](./calendar.md) — all `calendarProps` forwarded keys
- [`DateRangeInput`](./date-range-input.md) — range variant with typed `DateRangeInputRef`
- [Getting started](../getting-started.md) — install, CSS imports, tree-shaking, SSR
- [Accessibility setup](../integrations/accessibility-setup.md) — `ariaLabel`, `popoverLabel`, `dir`
