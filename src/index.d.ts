/**
 * First-party TypeScript declarations for @cyberlz/react-date-range.
 *
 * Based on community @types/react-date-range@1.4.10 shape, adapted
 * and owned by this package. Covers all exported components, props,
 * and utility types needed by normal consumers.
 *
 * Components are declared as functions returning React.JSX.Element
 * so the declarations work with both @types/react@18 (which requires
 * `refs` on Component) and @types/react@19 (which removed it).
 */

import type { Locale } from 'date-fns';
import type { FormatOptions } from 'date-fns';
import * as React from 'react';

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Internal utility used by createStaticRanges.
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Represents which range and step are focused: [range, rangeStep].
 * - `range` index in the list of ranges
 * - `rangeStep` 0 for start date, 1 for end date
 */
export type RangeFocus = [number, 0 | 1];

export interface Range {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  color?: string | undefined;
  key?: string | undefined;
  autoFocus?: boolean | undefined;
  disabled?: boolean | undefined;
  showDateDisplay?: boolean | undefined;
}

export interface RangeKeyDict {
  [key: string]: Range;
}

export type Preview = Pick<Range, 'startDate' | 'endDate' | 'color'>;

// =============================================================================
// Shared Shapes
// =============================================================================

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
}

export interface ScrollOptions {
  enabled?: boolean | undefined;
  calendarWidth?: number | undefined;
  calendarHeight?: number | undefined;
  longMonthHeight?: number | undefined;
  monthHeight?: number | undefined;
  monthWidth?: number | undefined;
}

export interface ClassNames {
  dateRangeWrapper?: string | undefined;
  calendarWrapper?: string | undefined;
  dateDisplay?: string | undefined;
  dateDisplayItem?: string | undefined;
  dateDisplayItemActive?: string | undefined;
  monthAndYearWrapper?: string | undefined;
  monthAndYearPickers?: string | undefined;
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
}

// =============================================================================
// Calendar Component
// =============================================================================

export interface CalendarProps {
  /** Custom accessibility aria labels for elements — default: `{}` */
  ariaLabels?: AriaLabelsShape | undefined;
  /** default: `forwards` */
  calendarFocus?: 'forwards' | 'backwards' | undefined;
  /** default: none */
  className?: string | undefined;
  /** Custom class names for elements — default: `{}` */
  classNames?: ClassNames | undefined;
  /** default: `#3d91ff` */
  color?: string | undefined;
  /** The currently selected date — default: none */
  date?: Date | undefined;
  /** default: `MMM d, yyyy` */
  dateDisplayFormat?: string | undefined;
  /** Custom renderer function for the calendar days — default: none */
  dayContentRenderer?: ((date: Date) => React.ReactNode) | undefined;
  /** default: `d` */
  dayDisplayFormat?: string | undefined;
  /** default: `vertical` */
  direction?: 'vertical' | 'horizontal' | undefined;
  /** default: `[]` */
  disabledDates?: Date[] | undefined;
  /** Custom function to determine if a day should be disabled — default: `() => {}` */
  disabledDay?: ((date: Date) => boolean) | undefined;
  /** default: `date` */
  displayMode?: 'dateRange' | 'date' | undefined;
  /** default: `true` */
  dragSelectionEnabled?: boolean | undefined;
  /** default: `false` */
  editableDateInputs?: boolean | undefined;
  /** default: `Continuous` */
  endDatePlaceholder?: string | undefined;
  /** default: `false` */
  fixedHeight?: boolean | undefined;
  /**
   * Which range and step are focused. First value is index of ranges,
   * second value is which step on date range (startDate or endDate).
   * default: `[0, 0]`
   */
  focusedRange?: RangeFocus | undefined;
  /** Initial value for focused range — default: none */
  initialFocusedRange?: RangeFocus | undefined;
  /**
   * default: `en-US` from `date-fns/locale`
   */
  locale?: Locale | undefined;
  /** default: 20 years after the current date */
  maxDate?: Date | undefined;
  /** default: 100 years before the current date */
  minDate?: Date | undefined;
  /** default: `MMM yyyy` */
  monthDisplayFormat?: string | undefined;
  /** default: `1` */
  months?: number | undefined;
  /** Custom renderer for month/year navigation — default: none */
  navigatorRenderer?:
    | ((
        currFocusedDate: Date,
        changeShownDate: (
          value: Date | number | string,
          mode?: 'set' | 'setYear' | 'setMonth' | 'monthOffset',
        ) => void,
        props: CalendarProps,
      ) => React.JSX.Element)
    | undefined;
  /** default: none */
  onChange?: ((date: Date) => void) | undefined;
  /** default: none */
  onPreviewChange?: ((previewDate?: Date) => void) | undefined;
  /** default: none */
  onRangeFocusChange?: ((newFocusedRange: RangeFocus) => void) | undefined;
  /** default: none */
  onShownDateChange?: ((date: Date) => void) | undefined;
  /** default: false */
  preventSnapRefocus?: boolean | undefined;
  /** default: none */
  preview?: Preview | undefined;
  /** default: `['#3d91ff', '#3ecf8e', '#fed14c']` */
  rangeColors?: string[] | undefined;
  /** default: `[]` */
  ranges?: Range[] | undefined;
  /** Custom scroll options — default: `{ enabled: false }` */
  scroll?: ScrollOptions | undefined;
  /** default: true */
  showDateDisplay?: boolean | undefined;
  /** default: true */
  showMonthAndYearPickers?: boolean | undefined;
  /** default: true */
  showMonthArrow?: boolean | undefined;
  /** default: true */
  showPreview?: boolean | undefined;
  /** default: none */
  shownDate?: Date | undefined;
  /** default: `Early` */
  startDatePlaceholder?: string | undefined;
  /** default: none */
  updateRange?: ((newRange: Range) => void) | undefined;
  /** default: `E` */
  weekdayDisplayFormat?: string | undefined;
  /** default: none */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}

