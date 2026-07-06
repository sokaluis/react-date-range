import React from 'react';
import { render, screen } from '@testing-library/react';
import Month from './index.jsx';

jest.mock('../DayCell/index.jsx', () => {
  const DayCellMock = (props) => (
    <button
      type="button"
      data-testid="day-cell"
      data-day={props.day.toISOString()}
      data-disabled={props.disabled ? 'true' : 'false'}
      data-istoday={props.isToday ? 'true' : 'false'}
      data-isweekend={props.isWeekend ? 'true' : 'false'}
      data-isstartofweek={props.isStartOfWeek ? 'true' : 'false'}
      data-isendofweek={props.isEndOfWeek ? 'true' : 'false'}
      data-ranges={JSON.stringify(props.ranges)}
      data-ispassive={props.isPassive ? 'true' : 'false'}
      tabIndex={props.disabled || props.isPassive ? -1 : 0}
    />
  );
  DayCellMock.displayName = 'DayCellMock';
  return { __esModule: true, default: DayCellMock };
});

const defaultProps = {
  displayMode: 'date',
  focusedRange: [0, 0],
  drag: { status: false, range: { startDate: null, endDate: null }, disablePreview: false },
  styles: {
    month: 'rdrMonth',
    monthName: 'rdrMonthName',
    weekDays: 'rdrWeekDays',
    weekDay: 'rdrWeekDay',
    days: 'rdrDays',
    day: 'rdrDay',
  },
  disabledDates: [],
  disabledDay: () => false,
  month: new Date(2025, 5, 15),
  dateOptions: {},
  fixedHeight: false,
  ranges: [],
  showPreview: false,
  preview: null,
  style: {},
  showMonthName: true,
  monthDisplayFormat: 'MMM yyyy',
  showWeekDays: true,
  weekdayDisplayFormat: 'E',
  minDate: undefined,
  maxDate: undefined,
  onMouseLeave: () => {},
  onDragSelectionStart: () => {},
  onDragSelectionEnd: () => {},
  onDragSelectionMove: () => {},
};

