# Accessibility

`ariaLabels`, live regions, `Range.label`, and `dir` — the full accessible-integration surface in one place.

---

## `ariaLabels` shape

All fields are optional. Pass a partial object to override only the defaults you need.

### Field reference

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `calendar` | `string \| undefined` | `'Calendar'` | `aria-label` on the calendar grid container |
| `calendarRoleDescription` | `string \| undefined` | `'month grid'` | `aria-roledescription` on the grid |
| `dateDisplay` | `string \| undefined` | `'Selected date range'` | Label for the start/end date display row |
| `dateInput` | `Record<string, { startDate?: string; endDate?: string; }>` | none | Keys must match range `key` values |
| `dateRangePicker` | `string \| false \| undefined` | `'Date range picker'` | Region label; `false` omits region semantics (see below) |
| `liveRegionMonthYear` | `(date: Date) => string` | month/year formatted string | Announces after month/year navigation |
| `liveRegionSelection` | `(range: { startDate: Date; endDate: Date }) => string` | formatted date range | Announces after a committed range selection |
| `monthPicker` | `string \| undefined` | none | Month select accessible name |
| `nextButton` | `string \| undefined` | none | Next-month nav button |
| `prevButton` | `string \| undefined` | none | Prev-month nav button |
| `yearPicker` | `string \| undefined` | none | Year select accessible name |

---

## Popover dialogs

`DatePickerInput` and `DateRangeInput` wrap their calendar popover in `role="dialog"`.

- `DatePickerInput` dialog is labelled by the `popoverLabel` prop (default: `'Choose date'`).
- `DateRangeInput` dialog is labelled by `ariaLabels.popover` prop, falling back to `popoverLabel` prop (default: `'Select date range'`).

`DateRangePicker` wraps its picker in a container with `role="region"` (not `role="dialog"`). The region is labelled by `ariaLabels.dateRangePicker` (default: `'Date range picker'`). Set `ariaLabels.dateRangePicker = false` to keep the wrapper but remove the region semantics — useful when the picker is already labelled by a surrounding `fieldset`/`legend` or `aria-labelledby` context.

The trigger input reflects `aria-expanded`. The popover traps focus when open and returns focus to the trigger on close (Escape, outside click, single-date selection, or range end-date selection when `closeOnEndSelection` is enabled).

---

## `aria-live` regions

Two live regions announce committed state changes — not hover, preview, or drag movement:

| Region | Trigger | Customizable via |
|--------|---------|-----------------|
| Month/year navigation | User clicks prev/next or uses month/year picker | `ariaLabels.liveRegionMonthYear` |
| Range selection | User commits a start or end date | `ariaLabels.liveRegionSelection` |

Hover, drag, and preview updates do **not** announce — this prevents over-announcement during fluid interactions.

---

## `Range.label` — per-range accessible name

Assign `label` to any `Range` to give screen readers a human-readable name for that slot:

```tsx
const [ranges, setRanges] = useState([
  { startDate, endDate, key: 'trip', label: 'Trip dates' },
]);
```

When `label` is set, `DateDisplay` renders the range inside `role="group" aria-labelledby={id}` where `id` references the label text. Labels are rendered as plain text only — no HTML is rendered, making them XSS-safe by design.

Labels also appear above the start/end date inputs in `DateDisplay`. The `liveRegionSelection` callback receives `{ startDate, endDate }` and does not include the range `label` in its default announcement.

See [`docs/components/types.md#range`](./components/types.md#range) for the full `Range` interface.

---

## `dir` prop — RTL and direction inheritance

All picker components (`Calendar`, `DateRange`, `DateRangePicker`) accept `dir`:

| Value | Effect |
|-------|--------|
| `'rtl'` | Sets `dir="rtl"` on the root element, applies the `rdrRtl` class hook, mirrors navigation glyphs, reverses horizontal month flow |
| `'ltr'` | Sets `dir="ltr"` without the RTL class hook |
| omitted | Leaves `dir` unset — picker inherits direction from an ancestor element |

`dir` is additive: setting `dir="rtl"` on the picker does not require a surrounding `lang="ar"` element, though pairing with your app's i18n locale is recommended for correct date formatting.

Custom `navigatorRenderer` output is not wrapped or transformed by the library. If a custom renderer uses directional glyphs, it must handle RTL mirroring itself.

For step-by-step RTL setup, see [`docs/integrations/rtl.md`](./integrations/rtl.md).

---

## `dateRangePicker = false` — opt-out

Set `ariaLabels.dateRangePicker = false` to remove `role="region"` and `aria-label` from the `DateRangePicker` wrapper. Use this when the picker is already wrapped in a named landmark (e.g. `<fieldset>` + `<legend>`) or when `aria-labelledby` on a parent element provides the accessible name.

---

## See also

- [Accessibility setup snippet](./integrations/accessibility-setup.md)
- [RTL integration](./integrations/rtl.md)
- [Component types reference](./components/types.md) — `AriaLabelsShape`, `Range`
