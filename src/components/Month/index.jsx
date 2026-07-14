
import React from 'react';
import DayCell from '../DayCell';
import classnames from 'classnames';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isBefore,
  isSameDay,
  isAfter,
  isWeekend,
  isWithinInterval,
  eachDayOfInterval,
} from 'date-fns';
import { getMonthDisplayRange } from '../../utils';
import { getUiSlotClassName, mergeUiSlotStyles } from '../../styles';

function renderWeekdays(styles, dateOptions, weekdayDisplayFormat, uiSlots) {
  const now = new Date();
  return (
    <div
      className={classnames(styles.weekDays, getUiSlotClassName(uiSlots, 'weekdays'))}
      style={mergeUiSlotStyles(undefined, uiSlots, 'weekdays')}>
      {eachDayOfInterval({
        start: startOfWeek(now, dateOptions),
        end: endOfWeek(now, dateOptions),
      }).map((day, i) => (
        <span
          className={classnames(styles.weekDay, getUiSlotClassName(uiSlots, 'weekDay'))}
          style={mergeUiSlotStyles(undefined, uiSlots, 'weekDay')}
          key={i}>
          {format(day, weekdayDisplayFormat, dateOptions)}
        </span>
      ))}
    </div>
  );
}

function Month(props) {
  const now = new Date();
  const {
    displayMode,
    focusedRange,
    drag,
    styles,
    disabledDates,
    disabledDay,
    minDate: rawMinDate,
    maxDate: rawMaxDate,
    month,
    dateOptions,
    fixedHeight,
    ranges: rawRanges,
    showPreview: shouldShowPreview,
    preview,
    style,
    showMonthName,
    monthDisplayFormat,
    showWeekDays,
    weekdayDisplayFormat,
    onMouseLeave,
    onDragSelectionStart,
    onDragSelectionEnd,
    onDragSelectionMove,
    todayAffordance,
    uiSlots,
  } = props;

  const minDate = rawMinDate && startOfDay(rawMinDate);
  const maxDate = rawMaxDate && endOfDay(rawMaxDate);
  const monthDisplay = getMonthDisplayRange(month, dateOptions, fixedHeight);

  let ranges = rawRanges;
  if (displayMode === 'dateRange' && drag.status) {
    const { startDate, endDate } = drag.range;
    ranges = ranges.map((range, i) => {
      if (i !== focusedRange[0]) return range;
      return { ...range, startDate, endDate };
    });
  }

  const showPreview = shouldShowPreview && !drag.disablePreview;

  return (
    <div
      className={classnames(styles.month, getUiSlotClassName(uiSlots, 'month'))}
      style={mergeUiSlotStyles(style, uiSlots, 'month')}>
      {showMonthName ? (
        <div className={styles.monthName}>
          {format(month, monthDisplayFormat, dateOptions)}
        </div>
      ) : null}
      {showWeekDays && renderWeekdays(styles, dateOptions, weekdayDisplayFormat, uiSlots)}
      <div
        className={classnames(styles.days, getUiSlotClassName(uiSlots, 'days'))}
        style={mergeUiSlotStyles(undefined, uiSlots, 'days')}
        onMouseLeave={onMouseLeave}>
        {eachDayOfInterval({ start: monthDisplay.start, end: monthDisplay.end }).map(
          (day, index) => {
            const isStartOfMonth = isSameDay(day, monthDisplay.startDateOfMonth);
            const isEndOfMonth = isSameDay(day, monthDisplay.endDateOfMonth);
            const isOutsideMinMax =
              (minDate && isBefore(day, minDate)) || (maxDate && isAfter(day, maxDate));
            const isDisabledSpecifically = disabledDates.some(disabledDate =>
              isSameDay(disabledDate, day)
            );
            const isDisabledDay = disabledDay(day);
            return (
              <DayCell
                {...props}
                ranges={ranges}
                day={day}
                preview={showPreview ? preview : null}
                isWeekend={isWeekend(day, dateOptions)}
                isToday={isSameDay(day, now)}
                todayAffordance={todayAffordance}
                isStartOfWeek={isSameDay(day, startOfWeek(day, dateOptions))}
                isEndOfWeek={isSameDay(day, endOfWeek(day, dateOptions))}
                isStartOfMonth={isStartOfMonth}
                isEndOfMonth={isEndOfMonth}
                key={index}
                disabled={isOutsideMinMax || isDisabledSpecifically || isDisabledDay}
                isPassive={
                  !props.selectablePassive &&
                  !isWithinInterval(day, {
                    start: monthDisplay.startDateOfMonth,
                    end: monthDisplay.endDateOfMonth,
                  })
                }
                styles={styles}
                onMouseDown={onDragSelectionStart}
                onMouseUp={onDragSelectionEnd}
                onMouseEnter={onDragSelectionMove}
                dragRange={drag.range}
                drag={drag.status}
              />
            );
          }
        )}
      </div>
    </div>
  );
}

export default Month;
