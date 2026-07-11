import { findNextRangeIndex, generateStyles } from "../../utils.mjs";
import styles_default from "../../styles.mjs";
import DateRange from "../DateRange/index.mjs";
import DefinedRange from "../DefinedRange/index.mjs";
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import classnames from "classnames";
//#region src/components/DateRangePicker/index.jsx
const DateRangePicker = forwardRef(function DateRangePicker(props, ref) {
	const dateRangeRef = useRef(null);
	const [focusedRangeState, setFocusedRangeState] = useState(() => [findNextRangeIndex(props.ranges), 0]);
	const focusedRange = props.focusedRange || focusedRangeState;
	const styles = useMemo(() => generateStyles([styles_default, props.classNames]), [props.classNames]);
	const regionProps = props.ariaLabels?.dateRangePicker === false ? {} : {
		role: "region",
		"aria-label": props.ariaLabels?.dateRangePicker || "Date range picker"
	};
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
		className: classnames(styles.dateRangePickerWrapper, props.dir === "rtl" && (props.classNames?.rtl ?? styles.rtl), props.className),
		...regionProps
	}, /* @__PURE__ */ React.createElement(DefinedRange, {
		...props,
		focusedRange,
		onPreviewChange: handlePreviewChange,
		range: props.ranges[focusedRange[0]],
		className: void 0
	}), /* @__PURE__ */ React.createElement(DateRange, {
		...props,
		onRangeFocusChange: handleRangeFocusChange,
		focusedRange,
		ref: dateRangeRef,
		className: void 0
	}));
});
//#endregion
export { DateRangePicker as default };
