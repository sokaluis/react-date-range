import {
  createStaticRanges,
  defaultStaticRanges,
  defaultInputRanges,
} from './defaultRanges';
import { isSameDay } from 'date-fns';

describe('createStaticRanges', () => {
  test('preserves label and range, adds isSelected method', () => {
    const rangeFn = () => ({ startDate: new Date(2025, 0, 1), endDate: new Date(2025, 0, 2) });
    const input = [{ label: 'Test', range: rangeFn }];
    const result = createStaticRanges(input);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Test');
    expect(result[0].range).toBe(rangeFn);
    expect(result[0].isSelected).toEqual(expect.any(Function));
  });

  test('isSelected returns true when both endpoints isSameDay the defined range', () => {
    const start = new Date(2025, 5, 10);
    const end = new Date(2025, 5, 12);
    const rangeFn = () => ({ startDate: start, endDate: end });
    const result = createStaticRanges([{ label: 'X', range: rangeFn }]);

    expect(
      result[0].isSelected({
        startDate: new Date(2025, 5, 10),
        endDate: new Date(2025, 5, 12),
      })
    ).toBe(true);
  });

  test('isSelected returns false when endpoints differ', () => {
    const rangeFn = () => ({ startDate: new Date(2025, 5, 10), endDate: new Date(2025, 5, 12) });
    const result = createStaticRanges([{ label: 'X', range: rangeFn }]);

    expect(
      result[0].isSelected({
        startDate: new Date(2025, 5, 10),
        endDate: new Date(2025, 5, 13),
      })
    ).toBe(false);
  });
});

describe('defaultStaticRanges', () => {
  test('contains the 6 expected labels in order', () => {
    const labels = defaultStaticRanges.map(r => r.label);
    expect(labels).toEqual([
      'Today',
      'Yesterday',
      'This Week',
      'Last Week',
      'This Month',
      'Last Month',
    ]);
  });

  test('each range() returns Date instances for startDate and endDate', () => {
    defaultStaticRanges.forEach((item, i) => {
      const range = item.range();
      expect(range.startDate).toBeInstanceOf(Date);
      expect(range.endDate).toBeInstanceOf(Date);
      // Both must be valid (non-NaN) dates
      expect(range.startDate.getTime()).not.toBeNaN();
      expect(range.endDate.getTime()).not.toBeNaN();
    });
  });

  test('each item has isSelected method', () => {
    defaultStaticRanges.forEach(item => {
      expect(item.isSelected).toEqual(expect.any(Function));
    });
  });
});

describe('defaultInputRanges', () => {
  test('contains 2 input ranges with expected labels', () => {
    expect(defaultInputRanges).toHaveLength(2);
    expect(defaultInputRanges[0].label).toBe('days up to today');
    expect(defaultInputRanges[1].label).toBe('days starting today');
  });

  test('range() returns objects with Date-valued startDate and endDate', () => {
    defaultInputRanges.forEach(inputRange => {
      const result = inputRange.range(5);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.startDate.getTime()).not.toBeNaN();
      expect(result.endDate.getTime()).not.toBeNaN();
    });
  });

  describe('getCurrentValue', () => {
    test("returns '-' when range endpoint does not match today reference", () => {
      const result = defaultInputRanges[0].getCurrentValue({
        startDate: new Date(2000, 0, 1),
        endDate: new Date(2000, 0, 2),
      });
      expect(result).toBe('-');
    });

    test('returns numeric value for range produced by the same input range', () => {
      // Call range() to get a valid range that internally matches the reference dates
      const completeRange = defaultInputRanges[0].range(1);
      const result = defaultInputRanges[0].getCurrentValue(completeRange);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);

      const completeRange2 = defaultInputRanges[1].range(1);
      const result2 = defaultInputRanges[1].getCurrentValue(completeRange2);
      expect(typeof result2).toBe('number');
      expect(result2).toBeGreaterThan(0);
    });

    // REQ-CG-004: range(0) produces a sensible same-day range
    test('range(0) produces valid startDate/endDate (same-day range)', () => {
      defaultInputRanges.forEach(inputRange => {
        const range = inputRange.range(0);
        expect(range.startDate).toBeInstanceOf(Date);
        expect(range.endDate).toBeInstanceOf(Date);
        expect(range.startDate.getTime()).not.toBeNaN();
        expect(range.endDate.getTime()).not.toBeNaN();
        // range(0) should produce a same-day range (start <= end)
        expect(range.startDate.getTime()).toBeLessThanOrEqual(range.endDate.getTime());
      });
    });

    // REQ-CG-004: range(NaN) produces Invalid Date (known edge — do NOT "fix" in production)
    // Each input range has one endpoint computed from value and one fixed to "today"
    test('range(NaN) produces Invalid Date on value-derived endpoint (known edge)', () => {
      // defaultInputRanges[0]: startDate derived from value, endDate = endOfToday
      const range0 = defaultInputRanges[0].range(NaN);
      expect(Number.isNaN(range0.startDate.getTime())).toBe(true); // derived from value
      expect(Number.isNaN(range0.endDate.getTime())).toBe(false); // fixed to endOfToday

      // defaultInputRanges[1]: startDate = today, endDate derived from value
      const range1 = defaultInputRanges[1].range(NaN);
      expect(Number.isNaN(range1.startDate.getTime())).toBe(false); // fixed to today
      expect(Number.isNaN(range1.endDate.getTime())).toBe(true); // derived from value
    });

    // REQ-CG-004: getCurrentValue returns '∞' when endpoint is null (unbounded range)
    test("getCurrentValue returns '∞' when startDate is null (unbounded range)", () => {
      // "days up to today" with open start
      const result0 = defaultInputRanges[0].getCurrentValue({
        startDate: null,
        endDate: new Date(),
      });
      expect(result0).toBe('∞');
    });

    test("getCurrentValue returns '∞' when endDate is null (unbounded range)", () => {
      // "days starting today" with open end
      const result1 = defaultInputRanges[1].getCurrentValue({
        startDate: new Date(),
        endDate: null,
      });
      expect(result1).toBe('∞');
    });
  });
});
