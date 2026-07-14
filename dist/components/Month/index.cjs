const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
const require_styles = require("../../styles.cjs");
const require_components_DayCell_index = require("../DayCell/index.cjs");
const require_utils = require("../../utils.cjs");
let date_fns = require("date-fns");
let react = require("react");
react = require_runtime.__toESM(react);
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
//#region src/components/Month/index.jsx
function renderWeekdays(styles, dateOptions, weekdayDisplayFormat, uiSlots) {
	const now = /* @__PURE__ */ new Date();
	return /* @__PURE__ */ react.default.createElement("div", {
		className: (0, classnames.default)(styles.weekDays, require_styles.getUiSlotClassName(uiSlots, "weekdays")),
		style: require_styles.mergeUiSlotStyles(void 0, uiSlots, "weekdays")
	}, (0, date_fns.eachDayOfInterval)({
		start: (0, date_fns.startOfWeek)(now, dateOptions),
		end: (0, date_fns.endOfWeek)(now, dateOptions)
	}).map((day, i) => /* @__PURE__ */ react.default.createElement("span", {
		className: (0, classnames.default)(styles.weekDay, require_styles.getUiSlotClassName(uiSlots, "weekDay")),
		style: require_styles.mergeUiSlotStyles(void 0, uiSlots, "weekDay"),
		key: i
	}, (0, date_fns.format)(day, weekdayDisplayFormat, dateOptions))));
}
function Month(props) {
	const now = /* @__PURE__ */ new Date();
	const { displayMode, focusedRange, drag, styles, disabledDates, disabledDay, minDate: rawMinDate, maxDate: rawMaxDate, month, dateOptions, fixedHeight, ranges: rawRanges, showPreview: shouldShowPreview, preview, style, showMonthName, monthDisplayFormat, showWeekDays, weekdayDisplayFormat, onMouseLeave, onDragSelectionStart, onDragSelectionEnd, onDragSelectionMove, todayAffordance, uiSlots } = props;
	const minDate = rawMinDate && (0, date_fns.startOfDay)(rawMinDate);
	const maxDate = rawMaxDate && (0, date_fns.endOfDay)(rawMaxDate);
	const monthDisplay = require_utils.getMonthDisplayRange(month, dateOptions, fixedHeight);
	let ranges = rawRanges;
	if (displayMode === "dateRange" && drag.status) {
		const { startDate, endDate } = drag.range;
		ranges = ranges.map((range, i) => {
			if (i !== focusedRange[0]) return range;
			return {
				...range,
				startDate,
				endDate
			};
		});
	}
	const showPreview = shouldShowPreview && !drag.disablePreview;
	return /* @__PURE__ */ react.default.createElement("div", {
		className: (0, classnames.default)(styles.month, require_styles.getUiSlotClassName(uiSlots, "month")),
		style: require_styles.mergeUiSlotStyles(style, uiSlots, "month")
	}, showMonthName ? /* @__PURE__ */ react.default.createElement("div", { className: styles.monthName }, (0, date_fns.format)(month, monthDisplayFormat, dateOptions)) : null, showWeekDays && renderWeekdays(styles, dateOptions, weekdayDisplayFormat, uiSlots), /* @__PURE__ */ react.default.createElement("div", {
		className: (0, classnames.default)(styles.days, require_styles.getUiSlotClassName(uiSlots, "days")),
		style: require_styles.mergeUiSlotStyles(void 0, uiSlots, "days"),
		onMouseLeave
	}, (0, date_fns.eachDayOfInterval)({
		start: monthDisplay.start,
		end: monthDisplay.end
	}).map((day, index) => {
		const isStartOfMonth = (0, date_fns.isSameDay)(day, monthDisplay.startDateOfMonth);
		const isEndOfMonth = (0, date_fns.isSameDay)(day, monthDisplay.endDateOfMonth);
		const isOutsideMinMax = minDate && (0, date_fns.isBefore)(day, minDate) || maxDate && (0, date_fns.isAfter)(day, maxDate);
		const isDisabledSpecifically = disabledDates.some((disabledDate) => (0, date_fns.isSameDay)(disabledDate, day));
		const isDisabledDay = disabledDay(day);
		return /* @__PURE__ */ react.default.createElement(require_components_DayCell_index, {
			...props,
			ranges,
			day,
			preview: showPreview ? preview : null,
			isWeekend: (0, date_fns.isWeekend)(day, dateOptions),
			isToday: (0, date_fns.isSameDay)(day, now),
			todayAffordance,
			isStartOfWeek: (0, date_fns.isSameDay)(day, (0, date_fns.startOfWeek)(day, dateOptions)),
			isEndOfWeek: (0, date_fns.isSameDay)(day, (0, date_fns.endOfWeek)(day, dateOptions)),
			isStartOfMonth,
			isEndOfMonth,
			key: index,
			disabled: isOutsideMinMax || isDisabledSpecifically || isDisabledDay,
			isPassive: !props.selectablePassive && !(0, date_fns.isWithinInterval)(day, {
				start: monthDisplay.startDateOfMonth,
				end: monthDisplay.endDateOfMonth
			}),
			styles,
			onMouseDown: onDragSelectionStart,
			onMouseUp: onDragSelectionEnd,
			onMouseEnter: onDragSelectionMove,
			dragRange: drag.range,
			drag: drag.status
		});
	})));
}
//#endregion
module.exports = Month;
