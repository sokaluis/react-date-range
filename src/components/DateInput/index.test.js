import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import DateInput from '../DateInput/index.jsx';

const FORMAT = 'MMM d, yyyy';
const dateOptions = { locale: enUS };

// Helper: given a Date, return its formatted string (match what DateInput renders)
function fmt(date) {
  return format(date, FORMAT, dateOptions);
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

// Helper: render DateInput with standard test props.
// readOnly defaults to false so interaction tests can type into the input.
function setup(overrides = {}) {
  const props = {
    readOnly: false,
    value: null,
    dateDisplayFormat: FORMAT,
    dateOptions,
    onFocus: jest.fn(),
    onChange: jest.fn(),
    ...overrides,
  };
  return render(<DateInput {...props} />);
}

// Helper: type a value into the input via fireEvent.change, wait for React to
// commit the state, then fireEvent.blur.  Uses async act to flush batched state
// updates (React 19 with createRoot requires async act for class components).
async function typeAndBlur(input, value) {
  await act(async () => {
    fireEvent.change(input, { target: { value } });
  });
  await act(async () => {
    fireEvent.blur(input);
  });
}

// Helper: type a value into the input, then press Enter.
async function typeAndEnter(input, value) {
  await act(async () => {
    fireEvent.change(input, { target: { value } });
  });
  await act(async () => {
    fireEvent.keyDown(input, { key: 'Enter' });
  });
}

// Helper: type a value into the input only (no blur/enter — mid-edit state).
async function typeOnly(input, value) {
  await act(async () => {
    fireEvent.change(input, { target: { value } });
  });
}

describe('DateInput', () => {
  // ---- REQ-HM-001: Function component ----
  test('Should resolve as a function component without runtime defaultProps', () => {
    expect(typeof DateInput).toBe('function');
    expect(DateInput.defaultProps).toBeUndefined();
    // With a class, new works; with a function, it throws TypeError
    expect(() => new DateInput({})).toThrow(TypeError);
  });

  // ---- 4.5: Backward compatibility (no constraint props) ----
  describe('without constraint props (regression)', () => {
    test('still emits onChange for valid parse', async () => {
      const onChange = jest.fn();
      const date = new Date(2025, 5, 15);
      setup({ onChange });
      const input = screen.getByRole('textbox');

      await typeAndBlur(input, fmt(date));

      expect(onChange).toHaveBeenCalledWith(date);
    });

    // Unparseable input — spec: "Parse Warning Compatibility > Unparseable input still warns"
    test('unparseable input does not emit onChange and shows warning', async () => {
      const onChange = jest.fn();
      const { container } = setup({ onChange });
      const input = screen.getByRole('textbox');

      await typeAndBlur(input, 'not-a-valid-date-at-all');

      expect(onChange).not.toHaveBeenCalled();
      expect(container.querySelector('.rdrWarning')).toBeInTheDocument();
    });
  });

  // ---- Constraint tests ----
  describe('with constraint props', () => {
    // ---- 4.4: Valid date within constraints ----
    test('accepts date within min/max and not disabled', async () => {
      const onChange = jest.fn();
      setup({
        onChange,
        minDate,
        maxDate,
        disabledDates: [disabledDate],
      });
      const input = screen.getByRole('textbox');

      await typeAndBlur(input, fmt(validInside));

      expect(onChange).toHaveBeenCalledTimes(1);
      const emitted = onChange.mock.calls[0][0];
      expect(emitted.getFullYear()).toBe(validInside.getFullYear());
      expect(emitted.getMonth()).toBe(validInside.getMonth());
      expect(emitted.getDate()).toBe(validInside.getDate());
    });

    // ---- 4.1: Reject date before minDate ----
    test('rejects date before minDate', async () => {
      const onChange = jest.fn();
      const { container } = setup({ onChange, minDate });
      const input = screen.getByRole('textbox');

      await typeAndBlur(input, fmt(beforeMin));

      expect(onChange).not.toHaveBeenCalled();
      expect(container.querySelector('.rdrWarning')).toBeInTheDocument();
    });

    // ---- 4.2: Reject date after maxDate ----
    test('rejects date after maxDate', async () => {
      const onChange = jest.fn();
      const { container } = setup({ onChange, maxDate });
      const input = screen.getByRole('textbox');

      await typeAndBlur(input, fmt(afterMax));

      expect(onChange).not.toHaveBeenCalled();
      expect(container.querySelector('.rdrWarning')).toBeInTheDocument();
    });

    // ---- 4.3: Reject date matching disabledDates entry ----
    test('rejects date listed in disabledDates', async () => {
      const onChange = jest.fn();
      const { container } = setup({
        onChange,
        disabledDates: [disabledDate],
      });
      const input = screen.getByRole('textbox');

      await typeAndBlur(input, fmt(disabledDate));

      expect(onChange).not.toHaveBeenCalled();
      expect(container.querySelector('.rdrWarning')).toBeInTheDocument();
    });

    // ---- 4.6: Boundary dates accepted ----
    test('accepts date equal to minDate boundary', async () => {
      const onChange = jest.fn();
      setup({ onChange, minDate, maxDate });
      const input = screen.getByRole('textbox');

      await typeAndBlur(input, fmt(minDate));

      expect(onChange).toHaveBeenCalledTimes(1);
      const emitted = onChange.mock.calls[0][0];
      expect(emitted.getFullYear()).toBe(minDate.getFullYear());
      expect(emitted.getMonth()).toBe(minDate.getMonth());
      expect(emitted.getDate()).toBe(minDate.getDate());
    });

    test('accepts date equal to maxDate boundary', async () => {
      const onChange = jest.fn();
      setup({ onChange, minDate, maxDate });
      const input = screen.getByRole('textbox');

      await typeAndBlur(input, fmt(maxDate));

      expect(onChange).toHaveBeenCalledTimes(1);
      const emitted = onChange.mock.calls[0][0];
      expect(emitted.getFullYear()).toBe(maxDate.getFullYear());
      expect(emitted.getMonth()).toBe(maxDate.getMonth());
      expect(emitted.getDate()).toBe(maxDate.getDate());
    });
  });

  // ---- REQ-HM-004: Destructuring defaults ----
  describe('destructuring defaults (post-defaultProps migration)', () => {
    test('readOnly defaults to true when prop is not provided', () => {
      // Don't use setup() — it defaults readOnly to false.
      // Render explicitly without readOnly to test the default.
      // Must provide a safe dateDisplayFormat to avoid date-fns protected-token RangeError.
      render(
        <DateInput
          value={new Date(2025, 5, 15)}
          dateDisplayFormat={FORMAT}
          onChange={jest.fn()}
        />
      );
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    test('readOnly is overridable when prop is explicitly passed', () => {
      render(
        <DateInput
          value={new Date(2025, 5, 15)}
          readOnly={false}
          dateDisplayFormat={FORMAT}
          onChange={jest.fn()}
        />
      );
      expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
    });
  });

  // ---- REQ-HM-005: Handler semantics (Enter key) ----
  describe('event handlers', () => {
    test('Enter key triggers update like blur', async () => {
      const onChange = jest.fn();
      const date = new Date(2025, 5, 15);
      setup({ onChange });
      const input = screen.getByRole('textbox');

      await typeAndEnter(input, fmt(date));

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    test('onChange clears warning and marks changed', async () => {
      const onChange = jest.fn();
      const { container } = setup({ onChange });
      const input = screen.getByRole('textbox');

      // First, produce a warning with unparseable input
      await typeAndBlur(input, 'garbage');
      expect(container.querySelector('.rdrWarning')).toBeInTheDocument();

      // Then type a valid date — warning should disappear
      await typeOnly(input, fmt(validInside));
      await waitFor(() => {
        expect(container.querySelector('.rdrWarning')).not.toBeInTheDocument();
      });
    });
  });

  // ---- REQ-HM-002: Lazy initializer (value formatted once on mount) ----
  test('formats initial value correctly on mount (REQ-HM-002)', () => {
    const date = new Date(2025, 5, 15);
    render(
      <DateInput
        value={date}
        dateDisplayFormat="yyyy-MM-dd"
        onChange={jest.fn()}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue('2025-06-15');
  });

  // ---- REQ-HM-003: Controlled-sync effect with changed-flag guard ----
  describe('controlled-sync effect', () => {
    test('external value change re-formats input (REQ-HM-003 scenario A)', () => {
      const onChange = jest.fn();
      const d1 = new Date(2025, 5, 15);
      const d2 = new Date(2025, 6, 4);
      const { rerender } = render(
        <DateInput
          value={d1}
          onChange={onChange}
          dateDisplayFormat="yyyy-MM-dd"
          dateOptions={dateOptions}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('2025-06-15');

      rerender(
        <DateInput
          value={d2}
          onChange={onChange}
          dateDisplayFormat="yyyy-MM-dd"
          dateOptions={dateOptions}
        />
      );
      expect(input).toHaveValue('2025-07-04');
    });

    test('preserves mid-edit value when parent re-renders with deeply-equal value (REQ-HM-003 scenario B)', async () => {
      const onChange = jest.fn(); // does NOT update parent state
      const d1 = new Date(2025, 5, 15);
      const { rerender } = render(
        <DateInput
          value={d1}
          onChange={onChange}
          readOnly={false}
          dateDisplayFormat="yyyy-MM-dd"
          dateOptions={dateOptions}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('2025-06-15');

      // User types something different (mid-edit, no blur)
      await typeOnly(input, '2025-08-01');

      // Parent re-renders with a NEW Date object representing the SAME calendar day
      // (different referential identity, same isEqual result — tests the changed guard)
      rerender(
        <DateInput
          value={new Date(2025, 5, 15)}
          onChange={onChange}
          readOnly={false}
          dateDisplayFormat="yyyy-MM-dd"
          dateOptions={dateOptions}
        />
      );
      expect(input).toHaveValue('2025-08-01'); // Should preserve user's typed value
    });
  });
});
