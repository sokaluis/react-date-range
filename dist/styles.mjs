//#region src/styles.js
const UI_SLOT_KEYS = Object.freeze([
	"root",
	"header",
	"monthYear",
	"monthPicker",
	"yearPicker",
	"nav",
	"navPrev",
	"navNext",
	"months",
	"month",
	"weekdays",
	"weekDay",
	"days",
	"day",
	"dayToday",
	"dateDisplay",
	"dateDisplayItem",
	"footer",
	"definedRanges"
]);
const UiSlots = Object.freeze(UI_SLOT_KEYS.reduce((slots, key) => ({
	...slots,
	[key]: key
}), {}));
const getUiSlotClassName = (uiSlots, key) => uiSlots?.[key]?.className;
const getUiSlotStyle = (uiSlots, key) => uiSlots?.[key]?.style;
const mergeUiSlotStyles = (baseStyle, uiSlots, key) => {
	const slotStyle = getUiSlotStyle(uiSlots, key);
	if (!slotStyle) return baseStyle;
	return {
		...baseStyle || {},
		...slotStyle
	};
};
const omitUiSlotKeys = (uiSlots, keys) => {
	if (!uiSlots) return uiSlots;
	const nextSlots = { ...uiSlots };
	keys.forEach((key) => {
		delete nextSlots[key];
	});
	return nextSlots;
};
var styles_default = {
	dateRangeWrapper: "rdrDateRangeWrapper",
	calendarWrapper: "rdrCalendarWrapper",
	calendarWrapperResponsive: "rdrCalendarWrapperResponsive",
	calendarWrapperFluid: "rdrCalendarWrapperFluid",
	dateDisplay: "rdrDateDisplay",
	dateDisplayItem: "rdrDateDisplayItem",
	dateDisplayItemActive: "rdrDateDisplayItemActive",
	dateDisplayLabel: "rdrDateDisplayLabel",
	datePickerInputWrapper: "rdrDatePickerInputWrapper",
	datePickerInputTrigger: "rdrDatePickerInputTrigger",
	datePickerInputPopover: "rdrDatePickerInputPopover",
	datePickerInputPopoverModal: "rdrDatePickerInputPopoverModal",
	dateRangeInputWrapper: "rdrDateRangeInputWrapper",
	dateRangeInputTrigger: "rdrDateRangeInputTrigger",
	dateRangeInputPopover: "rdrDateRangeInputPopover",
	dateRangeInputPopoverModal: "rdrDateRangeInputPopoverModal",
	monthAndYearWrapper: "rdrMonthAndYearWrapper",
	monthAndYearPickers: "rdrMonthAndYearPickers",
	liveRegion: "rdrLiveRegion",
	nextPrevButton: "rdrNextPrevButton",
	month: "rdrMonth",
	weekDays: "rdrWeekDays",
	weekDay: "rdrWeekDay",
	days: "rdrDays",
	day: "rdrDay",
	dayNumber: "rdrDayNumber",
	dayPassive: "rdrDayPassive",
	dayToday: "rdrDayToday",
	dayStartOfWeek: "rdrDayStartOfWeek",
	dayEndOfWeek: "rdrDayEndOfWeek",
	daySelected: "rdrDaySelected",
	dayDisabled: "rdrDayDisabled",
	dayStartOfMonth: "rdrDayStartOfMonth",
	dayEndOfMonth: "rdrDayEndOfMonth",
	dayWeekend: "rdrDayWeekend",
	dayStartPreview: "rdrDayStartPreview",
	dayInPreview: "rdrDayInPreview",
	dayEndPreview: "rdrDayEndPreview",
	dayHovered: "rdrDayHovered",
	dayActive: "rdrDayActive",
	inRange: "rdrInRange",
	endEdge: "rdrEndEdge",
	startEdge: "rdrStartEdge",
	prevButton: "rdrPprevButton",
	nextButton: "rdrNextButton",
	selected: "rdrSelected",
	months: "rdrMonths",
	monthPicker: "rdrMonthPicker",
	yearPicker: "rdrYearPicker",
	dateDisplayWrapper: "rdrDateDisplayWrapper",
	definedRangesWrapper: "rdrDefinedRangesWrapper",
	staticRanges: "rdrStaticRanges",
	staticRange: "rdrStaticRange",
	inputRanges: "rdrInputRanges",
	inputRange: "rdrInputRange",
	inputRangeInput: "rdrInputRangeInput",
	dateRangePickerWrapper: "rdrDateRangePickerWrapper",
	dateRangePickerWrapperFluid: "rdrDateRangePickerWrapperFluid",
	dateRangePickerWrapperResponsive: "rdrDateRangePickerWrapperResponsive",
	staticRangeLabel: "rdrStaticRangeLabel",
	staticRangeSelected: "rdrStaticRangeSelected",
	monthName: "rdrMonthName",
	infiniteMonths: "rdrInfiniteMonths",
	monthsVertical: "rdrMonthsVertical",
	monthsHorizontal: "rdrMonthsHorizontal",
	rtl: "rdrRtl"
};
//#endregion
export { UI_SLOT_KEYS, UiSlots, styles_default as default, getUiSlotClassName, getUiSlotStyle, mergeUiSlotStyles, omitUiSlotKeys };
