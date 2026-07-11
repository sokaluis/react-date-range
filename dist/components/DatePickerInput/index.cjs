const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
const require_styles = require("../../styles.cjs");
const require_components_Calendar_index = require("../Calendar/index.cjs");
const require_hooks_usePopover = require("../../hooks/usePopover.cjs");
let date_fns = require("date-fns");
let react = require("react");
react = require_runtime.__toESM(react);
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
let react_dom = require("react-dom");
//#region src/components/DatePickerInput/index.jsx
const defaultDateDisplayFormat = "MMM d, yyyy";
const defaultAriaLabel = "Select date";
const defaultPopoverLabel = "Choose date";
const canUseDocument = () => typeof document !== "undefined";
const canUseWindow = () => typeof window !== "undefined";
const formatDate = (date, dateDisplayFormat, dateOptions) => date && (0, date_fns.isValid)(date) ? (0, date_fns.format)(date, dateDisplayFormat, dateOptions) : "";
function DatePickerInput(props, ref) {
	const { date, onChange, open: controlledOpen, defaultOpen, onOpenChange, dateDisplayFormat = defaultDateDisplayFormat, ariaLabel = defaultAriaLabel, popoverLabel = defaultPopoverLabel, placeholder, disabled = false, calendarProps = {}, classNames = {}, className, dir } = props;
	const [mounted, setMounted] = (0, react.useState)(false);
	const [popoverStyle, setPopoverStyle] = (0, react.useState)(void 0);
	const styles = (0, react.useMemo)(() => ({
		...require_styles,
		...calendarProps.classNames,
		...classNames
	}), [calendarProps.classNames, classNames]);
	const dateOptions = calendarProps.locale ? { locale: calendarProps.locale } : void 0;
	const { open, setOpen, toggleOpen, triggerRef, popoverRef } = require_hooks_usePopover({
		open: controlledOpen,
		defaultOpen,
		onOpenChange
	});
	(0, react.useEffect)(() => {
		setMounted(true);
	}, []);
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
	const onCalendarChange = (nextDate) => {
		onChange?.(nextDate);
		setOpen(false);
	};
	const popover = open ? /* @__PURE__ */ react.default.createElement("div", {
		ref: popoverRef,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": popoverLabel,
		className: styles.datePickerInputPopover,
		style: popoverStyle,
		dir
	}, /* @__PURE__ */ react.default.createElement(require_components_Calendar_index, {
		...calendarProps,
		date: date || void 0,
		dateDisplayFormat,
		onChange: onCalendarChange,
		classNames: styles,
		dir: dir || calendarProps.dir
	})) : null;
	return /* @__PURE__ */ react.default.createElement("span", {
		className: (0, classnames.default)(styles.datePickerInputWrapper, className),
		dir
	}, /* @__PURE__ */ react.default.createElement("input", {
		ref: triggerRef,
		type: "text",
		readOnly: true,
		disabled,
		value: formatDate(date, dateDisplayFormat, dateOptions),
		placeholder,
		"aria-label": ariaLabel,
		"aria-haspopup": "dialog",
		"aria-expanded": open ? "true" : "false",
		className: styles.datePickerInputTrigger,
		onClick: onTriggerClick,
		onKeyDown: onTriggerKeyDown,
		onChange: () => {}
	}), mounted && canUseDocument() ? (0, react_dom.createPortal)(popover, document.body) : popover);
}
var DatePickerInput_default = (0, react.forwardRef)(DatePickerInput);
//#endregion
module.exports = DatePickerInput_default;
