import styles_default, { getUiSlotClassName, mergeUiSlotStyles, omitUiSlotKeys } from "../../styles.mjs";
import { findNextRangeIndex, generateStyles } from "../../utils.mjs";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout.mjs";
import DateRange from "../DateRange/index.mjs";
import DefinedRange from "../DefinedRange/index.mjs";
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import classnames from "classnames";
//#region src/components/DateRangePicker/index.jsx
const resolvePickerLayout = ({ resolvedLayout, calendarCount, scrollOrientation, months, direction, scroll }) => {
	if (scroll?.enabled) return {
		calendarProps: {},
		isMobile: false,
		calendarLayout: "reference"
	};
	const calendarMonths = calendarCount === void 0 ? months ?? 1 : calendarCount === 2 ? 2 : 1;
	const calendarDirection = scrollOrientation === void 0 ? direction ?? "vertical" : scrollOrientation === "horizontal" ? "horizontal" : "vertical";
	const isMobile = resolvedLayout === "mobile";
	return {
		calendarProps: {
			months: calendarMonths,
			direction: isMobile && calendarMonths > 1 ? "vertical" : calendarDirection
		},
		isMobile,
		calendarLayout: isMobile ? "mobile" : resolvedLayout === "desktop" ? "desktop" : "reference"
	};
};
const DateRangePicker = forwardRef(function DateRangePicker(props, ref) {
	const { calendarCount, scrollOrientation, widthMode, ...inheritedProps } = props;
	const resolvedLayout = useResponsiveLayout(props.layout, props.mobileBreakpoint);
	const dateRangeRef = useRef(null);
	const [focusedRangeState, setFocusedRangeState] = useState(() => [findNextRangeIndex(props.ranges), 0]);
	const focusedRange = props.focusedRange || focusedRangeState;
	const styles = useMemo(() => generateStyles([styles_default, props.classNames]), [props.classNames]);
	const dateRangeUiSlots = useMemo(() => omitUiSlotKeys(props.uiSlots, ["root", "definedRanges"]), [props.uiSlots]);
	const regionProps = props.ariaLabels?.dateRangePicker === false ? {} : {
		role: "region",
		"aria-label": props.ariaLabels?.dateRangePicker || "Date range picker"
	};
	const { calendarProps, isMobile, calendarLayout } = useMemo(() => resolvePickerLayout({
		resolvedLayout,
		calendarCount,
		scrollOrientation,
		months: props.months,
		direction: props.direction,
		scroll: props.scroll
	}), [
		calendarCount,
		props.direction,
		props.months,
		props.scroll,
		resolvedLayout,
		scrollOrientation
	]);
	useImperativeHandle(ref, () => ({}), []);
	const handlePreviewChange = useCallback((value) => {
		if (!dateRangeRef.current) return;
		dateRangeRef.current.updatePreview(value ? dateRangeRef.current.calcNewSelection(value, typeof value === "string") : null);
		props.onPreviewChange && props.onPreviewChange(value);
	}, [props]);
	const handleRangeFocusChange = useCallback((focusedRange) => {
		setFocusedRangeState(focusedRange);
		props.onRangeFocusChange && props.onRangeFocusChange(focusedRange);
	}, [props]);
	return /* @__PURE__ */ React.createElement("div", {
		dir: props.dir,
		className: classnames(styles.dateRangePickerWrapper, widthMode === "fluid" && styles.dateRangePickerWrapperFluid, isMobile && styles.dateRangePickerWrapperResponsive, props.dir === "rtl" && (props.classNames?.rtl ?? styles.rtl), getUiSlotClassName(props.uiSlots, "root"), props.className),
		style: mergeUiSlotStyles(props.style, props.uiSlots, "root"),
		...regionProps
	}, /* @__PURE__ */ React.createElement(DefinedRange, {
		...inheritedProps,
		focusedRange,
		onPreviewChange: handlePreviewChange,
		range: props.ranges[focusedRange[0]],
		className: getUiSlotClassName(props.uiSlots, "definedRanges"),
		style: mergeUiSlotStyles(void 0, props.uiSlots, "definedRanges")
	}), /* @__PURE__ */ React.createElement(DateRange, {
		...inheritedProps,
		...calendarProps,
		_resolvedLayout: calendarLayout,
		_calendarIsFluidWidthMode: widthMode === "fluid",
		_calendarCanAutoStackFluidMonths: props.layout === "auto",
		uiSlots: dateRangeUiSlots,
		onRangeFocusChange: handleRangeFocusChange,
		focusedRange,
		ref: dateRangeRef,
		className: void 0,
		style: void 0
	}));
});
//#endregion
export { DateRangePicker as default };
