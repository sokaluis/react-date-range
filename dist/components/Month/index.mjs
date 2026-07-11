import DayCell from "../DayCell/index.mjs";
import { getMonthDisplayRange } from "../../utils.mjs";
import { eachDayOfInterval, endOfDay, endOfWeek, format, isAfter, isBefore, isSameDay, isWeekend, isWithinInterval, startOfDay, startOfWeek } from "date-fns";
import React from "react";
//#region src/components/Month/index.jsx
function renderWeekdays(styles, dateOptions, weekdayDisplayFormat) {
	const now = /* @__PURE__ */ new Date();
	return /* @__PURE__ */ React.createElement("div", { className: styles.weekDays }, eachDayOfInterval({
		start: startOfWeek(now, dateOptions),
		end: endOfWeek(now, dateOptions)
	}).map((day, i) => /* @__PURE__ */ React.createElement("span", {
		className: styles.weekDay,
		key: i
	}, format(day, weekdayDisplayFormat, dateOptions))));
}
function Month(props) {
	const now = /* @__PURE__ */ new Date();
	const { displayMode, focusedRange, drag, styles, disabledDates, disabledDay, minDate: rawMinDate, maxDate: rawMaxDate, month, dateOptions, fixedHeight, ranges: rawRanges, showPreview: shouldShowPreview, preview, style, showMonthName, monthDisplayFormat, showWeekDays, weekdayDisplayFormat, onMouseLeave, onDragSelectionStart, onDragSelectionEnd, onDragSelectionMove } = props;
	const minDate = rawMinDate && startOfDay(rawMinDate);
	const maxDate = rawMaxDate && endOfDay(rawMaxDate);
	const monthDisplay = getMonthDisplayRange(month, dateOptions, fixedHeight);
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
	return /* @__PURE__ */ React.createElement("div", {
		className: styles.month,
		style
	}, showMonthName ? /* @__PURE__ */ React.createElement("div", { className: styles.monthName }, format(month, monthDisplayFormat, dateOptions)) : null, showWeekDays && renderWeekdays(styles, dateOptions, weekdayDisplayFormat), /* @__PURE__ */ React.createElement("div", {
		className: styles.days,
		onMouseLeave
	}, eachDayOfInterval({
		start: monthDisplay.start,
		end: monthDisplay.end
	}).map((day, index) => {
		const isStartOfMonth = isSameDay(day, monthDisplay.startDateOfMonth);
		const isEndOfMonth = isSameDay(day, monthDisplay.endDateOfMonth);
		const isOutsideMinMax = minDate && isBefore(day, minDate) || maxDate && isAfter(day, maxDate);
		const isDisabledSpecifically = disabledDates.some((disabledDate) => isSameDay(disabledDate, day));
		const isDisabledDay = disabledDay(day);
		return /* @__PURE__ */ React.createElement(DayCell, {
			...props,
			ranges,
			day,
			preview: showPreview ? preview : null,
			isWeekend: isWeekend(day, dateOptions),
			isToday: isSameDay(day, now),
			isStartOfWeek: isSameDay(day, startOfWeek(day, dateOptions)),
			isEndOfWeek: isSameDay(day, endOfWeek(day, dateOptions)),
			isStartOfMonth,
			isEndOfMonth,
			key: index,
			disabled: isOutsideMinMax || isDisabledSpecifically || isDisabledDay,
			isPassive: !props.selectablePassive && !isWithinInterval(day, {
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
export { Month as default };
