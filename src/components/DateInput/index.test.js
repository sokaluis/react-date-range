import { format } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import DateInput from '../DateInput';

const FORMAT = 'MMM d, yyyy';
const dateOptions = { locale: enUS };

// Helper: given a Date, return its formatted string (match what DateInput renders)
function fmt(date) {
  return format(date, FORMAT, dateOptions);
}

// Helper: create a DateInput instance with standard test props
function createInstance(overrides = {}) {
  const props = {
    value: null,
    dateDisplayFormat: FORMAT,
    dateOptions,
    onFocus: jest.fn(),
    onChange: jest.fn(),
    ...overrides,
  };
  const instance = new DateInput(props);
  // Mock setState so callbacks fire synchronously and state is tracked
  // (follows Calendar test pattern for direct instance testing)
  jest.spyOn(instance, 'setState').mockImplementation((updater, callback) => {
    if (typeof updater === 'function') {
      instance.state = { ...instance.state, ...updater(instance.state) };
    } else {
      instance.state = { ...instance.state, ...updater };
    }
    if (callback) callback();
  });
  return instance;
}

// Helper: set up typed-and-changed state then call update()
function typeAndUpdate(instance, value) {
  // Simulate user typing: set value, clear invalid, mark changed
  instance.state = {
    ...instance.state,
    changed: true,
    invalid: false,
    value,
  };
  instance.update(value);
}

// ---- Reference dates ----
// min boundary = June 10, 2025
// max boundary = June 20, 2025
// disabled      = June 12, 2025
// valid inside  = June 15, 2025
const minDate = new Date(2025, 5, 10);
const maxDate = new Date(2025, 5, 20);
const disabledDate = new Date(2025, 5, 12);
const validInside = new Date(2025, 5, 15);
const beforeMin = new Date(2025, 5, 5);
const afterMax = new Date(2025, 5, 25);

describe('DateInput', () => {
  // ---- Basic existence ----
  test('Should resolve', () => {
    expect(DateInput).toEqual(expect.anything());
  });

  // ---- 4.5: Backward compatibility (no constraint props) ----
  describe('without constraint props (regression)', () => {
    test('still emits onChange for valid parse', () => {
      const onChange = jest.fn();
      const date = new Date(2025, 5, 15);
      const instance = createInstance({ onChange });
      typeAndUpdate(instance, fmt(date));
      expect(onChange).toHaveBeenCalledWith(date);
      expect(instance.state.invalid).toBe(false);
    });

    // Unparseable input — spec: "Parse Warning Compatibility > Unparseable input still warns"
    test('unparseable input does not emit onChange and shows warning', () => {
      const onChange = jest.fn();
      const instance = createInstance({ onChange });
      typeAndUpdate(instance, 'not-a-valid-date-at-all');
      expect(onChange).not.toHaveBeenCalled();
      expect(instance.state.invalid).toBe(true);
    });
  });

  // ---- Constraint tests ----
  describe('with constraint props', () => {
    // ---- 4.4: Valid date within constraints ----
    test('accepts date within min/max and not disabled', () => {
      const onChange = jest.fn();
      const instance = createInstance({
        onChange,
        minDate,
        maxDate,
        disabledDates: [disabledDate],
      });
      typeAndUpdate(instance, fmt(validInside));
      expect(onChange).toHaveBeenCalledTimes(1);
      const emitted = onChange.mock.calls[0][0];
      expect(emitted.getFullYear()).toBe(validInside.getFullYear());
      expect(emitted.getMonth()).toBe(validInside.getMonth());
      expect(emitted.getDate()).toBe(validInside.getDate());
      expect(instance.state.invalid).toBe(false);
    });

    // ---- 4.1: Reject date before minDate ----
    test('rejects date before minDate', () => {
      const onChange = jest.fn();
      const instance = createInstance({ onChange, minDate });
      typeAndUpdate(instance, fmt(beforeMin));
      expect(onChange).not.toHaveBeenCalled();
      expect(instance.state.invalid).toBe(true);
    });

    // ---- 4.2: Reject date after maxDate ----
    test('rejects date after maxDate', () => {
      const onChange = jest.fn();
      const instance = createInstance({ onChange, maxDate });
      typeAndUpdate(instance, fmt(afterMax));
      expect(onChange).not.toHaveBeenCalled();
      expect(instance.state.invalid).toBe(true);
    });

    // ---- 4.3: Reject date matching disabledDates entry ----
    test('rejects date listed in disabledDates', () => {
      const onChange = jest.fn();
      const instance = createInstance({
        onChange,
        disabledDates: [disabledDate],
      });
      typeAndUpdate(instance, fmt(disabledDate));
      expect(onChange).not.toHaveBeenCalled();
      expect(instance.state.invalid).toBe(true);
    });

    // ---- 4.6: Boundary dates accepted ----
    test('accepts date equal to minDate boundary', () => {
      const onChange = jest.fn();
      const instance = createInstance({ onChange, minDate, maxDate });
      typeAndUpdate(instance, fmt(minDate));
      expect(onChange).toHaveBeenCalledTimes(1);
      const emitted = onChange.mock.calls[0][0];
      expect(emitted.getFullYear()).toBe(minDate.getFullYear());
      expect(emitted.getMonth()).toBe(minDate.getMonth());
      expect(emitted.getDate()).toBe(minDate.getDate());
      expect(instance.state.invalid).toBe(false);
    });

    test('accepts date equal to maxDate boundary', () => {
      const onChange = jest.fn();
      const instance = createInstance({ onChange, minDate, maxDate });
      typeAndUpdate(instance, fmt(maxDate));
      expect(onChange).toHaveBeenCalledTimes(1);
      const emitted = onChange.mock.calls[0][0];
      expect(emitted.getFullYear()).toBe(maxDate.getFullYear());
      expect(emitted.getMonth()).toBe(maxDate.getMonth());
      expect(emitted.getDate()).toBe(maxDate.getDate());
      expect(instance.state.invalid).toBe(false);
    });
  });
});
