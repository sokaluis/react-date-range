const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
const require_styles = require("../../styles.cjs");
const require_components_DateRange_index = require("../DateRange/index.cjs");
const require_hooks_usePopover = require("../../hooks/usePopover.cjs");
let date_fns = require("date-fns");
let react = require("react");
react = require_runtime.__toESM(react);
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
let react_dom = require("react-dom");
//#region src/components/DateRangeInput/index.jsx
const defaultFormat = "yyyy-MM-dd";
const defaultRangeKey = "selection";
const defaultTriggerLabel = "Select date range";
const defaultPopoverLabel = "Select date range";
const canUseDocument = () => typeof document !== "undefined";
const canUseWindow = () => typeof window !== "undefined";
const isUsableDate = (date) => date instanceof Date && (0, date_fns.isValid)(date);
const formatRange = (range, dateFormat, formatter, dateOptions) => {
	if (formatter) return formatter({
		startDate: range.startDate,
		endDate: range.endDate
	});
	if (!isUsableDate(range.startDate) || !isUsableDate(range.endDate)) return "";
	return `${(0, date_fns.format)(range.startDate, dateFormat, dateOptions)} – ${(0, date_fns.format)(range.endDate, dateFormat, dateOptions)}`;
};
function DateRangeInput(props, ref) {
	const { ranges, onChange, open: controlledOpen, defaultOpen, onOpenChange, closeOnEndSelection = true, triggerPlaceholder, formatter, format = defaultFormat, rangeKey = defaultRangeKey, calendarProps = {}, popoverLabel = defaultPopoverLabel, ariaLabels = {}, disabled = false, classNames = {}, className, dir } = props;
	const popoverId = (0, react.useId)();
	const focusedRangeRef = (0, react.useRef)([0, 0]);
	const [mounted, setMounted] = (0, react.useState)(false);
	const [popoverStyle, setPopoverStyle] = (0, react.useState)(void 0);
	const styles = (0, react.useMemo)(() => ({
		...require_styles.default,
		...calendarProps.classNames,
		...classNames
	}), [calendarProps.classNames, classNames]);
	const dateOptions = calendarProps.locale ? { locale: calendarProps.locale } : void 0;
	const normalizedRanges = (0, react.useMemo)(() => {
		const firstRange = ranges?.[0];
		return [{
			...firstRange,
			key: firstRange?.key || rangeKey
		}];
	}, [ranges, rangeKey]);
	const displayValue = formatRange(normalizedRanges[0], format, formatter, dateOptions);
	const { open, setOpen, toggleOpen, triggerRef, popoverRef } = require_hooks_usePopover({
		open: controlledOpen,
		defaultOpen,
		onOpenChange
	});
	(0, react.useEffect)(() => {
		setMounted(true);
	}, []);
	(0, react.useEffect)(() => {
		if (process.env.NODE_ENV !== "production" && ranges && ranges.length > 1) console.warn("DateRangeInput supports a single range; extra ranges are ignored.");
	}, [ranges]);
	(0, react.useEffect)(() => {
		if (!open || !canUseWindow()) {
			setPopoverStyle(void 0);
			return;
		}
		const triggerRect = triggerRef.current?.getBoundingClientRect();
		if (!triggerRect) return;
		setPopoverStyle({
			top: triggerRect.bottom + window.scrollY,
			left: triggerRect.left + window.scrollX,
			minWidth: triggerRect.width
		});
	}, [open, triggerRef]);
	(0, react.useImperativeHandle)(ref, () => ({
		focus: () => triggerRef.current?.focus(),
		getTriggerEl: () => triggerRef.current
	}), [triggerRef]);
	const onTriggerClick = () => {
		if (!disabled) toggleOpen();
	};
	const onTriggerKeyDown = (event) => {
		if (disabled || event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		toggleOpen();
	};
	const onRangeChange = (nextRangesByKey) => {
		const nextRange = nextRangesByKey[normalizedRanges[0].key || rangeKey];
		onChange?.(nextRangesByKey);
		if (!closeOnEndSelection || !nextRange) return;
		const selectingEnd = focusedRangeRef.current[1] === 1;
		const completedDragRange = focusedRangeRef.current[1] === 0 && !isUsableDate(normalizedRanges[0].endDate) && isUsableDate(nextRange.startDate) && isUsableDate(nextRange.endDate) && nextRange.startDate.getTime() !== nextRange.endDate.getTime();
		if (selectingEnd || completedDragRange) setOpen(false);
	};
	const onRangeFocusChange = (focusedRange) => {
		focusedRangeRef.current = focusedRange;
		calendarProps.onRangeFocusChange?.(focusedRange);
	};
	const popover = open ? /* @__PURE__ */ react.default.createElement("div", {
		ref: popoverRef,
		id: popoverId,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": ariaLabels.popover || popoverLabel,
		className: styles.dateRangeInputPopover,
		style: popoverStyle,
		dir
	}, /* @__PURE__ */ react.default.createElement(require_components_DateRange_index, {
		...calendarProps,
		ranges: normalizedRanges,
		onChange: onRangeChange,
		onRangeFocusChange,
		classNames: styles,
		dir: dir || calendarProps.dir
	})) : null;
	return /* @__PURE__ */ react.default.createElement("span", {
		className: (0, classnames.default)(styles.dateRangeInputWrapper, className),
		dir
	}, /* @__PURE__ */ react.default.createElement("input", {
		ref: triggerRef,
		type: "text",
		readOnly: true,
		disabled,
		value: displayValue,
		placeholder: triggerPlaceholder,
		"aria-label": ariaLabels.trigger || defaultTriggerLabel,
		"aria-haspopup": "dialog",
		"aria-expanded": open ? "true" : "false",
		"aria-controls": popoverId,
		className: styles.dateRangeInputTrigger,
		onClick: onTriggerClick,
		onKeyDown: onTriggerKeyDown,
		onChange: () => {}
	}), mounted && canUseDocument() ? (0, react_dom.createPortal)(popover, document.body) : popover);
}
var DateRangeInput_default = (0, react.forwardRef)(DateRangeInput);
//#endregion
module.exports = DateRangeInput_default;
