const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
const require_defaultRanges = require("../../defaultRanges.cjs");
const require_styles = require("../../styles.cjs");
const require_components_InputRangeField_index = require("../InputRangeField/index.cjs");
let react = require("react");
react = require_runtime.__toESM(react);
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
//#region src/components/DefinedRange/index.jsx
const getSelectedRange = (ranges, staticRange, props) => {
	const focusedRangeIndex = ranges.findIndex((range) => {
		if (!range.startDate || !range.endDate || range.disabled) return false;
		return staticRange.isSelected(range, props);
	});
	return {
		selectedRange: ranges[focusedRangeIndex],
		focusedRangeIndex
	};
};
const DefinedRange = (0, react.forwardRef)((props, ref) => {
	const { headerContent, footerContent, onPreviewChange, inputRanges = require_defaultRanges.defaultInputRanges, staticRanges = require_defaultRanges.defaultStaticRanges, ranges = [], focusedRange = [0, 0], renderStaticRangeLabel, rangeColors = [
		"#3d91ff",
		"#3ecf8e",
		"#fed14c"
	], className, style, onChange } = props;
	const [, setRangeOffset] = (0, react.useState)(0);
	const [, setFocusedInput] = (0, react.useState)(-1);
	(0, react.useImperativeHandle)(ref, () => ({}), []);
	const handleRangeChange = (0, react.useCallback)((range) => {
		const selectedRange = ranges[focusedRange[0]];
		if (!onChange || !selectedRange) return;
		onChange({ [selectedRange.key || `range${focusedRange[0] + 1}`]: {
			...selectedRange,
			...range
		} });
	}, [
		focusedRange,
		onChange,
		ranges
	]);
	const getRangeOptionValue = (0, react.useCallback)((option) => {
		if (typeof option.getCurrentValue !== "function") return "";
		const selectedRange = ranges[focusedRange[0]] || {};
		return option.getCurrentValue(selectedRange) || "";
	}, [focusedRange, ranges]);
	return /* @__PURE__ */ react.default.createElement("div", {
		className: (0, classnames.default)(require_styles.default.definedRangesWrapper, className),
		style
	}, headerContent, /* @__PURE__ */ react.default.createElement("div", { className: require_styles.default.staticRanges }, staticRanges.map((staticRange, i) => {
		const { selectedRange, focusedRangeIndex } = getSelectedRange(ranges, staticRange, props);
		let labelContent;
		if (staticRange.hasCustomRendering) labelContent = renderStaticRangeLabel(staticRange);
		else labelContent = staticRange.label;
		return /* @__PURE__ */ react.default.createElement("button", {
			type: "button",
			"aria-pressed": Boolean(selectedRange),
			className: (0, classnames.default)(require_styles.default.staticRange, { [require_styles.default.staticRangeSelected]: Boolean(selectedRange) }),
			style: { color: selectedRange ? selectedRange.color || rangeColors[focusedRangeIndex] : null },
			key: i,
			onClick: () => handleRangeChange(staticRange.range(props)),
			onFocus: () => onPreviewChange && onPreviewChange(staticRange.range(props)),
			onMouseOver: () => onPreviewChange && onPreviewChange(staticRange.range(props)),
			onMouseLeave: () => {
				onPreviewChange && onPreviewChange();
			}
		}, /* @__PURE__ */ react.default.createElement("span", {
			tabIndex: -1,
			className: require_styles.default.staticRangeLabel
		}, labelContent));
	})), /* @__PURE__ */ react.default.createElement("div", { className: require_styles.default.inputRanges }, inputRanges.map((rangeOption, i) => /* @__PURE__ */ react.default.createElement(require_components_InputRangeField_index, {
		key: i,
		styles: require_styles.default,
		label: rangeOption.label,
		onFocus: () => {
			setFocusedInput(i);
			setRangeOffset(0);
		},
		onBlur: () => setRangeOffset(0),
		onChange: (value) => handleRangeChange(rangeOption.range(value, props)),
		value: getRangeOptionValue(rangeOption)
	}))), footerContent);
});
DefinedRange.displayName = "DefinedRange";
//#endregion
module.exports = DefinedRange;
