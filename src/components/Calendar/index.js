import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { rangeShape } from '../DayCell';
import Month from '../Month';
import DateDisplay from '../DateDisplay';
import { calcFocusDate, generateStyles, getMonthDisplayRange } from '../../utils';
import classnames from 'classnames';
import ReactList from 'react-list';
import {
  addMonths,
  subMonths,
  format,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  addYears,
  setYear,
  setMonth,
  differenceInCalendarMonths,
  startOfMonth,
  endOfMonth,
  addDays,
  isSameMonth,
  differenceInDays,
  min,
  max,
} from 'date-fns';
import { enUS as defaultLocale } from 'date-fns/locale/en-US';
import coreStyles from '../../styles';
import { ariaLabelsShape } from '../../accessibility';

const calendarDefaultProps = {
  showMonthArrow: true,
  showMonthAndYearPickers: true,
  disabledDates: [],
  disabledDay: () => { },
  classNames: {},
  locale: defaultLocale,
  ranges: [],
  focusedRange: [0, 0],
  dateDisplayFormat: 'MMM d, yyyy',
  monthDisplayFormat: 'MMM yyyy',
  weekdayDisplayFormat: 'E',
  dayDisplayFormat: 'd',
  showDateDisplay: true,
  showPreview: true,
  displayMode: 'date',
  months: 1,
  color: '#3d91ff',
  scroll: {
    enabled: false,
  },
  direction: 'vertical',
  maxDate: addYears(new Date(), 20),
  minDate: addYears(new Date(), -100),
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  startDatePlaceholder: 'Early',
  endDatePlaceholder: 'Continuous',
  editableDateInputs: false,
  dragSelectionEnabled: true,
  fixedHeight: false,
  calendarFocus: 'forwards',
  preventSnapRefocus: false,
  ariaLabels: {},
};

const uninitializedTargetProp = Symbol('uninitializedTargetProp');

const mergeDefaultProps = props =>
  Object.keys(calendarDefaultProps).reduce(
    (mergedProps, propName) => ({
      ...mergedProps,
      [propName]: props[propName] === undefined ? calendarDefaultProps[propName] : props[propName],
    }),
    { ...props }
  );

const getDateOptions = ({ locale, weekStartsOn }) => {
  const dateOptions = { locale };
  if (weekStartsOn !== undefined) dateOptions.weekStartsOn = weekStartsOn;
  return dateOptions;
};

const getMonthNames = locale => [...Array(12).keys()].map(i => locale.localize.month(i));

const calcScrollArea = ({ direction, months, scroll }) => {
  if (!scroll.enabled) return { enabled: false };

  const longMonthHeight = scroll.longMonthHeight || scroll.monthHeight;
  if (direction === 'vertical') {
    return {
      enabled: true,
      monthHeight: scroll.monthHeight || 220,
      longMonthHeight: longMonthHeight || 260,
      calendarWidth: 'auto',
      calendarHeight: (scroll.calendarHeight || longMonthHeight || 240) * months,
    };
  }
  return {
    enabled: true,
    monthWidth: scroll.monthWidth || 332,
    calendarWidth: (scroll.calendarWidth || scroll.monthWidth || 332) * months,
    monthHeight: longMonthHeight || 300,
    calendarHeight: longMonthHeight || 300,
  };
};

