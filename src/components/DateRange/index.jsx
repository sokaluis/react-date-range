import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Calendar from '../Calendar';
import { findNextRangeIndex, generateStyles } from '../../utils';
import { format, isBefore, differenceInCalendarDays, addDays, min, isWithinInterval, max } from 'date-fns';
import classnames from 'classnames';
import coreStyles from '../../styles';

// REQ-UBF-003 / #607: frozen empty array preserves referential equality across renders
// so downstream useMemo/useCallback deps remain stable when disabledDates is non-array.
const EMPTY_DATES = Object.freeze([]);

const dateRangeDefaultProps = {
  classNames: {},
  ranges: [],
  moveRangeOnFirstSelection: false,
  retainEndDateOnFirstSelection: false,
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  disabledDates: [],
};

const resolveSelectedDisplay = (selectedDisplay, dateDisplayFormat) => ({
  format: selectedDisplay?.format || dateDisplayFormat,
  placement: selectedDisplay?.placement || 'top',
  separator: selectedDisplay?.separator ?? '',
});

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
  // REQ-UBF-003 / #607: normalize disabledDates to a guaranteed non-null array.
  // The frozen EMPTY_DATES constant preserves referential stability for downstream
  // useMemo/useCallback deps. This mirrors the Calendar/ForwardedCalendar pattern.
  const safeDisabledDates = Array.isArray(disabledDates) ? disabledDates : EMPTY_DATES;

  const props = useMemo(
    () => {
      const resolvedSelectedDisplay = resolveSelectedDisplay(rest.selectedDisplay, rest.dateDisplayFormat);

      return ({
      classNames,
      ranges,
      moveRangeOnFirstSelection,
      retainEndDateOnFirstSelection,
      rangeColors,
      disabledDates: safeDisabledDates,
      ...rest,
      selectedDisplay: resolvedSelectedDisplay,
    });
    },
    [classNames, ranges, moveRangeOnFirstSelection, retainEndDateOnFirstSelection, rangeColors, safeDisabledDates, rest]
  );

  /**
   * Scroll guard: virtual scrolling makes neighbour-month cells unreachable via
   * standard scroll; suppressing selectablePassive keeps them visually/physically
   * passive and keyboard-inert while scroll is active.
   */
  const effectiveSelectablePassive = !!rest.selectablePassive && !rest.scroll?.enabled;

  const calendarRef = useRef(null);
  const [focusedRangeState, setFocusedRangeState] = useState(
    () => props.initialFocusedRange || [findNextRangeIndex(props.ranges), 0]
  );
  const [preview, setPreview] = useState(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
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
      const { startDate, endDate } = newSelection.range;
      const liveFormatter = props.ariaLabels?.liveRegionSelection;
      setLiveAnnouncement(
        liveFormatter
          ? liveFormatter({ startDate, endDate })
          : `Selected ${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`
      );
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
    <>
      <Calendar
        focusedRange={focusedRangeState}
        onRangeFocusChange={handleRangeFocusChange}
        preview={preview}
        onPreviewChange={value => {
          updatePreview(value ? calcNewSelection(value) : null);
        }}
        {...props}
        selectablePassive={effectiveSelectablePassive}
        displayMode="dateRange"
        className={classnames(styles.dateRangeWrapper, props.className)}
        onChange={setSelection}
        updateRange={val => setSelection(val, false)}
        ref={calendarRef}
      />
      <div aria-live="polite" aria-atomic="true" className={classnames(styles.liveRegion)}>
        {liveAnnouncement}
      </div>
    </>
  );
});

export default DateRange;
