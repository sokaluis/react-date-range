import React from 'react';
import classnames from 'classnames';
import DateInput from '../DateInput';

function DateDisplay({
  focusedRange = [0, 0],
  color,
  ranges = [],
  rangeColors = [],
  dateDisplayFormat,
  editableDateInputs,
  startDatePlaceholder,
  endDatePlaceholder,
  ariaLabels = {},
  minDate,
  maxDate,
  disabledDates = [],
  onChange,
  onRangeFocusChange,
  dateOptions,
  styles = {},
}) {
  const defaultColor = rangeColors[focusedRange[0]] || color;

  return (
    <div className={styles.dateDisplayWrapper}>
      {ranges.map((range, i) => {
        if (range.showDateDisplay === false || (range.disabled && !range.showDateDisplay)) return null;
        return (
          <div className={styles.dateDisplay} key={i} style={{ color: range.color || defaultColor }}>
            <DateInput
              className={classnames(styles.dateDisplayItem, {
                [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 0,
              })}
              readOnly={!editableDateInputs}
              disabled={range.disabled}
              value={range.startDate}
              placeholder={startDatePlaceholder}
              dateOptions={dateOptions}
              dateDisplayFormat={dateDisplayFormat}
              ariaLabel={
                ariaLabels.dateInput &&
                ariaLabels.dateInput[range.key] &&
                ariaLabels.dateInput[range.key].startDate
              }
              onChange={onChange}
              onFocus={() => onRangeFocusChange(i, 0)}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
            />
            <DateInput
              className={classnames(styles.dateDisplayItem, {
                [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 1,
              })}
              readOnly={!editableDateInputs}
              disabled={range.disabled}
              value={range.endDate}
              placeholder={endDatePlaceholder}
              dateOptions={dateOptions}
              dateDisplayFormat={dateDisplayFormat}
              ariaLabel={
                ariaLabels.dateInput &&
                ariaLabels.dateInput[range.key] &&
                ariaLabels.dateInput[range.key].endDate
              }
              onChange={onChange}
              onFocus={() => onRangeFocusChange(i, 1)}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
            />
          </div>
        );
      })}
    </div>
  );
}

export default DateDisplay;
