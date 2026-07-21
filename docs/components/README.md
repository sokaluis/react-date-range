# Component Reference

> Updated for 1.4.x. Props tables are literal mirrors of `src/index.d.ts`.

## Components

| Component | Summary | Props page |
|-----------|---------|------------|
| [`Calendar`](./calendar.md) | Bare calendar month view; single-date or range selection | [`calendar.md`](./calendar.md) |
| [`DateRange`](./date-range.md) | Two-input date range with `onChange(rangesByKey)` | [`date-range.md`](./date-range.md) |
| [`DateRangePicker`](./date-range-picker.md) | `DateRange` + `DefinedRange` preset sidebar + preview | [`date-range-picker.md`](./date-range-picker.md) |
| [`DefinedRange`](./defined-range.md) | Preset ranges + custom input ranges sidebar | [`defined-range.md`](./defined-range.md) |
| [`DatePickerInput`](./date-picker-input.md) | Single-date popover trigger | [`date-picker-input.md`](./date-picker-input.md) |
| [`DateRangeInput`](./date-range-input.md) | Range popover trigger with `DateRangeInputRef` | [`date-range-input.md`](./date-range-input.md) |

## Shared types

Types used across multiple components live on a single page — link there instead of duplicating:

| Type | Used by | Definition |
|------|---------|------------|
| `Range` | All components | [`types.md`](./types.md#range) |
| `RangeKeyDict` | `DateRange`, `DateRangePicker`, `DateRangeInput`, `DefinedRange` | [`types.md`](./types.md#rangekeydict) |
| `RangeFocus` | `Calendar`, `DateRange`, `DateRangePicker`, `DefinedRange` | [`types.md`](./types.md#rangefocus) |
| `Preview` | `Calendar`, `DateRangePicker` | [`types.md`](./types.md#preview) |
| `ClassNames` | All components | [`types.md`](./types.md#classnames) |
| `AriaLabelsShape` | `Calendar`, `DateRangePicker` | [`types.md`](./types.md#arialabelsshape) |
| `ScrollOptions` | `Calendar` | [`types.md`](./types.md#scrolloptions) |
| `StaticRange` | `DefinedRange` | [`types.md`](./types.md#staticrange) |
| `InputRange` | `DefinedRange` | [`types.md`](./types.md#inputrange) |
| `DateInputProps` | `Calendar` (internal `DateDisplay` contract) | [`types.md`](./types.md#dateinputprops) |

> **DateInput** (`DateInputProps`) is a type-only export. The `DateInput` function itself is **not** in the runtime barrel — it is used internally by `DateDisplay` for the editable-date-input feature. Do not import it at runtime.

## Maintenance checklist

When a component prop is added, removed, or renamed in `src/index.d.ts`:

1. Find the corresponding `[Component]Props` interface in `src/index.d.ts` (line numbers are annotated in each props page).
2. Mirror every row exactly: **Prop name**, **Type** (signature verbatim), **Default** (from `default:` JSDoc tag), **Required** (`no` unless the prop has no default and no `?` in the type).
3. Do not add, remove, or rephrase prop descriptions — copy the JSDoc verbatim.
4. Run `git diff --check` before committing to catch trailing whitespace.

## See also

- [Getting started](../getting-started.md) — install, CSS imports, tree-shaking, SSR
- [Accessibility](../accessibility.md) — `ariaLabels`, live regions, `Range.label`, `dir`
- [Troubleshooting](../troubleshooting.md) — SSR, ESM/CJS, bundlers, date-fns locales
- [Evaluation guide](../evaluation-guide.md) — install and evaluate workflow
