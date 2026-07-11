import { endOfDay, format, isAfter, isBefore, isSameDay, isValid, parse, startOfDay } from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import classnames from "classnames";
//#region src/components/DateInput/index.jsx
function DateInput(props) {
	const { className, readOnly = true, placeholder, ariaLabel, disabled = false, onFocus, value, dateDisplayFormat = "MMM D, YYYY", dateOptions, onChange, minDate, maxDate, disabledDates = [] } = props;
	const [invalid, setInvalid] = useState(false);
	const [changed, setChanged] = useState(false);
	const [inputValue, setInputValue] = useState(() => formatDate({
		value,
		dateDisplayFormat,
		dateOptions
	}));
	function formatDate({ value: v, dateDisplayFormat: fmt, dateOptions: opts }) {
		if (v && isValid(v)) return format(v, fmt, opts);
		return "";
	}
	useEffect(() => {
		if (changed) return;
		setInputValue(formatDate({
			value,
			dateDisplayFormat,
			dateOptions
		}));
	}, [
		value,
		dateDisplayFormat,
		dateOptions,
		changed
	]);
	const isWithinConstraints = useCallback((parsed) => {
		if (minDate && isBefore(startOfDay(parsed), startOfDay(minDate))) return false;
		if (maxDate && isAfter(endOfDay(parsed), endOfDay(maxDate))) return false;
		if (disabledDates.some((d) => isSameDay(d, parsed))) return false;
		return true;
	}, [
		minDate,
		maxDate,
		disabledDates
	]);
	const update = useCallback((val) => {
		if (invalid || !changed || !val) return;
		const parsed = parse(val, dateDisplayFormat, /* @__PURE__ */ new Date(), dateOptions);
		if (isValid(parsed)) if (isWithinConstraints(parsed)) {
			setChanged(false);
			onChange(parsed);
		} else setInvalid(true);
		else setInvalid(true);
	}, [
		invalid,
		changed,
		dateDisplayFormat,
		dateOptions,
		onChange,
		isWithinConstraints
	]);
	return /* @__PURE__ */ React.createElement("span", { className: classnames("rdrDateInput", className) }, /* @__PURE__ */ React.createElement("input", {
		readOnly,
		disabled,
		value: inputValue,
		placeholder,
		"aria-label": ariaLabel,
		onKeyDown: (e) => {
			if (e.key === "Enter") update(inputValue);
		},
		onChange: (e) => {
			setInputValue(e.target.value);
			setChanged(true);
			setInvalid(false);
		},
		onBlur: () => update(inputValue),
		onFocus
	}), invalid && /* @__PURE__ */ React.createElement("span", { className: "rdrWarning" }, "⚠"));
}
//#endregion
export { DateInput as default };
