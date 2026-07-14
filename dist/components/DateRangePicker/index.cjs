const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
const require_styles = require("../../styles.cjs");
const require_utils = require("../../utils.cjs");
const require_components_DateRange_index = require("../DateRange/index.cjs");
const require_components_DefinedRange_index = require("../DefinedRange/index.cjs");
let react = require("react");
react = require_runtime.__toESM(react);
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
//#region src/components/DateRangePicker/index.jsx
const DateRangePicker = (0, react.forwardRef)(function DateRangePicker(props, ref) {
	const { calendarCount, scrollOrientation, ...inheritedProps } = props;
	const dateRangeRef = (0, react.useRef)(null);
	const [focusedRangeState, setFocusedRangeState] = (0, react.useState)(() => [require_utils.findNextRangeIndex(props.ranges), 0]);
	const focusedRange = props.focusedRange || focusedRangeState;
	const styles = (0, react.useMemo)(() => require_utils.generateStyles([require_styles.default, props.classNames]), [props.classNames]);
	const dateRangeUiSlots = (0, react.useMemo)(() => require_styles.omitUiSlotKeys(props.uiSlots, ["root", "definedRanges"]), [props.uiSlots]);
	const regionProps = props.ariaLabels?.dateRangePicker === false ? {} : {
		role: "region",
		"aria-label": props.ariaLabels?.dateRangePicker || "Date range picker"
	};
	const layoutProps = (0, react.useMemo)(() => {
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
	(0, react.useImperativeHandle)(ref, () => ({}), []);
	const handlePreviewChange = (0, react.useCallback)((value) => {
		if (!dateRangeRef.current) return;
		dateRangeRef.current.updatePreview(value ? dateRangeRef.current.calcNewSelection(value, typeof value === "string") : null);
		props.onPreviewChange && props.onPreviewChange(value);
	}, [props]);
	const handleRangeFocusChange = (0, react.useCallback)((focusedRange) => {
		setFocusedRangeState(focusedRange);
		props.onRangeFocusChange && props.onRangeFocusChange(focusedRange);
	}, [props]);
	return /* @__PURE__ */ react.default.createElement("div", {
		dir: props.dir,
		className: (0, classnames.default)(styles.dateRangePickerWrapper, props.dir === "rtl" && (props.classNames?.rtl ?? styles.rtl), require_styles.getUiSlotClassName(props.uiSlots, "root"), props.className),
		style: require_styles.mergeUiSlotStyles(props.style, props.uiSlots, "root"),
		...regionProps
	}, /* @__PURE__ */ react.default.createElement(require_components_DefinedRange_index, {
		...inheritedProps,
		focusedRange,
		onPreviewChange: handlePreviewChange,
		range: props.ranges[focusedRange[0]],
		className: require_styles.getUiSlotClassName(props.uiSlots, "definedRanges"),
		style: require_styles.mergeUiSlotStyles(void 0, props.uiSlots, "definedRanges")
	}), /* @__PURE__ */ react.default.createElement(require_components_DateRange_index, {
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
module.exports = DateRangePicker;
