import { addDays, addMonths, differenceInCalendarDays, endOfDay, endOfMonth, endOfWeek, isSameDay, startOfDay, startOfMonth, startOfWeek } from "date-fns";
//#region src/defaultRanges.js
const getWeekOptions = (props) => {
	if (props && props.weekStartsOn !== void 0) return { weekStartsOn: props.weekStartsOn };
	return {};
};
const defineds = {
	startOfToday: startOfDay(/* @__PURE__ */ new Date()),
	endOfToday: endOfDay(/* @__PURE__ */ new Date()),
	startOfYesterday: startOfDay(addDays(/* @__PURE__ */ new Date(), -1)),
	endOfYesterday: endOfDay(addDays(/* @__PURE__ */ new Date(), -1)),
	startOfMonth: startOfMonth(/* @__PURE__ */ new Date()),
	endOfMonth: endOfMonth(/* @__PURE__ */ new Date()),
	startOfLastMonth: startOfMonth(addMonths(/* @__PURE__ */ new Date(), -1)),
	endOfLastMonth: endOfMonth(addMonths(/* @__PURE__ */ new Date(), -1))
};
const staticRangeHandler = {
	range: {},
	isSelected(range, props) {
		const definedRange = this.range(props);
		return isSameDay(range.startDate, definedRange.startDate) && isSameDay(range.endDate, definedRange.endDate);
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
			startDate: startOfWeek(/* @__PURE__ */ new Date(), getWeekOptions(props)),
			endDate: endOfWeek(/* @__PURE__ */ new Date(), getWeekOptions(props))
		})
	},
	{
		label: "Last Week",
		range: (props) => ({
			startDate: startOfWeek(addDays(/* @__PURE__ */ new Date(), -7), getWeekOptions(props)),
			endDate: endOfWeek(addDays(/* @__PURE__ */ new Date(), -7), getWeekOptions(props))
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
			startDate: addDays(defineds.startOfToday, (Math.max(Number(value), 1) - 1) * -1),
			endDate: defineds.endOfToday
		};
	},
	getCurrentValue(range) {
		if (!isSameDay(range.endDate, defineds.endOfToday)) return "-";
		if (!range.startDate) return "∞";
		return differenceInCalendarDays(defineds.endOfToday, range.startDate) + 1;
	}
}, {
	label: "days starting today",
	range(value) {
		const today = /* @__PURE__ */ new Date();
		return {
			startDate: today,
			endDate: addDays(today, Math.max(Number(value), 1) - 1)
		};
	},
	getCurrentValue(range) {
		if (!isSameDay(range.startDate, defineds.startOfToday)) return "-";
		if (!range.endDate) return "∞";
		return differenceInCalendarDays(range.endDate, defineds.startOfToday) + 1;
	}
}];
//#endregion
export { createStaticRanges, defaultInputRanges, defaultStaticRanges };
