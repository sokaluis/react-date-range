import DateDisplay from './index.jsx';
import DateInput from '../DateInput/index.jsx';

// Helper: create a DateDisplay instance with defaultProps spread (matching Calendar test pattern)
function makeInstance(overrides = {}) {
  return new DateDisplay({
    ...DateDisplay.defaultProps,
    ...overrides,
  });
}

describe('DateDisplay', () => {
  test('Should resolve', () => {
    expect(DateDisplay).toEqual(expect.anything());
  });

  // ---- 4.1: Empty ranges renders wrapper with no children ----
  test('renders wrapper with no children when ranges is empty', () => {
    const instance = makeInstance({ ranges: [] });
    const tree = instance.render();
    expect(tree).not.toBeNull();
    expect(tree.props.children).toHaveLength(0);
  });

  // ---- 4.2: Visibility guard ----
  describe('range visibility', () => {
    test('returns null entry for range where showDateDisplay === false', () => {
      const instance = makeInstance({
        ranges: [{ startDate: null, endDate: null, key: 'r1', showDateDisplay: false }],
        styles: { dateDisplayWrapper: 'ddw' },
      });
      const tree = instance.render();
      // Map returns null for this range, so children contains [null]
      expect(tree.props.children[0]).toBeNull();
    });

    test('renders range when showDateDisplay === true even if disabled', () => {
      const instance = makeInstance({
        ranges: [{ startDate: null, endDate: null, key: 'r1', showDateDisplay: true, disabled: true }],
        styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
        dateOptions: { locale: {} },
      });
      const tree = instance.render();
      expect(tree.props.children).toHaveLength(1);
      const rangeDiv = tree.props.children[0];
      expect(rangeDiv).not.toBeNull();
      const [startInput] = rangeDiv.props.children;
      expect(startInput.props.disabled).toBe(true);
    });

    test('renders range when showDateDisplay is truthy (not explicitly false)', () => {
      const instance = makeInstance({
        ranges: [{ startDate: null, endDate: null, key: 'r1' }],
        styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
        dateOptions: { locale: {} },
      });
      const tree = instance.render();
      expect(tree.props.children).toHaveLength(1);
    });
  });

  // ---- 4.3: onRangeFocusChange wiring ----
  describe('onRangeFocusChange callbacks', () => {
    test('start DateInput onFocus calls onRangeFocusChange(i, 0)', () => {
      const onRangeFocusChange = jest.fn();
      const instance = makeInstance({
        ranges: [{ startDate: null, endDate: null, key: 'r1' }],
        focusedRange: [0, 0],
        styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
        dateOptions: { locale: {} },
        onRangeFocusChange,
      });
      const tree = instance.render();
      const rangeDiv = tree.props.children[0];
      const [startInput] = rangeDiv.props.children;
      startInput.props.onFocus();
      expect(onRangeFocusChange).toHaveBeenCalledWith(0, 0);
    });

    test('end DateInput onFocus calls onRangeFocusChange(i, 1)', () => {
      const onRangeFocusChange = jest.fn();
      const instance = makeInstance({
        ranges: [{ startDate: null, endDate: null, key: 'r1' }],
        focusedRange: [0, 0],
        styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
        dateOptions: { locale: {} },
        onRangeFocusChange,
      });
      const tree = instance.render();
      const rangeDiv = tree.props.children[0];
      const [, endInput] = rangeDiv.props.children;
      endInput.props.onFocus();
      expect(onRangeFocusChange).toHaveBeenCalledWith(0, 1);
    });

    test('uses correct range index i for multiple ranges', () => {
      const onRangeFocusChange = jest.fn();
      const instance = makeInstance({
        ranges: [
          { startDate: null, endDate: null, key: 'r1' },
          { startDate: null, endDate: null, key: 'r2' },
        ],
        focusedRange: [1, 0],
        styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
        dateOptions: { locale: {} },
        onRangeFocusChange,
      });
      const tree = instance.render();
      // Second range (i=1)
      const rangeDiv1 = tree.props.children[1];
      const [startInput1] = rangeDiv1.props.children;
      startInput1.props.onFocus();
      expect(onRangeFocusChange).toHaveBeenCalledWith(1, 0);

      const [, endInput1] = rangeDiv1.props.children;
      endInput1.props.onFocus();
      expect(onRangeFocusChange).toHaveBeenCalledWith(1, 1);
    });
  });

  // ---- 4.4: onChange forwarded ----
  test('onChange is forwarded unchanged to both DateInput instances', () => {
    const onChange = jest.fn();
    const instance = makeInstance({
      ranges: [{ startDate: null, endDate: null, key: 'r1' }],
      styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
      dateOptions: { locale: {} },
      onChange,
    });
    const tree = instance.render();
    const rangeDiv = tree.props.children[0];
    const [startInput, endInput] = rangeDiv.props.children;
    expect(startInput.props.onChange).toBe(onChange);
    expect(endInput.props.onChange).toBe(onChange);
  });

  // ---- 4.5: Constraint props forwarded ----
  test('minDate, maxDate, disabledDates reach both DateInput props', () => {
    const minDate = new Date(2025, 0, 1);
    const maxDate = new Date(2025, 11, 31);
    const disabledDates = [new Date(2025, 6, 4)];
    const instance = makeInstance({
      ranges: [{ startDate: null, endDate: null, key: 'r1' }],
      styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
      dateOptions: { locale: {} },
      minDate,
      maxDate,
      disabledDates,
    });
    const tree = instance.render();
    const rangeDiv = tree.props.children[0];
    const [startInput, endInput] = rangeDiv.props.children;

    expect(startInput.type).toBe(DateInput);
    expect(endInput.type).toBe(DateInput);

    expect(startInput.props.minDate).toBe(minDate);
    expect(startInput.props.maxDate).toBe(maxDate);
    expect(startInput.props.disabledDates).toBe(disabledDates);

    expect(endInput.props.minDate).toBe(minDate);
    expect(endInput.props.maxDate).toBe(maxDate);
    expect(endInput.props.disabledDates).toBe(disabledDates);
  });

  // ---- 4.6: readOnly and disabled wiring ----
  test('readOnly and disabled are correctly wired to both inputs', () => {
    // Range with disabled=true needs explicit showDateDisplay=true to render
    // (asymmetric rule: disabled && !showDateDisplay → hidden)
    const instance = makeInstance({
      ranges: [
        { startDate: null, endDate: null, key: 'r1', disabled: true, showDateDisplay: true },
        { startDate: null, endDate: null, key: 'r2', disabled: false },
      ],
      editableDateInputs: false,
      styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
      dateOptions: { locale: {} },
    });
    const tree = instance.render();

    // Range 0: disabled=true, showDateDisplay=true, editable=false → readOnly=true, disabled=true
    const rangeDiv0 = tree.props.children[0];
    const [start0, end0] = rangeDiv0.props.children;
    expect(start0.props.readOnly).toBe(true);
    expect(start0.props.disabled).toBe(true);
    expect(end0.props.readOnly).toBe(true);
    expect(end0.props.disabled).toBe(true);

    // Range 1: disabled=false, editable=false → readOnly=true, disabled=false
    const rangeDiv1 = tree.props.children[1];
    const [start1, end1] = rangeDiv1.props.children;
    expect(start1.props.readOnly).toBe(true);
    expect(start1.props.disabled).toBe(false);
    expect(end1.props.readOnly).toBe(true);
    expect(end1.props.disabled).toBe(false);

    // Create instance with editableDateInputs=true
    const instance2 = makeInstance({
      ranges: [{ startDate: null, endDate: null, key: 'r1', disabled: false }],
      editableDateInputs: true,
      styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
      dateOptions: { locale: {} },
    });
    const tree2 = instance2.render();
    const rangeDiv2 = tree2.props.children[0];
    const [start2, end2] = rangeDiv2.props.children;
    expect(start2.props.readOnly).toBe(false);
    expect(start2.props.disabled).toBe(false);
    expect(end2.props.readOnly).toBe(false);
    expect(end2.props.disabled).toBe(false);
  });

  // ---- 4.7: Formatting and placeholder props forwarded ----
  test('dateDisplayFormat, dateOptions, startDatePlaceholder, endDatePlaceholder are forwarded', () => {
    const dateOptions = { locale: { code: 'test' } };
    const instance = makeInstance({
      ranges: [{ startDate: null, endDate: null, key: 'r1' }],
      dateDisplayFormat: 'yyyy-MM-dd',
      startDatePlaceholder: 'From',
      endDatePlaceholder: 'To',
      dateOptions,
      styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
    });
    const tree = instance.render();
    const rangeDiv = tree.props.children[0];
    const [startInput, endInput] = rangeDiv.props.children;

    expect(startInput.props.dateDisplayFormat).toBe('yyyy-MM-dd');
    expect(startInput.props.placeholder).toBe('From');
    expect(startInput.props.dateOptions).toBe(dateOptions);

    expect(endInput.props.dateDisplayFormat).toBe('yyyy-MM-dd');
    expect(endInput.props.placeholder).toBe('To');
    expect(endInput.props.dateOptions).toBe(dateOptions);
  });

  // ---- Verify fix: ariaLabels.dateInput forwarded to DateInput ----
  test('ariaLabels.dateInput is forwarded to DateInput start and end ariaLabel', () => {
    const ariaLabels = {
      dateInput: {
        selection: { startDate: 'Check-in date', endDate: 'Check-out date' },
        alt: { startDate: 'Alt start', endDate: 'Alt end' },
      },
    };
    const instance = makeInstance({
      ranges: [
        { startDate: null, endDate: null, key: 'selection' },
        { startDate: null, endDate: null, key: 'alt' },
      ],
      ariaLabels,
      styles: { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' },
      dateOptions: { locale: {} },
    });
    const tree = instance.render();

    // Range 0: key='selection'
    const [start0, end0] = tree.props.children[0].props.children;
    expect(start0.props.ariaLabel).toBe('Check-in date');
    expect(end0.props.ariaLabel).toBe('Check-out date');

    // Range 1: key='alt'
    const [start1, end1] = tree.props.children[1].props.children;
    expect(start1.props.ariaLabel).toBe('Alt start');
    expect(end1.props.ariaLabel).toBe('Alt end');
  });

  // ---- 4.8: Active class logic ----
  describe('active class (dateDisplayItemActive)', () => {
    const styles = {
      dateDisplayWrapper: 'ddw',
      dateDisplay: 'dd',
      dateDisplayItem: 'ddi',
      dateDisplayItemActive: 'ddi-active',
    };

    test('applies active class to start input when focusedRange matches', () => {
      const instance = makeInstance({
        ranges: [{ startDate: null, endDate: null, key: 'r1' }],
        focusedRange: [0, 0],
        styles,
        dateOptions: { locale: {} },
      });
      const tree = instance.render();
      const rangeDiv = tree.props.children[0];
      const [startInput, endInput] = rangeDiv.props.children;
      expect(startInput.props.className).toContain('ddi-active');
      expect(endInput.props.className).not.toContain('ddi-active');
    });

    test('applies active class to end input when focusedRange matches', () => {
      const instance = makeInstance({
        ranges: [{ startDate: null, endDate: null, key: 'r1' }],
        focusedRange: [0, 1],
        styles,
        dateOptions: { locale: {} },
      });
      const tree = instance.render();
      const rangeDiv = tree.props.children[0];
      const [startInput, endInput] = rangeDiv.props.children;
      expect(startInput.props.className).not.toContain('ddi-active');
      expect(endInput.props.className).toContain('ddi-active');
    });

    test('applies active class to correct range when multiple ranges present', () => {
      const instance = makeInstance({
        ranges: [
          { startDate: null, endDate: null, key: 'r1' },
          { startDate: null, endDate: null, key: 'r2' },
        ],
        focusedRange: [1, 0],
        styles,
        dateOptions: { locale: {} },
      });
      const tree = instance.render();
      // Range 0 should NOT be active
      const rangeDiv0 = tree.props.children[0];
      const [s0] = rangeDiv0.props.children;
      expect(s0.props.className).not.toContain('ddi-active');
      // Range 1 SHOULD be active on start
      const rangeDiv1 = tree.props.children[1];
      const [s1, e1] = rangeDiv1.props.children;
      expect(s1.props.className).toContain('ddi-active');
      expect(e1.props.className).not.toContain('ddi-active');
    });
  });

  // ---- 4.9: Wrapper color style ----
  describe('wrapper color style', () => {
    const styles = { dateDisplayWrapper: 'ddw', dateDisplay: 'dd', dateDisplayItem: 'ddi' };

    test('uses range.color when provided', () => {
      const instance = makeInstance({
        ranges: [{ startDate: null, endDate: null, key: 'r1', color: '#ff0000' }],
        styles,
        dateOptions: { locale: {} },
      });
      const tree = instance.render();
      const rangeDiv = tree.props.children[0];
      expect(rangeDiv.props.style).toEqual({ color: '#ff0000' });
    });

    test('falls back to rangeColors[focusedRange[0]] when range has no color', () => {
      const instance = makeInstance({
        ranges: [{ startDate: null, endDate: null, key: 'r1' }],
        rangeColors: ['#abcdef', '#fedcba'],
        color: '#0000ff',
        focusedRange: [0, 0],
        styles,
        dateOptions: { locale: {} },
      });
      const tree = instance.render();
      const rangeDiv = tree.props.children[0];
      expect(rangeDiv.props.style).toEqual({ color: '#abcdef' });
    });

    test('falls back to color prop when rangeColors[focusedRange[0]] is falsy', () => {
      const instance = makeInstance({
        ranges: [{ startDate: null, endDate: null, key: 'r1' }],
        rangeColors: [],
        color: '#00ff00',
        focusedRange: [0, 0],
        styles,
        dateOptions: { locale: {} },
      });
      const tree = instance.render();
      const rangeDiv = tree.props.children[0];
      expect(rangeDiv.props.style).toEqual({ color: '#00ff00' });
    });

    test('color applies per-range — different focusedRange picks different defaultColor', () => {
      const instance = makeInstance({
        ranges: [
          { startDate: null, endDate: null, key: 'r1' },
          { startDate: null, endDate: null, key: 'r2' },
        ],
        rangeColors: ['#aaa', '#bbb'],
        color: '#000',
        focusedRange: [1, 0],
        styles,
        dateOptions: { locale: {} },
      });
      const tree = instance.render();
      const rangeDiv0 = tree.props.children[0];
      const rangeDiv1 = tree.props.children[1];
      expect(rangeDiv0.props.style).toEqual({ color: '#bbb' });
      expect(rangeDiv1.props.style).toEqual({ color: '#bbb' });
    });
  });
});
