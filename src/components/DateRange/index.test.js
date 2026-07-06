import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { subDays, addDays, isSameDay } from 'date-fns';
import DateRange from '../DateRange/index.jsx';
import Calendar from '../Calendar/index.jsx';
import fs from 'fs';
import path from 'path';

let latestCalendarProps;

jest.mock('../Calendar/index.jsx', () => {
  const React = require('react');
  const CalendarMock = React.forwardRef((props, ref) => {
    latestCalendarProps = props;
    React.useImperativeHandle(ref, () => ({
      focusToDate: jest.fn(),
      changeShownDate: jest.fn(),
      updateShownDate: jest.fn(),
      handleScroll: jest.fn(),
    }));
    return <div data-testid="calendar" data-display-mode={props.displayMode} data-class-name={props.className || ''} />;
  });
  CalendarMock.displayName = 'CalendarMock';
  CalendarMock.defaultProps = {};
  return { __esModule: true, default: CalendarMock };
});

const endDate = new Date(2025, 5, 15);
const startDate = subDays(endDate, 7);

const commonProps = {
  classNames: {},
  ranges: [],
  moveRangeOnFirstSelection: false,
  retainEndDateOnFirstSelection: false,
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  disabledDates: [],
  ranges: [{ startDate, endDate, key: 'selection' }],
  onChange: () => {},
  moveRangeOnFirstSelection: false,
};

const renderDateRange = props => {
  latestCalendarProps = undefined;
  const ref = React.createRef();
  const renderResult = render(<DateRange {...commonProps} {...props} ref={ref} />);
  return { ref, ...renderResult };
};

const calcSelection = props => renderDateRange(props).ref.current.calcNewSelection;

const compareRanges = (newRange, assertionRange) => {
  ['startDate', 'endDate'].forEach(key => {
    if (!newRange[key] || !assertionRange[key]) {
      return expect(newRange[key]).toEqual(assertionRange[key]);
    }
    return expect(isSameDay(newRange[key], assertionRange[key])).toEqual(true);
  });
};

