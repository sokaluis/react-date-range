import DateInput from "../DateInput/index.mjs";
import React, { useId } from "react";
import classnames from "classnames";
//#region src/components/DateDisplay/index.jsx
function DateDisplay({ focusedRange = [0, 0], color, ranges = [], rangeColors = [], dateDisplayFormat, editableDateInputs, startDatePlaceholder, endDatePlaceholder, ariaLabels = {}, minDate, maxDate, disabledDates = [], onChange, onRangeFocusChange, dateOptions, styles = {} }) {
	const defaultColor = rangeColors[focusedRange[0]] || color;
	const labelBaseId = useId();
	return /* @__PURE__ */ React.createElement("div", {
		className: styles.dateDisplayWrapper,
		role: "group",
		"aria-label": ariaLabels.dateDisplay || "Selected date range"
	}, ranges.map((range, i) => {
		if (range.showDateDisplay === false || range.disabled && !range.showDateDisplay) return null;
		return /* @__PURE__ */ React.createElement("div", {
			className: styles.dateDisplay,
			key: i,
			style: { color: range.color || defaultColor },
			role: range.label ? "group" : void 0,
			"aria-labelledby": range.label ? labelBaseId + "-label-" + i : void 0
		}, range.label && /* @__PURE__ */ React.createElement("span", {
			id: labelBaseId + "-label-" + i,
			className: styles.dateDisplayLabel
		}, range.label), /* @__PURE__ */ React.createElement(DateInput, {
			className: classnames(styles.dateDisplayItem, { [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 0 }),
			readOnly: !editableDateInputs,
			disabled: range.disabled,
			value: range.startDate,
			placeholder: startDatePlaceholder,
			dateOptions,
			dateDisplayFormat,
			ariaLabel: ariaLabels.dateInput && ariaLabels.dateInput[range.key] && ariaLabels.dateInput[range.key].startDate,
			onChange,
			onFocus: () => onRangeFocusChange(i, 0),
			minDate,
			maxDate,
			disabledDates
		}), /* @__PURE__ */ React.createElement(DateInput, {
			className: classnames(styles.dateDisplayItem, { [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 1 }),
			readOnly: !editableDateInputs,
			disabled: range.disabled,
			value: range.endDate,
			placeholder: endDatePlaceholder,
			dateOptions,
			dateDisplayFormat,
			ariaLabel: ariaLabels.dateInput && ariaLabels.dateInput[range.key] && ariaLabels.dateInput[range.key].endDate,
			onChange,
			onFocus: () => onRangeFocusChange(i, 1),
			minDate,
			maxDate,
			disabledDates
		}));
	}));
}
//#endregion
export { DateDisplay as default };
