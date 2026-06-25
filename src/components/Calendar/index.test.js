import Calendar from '../Calendar';

describe('Calendar', () => {
  test('Should resolve', () => {
    expect(Calendar).toEqual(expect.anything());
  });

  describe('StrictMode scroll safety (#577, #653)', () => {
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
});
