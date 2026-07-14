import React, { useId } from 'react';
import classnames from 'classnames';
import DateInput from '../DateInput';
import { getUiSlotClassName, mergeUiSlotStyles } from '../../styles';

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
  uiSlots,
  selectedDisplay,
}) {
  const defaultColor = rangeColors[focusedRange[0]] || color;
  const labelBaseId = useId();
  const resolvedDateDisplayFormat = selectedDisplay?.format || dateDisplayFormat;
  const separator = selectedDisplay?.separator ?? '';

  return (
    <div
      className={styles.dateDisplayWrapper}
      role="group"
      aria-label={ariaLabels.dateDisplay || 'Selected date range'}>
      {ranges.map((range, i) => {
        if (range.showDateDisplay === false || (range.disabled && !range.showDateDisplay)) return null;
        return (
          <div
            className={classnames(styles.dateDisplay, getUiSlotClassName(uiSlots, 'dateDisplay'))}
            key={i}
            style={mergeUiSlotStyles({ color: range.color || defaultColor }, uiSlots, 'dateDisplay')}
            role={range.label ? 'group' : undefined}
            aria-labelledby={range.label ? labelBaseId + '-label-' + i : undefined}>
            {range.label && (
              <span id={labelBaseId + '-label-' + i} className={styles.dateDisplayLabel}>
                {range.label}
              </span>
            )}
            <DateInput
              className={classnames(styles.dateDisplayItem, {
                [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 0,
              }, getUiSlotClassName(uiSlots, 'dateDisplayItem'))}
              style={mergeUiSlotStyles(undefined, uiSlots, 'dateDisplayItem')}
              readOnly={!editableDateInputs}
              disabled={range.disabled}
              value={range.startDate}
              placeholder={startDatePlaceholder}
              dateOptions={dateOptions}
              dateDisplayFormat={resolvedDateDisplayFormat}
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
            {separator ? <span>{separator}</span> : null}
            <DateInput
              className={classnames(styles.dateDisplayItem, {
                [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 1,
              }, getUiSlotClassName(uiSlots, 'dateDisplayItem'))}
              style={mergeUiSlotStyles(undefined, uiSlots, 'dateDisplayItem')}
              readOnly={!editableDateInputs}
              disabled={range.disabled}
              value={range.endDate}
              placeholder={endDatePlaceholder}
              dateOptions={dateOptions}
              dateDisplayFormat={resolvedDateDisplayFormat}
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
