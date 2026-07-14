const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
const require_styles = require("../../styles.cjs");
const require_components_DateInput_index = require("../DateInput/index.cjs");
let react = require("react");
react = require_runtime.__toESM(react);
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
//#region src/components/DateDisplay/index.jsx
function DateDisplay({ focusedRange = [0, 0], color, ranges = [], rangeColors = [], dateDisplayFormat, editableDateInputs, startDatePlaceholder, endDatePlaceholder, ariaLabels = {}, minDate, maxDate, disabledDates = [], onChange, onRangeFocusChange, dateOptions, styles = {}, uiSlots, selectedDisplay }) {
	const defaultColor = rangeColors[focusedRange[0]] || color;
	const labelBaseId = (0, react.useId)();
	const resolvedDateDisplayFormat = selectedDisplay?.format || dateDisplayFormat;
	const separator = selectedDisplay?.separator ?? "";
	return /* @__PURE__ */ react.default.createElement("div", {
		className: styles.dateDisplayWrapper,
		role: "group",
		"aria-label": ariaLabels.dateDisplay || "Selected date range"
	}, ranges.map((range, i) => {
		if (range.showDateDisplay === false || range.disabled && !range.showDateDisplay) return null;
		return /* @__PURE__ */ react.default.createElement("div", {
			className: (0, classnames.default)(styles.dateDisplay, require_styles.getUiSlotClassName(uiSlots, "dateDisplay")),
			key: i,
			style: require_styles.mergeUiSlotStyles({ color: range.color || defaultColor }, uiSlots, "dateDisplay"),
			role: range.label ? "group" : void 0,
			"aria-labelledby": range.label ? labelBaseId + "-label-" + i : void 0
		}, range.label && /* @__PURE__ */ react.default.createElement("span", {
			id: labelBaseId + "-label-" + i,
			className: styles.dateDisplayLabel
		}, range.label), /* @__PURE__ */ react.default.createElement(require_components_DateInput_index, {
			className: (0, classnames.default)(styles.dateDisplayItem, { [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 0 }, require_styles.getUiSlotClassName(uiSlots, "dateDisplayItem")),
			style: require_styles.mergeUiSlotStyles(void 0, uiSlots, "dateDisplayItem"),
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
		}), separator ? /* @__PURE__ */ react.default.createElement("span", null, separator) : null, /* @__PURE__ */ react.default.createElement(require_components_DateInput_index, {
			className: (0, classnames.default)(styles.dateDisplayItem, { [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 1 }, require_styles.getUiSlotClassName(uiSlots, "dateDisplayItem")),
			style: require_styles.mergeUiSlotStyles(void 0, uiSlots, "dateDisplayItem"),
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
module.exports = DateDisplay;
