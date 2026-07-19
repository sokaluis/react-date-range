Object.defineProperties(exports, {
	__esModule: { value: true },
	[Symbol.toStringTag]: { value: "Module" }
});
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
	dateDisplay: "rdrDateDisplay",
	dateDisplayItem: "rdrDateDisplayItem",
	dateDisplayItemActive: "rdrDateDisplayItemActive",
	dateDisplayLabel: "rdrDateDisplayLabel",
	datePickerInputWrapper: "rdrDatePickerInputWrapper",
	datePickerInputTrigger: "rdrDatePickerInputTrigger",
	datePickerInputPopover: "rdrDatePickerInputPopover",
	dateRangeInputWrapper: "rdrDateRangeInputWrapper",
	dateRangeInputTrigger: "rdrDateRangeInputTrigger",
	dateRangeInputPopover: "rdrDateRangeInputPopover",
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
exports.UI_SLOT_KEYS = UI_SLOT_KEYS;
exports.UiSlots = UiSlots;
exports.default = styles_default;
exports.getUiSlotClassName = getUiSlotClassName;
exports.getUiSlotStyle = getUiSlotStyle;
exports.mergeUiSlotStyles = mergeUiSlotStyles;
exports.omitUiSlotKeys = omitUiSlotKeys;