const CalendarContent = React.forwardRef(function CalendarContent(props, ref) {
  const dateOptions = props._calendarDateOptions;
  const styles = props._calendarStyles;
  const monthNames = props._calendarMonthNames;
  const [focusedDate, setFocusedDate] = useState(() => calcFocusDate(null, props));
  const [drag, setDrag] = useState({
    status: false,
    range: { startDate: null, endDate: null },
    disablePreview: false,
  });
  const [previewState, setPreviewState] = useState(null);
  const focusedDateRef = useRef(focusedDate);
  const listRef = useRef(null);
  const listSizeCacheRef = useRef({});
  const isFirstRenderRef = useRef(true);
  const focusTimerRef = useRef(null);
  const focusToDateRef = useRef(null);
  const previousTargetPropRef = useRef(uninitializedTargetProp);

  useEffect(() => {
    focusedDateRef.current = focusedDate;
  }, [focusedDate]);

  const focusToDate = useCallback(
    (date, nextProps = props, preventUnnecessary = true) => {
      if (!nextProps.scroll.enabled) {
        if (preventUnnecessary && nextProps.preventSnapRefocus) {
          const focusedDateDiff = differenceInCalendarMonths(date, focusedDateRef.current);
          const isAllowedForward = nextProps.calendarFocus === 'forwards' && focusedDateDiff >= 0;
          const isAllowedBackward = nextProps.calendarFocus === 'backwards' && focusedDateDiff <= 0;
          if ((isAllowedForward || isAllowedBackward) && Math.abs(focusedDateDiff) < nextProps.months) {
            return;
          }
        }
        setFocusedDate(date);
        return;
      }

      const list = listRef.current;
      if (!list) return;
      const targetMonthIndex = differenceInCalendarMonths(date, nextProps.minDate, dateOptions);
      const visibleMonths = list.getVisibleRange();
      if (preventUnnecessary && visibleMonths.includes(targetMonthIndex)) return;
      isFirstRenderRef.current = true;
      list.scrollTo(targetMonthIndex);
      if (typeof list.updateFrameAndClearCache === 'function') {
        list.updateFrameAndClearCache();
      }
      setFocusedDate(date);
    },
    [dateOptions, props]
  );

  useEffect(() => {
    focusToDateRef.current = focusToDate;
  }, [focusToDate]);

  useEffect(() => {
    if (!props.scroll.enabled) return undefined;
    focusTimerRef.current = setTimeout(() => focusToDateRef.current(focusedDateRef.current));
    return () => {
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
        focusTimerRef.current = null;
      }
    };
  }, [props.scroll.enabled]);

  const updateShownDate = useCallback(
    (nextProps = props) => {
      const list = listRef.current;
      const nextFocusProps = nextProps.scroll.enabled
        ? {
          ...nextProps,
          months: list ? list.getVisibleRange().length : nextProps.months,
        }
        : nextProps;
      const newFocus = calcFocusDate(focusedDateRef.current, nextFocusProps);
      focusToDate(newFocus, nextFocusProps);
    },
    [focusToDate, props]
  );

  const handleScroll = useCallback(() => {
    const { onShownDateChange, minDate } = props;
    const list = listRef.current;
    if (!list) return;
    if (typeof list.updateFrameAndClearCache === 'function') {
      list.updateFrameAndClearCache();
    }
    const visibleMonths = list.getVisibleRange();
    if (visibleMonths[0] === undefined) return;
    const visibleMonth = addMonths(minDate, visibleMonths[0] || 0);
    const isFocusedToDifferent = !isSameMonth(visibleMonth, focusedDateRef.current);
    if (isFocusedToDifferent && !isFirstRenderRef.current) {
      setFocusedDate(visibleMonth);
      onShownDateChange && onShownDateChange(visibleMonth);
    }
    isFirstRenderRef.current = false;
  }, [props]);

  const estimateMonthSize = useCallback(
    (index, cache) => {
      const { direction, minDate, _calendarScrollArea: scrollArea } = props;
      if (cache) {
        listSizeCacheRef.current = cache;
        if (cache[index]) return cache[index];
      }
      if (direction === 'horizontal') return scrollArea.monthWidth;
      const monthStep = addMonths(minDate, index);
      const { start, end } = getMonthDisplayRange(monthStep, dateOptions);
      const isLongMonth = differenceInDays(end, start, dateOptions) + 1 > 7 * 5;
      return isLongMonth ? scrollArea.longMonthHeight : scrollArea.monthHeight;
    },
    [dateOptions, props]
  );

  useEffect(() => {
    const propMapper = {
      dateRange: 'ranges',
      date: 'date',
    };
    const targetProp = propMapper[props.displayMode];
    const targetValue = props[targetProp];
    if (previousTargetPropRef.current === uninitializedTargetProp) {
      previousTargetPropRef.current = targetValue;
      return;
    }
    if (previousTargetPropRef.current !== targetValue) {
      previousTargetPropRef.current = targetValue;
      updateShownDate(props);
    }
  }, [props.date, props.displayMode, props.ranges, updateShownDate, props]);

  const changeShownDate = useCallback(
    (value, mode = 'set') => {
      const { onShownDateChange, minDate, maxDate } = props;
      const modeMapper = {
        monthOffset: () => addMonths(focusedDateRef.current, value),
        setMonth: () => setMonth(focusedDateRef.current, value),
        setYear: () => setYear(focusedDateRef.current, value),
        set: () => value,
      };

      const newDate = min([max([modeMapper[mode](), minDate]), maxDate]);
      focusToDate(newDate, props, false);
      onShownDateChange && onShownDateChange(newDate);
    },
    [focusToDate, props]
  );

  const handleRangeFocusChange = useCallback(
    (rangesIndex, rangeItemIndex) => {
      props.onRangeFocusChange && props.onRangeFocusChange([rangesIndex, rangeItemIndex]);
    },
    [props]
  );

  const updatePreview = useCallback(
    val => {
      if (!val) {
        setPreviewState(null);
        return;
      }
      setPreviewState({
        startDate: val,
        endDate: val,
        color: props.color,
      });
    },
    [props.color]
  );

  const onDragSelectionStart = useCallback(
    date => {
      const { onChange, dragSelectionEnabled } = props;

      if (dragSelectionEnabled) {
        setDrag({
          status: true,
          range: { startDate: date, endDate: date },
          disablePreview: true,
        });
      } else {
        onChange && onChange(date);
      }
    },
    [props]
  );

  const onDragSelectionEnd = useCallback(
    date => {
      const { updateRange, displayMode, onChange, dragSelectionEnabled } = props;

      if (!dragSelectionEnabled) return;

      if (displayMode === 'date' || !drag.status) {
        onChange && onChange(date);
        return;
      }
      const newRange = {
        startDate: drag.range.startDate,
        endDate: date,
      };
      if (displayMode !== 'dateRange' || isSameDay(newRange.startDate, date)) {
        setDrag({ status: false, range: {} });
        onChange && onChange(date);
      } else {
        setDrag({ status: false, range: {} });
        updateRange && updateRange(newRange);
      }
    },
    [drag, props]
  );

  const onDragSelectionMove = useCallback(
    date => {
      if (!drag.status || !props.dragSelectionEnabled) return;
      setDrag({
        status: drag.status,
        range: { startDate: drag.range.startDate, endDate: date },
        disablePreview: true,
      });
    },
    [drag, props.dragSelectionEnabled]
  );

  useImperativeHandle(
    ref,
    () => ({
      focusToDate,
      changeShownDate,
      updateShownDate,
      handleScroll,
    }),
    [changeShownDate, focusToDate, handleScroll, updateShownDate]
  );

  const renderMonthAndYear = useCallback(
    (date, changeDate, calendarProps) => {
      const { showMonthArrow, minDate, maxDate, showMonthAndYearPickers, ariaLabels } = calendarProps;
      const upperYearLimit = (maxDate || Calendar.defaultProps.maxDate).getFullYear();
      const lowerYearLimit = (minDate || Calendar.defaultProps.minDate).getFullYear();
      return (
        <div onMouseUp={e => e.stopPropagation()} className={styles.monthAndYearWrapper}>
          {showMonthArrow ? (
            <button
              type="button"
              className={classnames(styles.nextPrevButton, styles.prevButton)}
              onClick={() => changeDate(-1, 'monthOffset')}
              aria-label={ariaLabels.prevButton}>
              <i />
            </button>
          ) : null}
          {showMonthAndYearPickers ? (
            <span className={styles.monthAndYearPickers}>
              <span className={styles.monthPicker}>
                <select
                  value={date.getMonth()}
                  onChange={e => changeDate(e.target.value, 'setMonth')}
                  aria-label={ariaLabels.monthPicker}>
                  {monthNames.map((monthName, i) => (
                    <option key={i} value={i}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </span>
              <span className={styles.monthAndYearDivider} />
              <span className={styles.yearPicker}>
                <select
                  value={date.getFullYear()}
                  onChange={e => changeDate(e.target.value, 'setYear')}
                  aria-label={ariaLabels.yearPicker}>
                  {new Array(upperYearLimit - lowerYearLimit + 1)
                    .fill(upperYearLimit)
                    .map((val, i) => {
                      const year = val - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                </select>
              </span>
            </span>
          ) : (
            <span className={styles.monthAndYearPickers}>
              {monthNames[date.getMonth()]} {date.getFullYear()}
            </span>
          )}
          {showMonthArrow ? (
            <button
              type="button"
              className={classnames(styles.nextPrevButton, styles.nextButton)}
              onClick={() => changeDate(+1, 'monthOffset')}
              aria-label={ariaLabels.nextButton}>
              <i />
            </button>
          ) : null}
        </div>
      );
    },
    [monthNames, styles]
  );

  const renderDateDisplay = () => {
    const {
      focusedRange,
      color,
      ranges,
      rangeColors,
      dateDisplayFormat,
      editableDateInputs,
      startDatePlaceholder,
      endDatePlaceholder,
      ariaLabels,
      minDate,
      maxDate,
      disabledDates,
    } = props;

    return (
      <DateDisplay
        focusedRange={focusedRange}
        color={color}
        ranges={ranges}
        rangeColors={rangeColors}
        dateDisplayFormat={dateDisplayFormat}
        editableDateInputs={editableDateInputs}
        startDatePlaceholder={startDatePlaceholder}
        endDatePlaceholder={endDatePlaceholder}
        ariaLabels={ariaLabels}
        minDate={minDate}
        maxDate={maxDate}
        disabledDates={disabledDates}
        styles={styles}
        dateOptions={dateOptions}
        onChange={onDragSelectionEnd}
        onRangeFocusChange={handleRangeFocusChange}
      />
    );
  };

  const {
    showDateDisplay,
    onPreviewChange,
    scroll,
    direction,
    disabledDates,
    disabledDay,
    maxDate,
    minDate,
    rangeColors,
    color,
    navigatorRenderer,
    className,
    preview,
    _calendarScrollArea: scrollArea,
  } = props;
  const isVertical = direction === 'vertical';
  const monthAndYearRenderer = navigatorRenderer || renderMonthAndYear;
  const ranges = props.ranges.map((range, i) => ({
    ...range,
    color: range.color || rangeColors[i] || color,
  }));

  return (
    <div
      className={classnames(styles.calendarWrapper, className)}
      onMouseUp={() => setDrag({ status: false, range: {} })}
      onMouseLeave={() => {
        setDrag({ status: false, range: {} });
      }}>
      {showDateDisplay && renderDateDisplay()}
      {monthAndYearRenderer(focusedDate, changeShownDate, props)}
      {scroll.enabled ? (
        <div>
          {isVertical && (
            <div className={styles.weekDays}>
              {eachDayOfInterval({
                start: startOfWeek(new Date(), dateOptions),
                end: endOfWeek(new Date(), dateOptions),
              }).map((day, i) => (
                <span className={styles.weekDay} key={i}>
                  {format(day, props.weekdayDisplayFormat, dateOptions)}
                </span>
              ))}
            </div>
          )}
          <div
            className={classnames(
              styles.infiniteMonths,
              isVertical ? styles.monthsVertical : styles.monthsHorizontal
            )}
            onMouseLeave={() => onPreviewChange && onPreviewChange()}
            style={{
              width: scrollArea.calendarWidth + 11,
              height: scrollArea.calendarHeight + 11,
            }}
            onScroll={handleScroll}>
            <ReactList
              length={differenceInCalendarMonths(
                endOfMonth(maxDate),
                addDays(startOfMonth(minDate), -1),
                dateOptions
              )}
              treshold={500}
              type="variable"
              ref={target => (listRef.current = target)}
              itemSizeEstimator={estimateMonthSize}
              axis={isVertical ? 'y' : 'x'}
              itemRenderer={(index, key) => {
                const monthStep = addMonths(minDate, index);
                return (
                  <Month
                    {...props}
                    onPreviewChange={onPreviewChange || updatePreview}
                    preview={preview || previewState}
                    ranges={ranges}
                    key={key}
                    drag={drag}
                    dateOptions={dateOptions}
                    disabledDates={disabledDates}
                    disabledDay={disabledDay}
                    month={monthStep}
                    onDragSelectionStart={onDragSelectionStart}
                    onDragSelectionEnd={onDragSelectionEnd}
                    onDragSelectionMove={onDragSelectionMove}
                    onMouseLeave={() => onPreviewChange && onPreviewChange()}
                    styles={styles}
                    style={
                      isVertical
                        ? { height: estimateMonthSize(index) }
                        : { height: scrollArea.monthHeight, width: estimateMonthSize(index) }
                    }
                    showMonthName
                    showWeekDays={!isVertical}
                  />
                );
              }}
            />
          </div>
        </div>
      ) : (
        <div
          className={classnames(
            styles.months,
            isVertical ? styles.monthsVertical : styles.monthsHorizontal
          )}>
          {new Array(props.months).fill(null).map((_, i) => {
            let monthStep = addMonths(focusedDate, i);
            if (props.calendarFocus === 'backwards') {
              monthStep = subMonths(focusedDate, props.months - 1 - i);
            }
            return (
              <Month
                {...props}
                onPreviewChange={onPreviewChange || updatePreview}
                preview={preview || previewState}
                ranges={ranges}
                key={i}
                drag={drag}
                dateOptions={dateOptions}
                disabledDates={disabledDates}
                disabledDay={disabledDay}
                month={monthStep}
                onDragSelectionStart={onDragSelectionStart}
                onDragSelectionEnd={onDragSelectionEnd}
                onDragSelectionMove={onDragSelectionMove}
                onMouseLeave={() => onPreviewChange && onPreviewChange()}
                styles={styles}
                showWeekDays={!isVertical || i === 0}
                showMonthName={!isVertical || i > 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

const ForwardedCalendar = React.forwardRef(function Calendar(props, ref) {
  const resolvedProps = mergeDefaultProps(props);
  const dateOptions = useMemo(
    () => getDateOptions(resolvedProps),
    [resolvedProps.locale, resolvedProps.weekStartsOn]
  );
  const styles = useMemo(
    () => generateStyles([coreStyles, resolvedProps.classNames]),
    [resolvedProps.classNames]
  );
  const monthNames = useMemo(() => getMonthNames(resolvedProps.locale), [resolvedProps.locale]);
  const scrollArea = useMemo(
    () => calcScrollArea(resolvedProps),
    [resolvedProps.direction, resolvedProps.months, resolvedProps.scroll]
  );

  return (
    <CalendarContent
      {...resolvedProps}
      _calendarDateOptions={dateOptions}
      _calendarStyles={styles}
      _calendarMonthNames={monthNames}
      _calendarScrollArea={scrollArea}
      ref={ref}
    />
  );
});

const Calendar = ForwardedCalendar;

Calendar.defaultProps = calendarDefaultProps;

Calendar.propTypes = {
  showMonthArrow: PropTypes.bool,
  showMonthAndYearPickers: PropTypes.bool,
  disabledDates: PropTypes.array,
  disabledDay: PropTypes.func,
  minDate: PropTypes.object,
  maxDate: PropTypes.object,
  date: PropTypes.object,
  onChange: PropTypes.func,
  onPreviewChange: PropTypes.func,
  onRangeFocusChange: PropTypes.func,
  classNames: PropTypes.object,
  locale: PropTypes.object,
  shownDate: PropTypes.object,
  onShownDateChange: PropTypes.func,
  ranges: PropTypes.arrayOf(rangeShape),
  preview: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    color: PropTypes.string,
  }),
  dateDisplayFormat: PropTypes.string,
  monthDisplayFormat: PropTypes.string,
  weekdayDisplayFormat: PropTypes.string,
  weekStartsOn: PropTypes.number,
  dayDisplayFormat: PropTypes.string,
  focusedRange: PropTypes.arrayOf(PropTypes.number),
  initialFocusedRange: PropTypes.arrayOf(PropTypes.number),
  months: PropTypes.number,
  className: PropTypes.string,
  showDateDisplay: PropTypes.bool,
  showPreview: PropTypes.bool,
  displayMode: PropTypes.oneOf(['dateRange', 'date']),
  color: PropTypes.string,
  updateRange: PropTypes.func,
  scroll: PropTypes.shape({
    enabled: PropTypes.bool,
    monthHeight: PropTypes.number,
    longMonthHeight: PropTypes.number,
    monthWidth: PropTypes.number,
    calendarWidth: PropTypes.number,
    calendarHeight: PropTypes.number,
  }),
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  startDatePlaceholder: PropTypes.string,
  endDatePlaceholder: PropTypes.string,
  navigatorRenderer: PropTypes.func,
  rangeColors: PropTypes.arrayOf(PropTypes.string),
  editableDateInputs: PropTypes.bool,
  dragSelectionEnabled: PropTypes.bool,
  fixedHeight: PropTypes.bool,
  calendarFocus: PropTypes.string,
  preventSnapRefocus: PropTypes.bool,
  ariaLabels: ariaLabelsShape,
};

export default Calendar;
