import React, { useCallback, useId } from "react";
//#region src/components/InputRangeField/index.jsx
const MIN = 0;
const MAX = 99999;
const InputRangeField = React.memo(function InputRangeField({ value = "", label, placeholder = "-", styles, onBlur, onFocus, onChange }) {
	const labelId = useId();
	const handleChange = useCallback((e) => {
		let value = parseInt(e.target.value, 10);
		value = isNaN(value) ? 0 : Math.max(Math.min(MAX, value), MIN);
		onChange(value);
	}, [onChange]);
	return /* @__PURE__ */ React.createElement("div", { className: styles.inputRange }, /* @__PURE__ */ React.createElement("input", {
		"aria-labelledby": labelId,
		className: styles.inputRangeInput,
		placeholder,
		value,
		min: MIN,
		max: MAX,
		onChange: handleChange,
		onFocus,
		onBlur
	}), /* @__PURE__ */ React.createElement("span", {
		id: labelId,
		className: styles.inputRangeLabel
	}, label));
}, (prevProps, nextProps) => prevProps.value === nextProps.value && prevProps.label === nextProps.label && prevProps.placeholder === nextProps.placeholder);
InputRangeField.displayName = "InputRangeField";
//#endregion
export { InputRangeField as default };
