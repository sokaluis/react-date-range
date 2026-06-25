import { subDays, addDays, isSameDay } from 'date-fns';
import DateRange from '../DateRange';

let instance = null;
const endDate = new Date();
const startDate = subDays(endDate, 7);

const commonProps = {
  ...DateRange.defaultProps,
  ranges: [{ startDate, endDate, key: 'selection' }],
  onChange: () => {},
  moveRangeOnFirstSelection: false,
};

const compareRanges = (newRange, assertionRange) => {
  ['startDate', 'endDate'].forEach(key => {
    if (!newRange[key] || !assertionRange[key]) {
      return expect(newRange[key]).toEqual(assertionRange[key]);
    }
    return expect(isSameDay(newRange[key], assertionRange[key])).toEqual(true);
  });
};

// Direct instantiation — react-test-renderer.getInstance() returns null in React 19.
beforeEach(() => {
  instance = new DateRange(commonProps);
  // Simulate state initialization that would happen in the constructor.
  instance.state = {
    focusedRange: [0, 0],
    preview: null,
  };
});

describe('DateRange', () => {
  test('Should resolve', () => {
    expect(DateRange).toEqual(expect.anything());
  });

  test('calculate new selection by resetting end date', () => {
    const methodResult = instance.calcNewSelection(subDays(endDate, 10), true);
    compareRanges(methodResult.range, {
      startDate: subDays(endDate, 10),
      endDate: subDays(endDate, 10),
    });
  });

  test('calculate new selection by resetting end date if start date is not before', () => {
    const methodResult = instance.calcNewSelection(addDays(endDate, 2), true);
    compareRanges(methodResult.range, {
      startDate: addDays(endDate, 2),
      endDate: addDays(endDate, 2),
    });
  });

  test('calculate new selection based on moveRangeOnFirstSelection prop', () => {
    instance = new DateRange({ ...commonProps, moveRangeOnFirstSelection: true });
    instance.state = { focusedRange: [0, 0], preview: null };
    const methodResult = instance.calcNewSelection(subDays(endDate, 10), true);
    compareRanges(methodResult.range, {
      startDate: subDays(endDate, 10),
      endDate: subDays(endDate, 3),
    });
  });

  test('calculate new selection by retaining end date, based on retainEndDateOnFirstSelection prop', () => {
    instance = new DateRange({ ...commonProps, retainEndDateOnFirstSelection: true });
    instance.state = { focusedRange: [0, 0], preview: null };
    const methodResult = instance.calcNewSelection(subDays(endDate, 10), true);
    compareRanges(methodResult.range, {
      startDate: subDays(endDate, 10),
      endDate,
    });
  });

  test('calculate new selection when focused on end date (focusedRange[1] === 1)', () => {
    // PR #508: focusedRange={[0,1]} end-date handling.
    // When consumer controls focusedRange to the end-date slot,
    // clicking a day should set endDate while keeping startDate.
    instance = new DateRange({ ...commonProps, focusedRange: [0, 1] });
    instance.state = { focusedRange: [0, 1], preview: null };
    const newEnd = addDays(endDate, 2);
    const methodResult = instance.calcNewSelection(newEnd, true);
    // End date should be set to the clicked value; start date unchanged.
    compareRanges(methodResult.range, {
      startDate,
      endDate: newEnd,
    });
    // Next focus wraps back to [0, 0] for single-range scenarios.
    expect(methodResult.nextFocusRange).toEqual([0, 0]);
  });

  test('calculate new selection by retaining the unset end date, based on retainEndDateOnFirstSelection prop', () => {
    instance = new DateRange({
      ...commonProps,
      ranges: [{ ...commonProps.ranges[0], endDate: null }],
      retainEndDateOnFirstSelection: true,
    });
    instance.state = { focusedRange: [0, 0], preview: null };
    const methodResult = instance.calcNewSelection(subDays(endDate, 10), true);
    compareRanges(methodResult.range, {
      startDate: subDays(endDate, 10),
      endDate: null,
    });
  });
});
