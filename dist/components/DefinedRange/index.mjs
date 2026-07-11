import { defaultInputRanges, defaultStaticRanges } from "../../defaultRanges.mjs";
import styles_default from "../../styles.mjs";
import InputRangeField from "../InputRangeField/index.mjs";
import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import classnames from "classnames";
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
const DefinedRange = forwardRef((props, ref) => {
	const { headerContent, footerContent, onPreviewChange, inputRanges = defaultInputRanges, staticRanges = defaultStaticRanges, ranges = [], focusedRange = [0, 0], renderStaticRangeLabel, rangeColors = [
		"#3d91ff",
		"#3ecf8e",
		"#fed14c"
	], className, onChange } = props;
	const [, setRangeOffset] = useState(0);
	const [, setFocusedInput] = useState(-1);
	useImperativeHandle(ref, () => ({}), []);
	const handleRangeChange = useCallback((range) => {
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
	const getRangeOptionValue = useCallback((option) => {
		if (typeof option.getCurrentValue !== "function") return "";
		const selectedRange = ranges[focusedRange[0]] || {};
		return option.getCurrentValue(selectedRange) || "";
	}, [focusedRange, ranges]);
	return /* @__PURE__ */ React.createElement("div", { className: classnames(styles_default.definedRangesWrapper, className) }, headerContent, /* @__PURE__ */ React.createElement("div", { className: styles_default.staticRanges }, staticRanges.map((staticRange, i) => {
		const { selectedRange, focusedRangeIndex } = getSelectedRange(ranges, staticRange, props);
		let labelContent;
		if (staticRange.hasCustomRendering) labelContent = renderStaticRangeLabel(staticRange);
		else labelContent = staticRange.label;
		return /* @__PURE__ */ React.createElement("button", {
			type: "button",
			"aria-pressed": Boolean(selectedRange),
			className: classnames(styles_default.staticRange, { [styles_default.staticRangeSelected]: Boolean(selectedRange) }),
			style: { color: selectedRange ? selectedRange.color || rangeColors[focusedRangeIndex] : null },
			key: i,
			onClick: () => handleRangeChange(staticRange.range(props)),
			onFocus: () => onPreviewChange && onPreviewChange(staticRange.range(props)),
			onMouseOver: () => onPreviewChange && onPreviewChange(staticRange.range(props)),
			onMouseLeave: () => {
				onPreviewChange && onPreviewChange();
			}
		}, /* @__PURE__ */ React.createElement("span", {
			tabIndex: -1,
			className: styles_default.staticRangeLabel
		}, labelContent));
	})), /* @__PURE__ */ React.createElement("div", { className: styles_default.inputRanges }, inputRanges.map((rangeOption, i) => /* @__PURE__ */ React.createElement(InputRangeField, {
		key: i,
		styles: styles_default,
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
export { DefinedRange as default };
