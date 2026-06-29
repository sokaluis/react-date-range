import {
  calcFocusDate,
  findNextRangeIndex,
  getMonthDisplayRange,
  generateStyles,
} from './utils';

describe('calcFocusDate', () => {
  const makeProps = (overrides = {}) => ({
    shownDate: null,
    date: null,
    months: 1,
    ranges: [],
    focusedRange: [0, 0],
    displayMode: 'date',
    ...overrides,
  });

  test('returns shownDate when currentFocusedDate is null', () => {
    const shownDate = new Date(2025, 5, 15);
    expect(calcFocusDate(null, makeProps({ shownDate }))).toEqual(shownDate);
  });

  test('returns targetDate when shownDate absent and currentFocusedDate null', () => {
    const date = new Date(2025, 5, 15);
    const result = calcFocusDate(null, makeProps({ displayMode: 'date', date }));
    // The function calls startOfMonth on the date
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(5);
  });

  test('keeps currentFocusedDate when start after end exceeds months (inverted range)', () => {
    const current = new Date(2025, 3, 1);
    const ranges = [
      {
        // start after end — triggers the guard when span > months
        startDate: new Date(2025, 2, 1),
        endDate: new Date(2025, 0, 1),
        key: 'selection',
      },
    ];
    const result = calcFocusDate(
      current,
      makeProps({
        displayMode: 'dateRange',
        ranges,
        focusedRange: [0, 0],
        months: 1,
      })
    );
    expect(result).toEqual(current);
  });

  test('returns start-of-month targetDate when range fits within displayed months', () => {
    const current = new Date(2025, 5, 10);
    const ranges = [
      {
        startDate: new Date(2025, 4, 1),
        endDate: new Date(2025, 4, 30),
        key: 'selection',
      },
    ];
    const result = calcFocusDate(
      current,
      makeProps({
        displayMode: 'dateRange',
        ranges,
        focusedRange: [0, 0],
        months: 2,
      })
    );
    // Returns startOfMonth of range.startDate (May 2025)
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(4);
    expect(result.getDate()).toBe(1);
  });
});

describe('findNextRangeIndex', () => {
  test('skips range with autoFocus=false', () => {
    const ranges = [
      { autoFocus: false, startDate: new Date(2025, 0, 1) },
      { startDate: new Date(2025, 5, 15) },
    ];
    expect(findNextRangeIndex(ranges, 0)).toBe(1);
  });

  test('skips disabled ranges', () => {
    const ranges = [
      { disabled: true, startDate: new Date(2025, 0, 1) },
      { startDate: new Date(2025, 5, 15) },
    ];
    expect(findNextRangeIndex(ranges, 0)).toBe(1);
  });

  test('wraps to beginning when no next range found', () => {
    const ranges = [
      { startDate: new Date(2025, 0, 1) },
      { autoFocus: false },
    ];
    expect(findNextRangeIndex(ranges, 0)).toBe(0);
  });

  test('returns -1 when no eligible range exists', () => {
    const ranges = [
      { autoFocus: false },
      { disabled: true },
    ];
    expect(findNextRangeIndex(ranges)).toBe(-1);
  });
});

describe('getMonthDisplayRange', () => {
  test('returns ≤ 34 days difference without fixedHeight', () => {
    const range = getMonthDisplayRange(new Date(2025, 1, 1), {}, false);
    expect(range.end.getTime()).toBeGreaterThan(range.start.getTime());
    // February 2025 in a 28-day month — total days should be ≤ 34 (max 5 weeks)
  });

  test('extends by one extra week when fixedHeight and short month', () => {
    const range = getMonthDisplayRange(new Date(2025, 1, 1), {}, true);
    // February 2025 fits in 4 calendar weeks; with fixedHeight, another week is added
    expect(range.end.getTime()).toBeGreaterThan(range.start.getTime());
    // The start of March 2025 would be in week 5, so fixedHeight adds week 6
    const diffMs = range.end.getTime() - range.start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeGreaterThanOrEqual(35); // 5 weeks + 1 added = 6 weeks = 42 days
  });

  test('returns expected shape: start, end, startDateOfMonth, endDateOfMonth', () => {
    const date = new Date(2025, 5, 15);
    const range = getMonthDisplayRange(date, {}, false);
    expect(range).toHaveProperty('start');
    expect(range).toHaveProperty('end');
    expect(range).toHaveProperty('startDateOfMonth');
    expect(range).toHaveProperty('endDateOfMonth');
    expect(range.startDateOfMonth.getMonth()).toBe(5);
    expect(range.endDateOfMonth.getMonth()).toBe(5);
  });
});

describe('generateStyles', () => {
  test('returns {} for empty input', () => {
    expect(generateStyles([])).toEqual({});
  });

  test('merges multiple sources with classnames-style concatenation', () => {
    const source1 = { foo: 'a', bar: 'b' };
    const source2 = { foo: 'c', baz: 'd' };
    const result = generateStyles([source1, source2]);
    // classnames merges: foo becomes 'a c', bar stays 'b', baz stays 'd'
    expect(result.foo).toContain('a');
    expect(result.foo).toContain('c');
    expect(result.bar).toBe('b');
    expect(result.baz).toBe('d');
  });

  test('skips falsy sources', () => {
    const source = { foo: 'a' };
    const result = generateStyles([null, undefined, false, source]);
    expect(result).toEqual({ foo: 'a' });
  });

  test('single source returns its keys unchanged', () => {
    const source = { foo: 'bar' };
    expect(generateStyles([source])).toEqual({ foo: 'bar' });
  });
});
