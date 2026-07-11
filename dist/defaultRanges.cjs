Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
require("./_virtual/_rolldown/runtime.cjs");
let date_fns = require("date-fns");
//#region src/defaultRanges.js
const getWeekOptions = (props) => {
	if (props && props.weekStartsOn !== void 0) return { weekStartsOn: props.weekStartsOn };
	return {};
};
const defineds = {
	startOfToday: (0, date_fns.startOfDay)(/* @__PURE__ */ new Date()),
	endOfToday: (0, date_fns.endOfDay)(/* @__PURE__ */ new Date()),
	startOfYesterday: (0, date_fns.startOfDay)((0, date_fns.addDays)(/* @__PURE__ */ new Date(), -1)),
	endOfYesterday: (0, date_fns.endOfDay)((0, date_fns.addDays)(/* @__PURE__ */ new Date(), -1)),
	startOfMonth: (0, date_fns.startOfMonth)(/* @__PURE__ */ new Date()),
	endOfMonth: (0, date_fns.endOfMonth)(/* @__PURE__ */ new Date()),
	startOfLastMonth: (0, date_fns.startOfMonth)((0, date_fns.addMonths)(/* @__PURE__ */ new Date(), -1)),
	endOfLastMonth: (0, date_fns.endOfMonth)((0, date_fns.addMonths)(/* @__PURE__ */ new Date(), -1))
};
const staticRangeHandler = {
	range: {},
	isSelected(range, props) {
		const definedRange = this.range(props);
		return (0, date_fns.isSameDay)(range.startDate, definedRange.startDate) && (0, date_fns.isSameDay)(range.endDate, definedRange.endDate);
	}
};
function createStaticRanges(ranges) {
	return ranges.map((range) => ({
		...staticRangeHandler,
		...range
	}));
}
const defaultStaticRanges = createStaticRanges([
	{
		label: "Today",
		range: () => ({
			startDate: defineds.startOfToday,
			endDate: defineds.endOfToday
		})
	},
	{
		label: "Yesterday",
		range: () => ({
			startDate: defineds.startOfYesterday,
			endDate: defineds.endOfYesterday
		})
	},
	{
		label: "This Week",
		range: (props) => ({
			startDate: (0, date_fns.startOfWeek)(/* @__PURE__ */ new Date(), getWeekOptions(props)),
			endDate: (0, date_fns.endOfWeek)(/* @__PURE__ */ new Date(), getWeekOptions(props))
		})
	},
	{
		label: "Last Week",
		range: (props) => ({
			startDate: (0, date_fns.startOfWeek)((0, date_fns.addDays)(/* @__PURE__ */ new Date(), -7), getWeekOptions(props)),
			endDate: (0, date_fns.endOfWeek)((0, date_fns.addDays)(/* @__PURE__ */ new Date(), -7), getWeekOptions(props))
		})
	},
	{
		label: "This Month",
		range: () => ({
			startDate: defineds.startOfMonth,
			endDate: defineds.endOfMonth
		})
	},
	{
		label: "Last Month",
		range: () => ({
			startDate: defineds.startOfLastMonth,
			endDate: defineds.endOfLastMonth
		})
	}
]);
const defaultInputRanges = [{
	label: "days up to today",
	range(value) {
		return {
			startDate: (0, date_fns.addDays)(defineds.startOfToday, (Math.max(Number(value), 1) - 1) * -1),
			endDate: defineds.endOfToday
		};
	},
	getCurrentValue(range) {
		if (!(0, date_fns.isSameDay)(range.endDate, defineds.endOfToday)) return "-";
		if (!range.startDate) return "∞";
		return (0, date_fns.differenceInCalendarDays)(defineds.endOfToday, range.startDate) + 1;
	}
}, {
	label: "days starting today",
	range(value) {
		const today = /* @__PURE__ */ new Date();
		return {
			startDate: today,
			endDate: (0, date_fns.addDays)(today, Math.max(Number(value), 1) - 1)
		};
	},
	getCurrentValue(range) {
		if (!(0, date_fns.isSameDay)(range.startDate, defineds.startOfToday)) return "-";
		if (!range.endDate) return "∞";
		return (0, date_fns.differenceInCalendarDays)(range.endDate, defineds.startOfToday) + 1;
	}
}];
//#endregion
exports.createStaticRanges = createStaticRanges;
exports.defaultInputRanges = defaultInputRanges;
exports.defaultStaticRanges = defaultStaticRanges;
