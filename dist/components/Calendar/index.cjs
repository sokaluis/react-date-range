const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
const require_styles = require("../../styles.cjs");
const require_utils = require("../../utils.cjs");
const require_components_Month_index = require("../Month/index.cjs");
const require_components_DateDisplay_index = require("../DateDisplay/index.cjs");
let date_fns = require("date-fns");
let react = require("react");
react = require_runtime.__toESM(react);
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
let _tanstack_react_virtual = require("@tanstack/react-virtual");
let date_fns_locale_en_US = require("date-fns/locale/en-US");
//#region src/components/Calendar/index.jsx
const EMPTY_DATES = Object.freeze([]);
const calendarDefaultProps = {
	showMonthArrow: true,
	showMonthAndYearPickers: true,
	disabledDates: [],
	disabledDay: () => {},
	classNames: {},
	locale: date_fns_locale_en_US.enUS,
	ranges: [],
	focusedRange: [0, 0],
	dateDisplayFormat: "MMM d, yyyy",
	monthDisplayFormat: "MMM yyyy",
	weekdayDisplayFormat: "E",
	dayDisplayFormat: "d",
	showDateDisplay: true,
	showPreview: true,
	displayMode: "date",
	months: 1,
	color: "#3d91ff",
	scroll: { enabled: false },
	direction: "vertical",
	maxDate: (0, date_fns.addYears)(/* @__PURE__ */ new Date(), 20),
	minDate: (0, date_fns.addYears)(/* @__PURE__ */ new Date(), -100),
	rangeColors: [
		"#3d91ff",
		"#3ecf8e",
		"#fed14c"
	],
	startDatePlaceholder: "Early",
	endDatePlaceholder: "Continuous",
	editableDateInputs: false,
	dragSelectionEnabled: true,
	fixedHeight: false,
	calendarFocus: "forwards",
	preventSnapRefocus: false,
	ariaLabels: {},
	/** Opt-in: neighbour-month filler cells become selectable when scroll is disabled. */
	selectablePassive: false,
	headerConfig: {},
	todayAffordance: "highlight"
};
const uninitializedTargetProp = Symbol("uninitializedTargetProp");
const getDateOptions = ({ locale, weekStartsOn }) => {
	const dateOptions = { locale };
	if (weekStartsOn !== void 0) dateOptions.weekStartsOn = weekStartsOn;
	return dateOptions;
};
const getMonthNames = (locale) => [...Array(12).keys()].map((i) => locale.localize.month(i));
const resolveSelectedDisplay = (selectedDisplay, dateDisplayFormat) => ({
	format: selectedDisplay?.format || dateDisplayFormat,
	placement: selectedDisplay?.placement || "top",
	separator: selectedDisplay?.separator ?? ""
});
const calcScrollArea = ({ direction, months, scroll }) => {
	if (!scroll.enabled) return { enabled: false };
	const longMonthHeight = scroll.longMonthHeight || scroll.monthHeight;
	if (direction === "vertical") return {
		enabled: true,
		monthHeight: scroll.monthHeight || 220,
		longMonthHeight: longMonthHeight || 260,
		calendarWidth: scroll.calendarWidth || scroll.monthWidth || 332,
		calendarHeight: (scroll.calendarHeight || longMonthHeight || 240) * months
	};
	return {
		enabled: true,
		monthWidth: scroll.monthWidth || 332,
		calendarWidth: (scroll.calendarWidth || scroll.monthWidth || 332) * months,
		monthHeight: longMonthHeight || 300,
		calendarHeight: longMonthHeight || 300
	};
};
const CalendarContent = react.default.forwardRef(function CalendarContent(props, ref) {
	const dateOptions = props._calendarDateOptions;
	const styles = props._calendarStyles;
	const monthNames = props._calendarMonthNames;
	const ariaLabels = props.ariaLabels || {};
	const [focusedDate, setFocusedDate] = (0, react.useState)(() => require_utils.calcFocusDate(null, props));
	const [drag, setDrag] = (0, react.useState)({
		status: false,
		range: {
			startDate: null,
			endDate: null
		},
		disablePreview: false
	});
	const [previewState, setPreviewState] = (0, react.useState)(null);
	const [liveAnnouncement, setLiveAnnouncement] = (0, react.useState)("");
	const focusedDateRef = (0, react.useRef)(focusedDate);
	const scrollContainerRef = (0, react.useRef)(null);
	const listRef = (0, react.useRef)(null);
	const isFirstRenderRef = (0, react.useRef)(true);
	const calendarWrapperRef = (0, react.useRef)(null);
	const focusTimerRef = (0, react.useRef)(null);
	const focusToDateRef = (0, react.useRef)(null);
	const previousTargetPropRef = (0, react.useRef)(uninitializedTargetProp);
	(0, react.useEffect)(() => {
		focusedDateRef.current = focusedDate;
	}, [focusedDate]);
	const estimateMonthSize = (0, react.useCallback)((index) => {
		const { direction, minDate, _calendarScrollArea: scrollArea } = props;
		if (direction === "horizontal") return scrollArea.monthWidth;
		const { start, end } = require_utils.getMonthDisplayRange((0, date_fns.addMonths)(minDate, index), dateOptions, props.fixedHeight);
		return (0, date_fns.differenceInDays)(end, start, dateOptions) + 1 > 35 ? scrollArea.longMonthHeight : scrollArea.monthHeight;
	}, [dateOptions, props]);
	const monthVirtualizer = (0, _tanstack_react_virtual.useVirtualizer)({
		count: (0, react.useMemo)(() => props.scroll.enabled ? (0, date_fns.differenceInCalendarMonths)((0, date_fns.endOfMonth)(props.maxDate), (0, date_fns.addDays)((0, date_fns.startOfMonth)(props.minDate), -1), dateOptions) : 0, [
			dateOptions,
			props.maxDate,
			props.minDate,
			props.scroll.enabled
		]),
		getScrollElement: () => scrollContainerRef.current,
		estimateSize: estimateMonthSize,
		horizontal: props.direction === "horizontal",
		overscan: 2
	});
	(0, react.useEffect)(() => {
		listRef.current = {
			getVisibleRange: () => monthVirtualizer.getVirtualItems().map((item) => item.index),
			scrollTo: (index) => monthVirtualizer.scrollToIndex(index),
			updateFrameAndClearCache: () => {
				if (typeof monthVirtualizer.measure === "function") monthVirtualizer.measure();
			}
		};
	}, [monthVirtualizer]);
	const focusToDate = (0, react.useCallback)((date, nextProps = props, preventUnnecessary = true) => {
		if (!nextProps.scroll.enabled) {
			if (preventUnnecessary && nextProps.preventSnapRefocus) {
				const focusedDateDiff = (0, date_fns.differenceInCalendarMonths)(date, focusedDateRef.current);
				const isAllowedForward = nextProps.calendarFocus === "forwards" && focusedDateDiff >= 0;
				const isAllowedBackward = nextProps.calendarFocus === "backwards" && focusedDateDiff <= 0;
				if ((isAllowedForward || isAllowedBackward) && Math.abs(focusedDateDiff) < nextProps.months) return;
			}
			setFocusedDate(date);
			return;
		}
		const list = listRef.current;
		if (!list) return;
		const targetMonthIndex = (0, date_fns.differenceInCalendarMonths)(date, nextProps.minDate, dateOptions);
		const visibleMonths = list.getVisibleRange();
		if (preventUnnecessary && visibleMonths.includes(targetMonthIndex)) return;
		isFirstRenderRef.current = true;
		list.scrollTo(targetMonthIndex);
		if (typeof list.updateFrameAndClearCache === "function") list.updateFrameAndClearCache();
		setFocusedDate(date);
	}, [dateOptions, props]);
	(0, react.useEffect)(() => {
		focusToDateRef.current = focusToDate;
	}, [focusToDate]);
	(0, react.useEffect)(() => {
		if (!props.scroll.enabled) return void 0;
		focusTimerRef.current = setTimeout(() => focusToDateRef.current(focusedDateRef.current));
		return () => {
			if (focusTimerRef.current) {
				clearTimeout(focusTimerRef.current);
				focusTimerRef.current = null;
			}
		};
	}, [props.scroll.enabled]);
	const updateShownDate = (0, react.useCallback)((nextProps = props) => {
		const list = listRef.current;
		const nextFocusProps = nextProps.scroll.enabled ? {
			...nextProps,
			months: list ? list.getVisibleRange().length : nextProps.months
		} : nextProps;
		focusToDate(require_utils.calcFocusDate(focusedDateRef.current, nextFocusProps), nextFocusProps);
	}, [focusToDate, props]);
	const handleScroll = (0, react.useCallback)(() => {
		const { onShownDateChange, minDate } = props;
		const list = listRef.current;
		if (!list) return;
		if (typeof list.updateFrameAndClearCache === "function") list.updateFrameAndClearCache();
		const visibleMonths = list.getVisibleRange();
		if (visibleMonths[0] === void 0) return;
		const visibleMonth = (0, date_fns.addMonths)(minDate, visibleMonths[0] || 0);
		if (!(0, date_fns.isSameMonth)(visibleMonth, focusedDateRef.current) && !isFirstRenderRef.current) {
			setFocusedDate(visibleMonth);
			onShownDateChange && onShownDateChange(visibleMonth);
		}
		isFirstRenderRef.current = false;
	}, [props]);
	const announceShownDate = (0, react.useCallback)((date) => {
		const formatter = ariaLabels.liveRegionMonthYear;
		setLiveAnnouncement(formatter ? formatter(date) : `Now showing ${(0, date_fns.format)(date, "MMMM yyyy", dateOptions)}`);
	}, [ariaLabels.liveRegionMonthYear, dateOptions]);
	(0, react.useEffect)(() => {
		const targetValue = props[{
			dateRange: "ranges",
			date: "date"
		}[props.displayMode]];
		if (previousTargetPropRef.current === uninitializedTargetProp) {
			previousTargetPropRef.current = targetValue;
			return;
		}
		if (previousTargetPropRef.current !== targetValue) {
			previousTargetPropRef.current = targetValue;
			updateShownDate(props);
		}
	}, [
		props.date,
		props.displayMode,
		props.ranges,
		updateShownDate,
		props
	]);
	const changeShownDate = (0, react.useCallback)((value, mode = "set") => {
		const { onShownDateChange, minDate, maxDate } = props;
		const newDate = (0, date_fns.min)([(0, date_fns.max)([{
			monthOffset: () => (0, date_fns.addMonths)(focusedDateRef.current, value),
			setMonth: () => (0, date_fns.setMonth)(focusedDateRef.current, value),
			setYear: () => (0, date_fns.setYear)(focusedDateRef.current, value),
			set: () => value
		}[mode](), minDate]), maxDate]);
		focusToDate(newDate, props, false);
		onShownDateChange && onShownDateChange(newDate);
		if (mode === "setMonth" || mode === "setYear" || mode === "monthOffset") announceShownDate(newDate);
	}, [
		announceShownDate,
		focusToDate,
		props
	]);
	const handleRangeFocusChange = (0, react.useCallback)((rangesIndex, rangeItemIndex) => {
		props.onRangeFocusChange && props.onRangeFocusChange([rangesIndex, rangeItemIndex]);
	}, [props]);
	const updatePreview = (0, react.useCallback)((val) => {
		if (!val) {
			setPreviewState(null);
			return;
		}
		setPreviewState({
			startDate: val,
			endDate: val,
			color: props.color
		});
	}, [props.color]);
	const onDragSelectionStart = (0, react.useCallback)((date) => {
		const { onChange, dragSelectionEnabled } = props;
		if (dragSelectionEnabled) setDrag({
			status: true,
			range: {
				startDate: date,
				endDate: date
			},
			disablePreview: true
		});
		else onChange && onChange(date);
	}, [props]);
	const onDragSelectionEnd = (0, react.useCallback)((date) => {
		const { updateRange, displayMode, onChange, dragSelectionEnabled } = props;
		if (!dragSelectionEnabled) return;
		if (displayMode === "date" || !drag.status) {
			onChange && onChange(date);
			return;
		}
		const newRange = {
			startDate: drag.range.startDate,
			endDate: date
		};
		if (displayMode !== "dateRange" || (0, date_fns.isSameDay)(newRange.startDate, date)) {
			setDrag({
				status: false,
				range: {}
			});
			onChange && onChange(date);
		} else {
			setDrag({
				status: false,
				range: {}
			});
			updateRange && updateRange(newRange);
		}
	}, [drag, props]);
	const onDragSelectionMove = (0, react.useCallback)((date) => {
		if (!drag.status || !props.dragSelectionEnabled) return;
		setDrag({
			status: drag.status,
			range: {
				startDate: drag.range.startDate,
				endDate: date
			},
			disablePreview: true
		});
	}, [drag, props.dragSelectionEnabled]);
	const handleCalendarKeyDown = (0, react.useCallback)((e) => {
		const activeEl = document.activeElement;
		if (!activeEl || !activeEl.dataset.date) return;
		const currentDate = new Date(activeEl.dataset.date);
		if (isNaN(currentDate.getTime())) return;
		let newDate;
		switch (e.key) {
			case "ArrowLeft":
				newDate = (0, date_fns.addDays)(currentDate, -1);
				break;
			case "ArrowRight":
				newDate = (0, date_fns.addDays)(currentDate, 1);
				break;
			case "ArrowUp":
				newDate = (0, date_fns.addDays)(currentDate, -7);
				break;
			case "ArrowDown":
				newDate = (0, date_fns.addDays)(currentDate, 7);
				break;
			case "PageUp":
				newDate = e.shiftKey ? (0, date_fns.subYears)(currentDate, 1) : (0, date_fns.subMonths)(currentDate, 1);
				break;
			case "PageDown":
				newDate = e.shiftKey ? (0, date_fns.addYears)(currentDate, 1) : (0, date_fns.addMonths)(currentDate, 1);
				break;
			default: return;
		}
		e.preventDefault();
		e.stopPropagation();
		const minDay = props.minDate ? (0, date_fns.startOfDay)(props.minDate) : null;
		const maxDay = props.maxDate ? (0, date_fns.endOfDay)(props.maxDate) : null;
		if (minDay && (0, date_fns.isBefore)((0, date_fns.startOfDay)(newDate), minDay)) newDate = minDay;
		if (maxDay && (0, date_fns.isAfter)((0, date_fns.endOfDay)(newDate), maxDay)) newDate = (0, date_fns.startOfDay)(maxDay);
		const wrapper = calendarWrapperRef.current;
		if (wrapper) {
			const targetButton = wrapper.querySelector(`button[data-date="${newDate.toISOString()}"]`);
			if (targetButton && targetButton.tabIndex !== -1) targetButton.focus();
		}
	}, [props.minDate, props.maxDate]);
	(0, react.useImperativeHandle)(ref, () => ({
		focusToDate,
		changeShownDate,
		updateShownDate,
		handleScroll
	}), [
		changeShownDate,
		focusToDate,
		handleScroll,
		updateShownDate
	]);
	const renderMonthAndYear = (0, react.useCallback)((date, changeDate, calendarProps) => {
		const { showMonthArrow, minDate, maxDate, showMonthAndYearPickers, ariaLabels, headerConfig, uiSlots } = calendarProps;
		const showMonth = headerConfig.month !== false;
		const showYear = headerConfig.year !== false;
		const showNavigation = showMonthArrow && headerConfig.navigation !== false;
		if (!showMonth && !showYear && !showNavigation) return null;
		const upperYearLimit = maxDate.getFullYear();
		const lowerYearLimit = minDate.getFullYear();
		return /* @__PURE__ */ react.default.createElement("div", {
			onMouseUp: (e) => e.stopPropagation(),
			className: (0, classnames.default)(styles.monthAndYearWrapper, require_styles.getUiSlotClassName(uiSlots, "header")),
			style: require_styles.mergeUiSlotStyles(void 0, uiSlots, "header")
		}, showNavigation ? /* @__PURE__ */ react.default.createElement("button", {
			type: "button",
			className: (0, classnames.default)(styles.nextPrevButton, styles.prevButton, require_styles.getUiSlotClassName(uiSlots, "nav"), require_styles.getUiSlotClassName(uiSlots, "navPrev")),
			style: require_styles.mergeUiSlotStyles(require_styles.mergeUiSlotStyles(void 0, uiSlots, "nav"), uiSlots, "navPrev"),
			onClick: () => changeDate(-1, "monthOffset"),
			"aria-label": ariaLabels.prevButton
		}, /* @__PURE__ */ react.default.createElement("i", null)) : null, showMonthAndYearPickers ? /* @__PURE__ */ react.default.createElement("span", {
			className: (0, classnames.default)(styles.monthAndYearPickers, require_styles.getUiSlotClassName(uiSlots, "monthYear")),
			style: require_styles.mergeUiSlotStyles(void 0, uiSlots, "monthYear")
		}, showMonth ? /* @__PURE__ */ react.default.createElement("span", {
			className: (0, classnames.default)(styles.monthPicker, require_styles.getUiSlotClassName(uiSlots, "monthPicker")),
			style: require_styles.mergeUiSlotStyles(void 0, uiSlots, "monthPicker")
		}, /* @__PURE__ */ react.default.createElement("select", {
			value: date.getMonth(),
			onChange: (e) => changeDate(e.target.value, "setMonth"),
			"aria-label": ariaLabels.monthPicker
		}, monthNames.map((monthName, i) => /* @__PURE__ */ react.default.createElement("option", {
			key: i,
			value: i
		}, monthName)))) : null, showMonth && showYear ? /* @__PURE__ */ react.default.createElement("span", { className: styles.monthAndYearDivider }) : null, showYear ? /* @__PURE__ */ react.default.createElement("span", {
			className: (0, classnames.default)(styles.yearPicker, require_styles.getUiSlotClassName(uiSlots, "yearPicker")),
			style: require_styles.mergeUiSlotStyles(void 0, uiSlots, "yearPicker")
		}, /* @__PURE__ */ react.default.createElement("select", {
			value: date.getFullYear(),
			onChange: (e) => changeDate(e.target.value, "setYear"),
			"aria-label": ariaLabels.yearPicker
		}, new Array(upperYearLimit - lowerYearLimit + 1).fill(upperYearLimit).map((val, i) => {
			const year = val - i;
			return /* @__PURE__ */ react.default.createElement("option", {
				key: year,
				value: year
			}, year);
		}))) : null) : /* @__PURE__ */ react.default.createElement("span", {
			className: (0, classnames.default)(styles.monthAndYearPickers, require_styles.getUiSlotClassName(uiSlots, "monthYear")),
			style: require_styles.mergeUiSlotStyles(void 0, uiSlots, "monthYear")
		}, showMonth ? monthNames[date.getMonth()] : null, showMonth && showYear ? " " : null, showYear ? date.getFullYear() : null), showNavigation ? /* @__PURE__ */ react.default.createElement("button", {
			type: "button",
			className: (0, classnames.default)(styles.nextPrevButton, styles.nextButton, require_styles.getUiSlotClassName(uiSlots, "nav"), require_styles.getUiSlotClassName(uiSlots, "navNext")),
			style: require_styles.mergeUiSlotStyles(require_styles.mergeUiSlotStyles(void 0, uiSlots, "nav"), uiSlots, "navNext"),
			onClick: () => changeDate(1, "monthOffset"),
			"aria-label": ariaLabels.nextButton
		}, /* @__PURE__ */ react.default.createElement("i", null)) : null);
	}, [monthNames, styles]);
	const renderDateDisplay = () => {
		const { focusedRange, color, ranges, rangeColors, dateDisplayFormat, editableDateInputs, startDatePlaceholder, endDatePlaceholder, ariaLabels, minDate, maxDate, disabledDates } = props;
		return /* @__PURE__ */ react.default.createElement(require_components_DateDisplay_index, {
			focusedRange,
			color,
			ranges,
			rangeColors,
			dateDisplayFormat,
			editableDateInputs,
			startDatePlaceholder,
			endDatePlaceholder,
			ariaLabels,
			minDate,
			maxDate,
			disabledDates,
			uiSlots: props.uiSlots,
			selectedDisplay: props.selectedDisplay,
			styles,
			dateOptions,
			onChange: onDragSelectionEnd,
			onRangeFocusChange: handleRangeFocusChange
		});
	};
	const { showDateDisplay, onPreviewChange, scroll, direction, dir, disabledDates, disabledDay, minDate, rangeColors, color, navigatorRenderer, className, style, preview, _calendarScrollArea: scrollArea } = props;
	const isVertical = direction === "vertical";
	const monthAndYearRenderer = navigatorRenderer || renderMonthAndYear;
	const dateDisplay = showDateDisplay ? renderDateDisplay() : null;
	const isDateDisplayBottom = props.selectedDisplay?.placement === "bottom";
	const ranges = props.ranges.map((range, i) => ({
		...range,
		color: range.color || rangeColors[i] || color
	}));
	const virtualMonths = scroll.enabled ? monthVirtualizer.getVirtualItems() : [];
	const virtualSizeStyle = isVertical ? {
		height: monthVirtualizer.getTotalSize(),
		width: scrollArea.calendarWidth,
		position: "relative"
	} : {
		width: monthVirtualizer.getTotalSize(),
		height: "100%",
		position: "relative"
	};
	return /* @__PURE__ */ react.default.createElement("div", {
		ref: calendarWrapperRef,
		dir,
		className: (0, classnames.default)(styles.calendarWrapper, dir === "rtl" && (props.classNames?.rtl ?? styles.rtl), require_styles.getUiSlotClassName(props.uiSlots, "root"), className),
		style: require_styles.mergeUiSlotStyles(style, props.uiSlots, "root"),
		onKeyDown: handleCalendarKeyDown,
		onMouseUp: () => setDrag({
			status: false,
			range: {}
		}),
		onMouseLeave: () => {
			setDrag({
				status: false,
				range: {}
			});
		}
	}, !isDateDisplayBottom && dateDisplay, monthAndYearRenderer(focusedDate, changeShownDate, props), /* @__PURE__ */ react.default.createElement("div", {
		"aria-live": "polite",
		"aria-atomic": "true",
		className: styles.liveRegion
	}, liveAnnouncement), scroll.enabled ? /* @__PURE__ */ react.default.createElement("div", null, isVertical && /* @__PURE__ */ react.default.createElement("div", { className: styles.weekDays }, (0, date_fns.eachDayOfInterval)({
		start: (0, date_fns.startOfWeek)(/* @__PURE__ */ new Date(), dateOptions),
		end: (0, date_fns.endOfWeek)(/* @__PURE__ */ new Date(), dateOptions)
	}).map((day, i) => /* @__PURE__ */ react.default.createElement("span", {
		className: styles.weekDay,
		key: i
	}, (0, date_fns.format)(day, props.weekdayDisplayFormat, dateOptions)))), /* @__PURE__ */ react.default.createElement("div", {
		className: (0, classnames.default)(styles.infiniteMonths, isVertical ? styles.monthsVertical : styles.monthsHorizontal, require_styles.getUiSlotClassName(props.uiSlots, "months")),
		onMouseLeave: () => onPreviewChange && onPreviewChange(),
		style: require_styles.mergeUiSlotStyles({
			width: scrollArea.calendarWidth + 11,
			height: scrollArea.calendarHeight + 11,
			overflowX: isVertical ? "hidden" : void 0,
			overflowY: isVertical ? "auto" : void 0
		}, props.uiSlots, "months"),
		ref: scrollContainerRef,
		onScroll: handleScroll
	}, /* @__PURE__ */ react.default.createElement("div", { style: virtualSizeStyle }, virtualMonths.map((virtualMonth) => {
		const monthStep = (0, date_fns.addMonths)(minDate, virtualMonth.index);
		const itemStyle = {
			position: "absolute",
			top: 0,
			left: 0,
			transform: isVertical ? `translateY(${virtualMonth.start}px)` : `translateX(${virtualMonth.start}px)`
		};
		return /* @__PURE__ */ react.default.createElement("div", {
			key: virtualMonth.key ?? virtualMonth.index,
			style: isVertical ? {
				...itemStyle,
				height: virtualMonth.size,
				width: scrollArea.calendarWidth
			} : {
				...itemStyle,
				width: virtualMonth.size,
				height: "100%"
			}
		}, /* @__PURE__ */ react.default.createElement(require_components_Month_index, {
			...props,
			onPreviewChange: onPreviewChange || updatePreview,
			preview: preview || previewState,
			ranges,
			drag,
			dateOptions,
			disabledDates,
			disabledDay,
			month: monthStep,
			onDragSelectionStart,
			onDragSelectionEnd,
			onDragSelectionMove,
			onMouseLeave: () => onPreviewChange && onPreviewChange(),
			styles,
			style: isVertical ? { height: estimateMonthSize(virtualMonth.index) } : {
				height: scrollArea.monthHeight,
				width: estimateMonthSize(virtualMonth.index)
			},
			showMonthName: true,
			showWeekDays: !isVertical
		}));
	})))) : /* @__PURE__ */ react.default.createElement("div", {
		role: "grid",
		"aria-label": ariaLabels.calendar || "Calendar",
		"aria-roledescription": ariaLabels.calendarRoleDescription || "month grid",
		className: (0, classnames.default)(styles.months, isVertical ? styles.monthsVertical : styles.monthsHorizontal, require_styles.getUiSlotClassName(props.uiSlots, "months")),
		style: require_styles.mergeUiSlotStyles(void 0, props.uiSlots, "months")
	}, new Array(props.months).fill(null).map((_, i) => {
		let monthStep = (0, date_fns.addMonths)(focusedDate, i);
		if (props.calendarFocus === "backwards") monthStep = (0, date_fns.subMonths)(focusedDate, props.months - 1 - i);
		return /* @__PURE__ */ react.default.createElement(require_components_Month_index, {
			...props,
			onPreviewChange: onPreviewChange || updatePreview,
			preview: preview || previewState,
			ranges,
			key: i,
			drag,
			dateOptions,
			disabledDates,
			disabledDay,
			month: monthStep,
			onDragSelectionStart,
			onDragSelectionEnd,
			onDragSelectionMove,
			onMouseLeave: () => onPreviewChange && onPreviewChange(),
			styles,
			showWeekDays: !isVertical || i === 0,
			showMonthName: !isVertical || i > 0
		});
	})), isDateDisplayBottom && dateDisplay);
});
const Calendar = react.default.forwardRef(function Calendar({ showMonthArrow = calendarDefaultProps.showMonthArrow, showMonthAndYearPickers = calendarDefaultProps.showMonthAndYearPickers, disabledDates = calendarDefaultProps.disabledDates, disabledDay = calendarDefaultProps.disabledDay, classNames = calendarDefaultProps.classNames, locale = calendarDefaultProps.locale, ranges = calendarDefaultProps.ranges, focusedRange = calendarDefaultProps.focusedRange, dateDisplayFormat = calendarDefaultProps.dateDisplayFormat, monthDisplayFormat = calendarDefaultProps.monthDisplayFormat, weekdayDisplayFormat = calendarDefaultProps.weekdayDisplayFormat, dayDisplayFormat = calendarDefaultProps.dayDisplayFormat, showDateDisplay = calendarDefaultProps.showDateDisplay, showPreview = calendarDefaultProps.showPreview, displayMode = calendarDefaultProps.displayMode, months = calendarDefaultProps.months, color = calendarDefaultProps.color, scroll = calendarDefaultProps.scroll, direction = calendarDefaultProps.direction, maxDate = calendarDefaultProps.maxDate, minDate = calendarDefaultProps.minDate, rangeColors = calendarDefaultProps.rangeColors, startDatePlaceholder = calendarDefaultProps.startDatePlaceholder, endDatePlaceholder = calendarDefaultProps.endDatePlaceholder, editableDateInputs = calendarDefaultProps.editableDateInputs, dragSelectionEnabled = calendarDefaultProps.dragSelectionEnabled, fixedHeight = calendarDefaultProps.fixedHeight, calendarFocus = calendarDefaultProps.calendarFocus, preventSnapRefocus = calendarDefaultProps.preventSnapRefocus, ariaLabels = calendarDefaultProps.ariaLabels, selectablePassive = calendarDefaultProps.selectablePassive, headerConfig = calendarDefaultProps.headerConfig, todayAffordance = calendarDefaultProps.todayAffordance, selectedDisplay, uiSlots, ...rest }, ref) {
	const resolvedProps = {
		showMonthArrow,
		showMonthAndYearPickers,
		disabledDates: Array.isArray(disabledDates) ? disabledDates : EMPTY_DATES,
		disabledDay,
		classNames,
		locale,
		ranges,
		focusedRange,
		dateDisplayFormat,
		monthDisplayFormat,
		weekdayDisplayFormat,
		dayDisplayFormat,
		showDateDisplay,
		showPreview,
		displayMode,
		months,
		color,
		scroll,
		selectablePassive: !!selectablePassive && !scroll.enabled,
		direction,
		maxDate,
		minDate,
		rangeColors,
		startDatePlaceholder,
		endDatePlaceholder,
		editableDateInputs,
		dragSelectionEnabled,
		fixedHeight,
		calendarFocus,
		preventSnapRefocus,
		ariaLabels,
		headerConfig: {
			month: true,
			year: true,
			navigation: true,
			...headerConfig
		},
		todayAffordance,
		selectedDisplay: resolveSelectedDisplay(selectedDisplay, dateDisplayFormat),
		uiSlots,
		...rest
	};
	const dateOptions = (0, react.useMemo)(() => getDateOptions({
		locale: resolvedProps.locale,
		weekStartsOn: resolvedProps.weekStartsOn
	}), [resolvedProps.locale, resolvedProps.weekStartsOn]);
	const styles = (0, react.useMemo)(() => require_utils.generateStyles([require_styles.default, resolvedProps.classNames]), [resolvedProps.classNames]);
	const monthNames = (0, react.useMemo)(() => getMonthNames(resolvedProps.locale), [resolvedProps.locale]);
	const scrollArea = (0, react.useMemo)(() => calcScrollArea({
		direction: resolvedProps.direction,
		months: resolvedProps.months,
		scroll: resolvedProps.scroll
	}), [
		resolvedProps.direction,
		resolvedProps.months,
		resolvedProps.scroll
	]);
	return /* @__PURE__ */ react.default.createElement(CalendarContent, {
		...resolvedProps,
		_calendarDateOptions: dateOptions,
		_calendarStyles: styles,
		_calendarMonthNames: monthNames,
		_calendarScrollArea: scrollArea,
		ref
	});
});
//#endregion
module.exports = Calendar;
