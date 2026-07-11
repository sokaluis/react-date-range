const require_runtime = require("../../_virtual/_rolldown/runtime.cjs");
let date_fns = require("date-fns");
let react = require("react");
react = require_runtime.__toESM(react);
let classnames = require("classnames");
classnames = require_runtime.__toESM(classnames);
//#region src/components/DayCell/index.jsx
function DayCell(props) {
	const [hover, setHover] = (0, react.useState)(false);
	const [active, setActive] = (0, react.useState)(false);
	const { day, disabled, isPassive, isToday, isWeekend, isStartOfWeek, isEndOfWeek, isStartOfMonth, isEndOfMonth, styles, color, onMouseDown, onMouseUp, onMouseEnter, onPreviewChange, preview, ranges, displayMode, date, dayContentRenderer, dayDisplayFormat } = props;
	const handleKeyEvent = (event) => {
		if ([13, 32].includes(event.keyCode)) if (event.type === "keydown") onMouseDown(day);
		else onMouseUp(day);
	};
	const handleMouseEvent = (event) => {
		if (disabled) {
			onPreviewChange();
			return;
		}
		switch (event.type) {
			case "mouseenter":
				onMouseEnter(day);
				onPreviewChange(day);
				setHover(true);
				break;
			case "blur":
			case "mouseleave":
				setHover(false);
				break;
			case "mousedown":
				setActive(true);
				onMouseDown(day);
				break;
			case "mouseup":
				event.stopPropagation();
				setActive(false);
				onMouseUp(day);
				break;
			case "focus":
				onPreviewChange(day);
				break;
		}
	};
	const getClassNames = () => {
		return (0, classnames.default)(styles.day, {
			[styles.dayPassive]: isPassive,
			[styles.dayDisabled]: disabled,
			[styles.dayToday]: isToday,
			[styles.dayWeekend]: isWeekend,
			[styles.dayStartOfWeek]: isStartOfWeek,
			[styles.dayEndOfWeek]: isEndOfWeek,
			[styles.dayStartOfMonth]: isStartOfMonth,
			[styles.dayEndOfMonth]: isEndOfMonth,
			[styles.dayHovered]: hover,
			[styles.dayActive]: active
		});
	};
	const renderPreviewPlaceholder = () => {
		if (!preview) return null;
		const startDate = preview.startDate ? (0, date_fns.endOfDay)(preview.startDate) : null;
		const endDate = preview.endDate ? (0, date_fns.startOfDay)(preview.endDate) : null;
		const isInRange = (!startDate || (0, date_fns.isAfter)(day, startDate)) && (!endDate || (0, date_fns.isBefore)(day, endDate));
		const isStartEdge = !isInRange && (0, date_fns.isSameDay)(day, startDate);
		const isEndEdge = !isInRange && (0, date_fns.isSameDay)(day, endDate);
		return /* @__PURE__ */ react.default.createElement("span", {
			className: (0, classnames.default)({
				[styles.dayStartPreview]: isStartEdge,
				[styles.dayInPreview]: isInRange,
				[styles.dayEndPreview]: isEndEdge
			}),
			style: { color: preview.color }
		});
	};
	const renderSelectionPlaceholders = () => {
		if (displayMode === "date") return (0, date_fns.isSameDay)(day, date) ? /* @__PURE__ */ react.default.createElement("span", {
			className: styles.selected,
			style: { color }
		}) : null;
		return ranges.reduce((result, range) => {
			let startDate = range.startDate;
			let endDate = range.endDate;
			if (startDate && endDate && (0, date_fns.isBefore)(endDate, startDate)) [startDate, endDate] = [endDate, startDate];
			startDate = startDate ? (0, date_fns.endOfDay)(startDate) : null;
			endDate = endDate ? (0, date_fns.startOfDay)(endDate) : null;
			const isInRange = startDate && endDate ? (0, date_fns.isAfter)(day, startDate) && (0, date_fns.isBefore)(day, endDate) : false;
			const isStartEdge = !isInRange && (0, date_fns.isSameDay)(day, startDate);
			const isEndEdge = !isInRange && (0, date_fns.isSameDay)(day, endDate);
			if (isInRange || isStartEdge || isEndEdge) return [...result, {
				isStartEdge,
				isEndEdge,
				isInRange,
				...range
			}];
			return result;
		}, []).map((range, i) => /* @__PURE__ */ react.default.createElement("span", {
			key: i,
			className: (0, classnames.default)({
				[styles.startEdge]: range.isStartEdge,
				[styles.endEdge]: range.isEndEdge,
				[styles.inRange]: range.isInRange
			}),
			style: { color: range.color || color }
		}));
	};
	let isSelectedForAria = false;
	if (displayMode === "date") isSelectedForAria = (0, date_fns.isSameDay)(day, date);
	else isSelectedForAria = ranges.some((range) => {
		let s = range.startDate;
		let e = range.endDate;
		if (s && e && (0, date_fns.isBefore)(e, s)) [s, e] = [e, s];
		s = s ? (0, date_fns.endOfDay)(s) : null;
		e = e ? (0, date_fns.startOfDay)(e) : null;
		const inRng = s && e ? (0, date_fns.isAfter)(day, s) && (0, date_fns.isBefore)(day, e) : false;
		const startEdge = !inRng && (0, date_fns.isSameDay)(day, s);
		const endEdge = !inRng && (0, date_fns.isSameDay)(day, e);
		return inRng || startEdge || endEdge;
	});
	return /* @__PURE__ */ react.default.createElement("button", {
		type: "button",
		"data-date": day.toISOString(),
		role: "gridcell",
		"aria-selected": isSelectedForAria ? true : void 0,
		"aria-current": isToday ? "date" : void 0,
		"aria-disabled": disabled ? true : void 0,
		onMouseEnter: handleMouseEvent,
		onMouseLeave: handleMouseEvent,
		onFocus: handleMouseEvent,
		onMouseDown: handleMouseEvent,
		onMouseUp: handleMouseEvent,
		onBlur: handleMouseEvent,
		onPauseCapture: handleMouseEvent,
		onKeyDown: handleKeyEvent,
		onKeyUp: handleKeyEvent,
		className: getClassNames(props.styles),
		...disabled || isPassive ? { tabIndex: -1 } : {},
		style: { color }
	}, renderSelectionPlaceholders(), renderPreviewPlaceholder(), /* @__PURE__ */ react.default.createElement("span", { className: styles.dayNumber }, dayContentRenderer?.(day) || /* @__PURE__ */ react.default.createElement("span", null, (0, date_fns.format)(day, dayDisplayFormat))));
}
//#endregion
module.exports = DayCell;
