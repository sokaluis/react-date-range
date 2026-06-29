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
  });
});
