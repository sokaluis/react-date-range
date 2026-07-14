export const UI_SLOT_KEYS = Object.freeze([
  'root',
  'header',
  'monthYear',
  'monthPicker',
  'yearPicker',
  'nav',
  'navPrev',
  'navNext',
  'months',
  'month',
  'weekdays',
  'weekDay',
  'days',
  'day',
  'dayToday',
  'dateDisplay',
  'dateDisplayItem',
  'footer',
  'definedRanges',
]);

export const UiSlots = Object.freeze(
  UI_SLOT_KEYS.reduce((slots, key) => ({ ...slots, [key]: key }), {})
);

export const getUiSlotClassName = (uiSlots, key) => uiSlots?.[key]?.className;

export const getUiSlotStyle = (uiSlots, key) => uiSlots?.[key]?.style;

export const mergeUiSlotStyles = (baseStyle, uiSlots, key) => {
  const slotStyle = getUiSlotStyle(uiSlots, key);
  if (!slotStyle) return baseStyle;
  return { ...(baseStyle || {}), ...slotStyle };
};

export const omitUiSlotKeys = (uiSlots, keys) => {
  if (!uiSlots) return uiSlots;
  const nextSlots = { ...uiSlots };
  keys.forEach(key => {
    delete nextSlots[key];
  });
  return nextSlots;
};

export default {
  dateRangeWrapper: 'rdrDateRangeWrapper',
  calendarWrapper: 'rdrCalendarWrapper',
  dateDisplay: 'rdrDateDisplay',
  dateDisplayItem: 'rdrDateDisplayItem',
  dateDisplayItemActive: 'rdrDateDisplayItemActive',
  dateDisplayLabel: 'rdrDateDisplayLabel',
  datePickerInputWrapper: 'rdrDatePickerInputWrapper',
  datePickerInputTrigger: 'rdrDatePickerInputTrigger',
  datePickerInputPopover: 'rdrDatePickerInputPopover',
  dateRangeInputWrapper: 'rdrDateRangeInputWrapper',
  dateRangeInputTrigger: 'rdrDateRangeInputTrigger',
  dateRangeInputPopover: 'rdrDateRangeInputPopover',
  monthAndYearWrapper: 'rdrMonthAndYearWrapper',
  monthAndYearPickers: 'rdrMonthAndYearPickers',
  liveRegion: 'rdrLiveRegion',
  nextPrevButton: 'rdrNextPrevButton',
  month: 'rdrMonth',
  weekDays: 'rdrWeekDays',
  weekDay: 'rdrWeekDay',
  days: 'rdrDays',
  day: 'rdrDay',
  dayNumber: 'rdrDayNumber',
  dayPassive: 'rdrDayPassive',
  dayToday: 'rdrDayToday',
  dayStartOfWeek: 'rdrDayStartOfWeek',
  dayEndOfWeek: 'rdrDayEndOfWeek',
  daySelected: 'rdrDaySelected',
  dayDisabled: 'rdrDayDisabled',
  dayStartOfMonth: 'rdrDayStartOfMonth',
  dayEndOfMonth: 'rdrDayEndOfMonth',
  dayWeekend: 'rdrDayWeekend',
  dayStartPreview: 'rdrDayStartPreview',
  dayInPreview: 'rdrDayInPreview',
  dayEndPreview: 'rdrDayEndPreview',
  dayHovered: 'rdrDayHovered',
  dayActive: 'rdrDayActive',
  inRange: 'rdrInRange',
  endEdge: 'rdrEndEdge',
  startEdge: 'rdrStartEdge',
  prevButton: 'rdrPprevButton',
  nextButton: 'rdrNextButton',
  selected: 'rdrSelected',
  months: 'rdrMonths',
  monthPicker: 'rdrMonthPicker',
  yearPicker: 'rdrYearPicker',
  dateDisplayWrapper: 'rdrDateDisplayWrapper',
  definedRangesWrapper: 'rdrDefinedRangesWrapper',
  staticRanges: 'rdrStaticRanges',
  staticRange: 'rdrStaticRange',
  inputRanges: 'rdrInputRanges',
  inputRange: 'rdrInputRange',
  inputRangeInput: 'rdrInputRangeInput',
  dateRangePickerWrapper: 'rdrDateRangePickerWrapper',
  staticRangeLabel: 'rdrStaticRangeLabel',
  staticRangeSelected: 'rdrStaticRangeSelected',
  monthName: 'rdrMonthName',
  infiniteMonths: 'rdrInfiniteMonths',
  monthsVertical: 'rdrMonthsVertical',
  monthsHorizontal: 'rdrMonthsHorizontal',
  rtl: 'rdrRtl',
};