export function Calendar(props: CalendarProps): React.JSX.Element;

// =============================================================================
// DateRange Component
// =============================================================================

export interface DateRangeProps extends Omit<CalendarProps, 'onChange'> {
  /** default: none */
  onChange?: ((rangesByKey: RangeKeyDict) => void) | undefined;
  /** default: `false` */
  moveRangeOnFirstSelection?: boolean;
  /** default: `false` */
  retainEndDateOnFirstSelection?: boolean;
}

export function DateRange(props: DateRangeProps): React.JSX.Element;

// =============================================================================
// DefinedRange Component and Defaults
// =============================================================================

export interface StaticRange {
  range: (props?: DefinedRangeProps) => Preview;
  isSelected: (range: Range, props?: DefinedRangeProps) => boolean;
  label?: string | undefined;
  hasCustomRendering?: boolean | undefined;
}

export interface InputRange {
  range: (value: number, props?: DefinedRangeProps) => Range;
  getCurrentValue: (range: Range) => string | number;
  label?: string | undefined;
}

export interface DefinedRangeProps {
  /** default: none */
  className?: string | undefined;
  /**
   * Which range and step are focused.
   * default: `[0, 0]`
   */
  focusedRange?: RangeFocus | undefined;
  /** default: none */
  footerContent?: React.ReactNode | undefined;
  /** default: none */
  headerContent?: React.ReactNode | undefined;
  /** default: `defaultInputRanges` */
  inputRanges?: InputRange[] | undefined;
  /** default: none */
  onChange?: ((rangesByKey: RangeKeyDict) => void) | undefined;
  /** default: none */
  onPreviewChange?: ((preview?: Preview) => void) | undefined;
  /** default: `['#3d91ff', '#3ecf8e', '#fed14c']` */
  rangeColors?: string[] | undefined;
  /** default: `[]` */
  ranges?: Range[] | undefined;
  /** Custom renderer for static range labels — default: none */
  renderStaticRangeLabel?: ((staticRange: StaticRange) => React.ReactNode) | undefined;
  /** default: `defaultStaticRanges` */
  staticRanges?: StaticRange[] | undefined;
  /** 0=Sunday … 6=Saturday; forwarded into default weekly static ranges. */
  weekStartsOn?: number | undefined;
}

export function DefinedRange(props: DefinedRangeProps): React.JSX.Element;

export const defaultStaticRanges: StaticRange[];
export const defaultInputRanges: InputRange[];

export function createStaticRanges(
  ranges: Array<Optional<StaticRange, 'isSelected'>>,
): StaticRange[];

// =============================================================================
// DateRangePicker Component
// =============================================================================

export interface DateRangePickerProps extends DateRangeProps, DefinedRangeProps {
  /**
   * NOTE: currently the date range picker component passes the
   * `onPreviewChange` prop (if included) to both subcomponents even
   * though they seemingly expect different types for this method.
   * Therefore, if passing this prop, it should be able to handle both
   * types so it will work for either component.
   */
  /** default: none */
  onPreviewChange?: ((preview?: Date | Preview) => void) | undefined;
}

export function DateRangePicker(props: DateRangePickerProps): React.JSX.Element;

// =============================================================================
// DateInput Component (type-only; not exported from src/index.js runtime barrel)
// =============================================================================

/**
 * Props for the internal DateInput component used by DateDisplay.
 * NOTE: DateInput is NOT a public runtime export — this interface is a
 * type-only contract addition for TypeScript consumers (obs #8626).
 */
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

/**
 * Internal DateInput component — NOT exported from src/index.js runtime barrel.
 * Type-only declaration (obs #8626).
 */
export function DateInput(props: DateInputProps): React.JSX.Element;

// =============================================================================
// Style import declarations (SCSS / CSS consumed by library users)
// =============================================================================

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
