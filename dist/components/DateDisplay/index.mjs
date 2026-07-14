import { getUiSlotClassName, mergeUiSlotStyles } from "../../styles.mjs";
import DateInput from "../DateInput/index.mjs";
import React, { useId } from "react";
import classnames from "classnames";
//#region src/components/DateDisplay/index.jsx
function DateDisplay({ focusedRange = [0, 0], color, ranges = [], rangeColors = [], dateDisplayFormat, editableDateInputs, startDatePlaceholder, endDatePlaceholder, ariaLabels = {}, minDate, maxDate, disabledDates = [], onChange, onRangeFocusChange, dateOptions, styles = {}, uiSlots, selectedDisplay }) {
	const defaultColor = rangeColors[focusedRange[0]] || color;
	const labelBaseId = useId();
	const resolvedDateDisplayFormat = selectedDisplay?.format || dateDisplayFormat;
	const separator = selectedDisplay?.separator ?? "";
	return /* @__PURE__ */ React.createElement("div", {
		className: styles.dateDisplayWrapper,
		role: "group",
		"aria-label": ariaLabels.dateDisplay || "Selected date range"
	}, ranges.map((range, i) => {
		if (range.showDateDisplay === false || range.disabled && !range.showDateDisplay) return null;
		return /* @__PURE__ */ React.createElement("div", {
			className: classnames(styles.dateDisplay, getUiSlotClassName(uiSlots, "dateDisplay")),
			key: i,
			style: mergeUiSlotStyles({ color: range.color || defaultColor }, uiSlots, "dateDisplay"),
			role: range.label ? "group" : void 0,
			"aria-labelledby": range.label ? labelBaseId + "-label-" + i : void 0
		}, range.label && /* @__PURE__ */ React.createElement("span", {
			id: labelBaseId + "-label-" + i,
			className: styles.dateDisplayLabel
		}, range.label), /* @__PURE__ */ React.createElement(DateInput, {
			className: classnames(styles.dateDisplayItem, { [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 0 }, getUiSlotClassName(uiSlots, "dateDisplayItem")),
			style: mergeUiSlotStyles(void 0, uiSlots, "dateDisplayItem"),
			readOnly: !editableDateInputs,
			disabled: range.disabled,
			value: range.startDate,
			placeholder: startDatePlaceholder,
			dateOptions,
			dateDisplayFormat: resolvedDateDisplayFormat,
			ariaLabel: ariaLabels.dateInput && ariaLabels.dateInput[range.key] && ariaLabels.dateInput[range.key].startDate,
			onChange,
			onFocus: () => onRangeFocusChange(i, 0),
			minDate,
			maxDate,
			disabledDates
		}), separator ? /* @__PURE__ */ React.createElement("span", null, separator) : null, /* @__PURE__ */ React.createElement(DateInput, {
			className: classnames(styles.dateDisplayItem, { [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 1 }, getUiSlotClassName(uiSlots, "dateDisplayItem")),
			style: mergeUiSlotStyles(void 0, uiSlots, "dateDisplayItem"),
			readOnly: !editableDateInputs,
			disabled: range.disabled,
			value: range.endDate,
			placeholder: endDatePlaceholder,
			dateOptions,
			dateDisplayFormat: resolvedDateDisplayFormat,
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
