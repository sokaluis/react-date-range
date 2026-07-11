const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
const require_utils = require("../../utils.cjs");
const require_styles = require("../../styles.cjs");
const require_components_Calendar_index = require("../Calendar/index.cjs");
let date_fns = require("date-fns");
let react = require("react");
react = require_runtime.__toESM(react);
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
//#region src/components/DateRange/index.jsx
const EMPTY_DATES = Object.freeze([]);
const dateRangeDefaultProps = {
	classNames: {},
	ranges: [],
	moveRangeOnFirstSelection: false,
	retainEndDateOnFirstSelection: false,
	rangeColors: [
		"#3d91ff",
		"#3ecf8e",
		"#fed14c"
	],
	disabledDates: []
};
const DateRange = (0, react.forwardRef)(function DateRange({ classNames = dateRangeDefaultProps.classNames, ranges = dateRangeDefaultProps.ranges, moveRangeOnFirstSelection = dateRangeDefaultProps.moveRangeOnFirstSelection, retainEndDateOnFirstSelection = dateRangeDefaultProps.retainEndDateOnFirstSelection, rangeColors = dateRangeDefaultProps.rangeColors, disabledDates = dateRangeDefaultProps.disabledDates, ...rest }, ref) {
	const safeDisabledDates = Array.isArray(disabledDates) ? disabledDates : EMPTY_DATES;
	const props = (0, react.useMemo)(() => ({
		classNames,
		ranges,
		moveRangeOnFirstSelection,
		retainEndDateOnFirstSelection,
		rangeColors,
		disabledDates: safeDisabledDates,
		...rest
	}), [
		classNames,
		ranges,
		moveRangeOnFirstSelection,
		retainEndDateOnFirstSelection,
		rangeColors,
		safeDisabledDates,
		rest
	]);
	/**
	* Scroll guard: virtual scrolling makes neighbour-month cells unreachable via
	* standard scroll; suppressing selectablePassive keeps them visually/physically
	* passive and keyboard-inert while scroll is active.
	*/
	const effectiveSelectablePassive = !!rest.selectablePassive && !rest.scroll?.enabled;
	const calendarRef = (0, react.useRef)(null);
	const [focusedRangeState, setFocusedRangeState] = (0, react.useState)(() => props.initialFocusedRange || [require_utils.findNextRangeIndex(props.ranges), 0]);
	const [preview, setPreview] = (0, react.useState)(null);
	const [liveAnnouncement, setLiveAnnouncement] = (0, react.useState)("");
	const styles = (0, react.useMemo)(() => require_utils.generateStyles([require_styles, props.classNames]), [props.classNames]);
	const calcNewSelection = (0, react.useCallback)((value, isSingleValue = true) => {
		const focusedRange = props.focusedRange || focusedRangeState;
		const { ranges, onChange, maxDate, moveRangeOnFirstSelection, retainEndDateOnFirstSelection, disabledDates } = props;
		const selectedRange = ranges[focusedRange[0]];
		if (!selectedRange || !onChange) return {};
		let { startDate, endDate } = selectedRange;
		const now = /* @__PURE__ */ new Date();
		let nextFocusRange;
		if (!isSingleValue) {
			startDate = value.startDate;
			endDate = value.endDate;
		} else if (focusedRange[1] === 0) {
			const dayOffset = (0, date_fns.differenceInCalendarDays)(endDate || now, startDate);
			const calculateEndDate = () => {
				if (moveRangeOnFirstSelection) return (0, date_fns.addDays)(value, dayOffset);
				if (retainEndDateOnFirstSelection) {
					if (!endDate || (0, date_fns.isBefore)(value, endDate)) return endDate;
					return value;
				}
				return value || now;
			};
			startDate = value;
			endDate = calculateEndDate();
			if (maxDate) endDate = (0, date_fns.min)([endDate, maxDate]);
			nextFocusRange = [focusedRange[0], 1];
		} else endDate = value;
		let isStartDateSelected = focusedRange[1] === 0;
		if ((0, date_fns.isBefore)(endDate, startDate)) {
			isStartDateSelected = !isStartDateSelected;
			[startDate, endDate] = [endDate, startDate];
		}
		const inValidDatesWithinRange = disabledDates.filter((disabledDate) => (0, date_fns.isWithinInterval)(disabledDate, {
			start: startDate,
			end: endDate
		}));
		if (inValidDatesWithinRange.length > 0) if (isStartDateSelected) startDate = (0, date_fns.addDays)((0, date_fns.max)(inValidDatesWithinRange), 1);
		else endDate = (0, date_fns.addDays)((0, date_fns.min)(inValidDatesWithinRange), -1);
		if (!nextFocusRange) nextFocusRange = [require_utils.findNextRangeIndex(props.ranges, focusedRange[0]), 0];
		return {
			wasValid: !(inValidDatesWithinRange.length > 0),
			range: {
				startDate,
				endDate
			},
			nextFocusRange
		};
	}, [focusedRangeState, props]);
	const setSelection = (0, react.useCallback)((value, isSingleValue) => {
		const { onChange, ranges, onRangeFocusChange } = props;
		const focusedRangeIndex = (props.focusedRange || focusedRangeState)[0];
		const selectedRange = ranges[focusedRangeIndex];
		if (!selectedRange) return;
		const newSelection = calcNewSelection(value, isSingleValue);
		const { startDate, endDate } = newSelection.range;
		const liveFormatter = props.ariaLabels?.liveRegionSelection;
		setLiveAnnouncement(liveFormatter ? liveFormatter({
			startDate,
			endDate
		}) : `Selected ${(0, date_fns.format)(startDate, "PPP")} to ${(0, date_fns.format)(endDate, "PPP")}`);
		onChange({ [selectedRange.key || `range${focusedRangeIndex + 1}`]: {
			...selectedRange,
			...newSelection.range
		} });
		setFocusedRangeState(newSelection.nextFocusRange);
		setPreview(null);
		onRangeFocusChange && onRangeFocusChange(newSelection.nextFocusRange);
	}, [
		calcNewSelection,
		focusedRangeState,
		props
	]);
	const handleRangeFocusChange = (0, react.useCallback)((focusedRange) => {
		setFocusedRangeState(focusedRange);
		props.onRangeFocusChange && props.onRangeFocusChange(focusedRange);
	}, [props]);
	const updatePreview = (0, react.useCallback)((val) => {
		if (!val) {
			setPreview(null);
			return;
		}
		const { rangeColors, ranges } = props;
		const focusedRange = props.focusedRange || focusedRangeState;
		const color = ranges[focusedRange[0]]?.color || rangeColors[focusedRange[0]] || "#3d91ff";
		setPreview({
			...val.range,
			color
		});
	}, [focusedRangeState, props]);
	(0, react.useImperativeHandle)(ref, () => ({
		calcNewSelection,
		updatePreview,
		focusToDate: (...args) => calendarRef.current?.focusToDate?.(...args),
		changeShownDate: (...args) => calendarRef.current?.changeShownDate?.(...args),
		updateShownDate: (...args) => calendarRef.current?.updateShownDate?.(...args),
		handleScroll: (...args) => calendarRef.current?.handleScroll?.(...args)
	}), [calcNewSelection, updatePreview]);
	return /* @__PURE__ */ react.default.createElement(react.default.Fragment, null, /* @__PURE__ */ react.default.createElement(require_components_Calendar_index, {
		focusedRange: focusedRangeState,
		onRangeFocusChange: handleRangeFocusChange,
		preview,
		onPreviewChange: (value) => {
			updatePreview(value ? calcNewSelection(value) : null);
		},
		...props,
		selectablePassive: effectiveSelectablePassive,
		displayMode: "dateRange",
		className: (0, classnames.default)(styles.dateRangeWrapper, props.className),
		onChange: setSelection,
		updateRange: (val) => setSelection(val, false),
		ref: calendarRef
	}), /* @__PURE__ */ react.default.createElement("div", {
		"aria-live": "polite",
		"aria-atomic": "true",
		className: (0, classnames.default)(styles.liveRegion)
	}, liveAnnouncement));
});
//#endregion
module.exports = DateRange;
