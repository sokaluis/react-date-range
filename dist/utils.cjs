Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_runtime = require("./_virtual/_rolldown/runtime.cjs");
let date_fns = require("date-fns");
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
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
	targetInterval.start = (0, date_fns.startOfMonth)(targetInterval.start || /* @__PURE__ */ new Date());
	targetInterval.end = (0, date_fns.endOfMonth)(targetInterval.end || targetInterval.start);
	const targetDate = targetInterval.start || targetInterval.end || shownDate || /* @__PURE__ */ new Date();
	if (!currentFocusedDate) return shownDate || targetDate;
	if ((0, date_fns.differenceInCalendarMonths)(targetInterval.start, targetInterval.end) > months) return currentFocusedDate;
	return targetDate;
}
function findNextRangeIndex(ranges, currentRangeIndex = -1) {
	if (!Array.isArray(ranges)) return -1;
	const nextIndex = ranges.findIndex((range, i) => i > currentRangeIndex && range.autoFocus !== false && !range.disabled);
	if (nextIndex !== -1) return nextIndex;
	return ranges.findIndex((range) => range.autoFocus !== false && !range.disabled);
}
function getMonthDisplayRange(date, dateOptions, fixedHeight) {
	const startDateOfMonth = (0, date_fns.startOfMonth)(date, dateOptions);
	const endDateOfMonth = (0, date_fns.endOfMonth)(date, dateOptions);
	const startDateOfCalendar = (0, date_fns.startOfWeek)(startDateOfMonth, dateOptions);
	let endDateOfCalendar = (0, date_fns.endOfWeek)(endDateOfMonth, dateOptions);
	if (fixedHeight && (0, date_fns.differenceInCalendarDays)(endDateOfCalendar, startDateOfCalendar) <= 34) endDateOfCalendar = (0, date_fns.addDays)(endDateOfCalendar, 7);
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
			styles[key] = (0, classnames.default)(styles[key], styleSource[key]);
		});
		return styles;
	}, {});
}
//#endregion
exports.calcFocusDate = calcFocusDate;
exports.findNextRangeIndex = findNextRangeIndex;
exports.generateStyles = generateStyles;
exports.getMonthDisplayRange = getMonthDisplayRange;
