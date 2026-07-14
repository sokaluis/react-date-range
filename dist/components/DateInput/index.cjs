const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
let date_fns = require("date-fns");
let react = require("react");
react = require_runtime.__toESM(react);
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
//#region src/components/DateInput/index.jsx
function DateInput(props) {
	const { className, readOnly = true, placeholder, ariaLabel, disabled = false, onFocus, value, dateDisplayFormat = "MMM D, YYYY", dateOptions, onChange, minDate, maxDate, disabledDates = [], style } = props;
	const [invalid, setInvalid] = (0, react.useState)(false);
	const [changed, setChanged] = (0, react.useState)(false);
	const [inputValue, setInputValue] = (0, react.useState)(() => formatDate({
		value,
		dateDisplayFormat,
		dateOptions
	}));
	function formatDate({ value: v, dateDisplayFormat: fmt, dateOptions: opts }) {
		if (v && (0, date_fns.isValid)(v)) return (0, date_fns.format)(v, fmt, opts);
		return "";
	}
	(0, react.useEffect)(() => {
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
	const isWithinConstraints = (0, react.useCallback)((parsed) => {
		if (minDate && (0, date_fns.isBefore)((0, date_fns.startOfDay)(parsed), (0, date_fns.startOfDay)(minDate))) return false;
		if (maxDate && (0, date_fns.isAfter)((0, date_fns.endOfDay)(parsed), (0, date_fns.endOfDay)(maxDate))) return false;
		if (disabledDates.some((d) => (0, date_fns.isSameDay)(d, parsed))) return false;
		return true;
	}, [
		minDate,
		maxDate,
		disabledDates
	]);
	const update = (0, react.useCallback)((val) => {
		if (invalid || !changed || !val) return;
		const parsed = (0, date_fns.parse)(val, dateDisplayFormat, /* @__PURE__ */ new Date(), dateOptions);
		if ((0, date_fns.isValid)(parsed)) if (isWithinConstraints(parsed)) {
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
	return /* @__PURE__ */ react.default.createElement("span", {
		className: (0, classnames.default)("rdrDateInput", className),
		style
	}, /* @__PURE__ */ react.default.createElement("input", {
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
	}), invalid && /* @__PURE__ */ react.default.createElement("span", { className: "rdrWarning" }, "⚠"));
}
//#endregion
module.exports = DateInput;
