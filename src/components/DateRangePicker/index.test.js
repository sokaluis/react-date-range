import React from 'react';
import fs from 'fs';
import path from 'path';
import { act, render, screen } from '@testing-library/react';
import { addDays } from 'date-fns';
import DateRangePicker from '../DateRangePicker/index.jsx';
import DateRange from '../DateRange/index.jsx';
import DefinedRange from '../DefinedRange/index.jsx';

const readDateRangePickerStyles = () =>
  fs.readFileSync(path.resolve(__dirname, './index.scss'), 'utf8');

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
  const renderResult = render(<DateRangePicker {...baseProps} {...props} ref={ref} />);
  return { ref, ...renderResult };
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

  test('forwards explicit rtl direction to wrapper and DateRange child', () => {
    const { container } = renderDateRangePicker({ dir: 'rtl' });

    expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    expect(container.firstChild).toHaveClass('rdrRtl');
    expect(mockLatestDateRangeProps.dir).toBe('rtl');
  });

  test('omits wrapper dir and rtl class when direction is not provided', () => {
    const { container } = renderDateRangePicker();

    expect(container.firstChild).not.toHaveAttribute('dir');
    expect(container.firstChild).not.toHaveClass('rdrRtl');
    expect(mockLatestDateRangeProps.dir).toBeUndefined();
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

  test('defaults picker layout to one vertical calendar', () => {
    renderDateRangePicker();

    expect(mockLatestDateRangeProps.months).toBe(1);
    expect(mockLatestDateRangeProps.direction).toBe('vertical');
  });

  test('maps two horizontal picker layout props to DateRange calendar props', () => {
    renderDateRangePicker({ calendarCount: 2, scrollOrientation: 'horizontal' });

    expect(mockLatestDateRangeProps.months).toBe(2);
    expect(mockLatestDateRangeProps.direction).toBe('horizontal');
  });

  test('preserves explicit legacy layout props when picker layout props are omitted', () => {
    renderDateRangePicker({ months: 2, direction: 'horizontal' });

    expect(mockLatestDateRangeProps.months).toBe(2);
    expect(mockLatestDateRangeProps.direction).toBe('horizontal');
  });

  test('falls back to default layout for unsupported runtime values', () => {
    renderDateRangePicker({ calendarCount: 3, scrollOrientation: 'diagonal' });

    expect(mockLatestDateRangeProps.months).toBe(1);
    expect(mockLatestDateRangeProps.direction).toBe('vertical');
  });

  test('leaves scroll-enabled calendars outside responsive layout handling', () => {
    const { container } = renderDateRangePicker({
      layout: 'mobile',
      calendarCount: 2,
      scrollOrientation: 'horizontal',
      scroll: { enabled: true },
      months: 4,
      direction: 'vertical',
    });

    expect(mockLatestDateRangeProps.months).toBe(4);
    expect(mockLatestDateRangeProps.direction).toBe('vertical');
    expect(mockLatestDateRangeProps._resolvedLayout).toBe('reference');
    expect(container.firstChild).not.toHaveClass('rdrDateRangePickerWrapperResponsive');
  });

  describe('widthMode prop', () => {
    test('does not add fluid class when widthMode is omitted', () => {
      const { container } = renderDateRangePicker();

      expect(container.firstChild).not.toHaveClass('rdrDateRangePickerWrapperFluid');
    });

    test('preserves intrinsic sizing when widthMode is "content"', () => {
      const { container } = renderDateRangePicker({ widthMode: 'content' });

      expect(container.firstChild).not.toHaveClass('rdrDateRangePickerWrapperFluid');
    });

    test('adds fluid class when widthMode is "fluid"', () => {
      const { container } = renderDateRangePicker({ widthMode: 'fluid' });

      expect(container.firstChild).toHaveClass('rdrDateRangePickerWrapperFluid');
    });

    test('does not add fluid class for invalid widthMode values', () => {
      const { container } = renderDateRangePicker({ widthMode: 'unknown' });

      expect(container.firstChild).not.toHaveClass('rdrDateRangePickerWrapperFluid');
    });

    test('widthMode="fluid" does not force column layout (no responsive class)', () => {
      const { container } = renderDateRangePicker({ widthMode: 'fluid', layout: 'desktop' });

      expect(container.firstChild).toHaveClass('rdrDateRangePickerWrapperFluid');
      expect(container.firstChild).not.toHaveClass('rdrDateRangePickerWrapperResponsive');
    });

    test('widthMode="fluid" + layout="mobile" adds both fluid and responsive classes (column fills 100% container)', () => {
      const { container } = renderDateRangePicker({
        widthMode: 'fluid',
        layout: 'mobile',
        calendarCount: 2,
      });

      expect(container.firstChild).toHaveClass('rdrDateRangePickerWrapperFluid');
      expect(container.firstChild).toHaveClass('rdrDateRangePickerWrapperResponsive');
    });

    test('does not leak widthMode to child components', () => {
      renderDateRangePicker({ widthMode: 'fluid' });

      expect(mockLatestDefinedRangeProps).not.toHaveProperty('widthMode');
      expect(mockLatestDateRangeProps).not.toHaveProperty('widthMode');
    });

    test('passes _calendarIsFluidWidthMode=true to DateRange when widthMode is "fluid"', () => {
      renderDateRangePicker({ widthMode: 'fluid' });

      expect(mockLatestDateRangeProps._calendarIsFluidWidthMode).toBe(true);
    });

    test('passes _calendarIsFluidWidthMode=false to DateRange when widthMode is "content"', () => {
      renderDateRangePicker({ widthMode: 'content' });

      expect(mockLatestDateRangeProps._calendarIsFluidWidthMode).toBe(false);
    });

    test('passes _calendarIsFluidWidthMode=false to DateRange when widthMode is omitted', () => {
      renderDateRangePicker();

      expect(mockLatestDateRangeProps._calendarIsFluidWidthMode).toBe(false);
    });

    test('fluid wrapper SCSS contract: width 100% fills available container width in row mode', () => {
      const scss = readDateRangePickerStyles();

      expect(scss).toMatch(/\.rdrDateRangePickerWrapperFluid\s*\{[^}]*width:\s*100%/s);
      expect(scss).toMatch(/\.rdrDateRangePickerWrapperFluid\s*\{[^}]*max-width:\s*100%/s);
      expect(scss).toMatch(/\.rdrDateRangePickerWrapperFluid\s*\{[^}]*min-width:\s*0/s);
    });

    test('fluid row SCSS contract: DefinedRange and calendar use a 30/70 split', () => {
      const scss = readDateRangePickerStyles();

      expect(scss).toMatch(
        /\.rdrDateRangePickerWrapperFluid:not\(\.rdrDateRangePickerWrapperResponsive\)\s*>\s*\.rdrDefinedRangesWrapper\s*\{[^}]*flex:\s*0 0 30%/s
      );
      expect(scss).toMatch(
        /\.rdrDateRangePickerWrapperFluid:not\(\.rdrDateRangePickerWrapperResponsive\)\s*>\s*\.rdrDefinedRangesWrapper\s*\{[^}]*max-width:\s*30%/s
      );
      expect(scss).toMatch(
        /\.rdrDateRangePickerWrapperFluid:not\(\.rdrDateRangePickerWrapperResponsive\)\s*>\s*\.rdrCalendarWrapperFluid\s*\{[^}]*flex:\s*1 1 70%/s
      );
      expect(scss).toMatch(
        /\.rdrDateRangePickerWrapperFluid:not\(\.rdrDateRangePickerWrapperResponsive\)\s*>\s*\.rdrCalendarWrapperFluid\s*\{[^}]*max-width:\s*70%/s
      );
    });

    test('fluid row ratio does not apply to the responsive column wrapper', () => {
      const scss = readDateRangePickerStyles();

      expect(scss).not.toMatch(
        /\.rdrDateRangePickerWrapperFluid\.rdrDateRangePickerWrapperResponsive\s*>\s*\.rdrDefinedRangesWrapper\s*\{[^}]*30%/s
      );
      expect(scss).not.toMatch(
        /\.rdrDateRangePickerWrapperFluid\.rdrDateRangePickerWrapperResponsive\s*>\s*\.rdrCalendarWrapperFluid\s*\{[^}]*70%/s
      );
    });
  });

  describe('responsive layout contract', () => {
    test('calendarCount wins on mobile and multiple calendars stack vertically', () => {
      renderDateRangePicker({
        layout: 'mobile',
        calendarCount: 2,
        scrollOrientation: 'horizontal',
      });

      expect(mockLatestDateRangeProps._resolvedLayout).toBe('mobile');
      expect(mockLatestDateRangeProps.months).toBe(2);
      expect(mockLatestDateRangeProps.direction).toBe('vertical');
    });

    test('uses mobileBreakpoint when resolving auto layout for the wrapper', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = jest.fn(query => ({
        matches: query === '(max-width: 640px)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      try {
        const { container } = renderDateRangePicker({ layout: 'auto', mobileBreakpoint: 640 });

        expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 640px)');
        expect(container.firstChild).toHaveClass('rdrDateRangePickerWrapperResponsive');
      } finally {
        window.matchMedia = originalMatchMedia;
      }
    });

  });
});
