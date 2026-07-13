
import React from 'react';
import DayCell from '../DayCell';
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

function renderWeekdays(styles, dateOptions, weekdayDisplayFormat) {
  const now = new Date();
  return (
    <div className={styles.weekDays}>
      {eachDayOfInterval({
        start: startOfWeek(now, dateOptions),
        end: endOfWeek(now, dateOptions),
      }).map((day, i) => (
        <span className={styles.weekDay} key={i}>
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
    <div className={styles.month} style={style}>
      {showMonthName ? (
        <div className={styles.monthName}>
          {format(month, monthDisplayFormat, dateOptions)}
        </div>
      ) : null}
      {showWeekDays && renderWeekdays(styles, dateOptions, weekdayDisplayFormat)}
      <div className={styles.days} onMouseLeave={onMouseLeave}>
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
