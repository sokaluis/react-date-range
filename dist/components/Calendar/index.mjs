import styles_default, { getUiSlotClassName, mergeUiSlotStyles } from "../../styles.mjs";
import { calcFocusDate, generateStyles, getMonthDisplayRange } from "../../utils.mjs";
import Month from "../Month/index.mjs";
import DateDisplay from "../DateDisplay/index.mjs";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout.mjs";
import { addDays, addMonths, addYears, differenceInCalendarMonths, differenceInDays, eachDayOfInterval, endOfDay, endOfMonth, endOfWeek, format, isAfter, isBefore, isSameDay, isSameMonth, max, min, setMonth, setYear, startOfDay, startOfMonth, startOfWeek, subMonths, subYears } from "date-fns";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import classnames from "classnames";
import { useVirtualizer } from "@tanstack/react-virtual";
import { enUS } from "date-fns/locale/en-US";
//#region src/components/Calendar/index.jsx
const EMPTY_DATES = Object.freeze([]);
const calendarDefaultProps = {
	showMonthArrow: true,
	showMonthAndYearPickers: true,
	disabledDates: [],
	disabledDay: () => {},
	classNames: {},
	locale: enUS,
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
	maxDate: addYears(/* @__PURE__ */ new Date(), 20),
	minDate: addYears(/* @__PURE__ */ new Date(), -100),
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
const FLUID_MONTH_MIN_WIDTH_PX = 400;
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
const resolveCalendarLayoutProps = ({ resolvedLayout, months, direction, scroll }) => {
	if (scroll.enabled || resolvedLayout !== "mobile") return {
		months,
		direction,
		isResponsiveLayout: false
	};
	const effectiveMonths = months ?? calendarDefaultProps.months;
	return {
		months: effectiveMonths,
		direction: effectiveMonths > 1 ? "vertical" : direction ?? calendarDefaultProps.direction,
		isResponsiveLayout: true
	};
};
const getFluidMonthMinWidth = (element) => {
	if (typeof window === "undefined" || typeof window.getComputedStyle !== "function") return FLUID_MONTH_MIN_WIDTH_PX;
	const value = window.getComputedStyle(element).getPropertyValue("--rdr-calendar-month-min-width");
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : FLUID_MONTH_MIN_WIDTH_PX;
};
const CalendarContent = React.forwardRef(function CalendarContent(props, ref) {
	const dateOptions = props._calendarDateOptions;
	const styles = props._calendarStyles;
	const monthNames = props._calendarMonthNames;
	const ariaLabels = props.ariaLabels || {};
	const [focusedDate, setFocusedDate] = useState(() => calcFocusDate(null, props));
	const [drag, setDrag] = useState({
		status: false,
		range: {
			startDate: null,
			endDate: null
		},
		disablePreview: false
	});
	const [previewState, setPreviewState] = useState(null);
	const [liveAnnouncement, setLiveAnnouncement] = useState("");
	const focusedDateRef = useRef(focusedDate);
	const scrollContainerRef = useRef(null);
	const listRef = useRef(null);
	const isFirstRenderRef = useRef(true);
	const calendarWrapperRef = useRef(null);
	const focusTimerRef = useRef(null);
	const focusToDateRef = useRef(null);
	const previousTargetPropRef = useRef(uninitializedTargetProp);
	const [shouldStackFluidMonths, setShouldStackFluidMonths] = useState(false);
	useEffect(() => {
		focusedDateRef.current = focusedDate;
	}, [focusedDate]);
	useEffect(() => {
		if (!props._calendarCanAutoStackFluidMonths) {
			setShouldStackFluidMonths(false);
			return;
		}
		const element = calendarWrapperRef.current;
		if (!element || typeof window === "undefined" || typeof window.ResizeObserver === "undefined") {
			setShouldStackFluidMonths(false);
			return;
		}
		const updateStacking = () => {
			const { width } = element.getBoundingClientRect();
			const minWidth = getFluidMonthMinWidth(element) * props.months;
			setShouldStackFluidMonths(width > 0 && width < minWidth);
		};
		updateStacking();
		const resizeObserver = new window.ResizeObserver(updateStacking);
		resizeObserver.observe(element);
		return () => {
			resizeObserver.disconnect();
		};
	}, [props._calendarCanAutoStackFluidMonths, props.months]);
	const estimateMonthSize = useCallback((index) => {
		const { direction, minDate, _calendarScrollArea: scrollArea } = props;
		if (direction === "horizontal") return scrollArea.monthWidth;
		const { start, end } = getMonthDisplayRange(addMonths(minDate, index), dateOptions, props.fixedHeight);
		return differenceInDays(end, start, dateOptions) + 1 > 35 ? scrollArea.longMonthHeight : scrollArea.monthHeight;
	}, [dateOptions, props]);
	const monthVirtualizer = useVirtualizer({
		count: useMemo(() => props.scroll.enabled ? differenceInCalendarMonths(endOfMonth(props.maxDate), addDays(startOfMonth(props.minDate), -1), dateOptions) : 0, [
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
	useEffect(() => {
		listRef.current = {
			getVisibleRange: () => monthVirtualizer.getVirtualItems().map((item) => item.index),
			scrollTo: (index) => monthVirtualizer.scrollToIndex(index),
			updateFrameAndClearCache: () => {
				if (typeof monthVirtualizer.measure === "function") monthVirtualizer.measure();
			}
		};
	}, [monthVirtualizer]);
	const focusToDate = useCallback((date, nextProps = props, preventUnnecessary = true) => {
		if (!nextProps.scroll.enabled) {
			if (preventUnnecessary && nextProps.preventSnapRefocus) {
				const focusedDateDiff = differenceInCalendarMonths(date, focusedDateRef.current);
				const isAllowedForward = nextProps.calendarFocus === "forwards" && focusedDateDiff >= 0;
				const isAllowedBackward = nextProps.calendarFocus === "backwards" && focusedDateDiff <= 0;
				if ((isAllowedForward || isAllowedBackward) && Math.abs(focusedDateDiff) < nextProps.months) return;
			}
			setFocusedDate(date);
			return;
		}
		const list = listRef.current;
		if (!list) return;
		const targetMonthIndex = differenceInCalendarMonths(date, nextProps.minDate, dateOptions);
		const visibleMonths = list.getVisibleRange();
		if (preventUnnecessary && visibleMonths.includes(targetMonthIndex)) return;
		isFirstRenderRef.current = true;
		list.scrollTo(targetMonthIndex);
		if (typeof list.updateFrameAndClearCache === "function") list.updateFrameAndClearCache();
		setFocusedDate(date);
	}, [dateOptions, props]);
	useEffect(() => {
		focusToDateRef.current = focusToDate;
	}, [focusToDate]);
	useEffect(() => {
		if (!props.scroll.enabled) return void 0;
		focusTimerRef.current = setTimeout(() => focusToDateRef.current(focusedDateRef.current));
		return () => {
			if (focusTimerRef.current) {
				clearTimeout(focusTimerRef.current);
				focusTimerRef.current = null;
			}
		};
	}, [props.scroll.enabled]);
	const updateShownDate = useCallback((nextProps = props) => {
		const list = listRef.current;
		const nextFocusProps = nextProps.scroll.enabled ? {
			...nextProps,
			months: list ? list.getVisibleRange().length : nextProps.months
		} : nextProps;
		focusToDate(calcFocusDate(focusedDateRef.current, nextFocusProps), nextFocusProps);
	}, [focusToDate, props]);
	const handleScroll = useCallback(() => {
		const { onShownDateChange, minDate } = props;
		const list = listRef.current;
		if (!list) return;
		if (typeof list.updateFrameAndClearCache === "function") list.updateFrameAndClearCache();
		const visibleMonths = list.getVisibleRange();
		if (visibleMonths[0] === void 0) return;
		const visibleMonth = addMonths(minDate, visibleMonths[0] || 0);
		if (!isSameMonth(visibleMonth, focusedDateRef.current) && !isFirstRenderRef.current) {
			setFocusedDate(visibleMonth);
			onShownDateChange && onShownDateChange(visibleMonth);
		}
		isFirstRenderRef.current = false;
	}, [props]);
	const announceShownDate = useCallback((date) => {
		const formatter = ariaLabels.liveRegionMonthYear;
		setLiveAnnouncement(formatter ? formatter(date) : `Now showing ${format(date, "MMMM yyyy", dateOptions)}`);
	}, [ariaLabels.liveRegionMonthYear, dateOptions]);
	useEffect(() => {
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
	const changeShownDate = useCallback((value, mode = "set") => {
		const { onShownDateChange, minDate, maxDate } = props;
		const newDate = min([max([{
			monthOffset: () => addMonths(focusedDateRef.current, value),
			setMonth: () => setMonth(focusedDateRef.current, value),
			setYear: () => setYear(focusedDateRef.current, value),
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
	const handleRangeFocusChange = useCallback((rangesIndex, rangeItemIndex) => {
		props.onRangeFocusChange && props.onRangeFocusChange([rangesIndex, rangeItemIndex]);
	}, [props]);
	const updatePreview = useCallback((val) => {
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
	const onDragSelectionStart = useCallback((date) => {
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
	const onDragSelectionEnd = useCallback((date) => {
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
		if (displayMode !== "dateRange" || isSameDay(newRange.startDate, date)) {
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
	const onDragSelectionMove = useCallback((date) => {
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
	const handleCalendarKeyDown = useCallback((e) => {
		const activeEl = document.activeElement;
		if (!activeEl || !activeEl.dataset.date) return;
		const currentDate = new Date(activeEl.dataset.date);
		if (isNaN(currentDate.getTime())) return;
		let newDate;
		switch (e.key) {
			case "ArrowLeft":
				newDate = addDays(currentDate, -1);
				break;
			case "ArrowRight":
				newDate = addDays(currentDate, 1);
				break;
			case "ArrowUp":
				newDate = addDays(currentDate, -7);
				break;
			case "ArrowDown":
				newDate = addDays(currentDate, 7);
				break;
			case "PageUp":
				newDate = e.shiftKey ? subYears(currentDate, 1) : subMonths(currentDate, 1);
				break;
			case "PageDown":
				newDate = e.shiftKey ? addYears(currentDate, 1) : addMonths(currentDate, 1);
				break;
			default: return;
		}
		e.preventDefault();
		e.stopPropagation();
		const minDay = props.minDate ? startOfDay(props.minDate) : null;
		const maxDay = props.maxDate ? endOfDay(props.maxDate) : null;
		if (minDay && isBefore(startOfDay(newDate), minDay)) newDate = minDay;
		if (maxDay && isAfter(endOfDay(newDate), maxDay)) newDate = startOfDay(maxDay);
		const wrapper = calendarWrapperRef.current;
		if (wrapper) {
			const targetButton = wrapper.querySelector(`button[data-date="${newDate.toISOString()}"]`);
			if (targetButton && targetButton.tabIndex !== -1) targetButton.focus();
		}
	}, [props.minDate, props.maxDate]);
	useImperativeHandle(ref, () => ({
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
	const renderMonthAndYear = useCallback((date, changeDate, calendarProps) => {
		const { showMonthArrow, minDate, maxDate, showMonthAndYearPickers, ariaLabels, headerConfig, uiSlots } = calendarProps;
		const showMonth = headerConfig.month !== false;
		const showYear = headerConfig.year !== false;
		const showNavigation = showMonthArrow && headerConfig.navigation !== false;
		if (!showMonth && !showYear && !showNavigation) return null;
		const upperYearLimit = maxDate.getFullYear();
		const lowerYearLimit = minDate.getFullYear();
		return /* @__PURE__ */ React.createElement("div", {
			onMouseUp: (e) => e.stopPropagation(),
			className: classnames(styles.monthAndYearWrapper, getUiSlotClassName(uiSlots, "header")),
			style: mergeUiSlotStyles(void 0, uiSlots, "header")
		}, showNavigation ? /* @__PURE__ */ React.createElement("button", {
			type: "button",
			className: classnames(styles.nextPrevButton, styles.prevButton, getUiSlotClassName(uiSlots, "nav"), getUiSlotClassName(uiSlots, "navPrev")),
			style: mergeUiSlotStyles(mergeUiSlotStyles(void 0, uiSlots, "nav"), uiSlots, "navPrev"),
			onClick: () => changeDate(-1, "monthOffset"),
			"aria-label": ariaLabels.prevButton
		}, /* @__PURE__ */ React.createElement("i", null)) : null, showMonthAndYearPickers ? /* @__PURE__ */ React.createElement("span", {
			className: classnames(styles.monthAndYearPickers, getUiSlotClassName(uiSlots, "monthYear")),
			style: mergeUiSlotStyles(void 0, uiSlots, "monthYear")
		}, showMonth ? /* @__PURE__ */ React.createElement("span", {
			className: classnames(styles.monthPicker, getUiSlotClassName(uiSlots, "monthPicker")),
			style: mergeUiSlotStyles(void 0, uiSlots, "monthPicker")
		}, /* @__PURE__ */ React.createElement("select", {
			value: date.getMonth(),
			onChange: (e) => changeDate(e.target.value, "setMonth"),
			"aria-label": ariaLabels.monthPicker
		}, monthNames.map((monthName, i) => /* @__PURE__ */ React.createElement("option", {
			key: i,
			value: i
		}, monthName)))) : null, showMonth && showYear ? /* @__PURE__ */ React.createElement("span", { className: styles.monthAndYearDivider }) : null, showYear ? /* @__PURE__ */ React.createElement("span", {
			className: classnames(styles.yearPicker, getUiSlotClassName(uiSlots, "yearPicker")),
			style: mergeUiSlotStyles(void 0, uiSlots, "yearPicker")
		}, /* @__PURE__ */ React.createElement("select", {
			value: date.getFullYear(),
			onChange: (e) => changeDate(e.target.value, "setYear"),
			"aria-label": ariaLabels.yearPicker
		}, new Array(upperYearLimit - lowerYearLimit + 1).fill(upperYearLimit).map((val, i) => {
			const year = val - i;
			return /* @__PURE__ */ React.createElement("option", {
				key: year,
				value: year
			}, year);
		}))) : null) : /* @__PURE__ */ React.createElement("span", {
			className: classnames(styles.monthAndYearPickers, getUiSlotClassName(uiSlots, "monthYear")),
			style: mergeUiSlotStyles(void 0, uiSlots, "monthYear")
		}, showMonth ? monthNames[date.getMonth()] : null, showMonth && showYear ? " " : null, showYear ? date.getFullYear() : null), showNavigation ? /* @__PURE__ */ React.createElement("button", {
			type: "button",
			className: classnames(styles.nextPrevButton, styles.nextButton, getUiSlotClassName(uiSlots, "nav"), getUiSlotClassName(uiSlots, "navNext")),
			style: mergeUiSlotStyles(mergeUiSlotStyles(void 0, uiSlots, "nav"), uiSlots, "navNext"),
			onClick: () => changeDate(1, "monthOffset"),
			"aria-label": ariaLabels.nextButton
		}, /* @__PURE__ */ React.createElement("i", null)) : null);
	}, [monthNames, styles]);
	const renderDateDisplay = () => {
		const { focusedRange, color, ranges, rangeColors, dateDisplayFormat, editableDateInputs, startDatePlaceholder, endDatePlaceholder, ariaLabels, minDate, maxDate, disabledDates } = props;
		return /* @__PURE__ */ React.createElement(DateDisplay, {
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
	const effectiveDirection = shouldStackFluidMonths ? "vertical" : direction;
	const isVertical = effectiveDirection === "vertical";
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
	return /* @__PURE__ */ React.createElement("div", {
		ref: calendarWrapperRef,
		dir,
		className: classnames(styles.calendarWrapper, props._calendarIsResponsiveLayout && styles.calendarWrapperResponsive, props._calendarIsFluidWidthMode && styles.calendarWrapperFluid, dir === "rtl" && (props.classNames?.rtl ?? styles.rtl), getUiSlotClassName(props.uiSlots, "root"), className),
		style: mergeUiSlotStyles(style, props.uiSlots, "root"),
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
	}, !isDateDisplayBottom && dateDisplay, monthAndYearRenderer(focusedDate, changeShownDate, props), /* @__PURE__ */ React.createElement("div", {
		"aria-live": "polite",
		"aria-atomic": "true",
		className: styles.liveRegion
	}, liveAnnouncement), scroll.enabled ? /* @__PURE__ */ React.createElement("div", null, isVertical && /* @__PURE__ */ React.createElement("div", { className: styles.weekDays }, eachDayOfInterval({
		start: startOfWeek(/* @__PURE__ */ new Date(), dateOptions),
		end: endOfWeek(/* @__PURE__ */ new Date(), dateOptions)
	}).map((day, i) => /* @__PURE__ */ React.createElement("span", {
		className: styles.weekDay,
		key: i
	}, format(day, props.weekdayDisplayFormat, dateOptions)))), /* @__PURE__ */ React.createElement("div", {
		className: classnames(styles.infiniteMonths, isVertical ? styles.monthsVertical : styles.monthsHorizontal, getUiSlotClassName(props.uiSlots, "months")),
		onMouseLeave: () => onPreviewChange && onPreviewChange(),
		style: mergeUiSlotStyles({
			width: scrollArea.calendarWidth + 11,
			height: scrollArea.calendarHeight + 11,
			overflowX: isVertical ? "hidden" : void 0,
			overflowY: isVertical ? "auto" : void 0
		}, props.uiSlots, "months"),
		ref: scrollContainerRef,
		onScroll: handleScroll
	}, /* @__PURE__ */ React.createElement("div", { style: virtualSizeStyle }, virtualMonths.map((virtualMonth) => {
		const monthStep = addMonths(minDate, virtualMonth.index);
		const itemStyle = {
			position: "absolute",
			top: 0,
			left: 0,
			transform: isVertical ? `translateY(${virtualMonth.start}px)` : `translateX(${virtualMonth.start}px)`
		};
		return /* @__PURE__ */ React.createElement("div", {
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
		}, /* @__PURE__ */ React.createElement(Month, {
			...props,
			direction: effectiveDirection,
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
	})))) : /* @__PURE__ */ React.createElement("div", {
		role: "grid",
		"aria-label": ariaLabels.calendar || "Calendar",
		"aria-roledescription": ariaLabels.calendarRoleDescription || "month grid",
		className: classnames(styles.months, isVertical ? styles.monthsVertical : styles.monthsHorizontal, getUiSlotClassName(props.uiSlots, "months")),
		style: mergeUiSlotStyles(void 0, props.uiSlots, "months")
	}, new Array(props.months).fill(null).map((_, i) => {
		let monthStep = addMonths(focusedDate, i);
		if (props.calendarFocus === "backwards") monthStep = subMonths(focusedDate, props.months - 1 - i);
		return /* @__PURE__ */ React.createElement(Month, {
			...props,
			direction: effectiveDirection,
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
const Calendar = React.forwardRef(function Calendar({ showMonthArrow = calendarDefaultProps.showMonthArrow, showMonthAndYearPickers = calendarDefaultProps.showMonthAndYearPickers, disabledDates = calendarDefaultProps.disabledDates, disabledDay = calendarDefaultProps.disabledDay, classNames = calendarDefaultProps.classNames, locale = calendarDefaultProps.locale, ranges = calendarDefaultProps.ranges, focusedRange = calendarDefaultProps.focusedRange, dateDisplayFormat = calendarDefaultProps.dateDisplayFormat, monthDisplayFormat = calendarDefaultProps.monthDisplayFormat, weekdayDisplayFormat = calendarDefaultProps.weekdayDisplayFormat, dayDisplayFormat = calendarDefaultProps.dayDisplayFormat, showDateDisplay = calendarDefaultProps.showDateDisplay, showPreview = calendarDefaultProps.showPreview, displayMode = calendarDefaultProps.displayMode, months = calendarDefaultProps.months, color = calendarDefaultProps.color, scroll = calendarDefaultProps.scroll, direction = calendarDefaultProps.direction, maxDate = calendarDefaultProps.maxDate, minDate = calendarDefaultProps.minDate, rangeColors = calendarDefaultProps.rangeColors, startDatePlaceholder = calendarDefaultProps.startDatePlaceholder, endDatePlaceholder = calendarDefaultProps.endDatePlaceholder, editableDateInputs = calendarDefaultProps.editableDateInputs, dragSelectionEnabled = calendarDefaultProps.dragSelectionEnabled, fixedHeight = calendarDefaultProps.fixedHeight, calendarFocus = calendarDefaultProps.calendarFocus, preventSnapRefocus = calendarDefaultProps.preventSnapRefocus, ariaLabels = calendarDefaultProps.ariaLabels, selectablePassive = calendarDefaultProps.selectablePassive, headerConfig = calendarDefaultProps.headerConfig, todayAffordance = calendarDefaultProps.todayAffordance, selectedDisplay, layout, mobileBreakpoint, widthMode, _resolvedLayout, _calendarIsFluidWidthMode, _calendarCanAutoStackFluidMonths, uiSlots, ...rest }, ref) {
	const safeDisabledDates = Array.isArray(disabledDates) ? disabledDates : EMPTY_DATES;
	/** Holds the resolved value: true only when prop=true AND scroll is disabled. */
	const effectiveSelectablePassive = !!selectablePassive && !scroll.enabled;
	const resolvedHeaderConfig = {
		month: true,
		year: true,
		navigation: true,
		...headerConfig
	};
	const effectiveIsFluidWidthMode = widthMode === "fluid" || _calendarIsFluidWidthMode;
	const canAutoStackFluidMonths = effectiveIsFluidWidthMode && !scroll.enabled && months > 1 && direction === "horizontal" && (layout === "auto" || _calendarCanAutoStackFluidMonths);
	const resolvedSelectedDisplay = resolveSelectedDisplay(selectedDisplay, dateDisplayFormat);
	const calendarLayoutProps = resolveCalendarLayoutProps({
		resolvedLayout: useResponsiveLayout(_resolvedLayout ?? layout, mobileBreakpoint),
		months,
		direction,
		scroll
	});
	const resolvedProps = {
		showMonthArrow,
		showMonthAndYearPickers,
		disabledDates: safeDisabledDates,
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
		months: calendarLayoutProps.months,
		color,
		scroll,
		selectablePassive: effectiveSelectablePassive,
		direction: calendarLayoutProps.direction,
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
		headerConfig: resolvedHeaderConfig,
		todayAffordance,
		selectedDisplay: resolvedSelectedDisplay,
		mobileBreakpoint,
		uiSlots,
		_calendarIsResponsiveLayout: calendarLayoutProps.isResponsiveLayout,
		_calendarIsFluidWidthMode: effectiveIsFluidWidthMode,
		_calendarCanAutoStackFluidMonths: canAutoStackFluidMonths,
		...rest
	};
	const dateOptions = useMemo(() => getDateOptions({
		locale: resolvedProps.locale,
		weekStartsOn: resolvedProps.weekStartsOn
	}), [resolvedProps.locale, resolvedProps.weekStartsOn]);
	const styles = useMemo(() => generateStyles([styles_default, resolvedProps.classNames]), [resolvedProps.classNames]);
	const monthNames = useMemo(() => getMonthNames(resolvedProps.locale), [resolvedProps.locale]);
	const scrollArea = useMemo(() => calcScrollArea({
		direction: resolvedProps.direction,
		months: resolvedProps.months,
		scroll: resolvedProps.scroll
	}), [
		resolvedProps.direction,
		resolvedProps.months,
		resolvedProps.scroll
	]);
	return /* @__PURE__ */ React.createElement(CalendarContent, {
		...resolvedProps,
		_calendarDateOptions: dateOptions,
		_calendarStyles: styles,
		_calendarMonthNames: monthNames,
		_calendarScrollArea: scrollArea,
		ref
	});
});
//#endregion
export { Calendar as default };
