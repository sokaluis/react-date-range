import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import Month from '../Month';
import DateDisplay from '../DateDisplay';
import { calcFocusDate, generateStyles, getMonthDisplayRange } from '../../utils';
import classnames from 'classnames';
import { useVirtualizer } from '@tanstack/react-virtual';
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
  subYears,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { enUS as defaultLocale } from 'date-fns/locale/en-US';
import coreStyles from '../../styles';

// REQ-UBF-003: frozen empty array preserves referential equality across renders
// so downstream useMemo/useCallback deps remain stable when disabledDates is non-array.
const EMPTY_DATES = Object.freeze([]);

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
  /** Opt-in: neighbour-month filler cells become selectable when scroll is disabled. */
  selectablePassive: false,
};

const uninitializedTargetProp = Symbol('uninitializedTargetProp');

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
  const ariaLabels = props.ariaLabels || {};
  const [focusedDate, setFocusedDate] = useState(() => calcFocusDate(null, props));
  const [drag, setDrag] = useState({
    status: false,
    range: { startDate: null, endDate: null },
    disablePreview: false,
  });
  const [previewState, setPreviewState] = useState(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const focusedDateRef = useRef(focusedDate);
  const scrollContainerRef = useRef(null);
  const listRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  const calendarWrapperRef = useRef(null);
  const focusTimerRef = useRef(null);
  const focusToDateRef = useRef(null);
  const previousTargetPropRef = useRef(uninitializedTargetProp);

  useEffect(() => {
    focusedDateRef.current = focusedDate;
  }, [focusedDate]);

  const estimateMonthSize = useCallback(
    index => {
      const { direction, minDate, _calendarScrollArea: scrollArea } = props;
      if (direction === 'horizontal') return scrollArea.monthWidth;
      const monthStep = addMonths(minDate, index);
      const { start, end } = getMonthDisplayRange(monthStep, dateOptions, props.fixedHeight);
      const isLongMonth = differenceInDays(end, start, dateOptions) + 1 > 7 * 5;
      return isLongMonth ? scrollArea.longMonthHeight : scrollArea.monthHeight;
    },
    [dateOptions, props]
  );

  const monthCount = useMemo(
    () =>
      props.scroll.enabled
        ? differenceInCalendarMonths(
          endOfMonth(props.maxDate),
          addDays(startOfMonth(props.minDate), -1),
          dateOptions
        )
        : 0,
    [dateOptions, props.maxDate, props.minDate, props.scroll.enabled]
  );

  const monthVirtualizer = useVirtualizer({
    count: monthCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: estimateMonthSize,
    horizontal: props.direction === 'horizontal',
    overscan: 2,
  });

  useEffect(() => {
    listRef.current = {
      getVisibleRange: () => monthVirtualizer.getVirtualItems().map(item => item.index),
      scrollTo: index => monthVirtualizer.scrollToIndex(index),
      updateFrameAndClearCache: () => {
        if (typeof monthVirtualizer.measure === 'function') {
          monthVirtualizer.measure();
        }
      },
    };
  }, [monthVirtualizer]);

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

  const announceShownDate = useCallback(
    date => {
      const formatter = ariaLabels.liveRegionMonthYear;
      setLiveAnnouncement(
        formatter
          ? formatter(date)
          : `Now showing ${format(date, 'MMMM yyyy', dateOptions)}`
      );
    },
    [ariaLabels.liveRegionMonthYear, dateOptions]
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
      if (mode === 'setMonth' || mode === 'setYear' || mode === 'monthOffset') {
        announceShownDate(newDate);
      }
    },
    [announceShownDate, focusToDate, props]
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

  // REQ-CG-005: keyboard navigation on calendar day cells
  const handleCalendarKeyDown = useCallback(
    (e) => {
      const activeEl = document.activeElement;
      if (!activeEl || !activeEl.dataset.date) return;

      const currentDate = new Date(activeEl.dataset.date);
      if (isNaN(currentDate.getTime())) return;

      let newDate;
      switch (e.key) {
        case 'ArrowLeft':
          newDate = addDays(currentDate, -1);
          break;
        case 'ArrowRight':
          newDate = addDays(currentDate, 1);
          break;
        case 'ArrowUp':
          newDate = addDays(currentDate, -7);
          break;
        case 'ArrowDown':
          newDate = addDays(currentDate, 7);
          break;
        case 'PageUp':
          newDate = e.shiftKey ? subYears(currentDate, 1) : subMonths(currentDate, 1);
          break;
        case 'PageDown':
          newDate = e.shiftKey ? addYears(currentDate, 1) : addMonths(currentDate, 1);
          break;
        default:
          return;
      }

      e.preventDefault();
      e.stopPropagation();

      // Clamp to minDate / maxDate
      const minDay = props.minDate ? startOfDay(props.minDate) : null;
      const maxDay = props.maxDate ? endOfDay(props.maxDate) : null;
      if (minDay && isBefore(startOfDay(newDate), minDay)) newDate = minDay;
      if (maxDay && isAfter(endOfDay(newDate), maxDay)) newDate = startOfDay(maxDay);

      // Query within the calendar wrapper to isolate from other calendars on the page
      const wrapper = calendarWrapperRef.current;
      if (wrapper) {
        const targetButton = wrapper.querySelector(
          `button[data-date="${newDate.toISOString()}"]`
        );
        if (targetButton && targetButton.tabIndex !== -1) {
          targetButton.focus();
        }
      }
    },
    [props.minDate, props.maxDate]
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
      const upperYearLimit = maxDate.getFullYear();
      const lowerYearLimit = minDate.getFullYear();
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
    dir,
    disabledDates,
    disabledDay,
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
  const virtualMonths = scroll.enabled ? monthVirtualizer.getVirtualItems() : [];
  const virtualSizeStyle = isVertical
    ? { height: monthVirtualizer.getTotalSize(), width: '100%', position: 'relative' }
    : { width: monthVirtualizer.getTotalSize(), height: '100%', position: 'relative' };

  return (
    <div
      ref={calendarWrapperRef}
      dir={dir}
      className={classnames(
        styles.calendarWrapper,
        dir === 'rtl' && (props.classNames?.rtl ?? styles.rtl),
        className
      )}
      onKeyDown={handleCalendarKeyDown}
      onMouseUp={() => setDrag({ status: false, range: {} })}
      onMouseLeave={() => {
        setDrag({ status: false, range: {} });
      }}>
      {showDateDisplay && renderDateDisplay()}
      {monthAndYearRenderer(focusedDate, changeShownDate, props)}
      <div aria-live="polite" aria-atomic="true" className={styles.liveRegion}>
        {liveAnnouncement}
      </div>
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
            ref={scrollContainerRef}
            onScroll={handleScroll}>
            <div style={virtualSizeStyle}>
              {virtualMonths.map(virtualMonth => {
                const monthStep = addMonths(minDate, virtualMonth.index);
                const itemStyle = {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: isVertical
                    ? `translateY(${virtualMonth.start}px)`
                    : `translateX(${virtualMonth.start}px)`,
                };
                return (
                  <div
                    key={virtualMonth.key ?? virtualMonth.index}
                    style={
                      isVertical
                        ? { ...itemStyle, height: virtualMonth.size, width: '100%' }
                        : { ...itemStyle, width: virtualMonth.size, height: '100%' }
                    }>
                  <Month
                    {...props}
                    onPreviewChange={onPreviewChange || updatePreview}
                    preview={preview || previewState}
                    ranges={ranges}
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
                        ? { height: estimateMonthSize(virtualMonth.index) }
                        : { height: scrollArea.monthHeight, width: estimateMonthSize(virtualMonth.index) }
                    }
                    showMonthName
                    showWeekDays={!isVertical}
                  />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div
          role="grid"
          aria-label={ariaLabels.calendar || 'Calendar'}
          aria-roledescription={ariaLabels.calendarRoleDescription || 'month grid'}
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

const ForwardedCalendar = React.forwardRef(function Calendar(
  {
    showMonthArrow = calendarDefaultProps.showMonthArrow,
    showMonthAndYearPickers = calendarDefaultProps.showMonthAndYearPickers,
    disabledDates = calendarDefaultProps.disabledDates,
    disabledDay = calendarDefaultProps.disabledDay,
    classNames = calendarDefaultProps.classNames,
    locale = calendarDefaultProps.locale,
    ranges = calendarDefaultProps.ranges,
    focusedRange = calendarDefaultProps.focusedRange,
    dateDisplayFormat = calendarDefaultProps.dateDisplayFormat,
    monthDisplayFormat = calendarDefaultProps.monthDisplayFormat,
    weekdayDisplayFormat = calendarDefaultProps.weekdayDisplayFormat,
    dayDisplayFormat = calendarDefaultProps.dayDisplayFormat,
    showDateDisplay = calendarDefaultProps.showDateDisplay,
    showPreview = calendarDefaultProps.showPreview,
    displayMode = calendarDefaultProps.displayMode,
    months = calendarDefaultProps.months,
    color = calendarDefaultProps.color,
    scroll = calendarDefaultProps.scroll,
    direction = calendarDefaultProps.direction,
    maxDate = calendarDefaultProps.maxDate,
    minDate = calendarDefaultProps.minDate,
    rangeColors = calendarDefaultProps.rangeColors,
    startDatePlaceholder = calendarDefaultProps.startDatePlaceholder,
    endDatePlaceholder = calendarDefaultProps.endDatePlaceholder,
    editableDateInputs = calendarDefaultProps.editableDateInputs,
    dragSelectionEnabled = calendarDefaultProps.dragSelectionEnabled,
    fixedHeight = calendarDefaultProps.fixedHeight,
    calendarFocus = calendarDefaultProps.calendarFocus,
    preventSnapRefocus = calendarDefaultProps.preventSnapRefocus,
    ariaLabels = calendarDefaultProps.ariaLabels,
    selectablePassive = calendarDefaultProps.selectablePassive,
    ...rest
  },
  ref
) {
  // REQ-UBF-003: normalize disabledDates to a guaranteed non-null array.
  // The frozen EMPTY_DATES constant preserves referential stability for
  // downstream useMemo / useCallback deps. This guard covers Month:93,
  // DateRange:98, DateInput:59, and DateDisplay via resolvedProps.
  const safeDisabledDates = Array.isArray(disabledDates) ? disabledDates : EMPTY_DATES;

  // Scroll-enabled mode suppresses selectablePassive — passive cells must stay
  // visually passive and keyboard-inert when virtual scrolling is active.
  /** Holds the resolved value: true only when prop=true AND scroll is disabled. */
  const effectiveSelectablePassive = !!selectablePassive && !scroll.enabled;

  const resolvedProps = {
    showMonthArrow,
    showMonthAndYearPickers,
    disabledDates: safeDisabledDates,
    disabledDay,
    classNames,
    locale,
    ranges,
    focusedRange,
    dateDisplayFormat,
    monthDisplayFormat,
    weekdayDisplayFormat,
    dayDisplayFormat,
    showDateDisplay,
    showPreview,
    displayMode,
    months,
    color,
    scroll,
    selectablePassive: effectiveSelectablePassive,
    direction,
    maxDate,
    minDate,
    rangeColors,
    startDatePlaceholder,
    endDatePlaceholder,
    editableDateInputs,
    dragSelectionEnabled,
    fixedHeight,
    calendarFocus,
    preventSnapRefocus,
    ariaLabels,
    ...rest,
  };
  const dateOptions = useMemo(
    () => getDateOptions({ locale: resolvedProps.locale, weekStartsOn: resolvedProps.weekStartsOn }),
    [resolvedProps.locale, resolvedProps.weekStartsOn]
  );
  const styles = useMemo(
    () => generateStyles([coreStyles, resolvedProps.classNames]),
    [resolvedProps.classNames]
  );
  const monthNames = useMemo(() => getMonthNames(resolvedProps.locale), [resolvedProps.locale]);
  const scrollArea = useMemo(
    () => calcScrollArea({ direction: resolvedProps.direction, months: resolvedProps.months, scroll: resolvedProps.scroll }),
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

export default Calendar;
