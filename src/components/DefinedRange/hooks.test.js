import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import DefinedRange from '../DefinedRange/index.jsx';

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
  ranges: [selectedRange],
  focusedRange: [0, 0],
};

const renderDefinedRange = props => {
  const ref = React.createRef();
  const view = render(<DefinedRange {...baseProps} {...props} ref={ref} />);
  return { ref, ...view };
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
    expect(ref.current.setState).toBeUndefined();
  });

  test('renders static ranges, custom labels, and selected callbacks from focused range', () => {
    const onChange = jest.fn();
    const renderStaticRangeLabel = jest.fn(range => `Rendered ${range.label}`);
    const defaultLabelRange = staticRange({ label: 'Plain range' });
    const customLabelRange = staticRange({ label: 'Dynamic range', hasCustomRendering: true });
    renderDefinedRange({
      onChange,
      renderStaticRangeLabel,
      staticRanges: [defaultLabelRange, customLabelRange],
      inputRanges: [],
    });

    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual([
      'Plain range',
      'Rendered Dynamic range',
    ]);
    expect(defaultLabelRange.isSelected).toHaveBeenCalledWith(selectedRange);
    expect(renderStaticRangeLabel).toHaveBeenCalledWith(customLabelRange);

    fireEvent.click(screen.getByRole('button', { name: 'Plain range' }));

    expect(defaultLabelRange.range).toHaveBeenCalledWith(expect.objectContaining({ ranges: [selectedRange] }));
    expect(onChange).toHaveBeenCalledWith({
      selection: { ...selectedRange, ...nextRange },
    });
  });

  test('reports preview changes for static range focus, hover, and leave', () => {
    const onPreviewChange = jest.fn();
    const previewRange = staticRange({ label: 'Preview range' });
    renderDefinedRange({
      onPreviewChange,
      staticRanges: [previewRange],
      inputRanges: [],
    });
    const button = screen.getByRole('button', { name: 'Preview range' });

    fireEvent.focus(button);
    fireEvent.mouseOver(button);
    fireEvent.mouseLeave(button);

    expect(onPreviewChange.mock.calls).toEqual([[nextRange], [nextRange], []]);
  });

  test('renders input ranges and sends parsed input changes through focused selection key', () => {
    const onChange = jest.fn();
    const rangeOption = inputRange();
    renderDefinedRange({
      onChange,
      inputRanges: [rangeOption],
      staticRanges: [],
    });

    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('5');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.blur(input);

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
