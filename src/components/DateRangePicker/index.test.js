import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { addDays } from 'date-fns';
import DateRangePicker from '../DateRangePicker';
import DateRange from '../DateRange';
import DefinedRange from '../DefinedRange';
import Calendar from '../Calendar';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const startDate = new Date(2025, 5, 10);
const endDate = new Date(2025, 5, 15);
const nextStartDate = addDays(startDate, 20);
const nextEndDate = addDays(endDate, 20);

const ranges = [
  { startDate, endDate, key: 'selection', color: '#123456' },
  { startDate: nextStartDate, endDate: nextEndDate, key: 'comparison', color: '#654321' },
];

const baseProps = {
  ...DateRange.defaultProps,
  ranges,
  onChange: () => {},
  staticRanges: [],
  inputRanges: [],
};

const renderDateRangePicker = props => {
  const ref = React.createRef();
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<DateRangePicker {...baseProps} {...props} ref={ref} />);
  });
  return { ref, renderer };
};

describe('DateRangePicker hooks parity', () => {
  test('exports a forwardRef function component while preserving static metadata', () => {
    const { ref, renderer } = renderDateRangePicker({ className: 'customPicker' });

    expect(DateRangePicker.$$typeof).toBe(Symbol.for('react.forward_ref'));
    expect(DateRangePicker.defaultProps).toEqual({});
    expect(DateRangePicker.propTypes.ranges).toEqual(expect.any(Function));
    expect(DateRangePicker.propTypes.className).toEqual(expect.any(Function));
    expect(ref.current.setState).toBeUndefined();
    expect(renderer.root.findByType(DefinedRange).props.className).toBeUndefined();
    expect(renderer.root.findByType(DateRange).props.className).toBeUndefined();
  });

  test('keeps DefinedRange synchronized with DateRange focus changes', () => {
    const { renderer } = renderDateRangePicker();

    expect(renderer.root.findByType(DefinedRange).props.focusedRange).toEqual([0, 0]);
    expect(renderer.root.findByType(DefinedRange).props.range).toBe(ranges[0]);

    act(() => {
      renderer.root.findByType(DateRange).props.onRangeFocusChange([1, 0]);
    });

    expect(renderer.root.findByType(DefinedRange).props.focusedRange).toEqual([1, 0]);
    expect(renderer.root.findByType(DefinedRange).props.range).toBe(ranges[1]);
    expect(renderer.root.findByType(DateRange).props.focusedRange).toEqual([1, 0]);
  });

  test('routes DefinedRange previews through DateRange selection calculation and clears them', () => {
    const { renderer } = renderDateRangePicker();
    const previewValue = {
      startDate: addDays(startDate, 2),
      endDate: addDays(endDate, 2),
    };

    act(() => {
      renderer.root.findByType(DefinedRange).props.onPreviewChange(previewValue);
    });

    expect(renderer.root.findByType(Calendar).props.preview).toEqual({
      ...previewValue,
      color: ranges[0].color,
    });

    act(() => {
      renderer.root.findByType(DefinedRange).props.onPreviewChange();
    });

    expect(renderer.root.findByType(Calendar).props.preview).toBe(null);
  });
});
