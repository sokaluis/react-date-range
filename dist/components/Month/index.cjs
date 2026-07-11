const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
const require_components_DayCell_index = require("../DayCell/index.cjs");
const require_utils = require("../../utils.cjs");
let date_fns = require("date-fns");
let react = require("react");
react = require_runtime.__toESM(react);
//#region src/components/Month/index.jsx
function renderWeekdays(styles, dateOptions, weekdayDisplayFormat) {
	const now = /* @__PURE__ */ new Date();
	return /* @__PURE__ */ react.default.createElement("div", { className: styles.weekDays }, (0, date_fns.eachDayOfInterval)({
		start: (0, date_fns.startOfWeek)(now, dateOptions),
		end: (0, date_fns.endOfWeek)(now, dateOptions)
	}).map((day, i) => /* @__PURE__ */ react.default.createElement("span", {
		className: styles.weekDay,
		key: i
	}, (0, date_fns.format)(day, weekdayDisplayFormat, dateOptions))));
}
function Month(props) {
	const now = /* @__PURE__ */ new Date();
	const { displayMode, focusedRange, drag, styles, disabledDates, disabledDay, minDate: rawMinDate, maxDate: rawMaxDate, month, dateOptions, fixedHeight, ranges: rawRanges, showPreview: shouldShowPreview, preview, style, showMonthName, monthDisplayFormat, showWeekDays, weekdayDisplayFormat, onMouseLeave, onDragSelectionStart, onDragSelectionEnd, onDragSelectionMove } = props;
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
		className: styles.month,
		style
	}, showMonthName ? /* @__PURE__ */ react.default.createElement("div", { className: styles.monthName }, (0, date_fns.format)(month, monthDisplayFormat, dateOptions)) : null, showWeekDays && renderWeekdays(styles, dateOptions, weekdayDisplayFormat), /* @__PURE__ */ react.default.createElement("div", {
		className: styles.days,
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
