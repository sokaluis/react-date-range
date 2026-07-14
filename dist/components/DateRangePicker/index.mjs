import styles_default, { getUiSlotClassName, mergeUiSlotStyles, omitUiSlotKeys } from "../../styles.mjs";
import { findNextRangeIndex, generateStyles } from "../../utils.mjs";
import DateRange from "../DateRange/index.mjs";
import DefinedRange from "../DefinedRange/index.mjs";
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import classnames from "classnames";
//#region src/components/DateRangePicker/index.jsx
const DateRangePicker = forwardRef(function DateRangePicker(props, ref) {
	const { calendarCount, scrollOrientation, ...inheritedProps } = props;
	const dateRangeRef = useRef(null);
	const [focusedRangeState, setFocusedRangeState] = useState(() => [findNextRangeIndex(props.ranges), 0]);
	const focusedRange = props.focusedRange || focusedRangeState;
	const styles = useMemo(() => generateStyles([styles_default, props.classNames]), [props.classNames]);
	const dateRangeUiSlots = useMemo(() => omitUiSlotKeys(props.uiSlots, ["root", "definedRanges"]), [props.uiSlots]);
	const regionProps = props.ariaLabels?.dateRangePicker === false ? {} : {
		role: "region",
		"aria-label": props.ariaLabels?.dateRangePicker || "Date range picker"
	};
	const layoutProps = useMemo(() => {
		if (props.scroll?.enabled === true) return {};
		const hasCalendarCount = calendarCount !== void 0;
		const hasScrollOrientation = scrollOrientation !== void 0;
		return {
			months: hasCalendarCount ? calendarCount === 2 ? 2 : 1 : props.months ?? 1,
			direction: hasScrollOrientation ? scrollOrientation === "horizontal" ? "horizontal" : "vertical" : props.direction ?? "vertical"
		};
	}, [
		calendarCount,
		props.direction,
		props.months,
		props.scroll?.enabled,
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
		className: classnames(styles.dateRangePickerWrapper, props.dir === "rtl" && (props.classNames?.rtl ?? styles.rtl), getUiSlotClassName(props.uiSlots, "root"), props.className),
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
		...layoutProps,
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
