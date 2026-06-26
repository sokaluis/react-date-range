import React from 'react';
import Calendar from '../Calendar';
import DateDisplay from '../DateDisplay';
import TestRenderer, { act } from 'react-test-renderer';
import { isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { es } from 'date-fns/locale/es';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Calendar {...baseProps} {...props} />);
  });
  return renderer;
};

const rerenderCalendar = (renderer, props) => {
  act(() => {
    renderer.update(<Calendar {...baseProps} {...props} />);
  });
};

const textOf = node => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node || !node.children) return '';
  return node.children.map(textOf).join('');
};

const findButtonByLabel = (root, label) =>
  root.findByProps({ 'aria-label': label, type: 'button' });

const findSelectByLabel = (root, label) => root.findByProps({ 'aria-label': label });

const selectOptionTexts = select => select.findAllByType('option').map(option => textOf(option));

const visibleMonthLabels = root =>
  root
    .findAll(node => node.type === 'div' && node.props.className === 'rdrMonthName')
    .map(textOf);

const weekdayLabels = root =>
  root
    .findAll(node => node.type === 'span' && node.props.className === 'rdrWeekDay')
    .map(textOf);

const dayButtons = root =>
  root
    .findAllByType('button')
    .filter(button => button.props.tabIndex !== -1 && /^\d+$/.test(textOf(button)));

const findDayButton = (root, dayNumber) =>
  dayButtons(root).find(button => textOf(button) === String(dayNumber));

const expectSameDay = (actual, expected) => {
  expect(isSameDay(actual, expected)).toBe(true);
};

