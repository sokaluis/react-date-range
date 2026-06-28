import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Calendar from '../Calendar/index.jsx';
import DateDisplay from '../DateDisplay/index.jsx';
import ReactList from 'react-list';
import { isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { es } from 'date-fns/locale/es';

let mockReactListInstance;
let mockDateDisplayProps;

jest.mock('react-list', () => {
  const React = require('react');

  return class ReactListMock extends React.Component {
    visibleRange = [0, 1];

    constructor(props) {
      super(props);
      mockReactListInstance = this;
    }

    getVisibleRange() {
      return this.visibleRange;
    }

    scrollTo(index) {
      this.visibleRange = [index, index + 1];
    }

    updateFrameAndClearCache() {}

    render() {
      const [firstVisible] = this.visibleRange;
      return <div data-testid="react-list">{this.props.itemRenderer(firstVisible, firstVisible)}</div>;
    }
  };
});

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
  ...Calendar.defaultProps,
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
  mockReactListInstance = undefined;
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
  screen.getAllByRole('button').filter(button => /^\d+$/.test(button.textContent));

const dayButtons = () => calendarDayButtons().filter(button => button.tabIndex !== -1);

const findDayButton = dayNumber => dayButtons().find(button => button.textContent === String(dayNumber));

const findCalendarDayButton = dayNumber =>
  calendarDayButtons().find(button => button.textContent === String(dayNumber));

const expectSameDay = (actual, expected) => {
  expect(isSameDay(actual, expected)).toBe(true);
};

describe('Calendar', () => {
  test('Should resolve', () => {
    expect(Calendar).toEqual(expect.anything());
  });

  describe('forwardRef scaffold and metadata', () => {
    test('exports a forwardRef component while preserving defaultProps metadata', () => {
      expect(Calendar.$$typeof).toBe(Symbol.for('react.forward_ref'));
      expect(Calendar.defaultProps.scroll).toEqual({ enabled: false });
      expect(Calendar.defaultProps.locale).toBe(enUS);
      expect(Calendar.defaultProps.ariaLabels).toEqual({});
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

    test('non-scroll rendered months derive from updated focused date without ReactList refs', () => {
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

    test('scroll focus calls updateFrameAndClearCache after scrollTo (#577, #653)', () => {
      const { calendarRef } = renderScrollCalendar();
      const list = mockReactListInstance;
      const updateFrameAndClearCache = jest
        .spyOn(list, 'updateFrameAndClearCache')
        .mockImplementation(() => {});
      const getVisibleRange = jest.spyOn(list, 'getVisibleRange').mockReturnValue([0, 10]);
      const scrollTo = jest.spyOn(list, 'scrollTo').mockImplementation(() => {});

      act(() => {
        calendarRef.current.focusToDate(new Date(2025, 5, 15));
      });

      expect(getVisibleRange).toHaveBeenCalled();
      expect(scrollTo).toHaveBeenCalledWith(65);
      expect(updateFrameAndClearCache).toHaveBeenCalledTimes(1);
      expect(scrollTo.mock.invocationCallOrder[0]).toBeLessThan(
        updateFrameAndClearCache.mock.invocationCallOrder[0]
      );
    });

    test('scroll focus is safe when updateFrameAndClearCache is missing', () => {
      const { calendarRef } = renderScrollCalendar();
      const list = mockReactListInstance;
      jest.spyOn(list, 'getVisibleRange').mockReturnValue([0, 10]);
      const scrollTo = jest.spyOn(list, 'scrollTo').mockImplementation(() => {});
      const originalUpdateFrameAndClearCache = list.updateFrameAndClearCache;
      list.updateFrameAndClearCache = undefined;

      expect(() => {
        act(() => {
          calendarRef.current.focusToDate(new Date(2025, 5, 15));
        });
      }).not.toThrow();

      expect(scrollTo).toHaveBeenCalledWith(65);
      list.updateFrameAndClearCache = originalUpdateFrameAndClearCache;
    });

    test('handleScroll updates frame before reading visible range and reports later scrolls', () => {
      const onShownDateChange = jest.fn();
      const { view } = renderScrollCalendar({ onShownDateChange });
      const list = mockReactListInstance;
      const updateFrameAndClearCache = jest
        .spyOn(list, 'updateFrameAndClearCache')
        .mockImplementation(() => {});
      const getVisibleRange = jest
        .spyOn(list, 'getVisibleRange')
        .mockReturnValueOnce([65, 66])
        .mockReturnValueOnce([66, 67]);
      const scrollContainer = findScrollContainer(view.container);

      fireEvent.scroll(scrollContainer);
      fireEvent.scroll(scrollContainer);

      expect(updateFrameAndClearCache).toHaveBeenCalledTimes(2);
      expect(updateFrameAndClearCache.mock.invocationCallOrder[0]).toBeLessThan(
        getVisibleRange.mock.invocationCallOrder[0]
      );
      expect(onShownDateChange).toHaveBeenCalledTimes(1);
      expectSameDay(onShownDateChange.mock.calls[0][0], new Date(2025, 6, 1));
    });

    test('handleScroll is safe when visible range is empty or updateFrameAndClearCache is missing', () => {
      const { view } = renderScrollCalendar();
      const list = mockReactListInstance;
      jest.spyOn(list, 'getVisibleRange').mockReturnValue([]);
      const originalUpdateFrameAndClearCache = list.updateFrameAndClearCache;
      list.updateFrameAndClearCache = undefined;
      const scrollContainer = findScrollContainer(view.container);

      expect(() => {
        fireEvent.scroll(scrollContainer);
      }).not.toThrow();

      list.updateFrameAndClearCache = originalUpdateFrameAndClearCache;
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
