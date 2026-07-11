import { addDays, differenceInCalendarDays, differenceInCalendarMonths, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import classnames from "classnames";
//#region src/utils.js
function calcFocusDate(currentFocusedDate, props) {
	const { shownDate, date, months, ranges, focusedRange, displayMode } = props;
	let targetInterval;
	if (displayMode === "dateRange") {
		const range = ranges[focusedRange[0]] || {};
		targetInterval = {
			start: range.startDate,
			end: range.endDate
		};
	} else targetInterval = {
		start: date,
		end: date
	};
	targetInterval.start = startOfMonth(targetInterval.start || /* @__PURE__ */ new Date());
	targetInterval.end = endOfMonth(targetInterval.end || targetInterval.start);
	const targetDate = targetInterval.start || targetInterval.end || shownDate || /* @__PURE__ */ new Date();
	if (!currentFocusedDate) return shownDate || targetDate;
	if (differenceInCalendarMonths(targetInterval.start, targetInterval.end) > months) return currentFocusedDate;
	return targetDate;
}
function findNextRangeIndex(ranges, currentRangeIndex = -1) {
	if (!Array.isArray(ranges)) return -1;
	const nextIndex = ranges.findIndex((range, i) => i > currentRangeIndex && range.autoFocus !== false && !range.disabled);
	if (nextIndex !== -1) return nextIndex;
	return ranges.findIndex((range) => range.autoFocus !== false && !range.disabled);
}
function getMonthDisplayRange(date, dateOptions, fixedHeight) {
	const startDateOfMonth = startOfMonth(date, dateOptions);
	const endDateOfMonth = endOfMonth(date, dateOptions);
	const startDateOfCalendar = startOfWeek(startDateOfMonth, dateOptions);
	let endDateOfCalendar = endOfWeek(endDateOfMonth, dateOptions);
	if (fixedHeight && differenceInCalendarDays(endDateOfCalendar, startDateOfCalendar) <= 34) endDateOfCalendar = addDays(endDateOfCalendar, 7);
	return {
		start: startDateOfCalendar,
		end: endDateOfCalendar,
		startDateOfMonth,
		endDateOfMonth
	};
}
function generateStyles(sources) {
	if (!sources.length) return {};
	return sources.filter((source) => Boolean(source)).reduce((styles, styleSource) => {
		Object.keys(styleSource).forEach((key) => {
			styles[key] = classnames(styles[key], styleSource[key]);
		});
		return styles;
	}, {});
}
//#endregion
export { calcFocusDate, findNextRangeIndex, generateStyles, getMonthDisplayRange };
