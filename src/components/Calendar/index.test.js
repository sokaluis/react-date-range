import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Calendar from '../Calendar/index.jsx';
import DateDisplay from '../DateDisplay/index.jsx';
import { isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { es } from 'date-fns/locale/es';

let mockVirtualizerInstance;
let mockDateDisplayProps;

jest.mock('@tanstack/react-virtual', () => {
  const React = require('react');

  const buildVirtualItems = visibleRange =>
    visibleRange.map(index => ({ index, key: index, start: index * 240, size: 240 }));

  const useVirtualizer = options => {
    const [visibleRange, setVisibleRange] = React.useState([0, 1]);
    const visibleRangeRef = React.useRef(visibleRange);
    visibleRangeRef.current = visibleRange;

    const instance = React.useMemo(
      () => ({
        getTotalSize: () => options.count * 240,
        getVirtualItems: () => buildVirtualItems(visibleRangeRef.current),
        scrollToIndex: index => setVisibleRange([index, index + 1]),
        measure: jest.fn(),
        setVisibleRange,
      }),
      [options.count]
    );

    mockVirtualizerInstance = instance;
    return instance;
  };

  return { useVirtualizer };
}, { virtual: true });

jest.mock('../DateDisplay/index.jsx', () => {
  const DateDisplayMock = props => {
    mockDateDisplayProps = props;
    return <div data-testid="date-display" />;
  };
  DateDisplayMock.displayName = 'DateDisplayMock';
  return { __esModule: true, default: DateDisplayMock };
});

const selectionRange = {
  startDate: new Date(2025, 5, 10),
  endDate: new Date(2025, 5, 12),
  key: 'selection',
};

const baseProps = {
  showMonthArrow: true,
  showMonthAndYearPickers: true,
  disabledDates: [],
  disabledDay: () => {},
  classNames: {},
  locale: enUS,
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
  scroll: { enabled: false },
  direction: 'vertical',
  maxDate: new Date(2090, 0, 1),
  minDate: new Date(1925, 0, 1),
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  startDatePlaceholder: 'Early',
  endDatePlaceholder: 'Continuous',
  editableDateInputs: false,
  dragSelectionEnabled: true,
  fixedHeight: false,
  calendarFocus: 'forwards',
  preventSnapRefocus: false,
  ariaLabels: {},
  shownDate: new Date(2025, 5, 15),
  minDate: new Date(2025, 0, 1),
  maxDate: new Date(2025, 11, 31),
  ranges: [selectionRange],
  scroll: { enabled: false },
  showDateDisplay: false,
  locale: enUS,
  ariaLabels: {
    prevButton: 'Previous month',
    nextButton: 'Next month',
    monthPicker: 'Month',
    yearPicker: 'Year',
  },
};

const renderCalendar = props => {
  mockDateDisplayProps = undefined;
  mockVirtualizerInstance = undefined;
  return render(<Calendar {...baseProps} {...props} />);
};

const rerenderCalendar = (view, props) => {
  mockDateDisplayProps = undefined;
  view.rerender(<Calendar {...baseProps} {...props} />);
};

const findButtonByLabel = label => screen.getByRole('button', { name: label });

const findSelectByLabel = label => screen.getByLabelText(label);

const selectOptionTexts = select => Array.from(select.options).map(option => option.textContent);

const visibleMonthLabels = container =>
  Array.from(container.querySelectorAll('.rdrMonthName')).map(node => node.textContent);

const weekdayLabels = container =>
  Array.from(container.querySelectorAll('.rdrWeekDay')).map(node => node.textContent);

const calendarDayButtons = () =>
  screen
    .getAllByRole('gridcell')
    .filter(button => /^\d+$/.test(button.textContent));

const dayButtons = () => calendarDayButtons().filter(button => button.tabIndex !== -1);

const findDayButton = dayNumber => dayButtons().find(button => button.textContent === String(dayNumber));

const findCalendarDayButton = dayNumber =>
  calendarDayButtons().find(button => button.textContent === String(dayNumber));

const findLiveRegion = container => container.querySelector('.rdrLiveRegion');

const expectSameDay = (actual, expected) => {
  expect(isSameDay(actual, expected)).toBe(true);
};

describe('Calendar', () => {
  test('Should resolve', () => {
    expect(Calendar).toEqual(expect.anything());
  });

  describe('forwardRef scaffold and metadata', () => {
    test('exports a forwardRef component without static defaultProps', () => {
      expect(Calendar.$$typeof).toBe(Symbol.for('react.forward_ref'));
      expect(Calendar.defaultProps).toBeUndefined();
      // ariaLabels defaults are observable through rendering
      renderCalendar();
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
      expect(screen.getByLabelText('Month')).toBeInTheDocument();
      expect(screen.getByLabelText('Year')).toBeInTheDocument();
    });

    test('forwards refs to the compatibility instance seam', () => {
      const calendarRef = React.createRef();

      renderCalendar({ ref: calendarRef });

      expect(calendarRef.current.focusToDate).toEqual(expect.any(Function));
      expect(calendarRef.current.updateShownDate).toEqual(expect.any(Function));
    });

    test('non-scroll ref exposes calendar actions without leaking class instance state', () => {
      const calendarRef = React.createRef();

      renderCalendar({ ref: calendarRef, scroll: { enabled: false } });

      expect(calendarRef.current.focusToDate).toEqual(expect.any(Function));
      expect(calendarRef.current.changeShownDate).toEqual(expect.any(Function));
      expect(calendarRef.current.updateShownDate).toEqual(expect.any(Function));
      expect(calendarRef.current.setState).toBeUndefined();
    });
  });

  describe('rendered navigation and shown-date behavior', () => {
    test('renders one polite atomic live region outside rendered month content', () => {
      const { container } = renderCalendar({
        scroll: { enabled: true, monthHeight: 240, longMonthHeight: 280, calendarHeight: 420 },
        minDate: new Date(2025, 0, 1),
        maxDate: new Date(2025, 11, 31),
        shownDate: new Date(2025, 5, 15),
      });

      const liveRegions = container.querySelectorAll('.rdrLiveRegion');

      expect(liveRegions).toHaveLength(1);
      expect(liveRegions[0]).toHaveAttribute('aria-live', 'polite');
      expect(liveRegions[0]).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegions[0].closest('.rdrMonth')).toBeNull();
      expect(liveRegions[0].closest('.rdrInfiniteMonths')).toBeNull();
    });

    test('previous and next arrows update visible month and report clamped shown dates', () => {
      const onShownDateChange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 6, 31),
        onShownDateChange,
      });

      fireEvent.click(findButtonByLabel('Previous month'));

      expect(findSelectByLabel('Month')).toHaveValue('5');
      expectSameDay(onShownDateChange.mock.calls[0][0], new Date(2025, 5, 1));

      fireEvent.click(findButtonByLabel('Next month'));

      expect(findSelectByLabel('Month')).toHaveValue('6');
      expectSameDay(onShownDateChange.mock.calls[1][0], new Date(2025, 6, 1));
    });

    test('navigation arrows announce committed shown month and year', () => {
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 6, 31),
      });

      fireEvent.click(findButtonByLabel('Previous month'));

      expect(findLiveRegion(container)).toHaveTextContent('Now showing June 2025');

      fireEvent.click(findButtonByLabel('Next month'));

      expect(findLiveRegion(container)).toHaveTextContent('Now showing July 2025');
    });

    test('month and year pickers update visible values and report selected dates', () => {
      const onShownDateChange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
        onShownDateChange,
      });

      fireEvent.change(findSelectByLabel('Month'), { target: { value: '8' } });

      expect(findSelectByLabel('Month')).toHaveValue('8');
      expectSameDay(onShownDateChange.mock.calls[0][0], new Date(2025, 8, 15));

      fireEvent.change(findSelectByLabel('Year'), { target: { value: '2026' } });

      expect(findSelectByLabel('Year')).toHaveValue('2026');
      expectSameDay(onShownDateChange.mock.calls[1][0], new Date(2026, 8, 15));
    });

    test('month and year pickers announce committed shown month and year', () => {
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
      });

      fireEvent.change(findSelectByLabel('Month'), { target: { value: '8' } });

      expect(findLiveRegion(container)).toHaveTextContent('Now showing September 2025');

      fireEvent.change(findSelectByLabel('Year'), { target: { value: '2026' } });

      expect(findLiveRegion(container)).toHaveTextContent('Now showing September 2026');
    });

    test('custom live region month/year formatter receives the committed date', () => {
      const liveRegionMonthYear = jest.fn(date => `Showing ${date.getFullYear()}-${date.getMonth() + 1}`);
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
        ariaLabels: {
          ...baseProps.ariaLabels,
          liveRegionMonthYear,
        },
      });

      fireEvent.change(findSelectByLabel('Month'), { target: { value: '8' } });

      expect(liveRegionMonthYear).toHaveBeenCalledWith(new Date(2025, 8, 15));
      expect(findLiveRegion(container)).toHaveTextContent('Showing 2025-9');
    });

    test('non-scroll rendered months derive from updated focused date without virtualizer refs', () => {
      const { container } = renderCalendar({
        shownDate: new Date(2025, 0, 15),
        months: 2,
        direction: 'horizontal',
        showMonthAndYearPickers: false,
      });

      expect(visibleMonthLabels(container)).toEqual(['Jan 2025', 'Feb 2025']);

      fireEvent.click(findButtonByLabel('Next month'));

      expect(visibleMonthLabels(container)).toEqual(['Feb 2025', 'Mar 2025']);
    });

    test('non-scroll date mode syncs visible month when external date becomes defined', () => {
      const view = renderCalendar({
        displayMode: 'date',
        date: undefined,
        direction: 'horizontal',
        shownDate: new Date(2025, 5, 15),
        showMonthAndYearPickers: false,
      });

      expect(visibleMonthLabels(view.container)).toEqual(['Jun 2025']);

      rerenderCalendar(view, {
        displayMode: 'date',
        date: new Date(2025, 8, 20),
        direction: 'horizontal',
        shownDate: new Date(2025, 5, 15),
        showMonthAndYearPickers: false,
      });

      expect(visibleMonthLabels(view.container)).toEqual(['Sep 2025']);
    });
  });

  describe('rendered selection interactions', () => {
    test('hover and drag preview movement leave live region text unchanged', () => {
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'dateRange',
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
      });

      fireEvent.mouseEnter(findDayButton(10));
      fireEvent.mouseDown(findDayButton(10));
      fireEvent.mouseEnter(findDayButton(12));

      expect(findLiveRegion(container)).toHaveTextContent('');
    });

    test('drag selection end does not announce selection in the month/year-only slice', () => {
      const updateRange = jest.fn();
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'dateRange',
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        updateRange,
      });

      fireEvent.mouseDown(findDayButton(10));
      fireEvent.mouseEnter(findDayButton(12));
      fireEvent.mouseUp(findDayButton(12));

      expect(updateRange).toHaveBeenCalledTimes(1);
      expect(findLiveRegion(container)).toHaveTextContent('');
    });

    test('dragging a date range calls updateRange with start and end dates without using onChange', () => {
      const updateRange = jest.fn();
      const onChange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'dateRange',
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        updateRange,
        onChange,
      });

      fireEvent.mouseDown(findDayButton(10));
      fireEvent.mouseEnter(findDayButton(12));
      fireEvent.mouseUp(findDayButton(12));

      expectSameDay(updateRange.mock.calls[0][0].startDate, new Date(2025, 5, 10));
      expectSameDay(updateRange.mock.calls[0][0].endDate, new Date(2025, 5, 12));
      expect(onChange).not.toHaveBeenCalled();
    });

    test('single-date mouse selection calls onChange with the selected date', () => {
      const onChange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'date',
        date: new Date(2025, 5, 10),
        onChange,
      });

      fireEvent.mouseDown(findDayButton(18));
      fireEvent.mouseUp(findDayButton(18));

      expectSameDay(onChange.mock.calls[0][0], new Date(2025, 5, 18));
    });

    test('keyboard activation on an active day forwards selection through onChange', () => {
      const onChange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'date',
        date: new Date(2025, 5, 10),
        onChange,
      });

      fireEvent.keyDown(findDayButton(20), { key: 'Enter', keyCode: 13 });
      fireEvent.keyUp(findDayButton(20), { key: 'Enter', keyCode: 13 });

      expectSameDay(onChange.mock.calls[0][0], new Date(2025, 5, 20));
    });

    test('disabled days clear preview without forwarding selection callbacks', () => {
      const onPreviewChange = jest.fn();
      const onChange = jest.fn();
      const updateRange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'dateRange',
        disabledDates: [new Date(2025, 5, 18)],
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        onPreviewChange,
        onChange,
        updateRange,
      });
      const disabledDay = findCalendarDayButton(18);

      fireEvent.mouseEnter(disabledDay);
      fireEvent.mouseDown(disabledDay);
      fireEvent.mouseUp(disabledDay);

      expect(disabledDay.tabIndex).toBe(-1);
      expect(onPreviewChange).toHaveBeenCalledTimes(3);
      expect(onPreviewChange.mock.calls).toEqual([[], [], []]);
      expect(onChange).not.toHaveBeenCalled();
      expect(updateRange).not.toHaveBeenCalled();
    });
  });

  describe('locale and week start recalculation', () => {
    test('locale changes update rendered month picker labels', () => {
      const view = renderCalendar({ locale: enUS });

      expect(selectOptionTexts(findSelectByLabel('Month')).slice(0, 3)).toEqual([
        'January',
        'February',
        'March',
      ]);

      rerenderCalendar(view, { locale: es });

      expect(selectOptionTexts(findSelectByLabel('Month')).slice(0, 3)).toEqual([
        'enero',
        'febrero',
        'marzo',
      ]);
    });

    test('weekStartsOn changes update rendered weekday order', () => {
      const view = renderCalendar({ weekStartsOn: 0 });

      expect(weekdayLabels(view.container)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

      rerenderCalendar(view, { weekStartsOn: 1 });

      expect(weekdayLabels(view.container)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });
  });

  describe('StrictMode scroll safety (#577, #653)', () => {
    let scrollViews = [];

    beforeEach(() => {
      scrollViews = [];
      jest.useFakeTimers();
    });

    afterEach(() => {
      scrollViews.forEach(view => view.unmount());
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    const renderScrollCalendar = props => {
      const calendarRef = React.createRef();
      const view = renderCalendar({
        ref: calendarRef,
        scroll: { enabled: true, monthHeight: 240, longMonthHeight: 280, calendarHeight: 420 },
        minDate: new Date(2020, 0, 1),
        maxDate: new Date(2025, 11, 31),
        shownDate: new Date(2025, 5, 15),
        ...props,
      });
      scrollViews.push(view);
      return { calendarRef, view };
    };

    const findScrollContainer = container => container.querySelector('.rdrInfiniteMonths');

    test('scroll ref exposes hook actions without Calendar.Inner class leakage', () => {
      const { calendarRef } = renderScrollCalendar();

      expect(Calendar.Inner).toBeUndefined();
      expect(calendarRef.current.focusToDate).toEqual(expect.any(Function));
      expect(calendarRef.current.changeShownDate).toEqual(expect.any(Function));
      expect(calendarRef.current.updateShownDate).toEqual(expect.any(Function));
      expect(calendarRef.current.setState).toBeUndefined();
    });

    test('scroll focus measures after scrollToIndex (#577, #653)', () => {
      const { calendarRef } = renderScrollCalendar();
      const virtualizer = mockVirtualizerInstance;
      const measure = jest.spyOn(virtualizer, 'measure').mockImplementation(() => {});
      const getVirtualItems = jest
        .spyOn(virtualizer, 'getVirtualItems')
        .mockReturnValue([{ index: 0 }, { index: 10 }]);
      const scrollToIndex = jest.spyOn(virtualizer, 'scrollToIndex').mockImplementation(() => {});

      act(() => {
        calendarRef.current.focusToDate(new Date(2025, 5, 15));
      });

      expect(getVirtualItems).toHaveBeenCalled();
      expect(scrollToIndex).toHaveBeenCalledWith(65);
      expect(measure).toHaveBeenCalledTimes(1);
      expect(scrollToIndex.mock.invocationCallOrder[0]).toBeLessThan(
        measure.mock.invocationCallOrder[0]
      );
    });

    test('scroll focus is safe when measure is missing', () => {
      const { calendarRef } = renderScrollCalendar();
      const virtualizer = mockVirtualizerInstance;
      jest.spyOn(virtualizer, 'getVirtualItems').mockReturnValue([{ index: 0 }, { index: 10 }]);
      const scrollToIndex = jest.spyOn(virtualizer, 'scrollToIndex').mockImplementation(() => {});
      const originalMeasure = virtualizer.measure;
      virtualizer.measure = undefined;

      expect(() => {
        act(() => {
          calendarRef.current.focusToDate(new Date(2025, 5, 15));
        });
      }).not.toThrow();

      expect(scrollToIndex).toHaveBeenCalledWith(65);
      virtualizer.measure = originalMeasure;
    });

    test('handleScroll measures before reading visible range and reports later scrolls', () => {
      const onShownDateChange = jest.fn();
      const { view } = renderScrollCalendar({ onShownDateChange });
      const virtualizer = mockVirtualizerInstance;
      const measure = jest.spyOn(virtualizer, 'measure').mockImplementation(() => {});
      const getVirtualItems = jest
        .spyOn(virtualizer, 'getVirtualItems')
        .mockReturnValueOnce([{ index: 65 }, { index: 66 }])
        .mockReturnValueOnce([{ index: 66 }, { index: 67 }]);
      const scrollContainer = findScrollContainer(view.container);

      fireEvent.scroll(scrollContainer);
      fireEvent.scroll(scrollContainer);

      expect(measure).toHaveBeenCalledTimes(2);
      expect(measure.mock.invocationCallOrder[0]).toBeLessThan(
        getVirtualItems.mock.invocationCallOrder[0]
      );
      expect(onShownDateChange).toHaveBeenCalledTimes(1);
      expectSameDay(onShownDateChange.mock.calls[0][0], new Date(2025, 6, 1));
    });

    test('scroll-driven shown date changes do not announce transient movement', () => {
      const onShownDateChange = jest.fn();
      const { view } = renderScrollCalendar({ onShownDateChange });
      const virtualizer = mockVirtualizerInstance;
      jest
        .spyOn(virtualizer, 'getVirtualItems')
        .mockReturnValueOnce([{ index: 65 }, { index: 66 }])
        .mockReturnValueOnce([{ index: 66 }, { index: 67 }]);
      const scrollContainer = findScrollContainer(view.container);

      fireEvent.scroll(scrollContainer);
      fireEvent.scroll(scrollContainer);

      expect(onShownDateChange).toHaveBeenCalledTimes(1);
      expect(findLiveRegion(view.container)).toHaveTextContent('');
    });

    test('handleScroll is safe when visible range is empty or measure is missing', () => {
      const { view } = renderScrollCalendar();
      const virtualizer = mockVirtualizerInstance;
      jest.spyOn(virtualizer, 'getVirtualItems').mockReturnValue([]);
      const originalMeasure = virtualizer.measure;
      virtualizer.measure = undefined;
      const scrollContainer = findScrollContainer(view.container);

      expect(() => {
        fireEvent.scroll(scrollContainer);
      }).not.toThrow();

      virtualizer.measure = originalMeasure;
    });

    test('scroll virtualization renders only the current virtual window and can move back', () => {
      const { view } = renderScrollCalendar({
        scroll: { enabled: true, monthHeight: 240, longMonthHeight: 280, calendarHeight: 420 },
        minDate: new Date(1900, 0, 1),
        maxDate: new Date(2019, 11, 31),
        shownDate: new Date(1900, 0, 15),
        showMonthAndYearPickers: false,
      });

      expect(visibleMonthLabels(view.container)).toEqual(['Jan 1900', 'Feb 1900']);

      act(() => {
        mockVirtualizerInstance.setVisibleRange([120, 121]);
      });

      expect(visibleMonthLabels(view.container)).toEqual(['Jan 1910', 'Feb 1910']);
      expect(view.container.querySelectorAll('.rdrMonth')).toHaveLength(2);

      act(() => {
        mockVirtualizerInstance.setVisibleRange([0, 1]);
      });

      expect(visibleMonthLabels(view.container)).toEqual(['Jan 1900', 'Feb 1900']);
      expect(view.container.querySelectorAll('.rdrMonth')).toHaveLength(2);
    });

    test('scroll focus timer is cleaned up on unmount', () => {
      const { view } = renderScrollCalendar();

      view.unmount();

      expect(() => {
        act(() => {
          jest.runOnlyPendingTimers();
        });
      }).not.toThrow();
    });
  });

  describe('REQ-UBF-003 / #607: disabledDates array guard', () => {
    test('null disabledDates does not crash Month.some()', () => {
      expect(() =>
        renderCalendar({
          shownDate: new Date(2025, 5, 1),
          disabledDates: null,
        })
      ).not.toThrow();

      const dayCells = calendarDayButtons();
      expect(dayCells.length).toBeGreaterThanOrEqual(35);
      expect(dayCells.length).toBeLessThanOrEqual(42);
    });

    test('single-Date disabledDates does not crash Month.some()', () => {
      expect(() =>
        renderCalendar({
          shownDate: new Date(2025, 5, 1),
          disabledDates: new Date(2025, 5, 18),
        })
      ).not.toThrow();

      const dayCells = calendarDayButtons();
      expect(dayCells.length).toBeGreaterThanOrEqual(35);
      // Single Date treated as "no disabled dates" — day 18 is NOT disabled
      const day18 = findCalendarDayButton(18);
      expect(day18).toBeDefined();
      expect(day18.tabIndex).not.toBe(-1);
    });

    test('valid array disabledDates marks the right day', () => {
      renderCalendar({
        shownDate: new Date(2025, 5, 1),
        disabledDates: [new Date(2025, 5, 18)],
      });

      const disabledDay = findCalendarDayButton(18);
      expect(disabledDay).toBeDefined();
      expect(disabledDay.tabIndex).toBe(-1);

      // Non-disabled date is reachable and interactive
      const activeDay = findCalendarDayButton(10);
      expect(activeDay).toBeDefined();
      expect(activeDay.tabIndex).not.toBe(-1);
    });
  });

  describe('keyboard navigation (REQ-CG-005)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 5, 15));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const navBaseProps = {
      shownDate: new Date(2025, 5, 15),
      minDate: new Date(2025, 5, 1),
      maxDate: new Date(2025, 5, 30),
      direction: 'vertical',
      showMonthAndYearPickers: false,
      showDateDisplay: false,
    };

    test('ArrowLeft on a focused day moves focus to the previous day', () => {
      renderCalendar(navBaseProps);
      const day15 = findDayButton(15);
      day15.focus();
      expect(document.activeElement).toBe(day15);

      fireEvent.keyDown(day15, { key: 'ArrowLeft' });
      expect(document.activeElement).not.toBe(day15);
      expect(document.activeElement.textContent).toBe('14');
    });

    test('ArrowRight on a focused day moves focus to the next day', () => {
      renderCalendar(navBaseProps);
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'ArrowRight' });
      expect(document.activeElement.textContent).toBe('16');
    });

    test('ArrowUp moves focus to the same weekday in the previous week (−7 days)', () => {
      renderCalendar(navBaseProps);
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'ArrowUp' });
      expect(document.activeElement.textContent).toBe('8');
    });

    test('ArrowDown moves focus to the same weekday in the next week (+7 days)', () => {
      renderCalendar(navBaseProps);
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'ArrowDown' });
      expect(document.activeElement.textContent).toBe('22');
    });

    test('PageUp moves focus to the same day-of-month in the previous month', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 6, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 11, 31),
      });
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'PageUp' });
      // In June, day 15 should exist
      expect(document.activeElement.textContent).toBe('15');
    });

    test('PageDown moves focus to the same day-of-month in the next month', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 11, 31),
      });
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'PageDown' });
      // Moves to July 15 — should be focusable (not disabled)
      const newFocused = document.activeElement;
      expect(newFocused).toBeTruthy();
      expect(newFocused.textContent).toBe('15');
    });

    test('Shift+PageUp moves focus to the same day-of-month in the previous year', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
      });
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'PageUp', shiftKey: true });
      // Moves to June 15, 2024 — should exist
      expect(document.activeElement.textContent).toBe('15');
    });

    test('Shift+PageDown moves focus to the same day-of-month in the next year', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
      });
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'PageDown', shiftKey: true });
      expect(document.activeElement.textContent).toBe('15');
    });

    test('focus does not move outside minDate/maxDate boundaries', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 15),
      });
      const day1 = findDayButton(1);
      day1.focus();

      // ArrowLeft should be clamped to minDate (June 1)
      fireEvent.keyDown(day1, { key: 'ArrowLeft' });
      expect(document.activeElement.textContent).toBe('1');
    });

    test('focus does not move beyond maxDate', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 15),
      });
      const day15 = findDayButton(15);
      day15.focus();

      // ArrowRight at max boundary should stay at day 15
      fireEvent.keyDown(day15, { key: 'ArrowRight' });
      expect(document.activeElement.textContent).toBe('15');
    });

    test('Enter keyDown/keyUp still triggers onChange (regression guard)', () => {
      const onChange = jest.fn();
      renderCalendar({
        ...navBaseProps,
        displayMode: 'date',
        date: new Date(2025, 5, 15),
        onChange,
      });
      const day20 = findDayButton(20);

      fireEvent.keyDown(day20, { key: 'Enter', keyCode: 13 });
      fireEvent.keyUp(day20, { key: 'Enter', keyCode: 13 });

      expectSameDay(onChange.mock.calls[0][0], new Date(2025, 5, 20));
    });
  });

  describe('ARIA roles and states (REQ-CG-006)', () => {
    const ariaBaseProps = {
      shownDate: new Date(2025, 5, 15),
      minDate: new Date(2025, 5, 1),
      maxDate: new Date(2025, 5, 30),
      direction: 'vertical',
      showMonthAndYearPickers: false,
      showDateDisplay: false,
    };

    test('calendar root exposes role="grid"', () => {
      const { container } = renderCalendar(ariaBaseProps);
      const grid = container.querySelector('[role="grid"]');
      expect(grid).toBeInTheDocument();
    });

    test('calendar grid exposes default accessible name and role description', () => {
      renderCalendar(ariaBaseProps);

      const grid = screen.getByRole('grid', { name: 'Calendar' });
      expect(grid).toHaveAttribute('aria-roledescription', 'month grid');
    });

    test('calendar grid uses custom accessible name and role description', () => {
      renderCalendar({
        ...ariaBaseProps,
        ariaLabels: {
          ...baseProps.ariaLabels,
          calendar: 'Calendrier',
          calendarRoleDescription: 'grille mensuelle',
        },
      });

      const grid = screen.getByRole('grid', { name: 'Calendrier' });
      expect(grid).toHaveAttribute('aria-roledescription', 'grille mensuelle');
    });

    test('calendar grid name remains distinct from DateDisplay labels', () => {
      renderCalendar({
        ...ariaBaseProps,
        showDateDisplay: true,
        ariaLabels: {
          ...baseProps.ariaLabels,
          dateDisplay: 'Selected dates',
        },
      });

      expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();
      expect(screen.queryByRole('grid', { name: 'Selected dates' })).not.toBeInTheDocument();
      expect(mockDateDisplayProps.ariaLabels.dateDisplay).toBe('Selected dates');
    });

    test('each day cell exposes role="gridcell"', () => {
      renderCalendar(ariaBaseProps);
      const cells = calendarDayButtons();
      expect(cells.length).toBeGreaterThan(28);
      cells.forEach(cell => {
        expect(cell).toHaveAttribute('role', 'gridcell');
      });
    });

    test('disabled day cells expose aria-disabled="true"', () => {
      renderCalendar({
        ...ariaBaseProps,
        disabledDates: [new Date(2025, 5, 18)],
      });
      const disabledDay = findCalendarDayButton(18);
      expect(disabledDay).toBeDefined();
      expect(disabledDay).toHaveAttribute('aria-disabled', 'true');
    });

    test('selected day cell exposes aria-selected="true" in date mode', () => {
      renderCalendar({
        ...ariaBaseProps,
        displayMode: 'date',
        date: new Date(2025, 5, 15),
      });
      const selectedDay = findCalendarDayButton(15);
      expect(selectedDay).toHaveAttribute('aria-selected', 'true');
    });

    test('today exposes aria-current="date"', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 5, 15));
      renderCalendar(ariaBaseProps);
      const todayCell = calendarDayButtons().find(btn => btn.textContent === '15');
      expect(todayCell).toHaveAttribute('aria-current', 'date');
      jest.useRealTimers();
    });
  });

  describe('DateDisplay delegation', () => {
    const min = new Date(2025, 0, 1);
    const max = new Date(2025, 11, 31);
    const disabled = [new Date(2025, 6, 4)];

    test('renders DateDisplay with constraints propagated', () => {
      const onRangeFocusChange = jest.fn();
      renderCalendar({
        showDateDisplay: true,
        minDate: min,
        maxDate: max,
        disabledDates: disabled,
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        onRangeFocusChange,
      });

      expect(screen.getByTestId('date-display')).toBeInTheDocument();
      expect(mockDateDisplayProps.minDate).toBe(min);
      expect(mockDateDisplayProps.maxDate).toBe(max);
      expect(mockDateDisplayProps.disabledDates).toBe(disabled);
      expect(mockDateDisplayProps.ranges).toEqual([
        { startDate: null, endDate: null, key: 'selection' },
      ]);
      expect(mockDateDisplayProps.onRangeFocusChange).toEqual(expect.any(Function));
      expect(mockDateDisplayProps.styles.calendarWrapper).toBe('rdrCalendarWrapper');
      expect(mockDateDisplayProps.dateOptions.locale).toBe(enUS);

      act(() => {
        mockDateDisplayProps.onRangeFocusChange(0, 1);
      });

      expect(onRangeFocusChange).toHaveBeenCalledWith([0, 1]);
    });

    test('DateDisplay onChange forwards selected date through Calendar selection handler', () => {
      const onChange = jest.fn();
      const view = renderCalendar({
        displayMode: 'date',
        showDateDisplay: false,
        onChange,
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
      });

      expect(screen.queryByTestId('date-display')).not.toBeInTheDocument();

      rerenderCalendar(view, {
        showDateDisplay: true,
        displayMode: 'date',
        onChange,
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
      });

      act(() => {
        mockDateDisplayProps.onChange(new Date(2025, 6, 4));
      });

      expectSameDay(onChange.mock.calls[0][0], new Date(2025, 6, 4));
    });
  });
});
