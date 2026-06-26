import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import DefinedRange from '../DefinedRange';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const selectedRange = {
  startDate: new Date(2025, 5, 10),
  endDate: new Date(2025, 5, 12),
  key: 'selection',
  color: '#123456',
};

const nextRange = {
  startDate: new Date(2025, 6, 1),
  endDate: new Date(2025, 6, 7),
};

const baseProps = {
  ...DefinedRange.defaultProps,
  ranges: [selectedRange],
  focusedRange: [0, 0],
};

const renderDefinedRange = props => {
  let renderer;
  const ref = React.createRef();
  act(() => {
    renderer = TestRenderer.create(<DefinedRange {...baseProps} {...props} ref={ref} />);
  });
  return { ref, renderer };
};

const textOf = node => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node || !node.children) return '';
  return node.children.map(textOf).join('');
};

const staticRange = overrides => ({
  label: 'Custom range',
  range: jest.fn(() => nextRange),
  isSelected: jest.fn(range => range === selectedRange),
  ...overrides,
});

const inputRange = overrides => ({
  label: 'days from selection',
  range: jest.fn(value => ({ endDate: selectedRange.endDate, startDate: new Date(2025, 5, value) })),
  getCurrentValue: jest.fn(() => 5),
  ...overrides,
});

describe('DefinedRange hooks parity', () => {
  test('exports a forwardRef function component while preserving static metadata', () => {
    const { ref } = renderDefinedRange();

    expect(DefinedRange.$$typeof).toBe(Symbol.for('react.forward_ref'));
    expect(DefinedRange.defaultProps.staticRanges).toEqual(expect.any(Array));
    expect(DefinedRange.defaultProps.inputRanges).toEqual(expect.any(Array));
    expect(DefinedRange.defaultProps.focusedRange).toEqual([0, 0]);
    expect(DefinedRange.propTypes.onChange).toEqual(expect.any(Function));
    expect(ref.current.setState).toBeUndefined();
  });

  test('renders static ranges, custom labels, and selected callbacks from focused range', () => {
    const onChange = jest.fn();
    const renderStaticRangeLabel = jest.fn(range => `Rendered ${range.label}`);
    const defaultLabelRange = staticRange({ label: 'Plain range' });
    const customLabelRange = staticRange({ label: 'Dynamic range', hasCustomRendering: true });
    const { renderer } = renderDefinedRange({
      onChange,
      renderStaticRangeLabel,
      staticRanges: [defaultLabelRange, customLabelRange],
      inputRanges: [],
    });

    const buttons = renderer.root.findAllByType('button');

    expect(buttons.map(textOf)).toEqual(['Plain range', 'Rendered Dynamic range']);
    expect(defaultLabelRange.isSelected).toHaveBeenCalledWith(selectedRange);
    expect(renderStaticRangeLabel).toHaveBeenCalledWith(customLabelRange);

    act(() => {
      buttons[0].props.onClick();
    });

    expect(defaultLabelRange.range).toHaveBeenCalledWith(expect.objectContaining({ ranges: [selectedRange] }));
    expect(onChange).toHaveBeenCalledWith({
      selection: { ...selectedRange, ...nextRange },
    });
  });

  test('reports preview changes for static range focus, hover, and leave', () => {
    const onPreviewChange = jest.fn();
    const previewRange = staticRange({ label: 'Preview range' });
    const { renderer } = renderDefinedRange({
      onPreviewChange,
      staticRanges: [previewRange],
      inputRanges: [],
    });
    const [button] = renderer.root.findAllByType('button');

    act(() => {
      button.props.onFocus();
      button.props.onMouseOver();
      button.props.onMouseLeave();
    });

    expect(onPreviewChange.mock.calls).toEqual([[nextRange], [nextRange], []]);
  });

  test('renders input ranges and sends parsed input changes through focused selection key', () => {
    const onChange = jest.fn();
    const rangeOption = inputRange();
    const { renderer } = renderDefinedRange({
      onChange,
      inputRanges: [rangeOption],
      staticRanges: [],
    });

    const [input] = renderer.root.findAllByType('input');

    expect(input.props.value).toBe(5);

    act(() => {
      input.props.onFocus();
      input.props.onChange({ target: { value: '7' } });
      input.props.onBlur();
    });

    expect(rangeOption.getCurrentValue).toHaveBeenCalledWith(selectedRange);
    expect(rangeOption.range).toHaveBeenCalledWith(7, expect.objectContaining({ ranges: [selectedRange] }));
    expect(onChange).toHaveBeenCalledWith({
      selection: {
        ...selectedRange,
        startDate: new Date(2025, 5, 7),
        endDate: selectedRange.endDate,
      },
    });
  });
});
