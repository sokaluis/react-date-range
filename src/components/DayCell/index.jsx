 
import React, { useState } from 'react';
import classnames from 'classnames';
import { startOfDay, format, isSameDay, isAfter, isBefore, endOfDay } from 'date-fns';

function DayCell(props) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const {
    day,
    disabled,
    isPassive,
    isToday,
    isWeekend,
    isStartOfWeek,
    isEndOfWeek,
    isStartOfMonth,
    isEndOfMonth,
    styles,
    color,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onPreviewChange,
    preview,
    ranges,
    displayMode,
    date,
    dayContentRenderer,
    dayDisplayFormat,
  } = props;

  const handleKeyEvent = event => {
    if ([13 /* space */, 32 /* enter */].includes(event.keyCode)) {
      if (event.type === 'keydown') onMouseDown(day);
      else onMouseUp(day);
    }
  };

  const handleMouseEvent = event => {
    if (disabled) {
      onPreviewChange();
      return;
    }

    switch (event.type) {
      case 'mouseenter':
        onMouseEnter(day);
        onPreviewChange(day);
        setHover(true);
        break;
      case 'blur':
      case 'mouseleave':
        setHover(false);
        break;
      case 'mousedown':
        setActive(true);
        onMouseDown(day);
        break;
      case 'mouseup':
        event.stopPropagation();
        setActive(false);
        onMouseUp(day);
        break;
      case 'focus':
        onPreviewChange(day);
        break;
    }
  };

  const getClassNames = () => {
    return classnames(styles.day, {
      [styles.dayPassive]: isPassive,
      [styles.dayDisabled]: disabled,
      [styles.dayToday]: isToday,
      [styles.dayWeekend]: isWeekend,
      [styles.dayStartOfWeek]: isStartOfWeek,
      [styles.dayEndOfWeek]: isEndOfWeek,
      [styles.dayStartOfMonth]: isStartOfMonth,
      [styles.dayEndOfMonth]: isEndOfMonth,
      [styles.dayHovered]: hover,
      [styles.dayActive]: active,
    });
  };

  const renderPreviewPlaceholder = () => {
    if (!preview) return null;
    const startDate = preview.startDate ? endOfDay(preview.startDate) : null;
    const endDate = preview.endDate ? startOfDay(preview.endDate) : null;
    const isInRange =
      (!startDate || isAfter(day, startDate)) && (!endDate || isBefore(day, endDate));
    const isStartEdge = !isInRange && isSameDay(day, startDate);
    const isEndEdge = !isInRange && isSameDay(day, endDate);
    return (
      <span
        className={classnames({
          [styles.dayStartPreview]: isStartEdge,
          [styles.dayInPreview]: isInRange,
          [styles.dayEndPreview]: isEndEdge,
        })}
        style={{ color: preview.color }}
      />
    );
  };

  const renderSelectionPlaceholders = () => {
    if (displayMode === 'date') {
      const isSelected = isSameDay(day, date);
      return isSelected ? (
        <span className={styles.selected} style={{ color }} />
      ) : null;
    }

    const inRanges = ranges.reduce((result, range) => {
      let startDate = range.startDate;
      let endDate = range.endDate;
      if (startDate && endDate && isBefore(endDate, startDate)) {
        [startDate, endDate] = [endDate, startDate];
      }
      startDate = startDate ? endOfDay(startDate) : null;
      endDate = endDate ? startOfDay(endDate) : null;
      const isInRange =
        startDate && endDate
          ? isAfter(day, startDate) && isBefore(day, endDate)
          : false;
      const isStartEdge = !isInRange && isSameDay(day, startDate);
      const isEndEdge = !isInRange && isSameDay(day, endDate);
      if (isInRange || isStartEdge || isEndEdge) {
        return [
          ...result,
          {
            isStartEdge,
            isEndEdge: isEndEdge,
            isInRange,
            ...range,
          },
        ];
      }
      return result;
    }, []);

    return inRanges.map((range, i) => (
      <span
        key={i}
        className={classnames({
          [styles.startEdge]: range.isStartEdge,
          [styles.endEdge]: range.isEndEdge,
          [styles.inRange]: range.isInRange,
        })}
        style={{ color: range.color || color }}
      />
    ));
  };

  // REQ-CG-006: compute ARIA selection state
  let isSelectedForAria = false;
  if (displayMode === 'date') {
    isSelectedForAria = isSameDay(day, date);
  } else {
    isSelectedForAria = ranges.some(range => {
      let s = range.startDate;
      let e = range.endDate;
      if (s && e && isBefore(e, s)) {
        [s, e] = [e, s];
      }
      s = s ? endOfDay(s) : null;
      e = e ? startOfDay(e) : null;
      const inRng = s && e ? isAfter(day, s) && isBefore(day, e) : false;
      const startEdge = !inRng && isSameDay(day, s);
      const endEdge = !inRng && isSameDay(day, e);
      return inRng || startEdge || endEdge;
    });
  }

  return (
    <button
      type="button"
      data-date={day.toISOString()}
      role="gridcell"
      aria-selected={isSelectedForAria ? true : undefined}
      aria-current={isToday ? 'date' : undefined}
      aria-disabled={disabled ? true : undefined}
      onMouseEnter={handleMouseEvent}
      onMouseLeave={handleMouseEvent}
      onFocus={handleMouseEvent}
      onMouseDown={handleMouseEvent}
      onMouseUp={handleMouseEvent}
      onBlur={handleMouseEvent}
      onPauseCapture={handleMouseEvent}
      onKeyDown={handleKeyEvent}
      onKeyUp={handleKeyEvent}
      className={getClassNames(props.styles)}
      {...(disabled || isPassive ? { tabIndex: -1 } : {})}
      style={{ color }}>
      {renderSelectionPlaceholders()}
      {renderPreviewPlaceholder()}
      <span className={styles.dayNumber}>
        {
          dayContentRenderer?.(day) ||
          <span>{format(day, dayDisplayFormat)}</span>
        }
      </span>
    </button>
  );
}

export default DayCell;
