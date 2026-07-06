import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { addDays } from 'date-fns';
import DateRangePicker from '../DateRangePicker/index.jsx';
import DateRange from '../DateRange/index.jsx';
import DefinedRange from '../DefinedRange/index.jsx';

let mockLatestDateRangeProps;
let mockLatestDefinedRangeProps;
let mockDateRangeApi;

jest.mock('../DateRange/index.jsx', () => {
  const React = require('react');
  const DateRangeMock = React.forwardRef((props, ref) => {
    mockLatestDateRangeProps = props;
    mockDateRangeApi = {
      updatePreview: jest.fn(),
      calcNewSelection: jest.fn(value => ({ range: value, color: props.ranges[props.focusedRange[0]]?.color })),
    };
    React.useImperativeHandle(ref, () => mockDateRangeApi);
    return <div data-testid="date-range" />;
  });
  DateRangeMock.displayName = 'DateRangeMock';
  DateRangeMock.defaultProps = { ranges: [] };
  return { __esModule: true, default: DateRangeMock };
});

jest.mock('../DefinedRange/index.jsx', () => {
  const React = require('react');
  const DefinedRangeMock = props => {
    mockLatestDefinedRangeProps = props;
    return <div data-testid="defined-range" />;
  };
  DefinedRangeMock.displayName = 'DefinedRangeMock';
  DefinedRangeMock.defaultProps = {};
  return { __esModule: true, default: DefinedRangeMock };
});

const startDate = new Date(2025, 5, 10);
const endDate = new Date(2025, 5, 15);
const nextStartDate = addDays(startDate, 20);
const nextEndDate = addDays(endDate, 20);

const ranges = [
  { startDate, endDate, key: 'selection', color: '#123456' },
  { startDate: nextStartDate, endDate: nextEndDate, key: 'comparison', color: '#654321' },
];

const baseProps = {
  classNames: {},
  ranges: [],
  moveRangeOnFirstSelection: false,
  retainEndDateOnFirstSelection: false,
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  disabledDates: [],
  ranges,
  onChange: () => {},
  staticRanges: [],
  inputRanges: [],
};

const renderDateRangePicker = props => {
  mockLatestDateRangeProps = undefined;
  mockLatestDefinedRangeProps = undefined;
  mockDateRangeApi = undefined;
  const ref = React.createRef();
  render(<DateRangePicker {...baseProps} {...props} ref={ref} />);
  return { ref };
};

describe('DateRangePicker hooks parity', () => {
  test('exports a forwardRef function component while preserving static metadata', () => {
    const { ref } = renderDateRangePicker({ className: 'customPicker' });

    expect(DateRangePicker.$$typeof).toBe(Symbol.for('react.forward_ref'));
    expect(DateRangePicker.defaultProps).toBeUndefined();
    expect(ref.current.setState).toBeUndefined();
    expect(mockLatestDefinedRangeProps.className).toBeUndefined();
    expect(mockLatestDateRangeProps.className).toBeUndefined();
    expect(screen.getByTestId('defined-range')).toBeInTheDocument();
    expect(screen.getByTestId('date-range')).toBeInTheDocument();
  });

  test('renders the wrapper as a named region by default', () => {
    renderDateRangePicker();

    expect(screen.getByRole('region', { name: 'Date range picker' })).toBeInTheDocument();
  });

  test('uses a custom DateRangePicker region label', () => {
    renderDateRangePicker({ ariaLabels: { dateRangePicker: 'Booking date range' } });

    expect(screen.getByRole('region', { name: 'Booking date range' })).toBeInTheDocument();
  });

  test('omits wrapper region semantics when ariaLabels.dateRangePicker is false', () => {
    const { container } = render(<DateRangePicker {...baseProps} ariaLabels={{ dateRangePicker: false }} />);

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(container.firstChild).not.toHaveAttribute('role');
    expect(container.firstChild).not.toHaveAttribute('aria-label');
  });

  test('keeps DefinedRange synchronized with DateRange focus changes', () => {
    renderDateRangePicker();

    expect(mockLatestDefinedRangeProps.focusedRange).toEqual([0, 0]);
    expect(mockLatestDefinedRangeProps.range).toBe(ranges[0]);

    act(() => {
      mockLatestDateRangeProps.onRangeFocusChange([1, 0]);
    });

    expect(mockLatestDefinedRangeProps.focusedRange).toEqual([1, 0]);
    expect(mockLatestDefinedRangeProps.range).toBe(ranges[1]);
    expect(mockLatestDateRangeProps.focusedRange).toEqual([1, 0]);
  });

  test('routes DefinedRange previews through DateRange selection calculation and clears them', () => {
    renderDateRangePicker();
    const previewValue = {
      startDate: addDays(startDate, 2),
      endDate: addDays(endDate, 2),
    };

    act(() => {
      mockLatestDefinedRangeProps.onPreviewChange(previewValue);
    });

    expect(mockDateRangeApi.calcNewSelection).toHaveBeenCalledWith(previewValue, false);
    expect(mockDateRangeApi.updatePreview).toHaveBeenCalledWith({
      range: previewValue,
      color: ranges[0].color,
    });

    act(() => {
      mockLatestDefinedRangeProps.onPreviewChange();
    });

    expect(mockDateRangeApi.updatePreview).toHaveBeenLastCalledWith(null);
  });

  test('forwards ariaLabels.liveRegionSelection to DateRange', () => {
    const formatter = () => 'Custom announcement';
    renderDateRangePicker({ ariaLabels: { liveRegionSelection: formatter } });

    expect(mockLatestDateRangeProps.ariaLabels.liveRegionSelection).toBe(formatter);
  });
});