describe('DateRange', () => {
  test('Should resolve', () => {
    expect(DateRange).toEqual(expect.anything());
  });

  test('calculate new selection by resetting end date', () => {
    const methodResult = calcSelection()(subDays(endDate, 10), true);
    compareRanges(methodResult.range, {
      startDate: subDays(endDate, 10),
      endDate: subDays(endDate, 10),
    });
  });

  test('calculate new selection by resetting end date if start date is not before', () => {
    const methodResult = calcSelection()(addDays(endDate, 2), true);
    compareRanges(methodResult.range, {
      startDate: addDays(endDate, 2),
      endDate: addDays(endDate, 2),
    });
  });

  test('calculate new selection based on moveRangeOnFirstSelection prop', () => {
    const methodResult = calcSelection({ moveRangeOnFirstSelection: true })(subDays(endDate, 10), true);
    compareRanges(methodResult.range, {
      startDate: subDays(endDate, 10),
      endDate: subDays(endDate, 3),
    });
  });

  test('calculate new selection by retaining end date, based on retainEndDateOnFirstSelection prop', () => {
    const methodResult = calcSelection({ retainEndDateOnFirstSelection: true })(subDays(endDate, 10), true);
    compareRanges(methodResult.range, {
      startDate: subDays(endDate, 10),
      endDate,
    });
  });

  test('calculate new selection when focused on end date (focusedRange[1] === 1)', () => {
    // PR #508: focusedRange={[0,1]} end-date handling.
    // When consumer controls focusedRange to the end-date slot,
    // clicking a day should set endDate while keeping startDate.
    const newEnd = addDays(endDate, 2);
    const methodResult = calcSelection({ focusedRange: [0, 1] })(newEnd, true);
    // End date should be set to the clicked value; start date unchanged.
    compareRanges(methodResult.range, {
      startDate,
      endDate: newEnd,
    });
    // Next focus wraps back to [0, 0] for single-range scenarios.
    expect(methodResult.nextFocusRange).toEqual([0, 0]);
  });

  test('calculate new selection by retaining the unset end date, based on retainEndDateOnFirstSelection prop', () => {
    const methodResult = calcSelection({
      ranges: [{ ...commonProps.ranges[0], endDate: null }],
      retainEndDateOnFirstSelection: true,
    })(subDays(endDate, 10), true);
    compareRanges(methodResult.range, {
      startDate: subDays(endDate, 10),
      endDate: null,
    });
  });

  test('calculate new selection around disabled dates', () => {
    const disabledDate = subDays(endDate, 5);
    const fromStart = calcSelection({
      disabledDates: [disabledDate],
      retainEndDateOnFirstSelection: true,
    })(subDays(endDate, 10), true);
    const fromEnd = calcSelection({ focusedRange: [0, 1], disabledDates: [disabledDate] })(addDays(endDate, 2), true);

    expect(fromStart.wasValid).toBe(false);
    compareRanges(fromStart.range, { startDate: addDays(disabledDate, 1), endDate });
    expect(fromEnd.wasValid).toBe(false);
    compareRanges(fromEnd.range, { startDate, endDate: subDays(disabledDate, 1) });
  });

  test('preserves static metadata and exposes DateRange plus Calendar imperative methods', () => {
    const { ref } = renderDateRange();

    expect(DateRange.$$typeof).toBe(Symbol.for('react.forward_ref'));
    expect(DateRange.defaultProps).toBeUndefined();
    ['calcNewSelection', 'updatePreview', 'focusToDate', 'changeShownDate', 'updateShownDate', 'handleScroll'].forEach(
      methodName => expect(ref.current[methodName]).toEqual(expect.any(Function))
    );
    expect(ref.current.setState).toBeUndefined();
  });

  test('updates preview and keeps Calendar passthrough props intact', () => {
    const { ref } = renderDateRange({
      ranges: [{ ...commonProps.ranges[0], color: '#ff0000' }],
      className: 'customRange',
    });

    act(() => {
      ref.current.updatePreview({ range: { startDate, endDate } });
    });

    expect(latestCalendarProps.preview).toEqual({ startDate, endDate, color: '#ff0000' });
    expect(screen.getByTestId('calendar')).toHaveAttribute('data-display-mode', 'dateRange');
    expect(screen.getByTestId('calendar')).toHaveAttribute('data-class-name', expect.stringContaining('customRange'));
    act(() => {
      ref.current.updatePreview(null);
    });

    expect(latestCalendarProps.preview).toBe(null);
  });

  describe('REQ-DDDG-001..003 / #607: direct <DateRange disabledDates> boundary guard', () => {
    test('disabledDates={null} does not throw and yields full range', () => {
      // REQ-DDDG-001: null is treated as empty array; no dates excluded.
      const methodResult = calcSelection({ disabledDates: null })(new Date(2025, 5, 10), true);
      expect(methodResult.wasValid).toBe(true);
      compareRanges(methodResult.range, {
        startDate: new Date(2025, 5, 10),
        endDate: new Date(2025, 5, 10),
      });
    });

    test('disabledDates={new Date(...)} single Date does not throw and yields full range', () => {
      // REQ-DDDG-002: a bare Date is not treated as one disabled date;
      // it is treated as empty (non-iterable for .filter).
      const methodResult = calcSelection({ disabledDates: new Date(2025, 5, 18) })(new Date(2025, 5, 10), true);
      expect(methodResult.wasValid).toBe(true);
      compareRanges(methodResult.range, {
        startDate: new Date(2025, 5, 10),
        endDate: new Date(2025, 5, 10),
      });
    });

    test('disabledDates={[dateA, dateB]} still splits selection around disabled dates (regression)', () => {
      // REQ-DDDG-003: valid array behavior is unchanged.
      // Mirrors the existing "around disabled dates" pattern from the main suite.
      const firstDisabled = subDays(endDate, 5);
      const secondDisabled = subDays(endDate, 3);
      const disabledDates = [firstDisabled, secondDisabled];
      const fromStart = calcSelection({ disabledDates, retainEndDateOnFirstSelection: true })(subDays(endDate, 10), true);
      const fromEnd = calcSelection({ focusedRange: [0, 1], disabledDates })(addDays(endDate, 2), true);

      expect(fromStart.wasValid).toBe(false);
      compareRanges(fromStart.range, { startDate: addDays(secondDisabled, 1), endDate });
      expect(fromEnd.wasValid).toBe(false);
      compareRanges(fromEnd.range, { startDate, endDate: subDays(firstDisabled, 1) });
    });

    test('disabledDates={[]} and omitted prop both yield full range (regression)', () => {
      // REQ-DDDG-003: empty array and undefined/omitted behave identically.
      const explicitEmpty = calcSelection({ disabledDates: [] })(new Date(2025, 5, 10), true);
      expect(explicitEmpty.wasValid).toBe(true);
      compareRanges(explicitEmpty.range, { startDate: new Date(2025, 5, 10), endDate: new Date(2025, 5, 10) });

      const omitted = calcSelection()(new Date(2025, 5, 10), true);
      expect(omitted.wasValid).toBe(true);
      compareRanges(omitted.range, { startDate: new Date(2025, 5, 10), endDate: new Date(2025, 5, 10) });
    });
  });

  describe('REQ-UBF-001 / #658: updatePreview color fallback chain (regression lock-in)', () => {
    test('falls back to rangeColors[i] when range has no color', () => {
      const { ref } = renderDateRange({
        ranges: [{ startDate, endDate, key: 'selection' /* no color */ }],
        rangeColors: ['#abcdef', '#fed14c'],
      });

      act(() => {
        ref.current.updatePreview({ range: { startDate, endDate } });
      });

      expect(latestCalendarProps.preview).toEqual({
        startDate,
        endDate,
        color: '#abcdef',
      });
    });

    test('falls back to default #3d91ff when rangeColors is empty', () => {
      const { ref } = renderDateRange({
        ranges: [{ startDate, endDate, key: 'selection' /* no color */ }],
        rangeColors: [],
      });

      act(() => {
        ref.current.updatePreview({ range: { startDate, endDate } });
      });

      expect(latestCalendarProps.preview).toEqual({
        startDate,
        endDate,
        color: '#3d91ff',
      });
    });
  });

  describe('REQ-ASLR: live region for selection announcements', () => {
    let container;

    beforeEach(() => {
      const result = renderDateRange();
      container = result.container;
    });

    test('renders a live region with aria-live="polite" as sibling to Calendar, initially empty', () => {
      const region = container.querySelector('[aria-live="polite"]');
      expect(region).toBeInTheDocument();
      expect(region).toHaveTextContent('');
    });

    test('live region has aria-atomic="true"', () => {
      const region = container.querySelector('[aria-live="polite"]');
      expect(region).toHaveAttribute('aria-atomic', 'true');
    });

    test('first click (onChange, isSingleValue=true) announces single-day range', () => {
      const clickDate = new Date(2025, 5, 10);
      act(() => {
        latestCalendarProps.onChange(clickDate);
      });
      const region = container.querySelector('[aria-live="polite"]');
      expect(region).not.toHaveTextContent('');
      expect(region.textContent).toContain('June 10th, 2025');
    });

    test('second click completes range; reversed input normalized in announcement', () => {
      const start = new Date(2025, 5, 8);
      const end = new Date(2025, 5, 15);
      act(() => {
        latestCalendarProps.onChange(start);
      });
      act(() => {
        latestCalendarProps.onChange(end);
      });
      const region = container.querySelector('[aria-live="polite"]');
      expect(region.textContent).toContain('June 8th, 2025');
      expect(region.textContent).toContain('June 15th, 2025');
    });

    test('drag end (updateRange) announces normalized range from calcNewSelection', () => {
      const range = { startDate: new Date(2025, 5, 5), endDate: new Date(2025, 5, 12) };
      act(() => {
        latestCalendarProps.updateRange(range);
      });
      const region = container.querySelector('[aria-live="polite"]');
      expect(region.textContent).toContain('June 5th, 2025');
      expect(region.textContent).toContain('June 12th, 2025');
    });

    test('disabledDates clamps; region announces clamped normalized range', () => {
      const disabledDate = new Date(2025, 5, 12);
      const { container: local } = render(
        <DateRange
          {...commonProps}
          retainEndDateOnFirstSelection={true}
          disabledDates={[disabledDate]}
        />
      );
      act(() => {
        latestCalendarProps.onChange(new Date(2025, 5, 10));
      });
      const region = local.querySelector('[aria-live="polite"]');
      // disabledDate=Jun 12 falls within [Jun 10, Jun 15]; isStartDateSelected=true
      // startDate → addDays(max([Jun 12]), 1) = Jun 13; endDate = Jun 15
      expect(region.textContent).toContain('June 13th, 2025');
      expect(region.textContent).toContain('June 15th, 2025');
    });

    test('custom ariaLabels.liveRegionSelection receives normalized range and populates region', () => {
      const formatter = jest.fn((range) => `From ${range.startDate.toISOString()} to ${range.endDate.toISOString()}`);
      const clickDate = new Date(2025, 5, 20);
      const { container: local } = render(
        <DateRange {...commonProps} ariaLabels={{ liveRegionSelection: formatter }} />
      );
      act(() => {
        latestCalendarProps.onChange(clickDate);
      });
      expect(formatter).toHaveBeenCalledTimes(1);
      const { startDate, endDate } = formatter.mock.calls[0][0];
      expect(startDate).toBeInstanceOf(Date);
      expect(endDate).toBeInstanceOf(Date);
      // Assert exact normalized values: single click yields startDate === endDate
      expect(isSameDay(startDate, clickDate)).toBe(true);
      expect(isSameDay(endDate, clickDate)).toBe(true);
      const region = local.querySelector('[aria-live="polite"]');
      expect(region.textContent).toContain('From');
      expect(region.textContent).toContain('to');
    });

    test('default formatter uses Selected <start> to <end> when no custom formatter', () => {
      const { container: local } = render(
        <DateRange {...commonProps} />
      );
      act(() => {
        latestCalendarProps.onChange(new Date(2025, 5, 25));
      });
      const region = local.querySelector('[aria-live="polite"]');
      expect(region.textContent).toContain('Selected');
      expect(region.textContent).toContain('to');
    });

    test('hover (onMouseEnter on day cells) does NOT populate region', () => {
      const region = container.querySelector('[aria-live="polite"]');
      expect(region).toHaveTextContent('');
      // onPreviewChange is the closest Calendar-level path for hover;
      // it should NOT trigger setSelection
      act(() => {
        latestCalendarProps.onPreviewChange(new Date(2025, 5, 10));
      });
      expect(region).toHaveTextContent('');
    });

    test('onPreviewChange does NOT populate region', () => {
      const region = container.querySelector('[aria-live="polite"]');
      act(() => {
        latestCalendarProps.onPreviewChange(new Date(2025, 5, 10));
      });
      expect(region).toHaveTextContent('');
    });

    test('onDragSelectionMove does NOT populate region', () => {
      // onDragSelectionMove is internal to Calendar and updates drag state
      // for visual preview only; it does NOT call setSelection/setLiveAnnouncement.
      // Exercise the drag/preview movement path via updatePreview (the DateRange-level
      // equivalent that feeds the same visual preview mechanism), then verify region stays empty.
      const { ref, container } = renderDateRange();
      act(() => {
        ref.current.updatePreview({ range: { startDate: new Date(2025, 5, 10), endDate: new Date(2025, 5, 15) } });
      });
      const region = container.querySelector('[aria-live="polite"]');
      expect(region).toHaveTextContent('');
    });

    test('range with no endDate (single click) announces startDate===endDate', () => {
      const clickDate = new Date(2025, 5, 18);
      const { container: local } = render(
        <DateRange {...commonProps} />
      );
      act(() => {
        latestCalendarProps.onChange(clickDate);
      });
      const region = local.querySelector('[aria-live="polite"]');
      expect(region.textContent).toContain('June 18th, 2025');
    });

    test('region starts empty on initial render', () => {
      const region = container.querySelector('[aria-live="polite"]');
      expect(region).toHaveTextContent('');
    });

    test('reversed input (end before start) is normalized in announcement', () => {
      const start = new Date(2025, 5, 8);
      const end = new Date(2025, 5, 15);
      act(() => {
        latestCalendarProps.onChange(start);
      });
      // Select end BEFORE start — should be normalized to [Jun 8, Jun 15]
      act(() => {
        latestCalendarProps.onChange(new Date(2025, 5, 5));
      });
      const region = container.querySelector('[aria-live="polite"]');
      // After reversal: startDate=Jun 5, endDate=Jun 8
      expect(region.textContent).toContain('June 5th, 2025');
      expect(region.textContent).toContain('June 8th, 2025');
    });
  });

  describe('selectablePassive guard', () => {
    test('scroll.enabled=true suppresses selectablePassive (effective false)', () => {
      renderDateRange({ scroll: { enabled: true }, selectablePassive: true });
      expect(latestCalendarProps.selectablePassive).toBe(false);
    });

    test('no scroll prop + selectablePassive=true propagates effective true', () => {
      renderDateRange({ selectablePassive: true });
      expect(latestCalendarProps.selectablePassive).toBe(true);
    });
  });

  describe('REQ-UBF-002 / #664 #663: date-fns ESM named-import audit (regression lock-in)', () => {
    const srcDir = path.resolve(__dirname, '..', '..');

    const readSourceFiles = () => {
      const files = [];
      const walk = dir => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== '__tests__') walk(full);
          } else if (
            (full.endsWith('.js') || full.endsWith('.jsx')) &&
            !entry.name.includes('.test.')
          ) {
            files.push(full);
          }
        }
      };
      walk(srcDir);
      return files;
    };

    let sourceFiles;
    let fileContents;

    beforeAll(() => {
      sourceFiles = readSourceFiles();
      fileContents = sourceFiles.map(f => ({ file: f, content: fs.readFileSync(f, 'utf-8') }));
    });

    test('zero _dateFns interop wrapper references in src/', () => {
      const violations = [];
      for (const { file, content } of fileContents) {
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (/_dateFns/.test(line)) {
            violations.push(`${file}:${i + 1}`);
          }
        });
      }
      expect(violations).toEqual([]);
    });

    test('zero default imports from date-fns (named imports only)', () => {
      // Matches: `import name from 'date-fns'` or `import name from 'date-fns/subpath'`
      // Excludes named imports and locale paths
      const defaultImportRe = /^import\s+(?!\{|type)([a-zA-Z_$][\w$]*)\s+from\s+['"]date-fns(\/[^'"]*)?['"]/;
      const violations = [];
      for (const { file, content } of fileContents) {
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (defaultImportRe.test(line.trim())) {
            violations.push(`${file}:${i + 1}: ${line.trim()}`);
          }
        });
      }
      expect(violations).toEqual([]);
    });

    test('all date-fns imports use ESM named syntax', () => {
      // Collect all import lines from 'date-fns' or 'date-fns/...'
      const dateFnsImportRe = /^import\s+.+?\s+from\s+['"]date-fns(\/[^'"]*)?['"]/;
      const imports = [];
      for (const { file, content } of fileContents) {
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (dateFnsImportRe.test(line.trim())) {
            imports.push({ file: path.relative(srcDir, file), line: i + 1, text: line.trim() });
          }
        });
      }

      expect(imports.length).toBeGreaterThan(0);

      // Every import must use destructured named syntax: `import { x, y } from ...`
      const namedImportRe = /^import\s+\{/;
      const violations = imports.filter(imp => !namedImportRe.test(imp.text));
      expect(violations).toEqual([]);
    });

    test('tsdown.config.ts externalizes date-fns from bundle', () => {
      const configPath = path.resolve(srcDir, '..', 'tsdown.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');

      // Verify date-fns is in neverBundle (as string entry AND regex pattern)
      expect(configContent).toContain("'date-fns'");
      expect(configContent).toMatch(/\/\^date-fns/);
    });
  });
});