describe('Calendar', () => {
  test('Should resolve', () => {
    expect(Calendar).toEqual(expect.anything());
  });

  describe('rendered navigation and shown-date behavior', () => {
    test('previous and next arrows update visible month and report clamped shown dates', () => {
      const onShownDateChange = jest.fn();
      const renderer = renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 6, 31),
        onShownDateChange,
      });

      act(() => {
        findButtonByLabel(renderer.root, 'Previous month').props.onClick();
      });

      expect(findSelectByLabel(renderer.root, 'Month').props.value).toBe(5);
      expectSameDay(onShownDateChange.mock.calls[0][0], new Date(2025, 5, 1));

      act(() => {
        findButtonByLabel(renderer.root, 'Next month').props.onClick();
      });

      expect(findSelectByLabel(renderer.root, 'Month').props.value).toBe(6);
      expectSameDay(onShownDateChange.mock.calls[1][0], new Date(2025, 6, 1));
    });

    test('month and year pickers update visible values and report selected dates', () => {
      const onShownDateChange = jest.fn();
      const renderer = renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
        onShownDateChange,
      });

      act(() => {
        findSelectByLabel(renderer.root, 'Month').props.onChange({ target: { value: 8 } });
      });

      expect(findSelectByLabel(renderer.root, 'Month').props.value).toBe(8);
      expectSameDay(onShownDateChange.mock.calls[0][0], new Date(2025, 8, 15));

      act(() => {
        findSelectByLabel(renderer.root, 'Year').props.onChange({ target: { value: 2026 } });
      });

      expect(findSelectByLabel(renderer.root, 'Year').props.value).toBe(2026);
      expectSameDay(onShownDateChange.mock.calls[1][0], new Date(2026, 8, 15));
    });

    test('non-scroll rendered months derive from updated focused date without ReactList refs', () => {
      const renderer = renderCalendar({
        shownDate: new Date(2025, 0, 15),
        months: 2,
        direction: 'horizontal',
        showMonthAndYearPickers: false,
      });

      expect(visibleMonthLabels(renderer.root)).toEqual(['Jan 2025', 'Feb 2025']);

      act(() => {
        findButtonByLabel(renderer.root, 'Next month').props.onClick();
      });

      expect(visibleMonthLabels(renderer.root)).toEqual(['Feb 2025', 'Mar 2025']);
    });
  });

  describe('rendered selection interactions', () => {
    test('dragging a date range calls updateRange with start and end dates without using onChange', () => {
      const updateRange = jest.fn();
      const onChange = jest.fn();
      const renderer = renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'dateRange',
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        updateRange,
        onChange,
      });

      act(() => {
        findDayButton(renderer.root, 10).props.onMouseDown({ type: 'mousedown' });
      });
      act(() => {
        findDayButton(renderer.root, 12).props.onMouseEnter({ type: 'mouseenter' });
      });
      act(() => {
        findDayButton(renderer.root, 12).props.onMouseUp({
          type: 'mouseup',
          stopPropagation: jest.fn(),
        });
      });

      expectSameDay(updateRange.mock.calls[0][0].startDate, new Date(2025, 5, 10));
      expectSameDay(updateRange.mock.calls[0][0].endDate, new Date(2025, 5, 12));
      expect(onChange).not.toHaveBeenCalled();
    });

    test('single-date mouse selection calls onChange with the selected date', () => {
      const onChange = jest.fn();
      const renderer = renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'date',
        date: new Date(2025, 5, 10),
        onChange,
      });

      act(() => {
        findDayButton(renderer.root, 18).props.onMouseDown({ type: 'mousedown' });
      });
      act(() => {
        findDayButton(renderer.root, 18).props.onMouseUp({
          type: 'mouseup',
          stopPropagation: jest.fn(),
        });
      });

      expectSameDay(onChange.mock.calls[0][0], new Date(2025, 5, 18));
    });

    test('keyboard activation on an active day forwards selection through onChange', () => {
      const onChange = jest.fn();
      const renderer = renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'date',
        date: new Date(2025, 5, 10),
        onChange,
      });

      act(() => {
        findDayButton(renderer.root, 20).props.onKeyDown({ type: 'keydown', keyCode: 13 });
      });
      act(() => {
        findDayButton(renderer.root, 20).props.onKeyUp({ type: 'keyup', keyCode: 13 });
      });

      expectSameDay(onChange.mock.calls[0][0], new Date(2025, 5, 20));
    });
  });

  describe('locale and week start recalculation', () => {
    test('locale changes update rendered month picker labels', () => {
      const renderer = renderCalendar({ locale: enUS });

      expect(selectOptionTexts(findSelectByLabel(renderer.root, 'Month')).slice(0, 3)).toEqual([
        'January',
        'February',
        'March',
      ]);

      rerenderCalendar(renderer, { locale: es });

      expect(selectOptionTexts(findSelectByLabel(renderer.root, 'Month')).slice(0, 3)).toEqual([
        'enero',
        'febrero',
        'marzo',
      ]);
    });

    test('weekStartsOn changes update rendered weekday order', () => {
      const renderer = renderCalendar({ weekStartsOn: 0 });

      expect(weekdayLabels(renderer.root)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

      rerenderCalendar(renderer, { weekStartsOn: 1 });

      expect(weekdayLabels(renderer.root)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });
  });

  describe('StrictMode scroll safety (#577, #653)', () => {
    // These direct-instance tests intentionally remain as narrow exceptions:
    // ReactList refs, timers, and visible-range scroll seams are not stable through
    // react-test-renderer, but they protect the StrictMode regressions in #577/#653.
    let instance;
    const commonProps = {
      ...Calendar.defaultProps,
    };

    beforeEach(() => {
      instance = new Calendar(commonProps);
      instance.state = {
        ...instance.state,
        focusedDate: new Date(2025, 5, 15),
      };
    });

    test('componentDidMount stores focus timer when scroll enabled', () => {
      instance.props = { ...commonProps, scroll: { enabled: true } };
      jest.useFakeTimers();
      instance.componentDidMount();
      expect(instance._focusTimer).toBeDefined();
      // With fake timers, setTimeout returns a Timeout object (not a number)
      expect(instance._focusTimer).not.toBeNull();
      jest.useRealTimers();
    });

    test('componentDidMount does NOT store timer when scroll disabled', () => {
      instance.props = { ...commonProps, scroll: { enabled: false } };
      instance.componentDidMount();
      expect(instance._focusTimer).toBeUndefined();
    });

    test('componentWillUnmount clears the focus timer', () => {
      jest.useFakeTimers();
      instance.props = { ...commonProps, scroll: { enabled: true } };
      instance.componentDidMount();
      expect(instance._focusTimer).toBeDefined();
      expect(instance._focusTimer).not.toBeNull();

      instance.componentWillUnmount();
      expect(instance._focusTimer).toBeNull();
      jest.useRealTimers();
    });

    test('componentWillUnmount is safe when no timer exists', () => {
      instance.props = { ...commonProps, scroll: { enabled: false } };
      expect(() => instance.componentWillUnmount()).not.toThrow();
    });

    test('focusToDate returns early when this.list is null (StrictMode safety)', () => {
      instance.props = {
        ...commonProps,
        scroll: { enabled: true },
        minDate: new Date(2020, 0, 1),
      };
      instance.list = null;
      instance.state.scrollArea = {
        enabled: true,
        monthHeight: 240,
        longMonthHeight: 280,
        calendarHeight: 420,
        calendarWidth: 'auto',
      };

      // Should not throw
      expect(() => {
        instance.focusToDate(new Date(2025, 5, 15));
      }).not.toThrow();
    });

    test('focusToDate works normally when this.list is available', () => {
      instance.props = {
        ...commonProps,
        scroll: { enabled: true },
        minDate: new Date(2020, 0, 1),
      };
      instance.state.scrollArea = {
        enabled: true,
        monthHeight: 240,
        longMonthHeight: 280,
        calendarHeight: 420,
        calendarWidth: 'auto',
      };
      instance.list = {
        getVisibleRange: jest.fn(() => [0, 10]),
        scrollTo: jest.fn(),
      };
      // Suppress setState warning in direct instance test
      jest.spyOn(instance, 'setState').mockImplementation(() => {});

      expect(() => {
        instance.focusToDate(new Date(2025, 5, 15));
      }).not.toThrow();

      expect(instance.list.scrollTo).toHaveBeenCalled();
      instance.setState.mockRestore();
    });

    test('focusToDate calls updateFrameAndClearCache after scrollTo (#577, #653)', () => {
      instance.props = {
        ...commonProps,
        scroll: { enabled: true },
        minDate: new Date(2020, 0, 1),
      };
      instance.state.scrollArea = {
        enabled: true,
        monthHeight: 240,
        longMonthHeight: 280,
        calendarHeight: 420,
        calendarWidth: 'auto',
      };
      const mockUpdateFrameAndClearCache = jest.fn();
      instance.list = {
        getVisibleRange: jest.fn(() => [0, 10]),
        scrollTo: jest.fn(),
        updateFrameAndClearCache: mockUpdateFrameAndClearCache,
      };
      jest.spyOn(instance, 'setState').mockImplementation(() => {});

      instance.focusToDate(new Date(2025, 5, 15));

      expect(instance.list.scrollTo).toHaveBeenCalled();
      expect(mockUpdateFrameAndClearCache).toHaveBeenCalledTimes(1);
      instance.setState.mockRestore();
    });

    test('focusToDate is safe when updateFrameAndClearCache is missing', () => {
      instance.props = {
        ...commonProps,
        scroll: { enabled: true },
        minDate: new Date(2020, 0, 1),
      };
      instance.state.scrollArea = {
        enabled: true,
        monthHeight: 240,
        longMonthHeight: 280,
        calendarHeight: 420,
        calendarWidth: 'auto',
      };
      instance.list = {
        getVisibleRange: jest.fn(() => [0, 10]),
        scrollTo: jest.fn(),
        // updateFrameAndClearCache intentionally omitted
      };
      jest.spyOn(instance, 'setState').mockImplementation(() => {});

      expect(() => {
        instance.focusToDate(new Date(2025, 5, 15));
      }).not.toThrow();

      expect(instance.list.scrollTo).toHaveBeenCalled();
      instance.setState.mockRestore();
    });

    test('handleScroll calls updateFrameAndClearCache before getVisibleRange (#577, #653)', () => {
      instance.props = {
        ...commonProps,
        scroll: { enabled: true },
        minDate: new Date(2020, 0, 1),
        onShownDateChange: jest.fn(),
      };
      instance.state.focusedDate = new Date(2025, 5, 15);
      const mockUpdateFrameAndClearCache = jest.fn();
      const mockGetVisibleRange = jest.fn(() => [60, 65]);
      instance.list = {
        getVisibleRange: mockGetVisibleRange,
        updateFrameAndClearCache: mockUpdateFrameAndClearCache,
      };

      instance.handleScroll();

      // updateFrameAndClearCache must be called BEFORE getVisibleRange
      expect(mockUpdateFrameAndClearCache).toHaveBeenCalledTimes(1);
      const updateCallOrder = mockUpdateFrameAndClearCache.mock.invocationCallOrder[0];
      const getRangeCallOrder = mockGetVisibleRange.mock.invocationCallOrder[0];
      expect(updateCallOrder).toBeLessThan(getRangeCallOrder);
    });

    test('handleScroll reports the first visible month after initial scroll render', () => {
      const onShownDateChange = jest.fn();
      instance.props = {
        ...commonProps,
        scroll: { enabled: true },
        minDate: new Date(2020, 0, 1),
        onShownDateChange,
      };
      instance.state.focusedDate = new Date(2025, 5, 15);
      instance.isFirstRender = false;
      instance.list = {
        getVisibleRange: jest.fn(() => [66, 67]),
        updateFrameAndClearCache: jest.fn(),
      };
      jest.spyOn(instance, 'setState').mockImplementation(update => {
        instance.state = { ...instance.state, ...update };
      });

      instance.handleScroll();

      expectSameDay(onShownDateChange.mock.calls[0][0], new Date(2025, 6, 1));
      expectSameDay(instance.state.focusedDate, new Date(2025, 6, 1));
      instance.setState.mockRestore();
    });

    test('handleScroll is safe when updateFrameAndClearCache is missing', () => {
      instance.props = {
        ...commonProps,
        scroll: { enabled: true },
        minDate: new Date(2020, 0, 1),
      };
      instance.state.focusedDate = new Date(2025, 5, 15);
      instance.list = {
        getVisibleRange: jest.fn(() => [0, 10]),
        // updateFrameAndClearCache intentionally omitted
      };

      expect(() => instance.handleScroll()).not.toThrow();
    });

    test('focusToDate with scroll disabled still works (regression)', () => {
      instance.props = {
        ...commonProps,
        scroll: { enabled: false },
      };
      // Suppress setState warning in direct instance test
      jest.spyOn(instance, 'setState').mockImplementation(() => {});

      // Should use setState path without touching this.list
      expect(() => {
        instance.focusToDate(new Date(2025, 5, 15));
      }).not.toThrow();
      instance.setState.mockRestore();
    });

    test('handleScroll returns early when this.list is null', () => {
      instance.props = { ...commonProps, minDate: new Date(2020, 0, 1) };
      instance.list = null;

      expect(() => instance.handleScroll()).not.toThrow();
    });

    test('updateShownDate falls back to props.months when this.list is null', () => {
      instance.props = {
        ...commonProps,
        scroll: { enabled: true },
        months: 2,
      };
      instance.list = null;
      instance.state.scrollArea = {
        enabled: true,
        monthHeight: 240,
        longMonthHeight: 280,
        calendarHeight: 420,
        calendarWidth: 'auto',
      };

      // Should not throw — uses props.months as fallback
      expect(() => instance.updateShownDate()).not.toThrow();
    });
  });

  // ---- 5.1: Calendar delegates to DateDisplay with constraint props ----
  describe('DateDisplay delegation', () => {
    const min = new Date(2025, 0, 1);
    const max = new Date(2025, 11, 31);
    const disabled = [new Date(2025, 6, 4)];

    test('renderDateDisplay returns a DateDisplay element with constraints propagated', () => {
      const instance = new Calendar({
        ...Calendar.defaultProps,
        minDate: min,
        maxDate: max,
        disabledDates: disabled,
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
      });
      instance.styles = {};

      const tree = instance.renderDateDisplay();

      // Verify the rendered element IS a DateDisplay component
      expect(tree.type).toBe(DateDisplay);

      // Verify constraint props are forwarded to DateDisplay
      expect(tree.props.minDate).toBe(min);
      expect(tree.props.maxDate).toBe(max);
      expect(tree.props.disabledDates).toBe(disabled);

      // Verify other key props are forwarded
      expect(tree.props.ranges).toEqual([
        { startDate: null, endDate: null, key: 'selection' },
      ]);
      expect(tree.props.onChange).toBe(instance.onDragSelectionEnd);
      expect(tree.props.onRangeFocusChange).toBe(instance.handleRangeFocusChange);
      expect(tree.props.styles).toBe(instance.styles);
      expect(tree.props.dateOptions).toBe(instance.dateOptions);
    });

    // ---- 5.2: renderDateDisplay always returns DateDisplay (guard is in render()) ----
    test('renderDateDisplay returns DateDisplay regardless of showDateDisplay prop', () => {
      const instance = new Calendar({
        ...Calendar.defaultProps,
        showDateDisplay: false,
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
      });
      instance.styles = {};

      const tree = instance.renderDateDisplay();
      // The showDateDisplay guard is in Calendar.render(), not renderDateDisplay
      expect(tree.type).toBe(DateDisplay);
    });

    // ---- Verify fix: spec scenario "Calendar-level display disabled" ----
    describe('render-level showDateDisplay guard', () => {
      test('when showDateDisplay is false, no DateDisplay appears in render tree', () => {
        const instance = new Calendar({
          ...Calendar.defaultProps,
          showDateDisplay: false,
          ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        });
        instance.styles = {};
        instance.dateOptions = {};

        const tree = instance.render();

        const hasDateDisplay = tree.props.children.some(
          child => child && child.type === DateDisplay
        );
        expect(hasDateDisplay).toBe(false);
      });

      test('when showDateDisplay is true, DateDisplay appears in render tree', () => {
        const instance = new Calendar({
          ...Calendar.defaultProps,
          showDateDisplay: true,
          ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        });
        instance.styles = {};
        instance.dateOptions = {};

        const tree = instance.render();

        const hasDateDisplay = tree.props.children.some(
          child => child && child.type === DateDisplay
        );
        expect(hasDateDisplay).toBe(true);
      });
    });
  });
});
