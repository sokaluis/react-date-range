import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Calendar from '../Calendar';
import { findNextRangeIndex, generateStyles } from '../../utils';
import { isBefore, differenceInCalendarDays, addDays, min, isWithinInterval, max } from 'date-fns';
import classnames from 'classnames';
import coreStyles from '../../styles';

const dateRangeDefaultProps = {
  classNames: {},
  ranges: [],
  moveRangeOnFirstSelection: false,
  retainEndDateOnFirstSelection: false,
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  disabledDates: [],
};

const DateRange = forwardRef(function DateRange(
  {
    classNames = dateRangeDefaultProps.classNames,
    ranges = dateRangeDefaultProps.ranges,
    moveRangeOnFirstSelection = dateRangeDefaultProps.moveRangeOnFirstSelection,
    retainEndDateOnFirstSelection = dateRangeDefaultProps.retainEndDateOnFirstSelection,
    rangeColors = dateRangeDefaultProps.rangeColors,
    disabledDates = dateRangeDefaultProps.disabledDates,
    ...rest
  },
  ref
) {
  const props = useMemo(
    () => ({
      classNames,
      ranges,
      moveRangeOnFirstSelection,
      retainEndDateOnFirstSelection,
      rangeColors,
      disabledDates,
      ...rest,
    }),
    [classNames, ranges, moveRangeOnFirstSelection, retainEndDateOnFirstSelection, rangeColors, disabledDates, rest]
  );
  const calendarRef = useRef(null);
  const [focusedRangeState, setFocusedRangeState] = useState(
    () => props.initialFocusedRange || [findNextRangeIndex(props.ranges), 0]
  );
  const [preview, setPreview] = useState(null);
  const styles = useMemo(() => generateStyles([coreStyles, props.classNames]), [props.classNames]);

  const calcNewSelection = useCallback(
    (value, isSingleValue = true) => {
      const focusedRange = props.focusedRange || focusedRangeState;
      const {
        ranges,
        onChange,
        maxDate,
        moveRangeOnFirstSelection,
        retainEndDateOnFirstSelection,
        disabledDates,
      } = props;
      const focusedRangeIndex = focusedRange[0];
      const selectedRange = ranges[focusedRangeIndex];
      if (!selectedRange || !onChange) return {};
      let { startDate, endDate } = selectedRange;
      const now = new Date();
      let nextFocusRange;
      if (!isSingleValue) {
        startDate = value.startDate;
        endDate = value.endDate;
      } else if (focusedRange[1] === 0) {
        // startDate selection
        const dayOffset = differenceInCalendarDays(endDate || now, startDate);
        const calculateEndDate = () => {
          if (moveRangeOnFirstSelection) {
            return addDays(value, dayOffset);
          }
          if (retainEndDateOnFirstSelection) {
            if (!endDate || isBefore(value, endDate)) {
              return endDate;
            }
            return value;
          }
          return value || now;
        };
        startDate = value;
        endDate = calculateEndDate();
        if (maxDate) endDate = min([endDate, maxDate]);
        nextFocusRange = [focusedRange[0], 1];
      } else {
        endDate = value;
      }

      // reverse dates if startDate before endDate
      let isStartDateSelected = focusedRange[1] === 0;
      if (isBefore(endDate, startDate)) {
        isStartDateSelected = !isStartDateSelected;
        [startDate, endDate] = [endDate, startDate];
      }

      const inValidDatesWithinRange = disabledDates.filter(disabledDate =>
        isWithinInterval(disabledDate, {
          start: startDate,
          end: endDate,
        })
      );

      if (inValidDatesWithinRange.length > 0) {
        if (isStartDateSelected) {
          startDate = addDays(max(inValidDatesWithinRange), 1);
        } else {
          endDate = addDays(min(inValidDatesWithinRange), -1);
        }
      }

      if (!nextFocusRange) {
        const nextFocusRangeIndex = findNextRangeIndex(props.ranges, focusedRange[0]);
        nextFocusRange = [nextFocusRangeIndex, 0];
      }
      return {
        wasValid: !(inValidDatesWithinRange.length > 0),
        range: { startDate, endDate },
        nextFocusRange: nextFocusRange,
      };
    },
    [focusedRangeState, props]
  );

  const setSelection = useCallback(
    (value, isSingleValue) => {
      const { onChange, ranges, onRangeFocusChange } = props;
      const focusedRange = props.focusedRange || focusedRangeState;
      const focusedRangeIndex = focusedRange[0];
      const selectedRange = ranges[focusedRangeIndex];
      if (!selectedRange) return;
      const newSelection = calcNewSelection(value, isSingleValue);
      onChange({
        [selectedRange.key || `range${focusedRangeIndex + 1}`]: {
          ...selectedRange,
          ...newSelection.range,
        },
      });
      setFocusedRangeState(newSelection.nextFocusRange);
      setPreview(null);
      onRangeFocusChange && onRangeFocusChange(newSelection.nextFocusRange);
    },
    [calcNewSelection, focusedRangeState, props]
  );

  const handleRangeFocusChange = useCallback(
    focusedRange => {
      setFocusedRangeState(focusedRange);
      props.onRangeFocusChange && props.onRangeFocusChange(focusedRange);
    },
    [props]
  );

  const updatePreview = useCallback(
    val => {
      if (!val) {
        setPreview(null);
        return;
      }
      const { rangeColors, ranges } = props;
      const focusedRange = props.focusedRange || focusedRangeState;
      const color = ranges[focusedRange[0]]?.color || rangeColors[focusedRange[0]] || '#3d91ff';
      setPreview({ ...val.range, color });
    },
    [focusedRangeState, props]
  );

  useImperativeHandle(
    ref,
    () => ({
      calcNewSelection,
      updatePreview,
      focusToDate: (...args) => calendarRef.current?.focusToDate?.(...args),
      changeShownDate: (...args) => calendarRef.current?.changeShownDate?.(...args),
      updateShownDate: (...args) => calendarRef.current?.updateShownDate?.(...args),
      handleScroll: (...args) => calendarRef.current?.handleScroll?.(...args),
    }),
    [calcNewSelection, updatePreview]
  );

  return (
    <Calendar
      focusedRange={focusedRangeState}
      onRangeFocusChange={handleRangeFocusChange}
      preview={preview}
      onPreviewChange={value => {
        updatePreview(value ? calcNewSelection(value) : null);
      }}
      {...props}
      displayMode="dateRange"
      className={classnames(styles.dateRangeWrapper, props.className)}
      onChange={setSelection}
      updateRange={val => setSelection(val, false)}
      ref={calendarRef}
    />
  );
});

export default DateRange;