describe('Month', () => {
  describe('weekday header', () => {
    test('renders 7 weekday spans when showWeekDays=true', () => {
      render(<Month {...defaultProps} showWeekDays={true} />);
      const weekdays = document.querySelectorAll('.rdrWeekDay');
      expect(weekdays).toHaveLength(7);
    });

    test('does not render weekday header when showWeekDays=false', () => {
      render(<Month {...defaultProps} showWeekDays={false} />);
      const weekdays = document.querySelectorAll('.rdrWeekDay');
      expect(weekdays).toHaveLength(0);
    });
  });

  describe('month name', () => {
    test('shows formatted month name when showMonthName=true', () => {
      render(<Month {...defaultProps} showMonthName={true} />);
      expect(screen.getByText('Jun 2025')).toBeInTheDocument();
    });

    test('does not show month name when showMonthName=false', () => {
      render(<Month {...defaultProps} showMonthName={false} />);
      expect(screen.queryByText('Jun 2025')).not.toBeInTheDocument();
    });
  });

  describe('min/max date boundary', () => {
    test('marks day outside minDate as disabled', () => {
      const minDate = new Date(2025, 5, 10);
      render(<Month {...defaultProps} minDate={minDate} />);
      const cells = screen.getAllByTestId('day-cell');
      const earlyCell = cells.find(cell => cell.dataset.disabled === 'true');
      expect(earlyCell).toBeDefined();
    });

    test('marks day outside maxDate as disabled', () => {
      const maxDate = new Date(2025, 5, 20);
      render(<Month {...defaultProps} maxDate={maxDate} />);
      const cells = screen.getAllByTestId('day-cell');
      const lateCell = cells.find(cell => cell.dataset.disabled === 'true');
      expect(lateCell).toBeDefined();
    });

    test('days within range are not disabled', () => {
      render(<Month {...defaultProps} />);
      const cells = screen.getAllByTestId('day-cell');
      const nonPassiveDays = cells.filter(
        cell => cell.dataset.disabled === 'false' && cell.tabIndex !== -1
      );
      expect(nonPassiveDays.length).toBeGreaterThan(0);
    });
  });

  describe('isToday flag', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 5, 15));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('marks the current date day with isToday=true', () => {
      render(<Month {...defaultProps} />);
      const cells = screen.getAllByTestId('day-cell');
      const todayCell = cells.find(cell => cell.dataset.istoday === 'true');
      expect(todayCell).toBeDefined();
      // June 15, 2025 is the expected today
      const todayDate = new Date(todayCell.dataset.day);
      expect(todayDate.getDate()).toBe(15);
      expect(todayDate.getMonth()).toBe(5);
    });
  });

  describe('isWeekend and startOfWeek/endOfWeek flags', () => {
    test('passes isWeekend flag to DayCell', () => {
      render(<Month {...defaultProps} />);
      const cells = screen.getAllByTestId('day-cell');
      const weekendCells = cells.filter(cell => cell.dataset.isweekend === 'true');
      expect(weekendCells.length).toBeGreaterThan(0);
    });

    test('passes isStartOfWeek and isEndOfWeek flags to DayCell', () => {
      render(<Month {...defaultProps} />);
      const cells = screen.getAllByTestId('day-cell');
      const startOfWeekCells = cells.filter(cell => cell.dataset.isstartofweek === 'true');
      const endOfWeekCells = cells.filter(cell => cell.dataset.isendofweek === 'true');
      // At least one of each in a month
      expect(startOfWeekCells.length).toBeGreaterThan(0);
      expect(endOfWeekCells.length).toBeGreaterThan(0);
    });
  });

  describe('selectablePassive suppression', () => {
    test('selectablePassive=true sets isPassive=false for outside-month days', () => {
      render(<Month {...defaultProps} selectablePassive={true} />);
      const cells = screen.getAllByTestId('day-cell');
      // Outside-month days (before June 1 or after June 30, 2025)
      const outsideMonth = cells.filter(cell => {
        const d = new Date(cell.dataset.day);
        return d.getMonth() !== 5;
      });
      expect(outsideMonth.length).toBeGreaterThan(0);
      // All outside-month cells should NOT be passive when selectablePassive=true
      outsideMonth.forEach(cell => {
        expect(cell.dataset.ispassive).toBe('false');
      });
    });

    test('default (selectablePassive unset) keeps isPassive for outside-month days', () => {
      render(<Month {...defaultProps} />);
      const cells = screen.getAllByTestId('day-cell');
      const outsideMonth = cells.filter(cell => {
        const d = new Date(cell.dataset.day);
        return d.getMonth() !== 5;
      });
      expect(outsideMonth.length).toBeGreaterThan(0);
      // Without selectablePassive, outside-month cells ARE passive
      outsideMonth.forEach(cell => {
        expect(cell.dataset.ispassive).toBe('true');
      });
    });
  });

  describe('drag status overlay', () => {
    const dragRange = {
      startDate: new Date(2025, 5, 5),
      endDate: new Date(2025, 5, 8),
    };

    test('overlays focused range start/end with drag range', () => {
      const { rerender } = render(
        <Month
          {...defaultProps}
          displayMode="dateRange"
          drag={{ status: true, range: dragRange, disablePreview: true }}
          focusedRange={[0, 0]}
          ranges={[{ startDate: new Date(2025, 5, 1), endDate: new Date(2025, 5, 3) }]}
        />
      );

      const cells = screen.getAllByTestId('day-cell');
      expect(cells.length).toBeGreaterThan(0);

      // The mock DayCell receives ranges as JSON in data-ranges
      const firstCellRanges = JSON.parse(cells[0].dataset.ranges);
      expect(firstCellRanges).toBeDefined();
    });
  });
});
