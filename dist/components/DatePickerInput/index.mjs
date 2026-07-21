import styles_default from "../../styles.mjs";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout.mjs";
import Calendar from "../Calendar/index.mjs";
import usePopover from "../../hooks/usePopover.mjs";
import { format, isValid } from "date-fns";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import classnames from "classnames";
import { createPortal } from "react-dom";
//#region src/components/DatePickerInput/index.jsx
const defaultDateDisplayFormat = "MMM d, yyyy";
const defaultAriaLabel = "Select date";
const defaultPopoverLabel = "Choose date";
const anchorPopoverMaxWidth = "min(var(--rdr-date-picker-input-popover-anchor-max-width, var(--rdr-input-popover-anchor-max-width, 26rem)), calc(100vw - 2rem))";
const canUseDocument = () => typeof document !== "undefined";
const canUseWindow = () => typeof window !== "undefined";
const formatDate = (date, dateDisplayFormat, dateOptions) => date && isValid(date) ? format(date, dateDisplayFormat, dateOptions) : "";
function DatePickerInput(props, ref) {
	const { date, onChange, open: controlledOpen, defaultOpen, onOpenChange, dateDisplayFormat = defaultDateDisplayFormat, ariaLabel = defaultAriaLabel, popoverLabel = defaultPopoverLabel, placeholder, disabled = false, calendarProps = {}, popoverPlacement = "anchor", mobileBreakpoint: mobileBreakpointProp, classNames = {}, className, dir } = props;
	const mobileBreakpoint = mobileBreakpointProp ?? calendarProps.mobileBreakpoint ?? 768;
	const [mounted, setMounted] = useState(false);
	const [popoverStyle, setPopoverStyle] = useState(void 0);
	const styles = useMemo(() => ({
		...styles_default,
		...calendarProps.classNames,
		...classNames
	}), [calendarProps.classNames, classNames]);
	const dateOptions = calendarProps.locale ? { locale: calendarProps.locale } : void 0;
	const { open, setOpen, toggleOpen, triggerRef, popoverRef } = usePopover({
		open: controlledOpen,
		defaultOpen,
		onOpenChange
	});
	const isResponsiveModal = useResponsiveLayout(popoverPlacement === "responsive" ? "auto" : "reference", mobileBreakpoint) === "mobile";
	const isModal = popoverPlacement === "modal" || isResponsiveModal;
	useEffect(() => {
		setMounted(true);
	}, []);
	useEffect(() => {
		if (!open || !canUseWindow()) {
			setPopoverStyle(void 0);
			return;
		}
		if (isModal) {
			setPopoverStyle(void 0);
			return;
		}
		const triggerRect = triggerRef.current?.getBoundingClientRect();
		if (!triggerRect) return;
		setPopoverStyle({
			top: triggerRect.bottom + window.scrollY,
			left: triggerRect.left + window.scrollX,
			minWidth: `min(${triggerRect.width}px, var(--rdr-date-picker-input-popover-anchor-max-width, var(--rdr-input-popover-anchor-max-width, 26rem)), calc(100vw - 2rem))`,
			maxWidth: anchorPopoverMaxWidth
		});
	}, [
		isModal,
		open,
		triggerRef
	]);
	useImperativeHandle(ref, () => ({
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
	const popover = open ? /* @__PURE__ */ React.createElement("div", {
		ref: popoverRef,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": popoverLabel,
		className: classnames(styles.datePickerInputPopover, isModal && styles.datePickerInputPopoverModal),
		style: popoverStyle,
		dir
	}, /* @__PURE__ */ React.createElement(Calendar, {
		...calendarProps,
		date: date || void 0,
		dateDisplayFormat,
		onChange: onCalendarChange,
		classNames: styles,
		dir: dir || calendarProps.dir,
		_calendarIsFluidWidthMode: isModal
	})) : null;
	return /* @__PURE__ */ React.createElement("span", {
		className: classnames(styles.datePickerInputWrapper, className),
		dir
	}, /* @__PURE__ */ React.createElement("input", {
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
	}), mounted && canUseDocument() ? createPortal(popover, document.body) : popover);
}
var DatePickerInput_default = forwardRef(DatePickerInput);
//#endregion
export { DatePickerInput_default as default };
