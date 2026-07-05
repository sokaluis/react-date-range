import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import DayCell from './index.jsx';

// Provide minimal styles to avoid import errors from CSS module mocking
const styles = {
  day: 'rdrDay',
  dayPassive: 'rdrDayPassive',
  dayDisabled: 'rdrDayDisabled',
  dayToday: 'rdrDayToday',
  dayWeekend: 'rdrDayWeekend',
  dayStartOfWeek: 'rdrDayStartOfWeek',
  dayEndOfWeek: 'rdrDayEndOfWeek',
  dayStartOfMonth: 'rdrDayStartOfMonth',
  dayEndOfMonth: 'rdrDayEndOfMonth',
  dayHovered: 'rdrDayHovered',
  dayActive: 'rdrDayActive',
  dayNumber: 'rdrDayNumber',
  selected: 'rdrSelected',
  startEdge: 'rdrStartEdge',
  endEdge: 'rdrEndEdge',
  inRange: 'rdrInRange',
  dayStartPreview: 'rdrDayStartPreview',
  dayInPreview: 'rdrDayInPreview',
  dayEndPreview: 'rdrDayEndPreview',
};

const baseProps = {
  day: new Date(2025, 5, 15),
  disabled: false,
  isPassive: false,
  isToday: false,
  isWeekend: false,
  isStartOfWeek: false,
  isEndOfWeek: false,
  isStartOfMonth: false,
  isEndOfMonth: false,
  styles,
  color: '#3d91ff',
  onMouseDown: () => {},
  onMouseUp: () => {},
  onMouseEnter: () => {},
  onPreviewChange: () => {},
  preview: null,
  ranges: [],
  displayMode: 'date',
  date: new Date(2025, 5, 15),
  dayContentRenderer: undefined,
  dayDisplayFormat: 'd',
};

describe('DayCell', () => {
  describe('keyboard activation', () => {
    test('Enter keyDown invokes onMouseDown with day', () => {
      const onMouseDown = jest.fn();
      const onMouseUp = jest.fn();
      render(<DayCell {...baseProps} onMouseDown={onMouseDown} onMouseUp={onMouseUp} />);
      const button = screen.getByRole('gridcell');

      fireEvent.keyDown(button, { key: 'Enter', keyCode: 13 });
      expect(onMouseDown).toHaveBeenCalledTimes(1);
      expect(onMouseDown).toHaveBeenCalledWith(baseProps.day);

      fireEvent.keyUp(button, { key: 'Enter', keyCode: 13 });
      expect(onMouseUp).toHaveBeenCalledTimes(1);
      expect(onMouseUp).toHaveBeenCalledWith(baseProps.day);
    });

    test('Space keyDown/keyUp triggers the mouse chain', () => {
      const onMouseDown = jest.fn();
      const onMouseUp = jest.fn();
      render(<DayCell {...baseProps} onMouseDown={onMouseDown} onMouseUp={onMouseUp} />);
      const button = screen.getByRole('gridcell');

      fireEvent.keyDown(button, { key: ' ', keyCode: 32 });
      expect(onMouseDown).toHaveBeenCalledTimes(1);

      fireEvent.keyUp(button, { key: ' ', keyCode: 32 });
      expect(onMouseUp).toHaveBeenCalledTimes(1);
    });
  });

  describe('tabIndex', () => {
    test('tabIndex is -1 when disabled', () => {
      render(<DayCell {...baseProps} disabled={true} />);
      expect(screen.getByRole('gridcell').tabIndex).toBe(-1);
    });

    test('tabIndex is -1 when isPassive', () => {
      render(<DayCell {...baseProps} isPassive={true} />);
      expect(screen.getByRole('gridcell').tabIndex).toBe(-1);
    });

    test('tabIndex is 0 (default) when not disabled or passive', () => {
      render(<DayCell {...baseProps} disabled={false} isPassive={false} />);
      expect(screen.getByRole('gridcell').tabIndex).toBe(0);
    });
  });

  describe('dayContentRenderer', () => {
    test('uses dayContentRenderer output instead of default number', () => {
      const day = new Date(2025, 5, 15);
      const renderer = (d) => <span data-testid="custom-content">Day {d.getDate()}</span>;
      render(<DayCell {...baseProps} day={day} dayContentRenderer={renderer} />);

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByTestId('custom-content')).toHaveTextContent('Day 15');
    });

    test('falls back to format(day, dayDisplayFormat) when no renderer', () => {
      const day = new Date(2025, 5, 15);
      render(<DayCell {...baseProps} day={day} dayDisplayFormat="d" />);
      // Should render the day number "15"
      expect(screen.getByRole('gridcell')).toHaveTextContent('15');
    });
  });

  describe('preview placeholder', () => {
    test('renders preview startEdge, inRange, and endEdge classes', () => {
      const day = new Date(2025, 5, 15);
      const preview = {
        startDate: new Date(2025, 5, 14),
        endDate: new Date(2025, 5, 16),
        color: '#ff0000',
      };

      // Day 15 is in-range between 14 and 16
      render(<DayCell {...baseProps} day={day} preview={preview} />);
      const button = screen.getByRole('gridcell');
      expect(button.innerHTML).toContain('rdrDayInPreview');
    });

    test('day at preview startDate shows startEdge class', () => {
      const day = new Date(2025, 5, 14);
      const preview = {
        startDate: new Date(2025, 5, 14),
        endDate: new Date(2025, 5, 16),
      };
      render(<DayCell {...baseProps} day={day} preview={preview} />);
      const button = screen.getByRole('gridcell');
      expect(button.innerHTML).toContain('rdrDayStartPreview');
    });

    test('day at preview endDate shows endEdge class', () => {
      const day = new Date(2025, 5, 16);
      const preview = {
        startDate: new Date(2025, 5, 14),
        endDate: new Date(2025, 5, 16),
      };
      render(<DayCell {...baseProps} day={day} preview={preview} />);
      const button = screen.getByRole('gridcell');
      expect(button.innerHTML).toContain('rdrDayEndPreview');
    });
  });

  describe('displayMode date selection', () => {
    test('selected date shows selected class in date mode', () => {
      const day = new Date(2025, 5, 15);
      render(
        <DayCell {...baseProps} day={day} displayMode="date" date={day} />
      );
      const button = screen.getByRole('gridcell');
      expect(button.innerHTML).toContain('rdrSelected');
    });

    test('non-selected date does not show selected class in date mode', () => {
      const day = new Date(2025, 5, 15);
      const differentDate = new Date(2025, 5, 16);
      render(
        <DayCell {...baseProps} day={day} displayMode="date" date={differentDate} />
      );
      const button = screen.getByRole('gridcell');
      expect(button.innerHTML).not.toContain('rdrSelected');
    });
  });

  describe('renderSelectionPlaceholders — null endpoint guards', () => {
    const rangeBaseProps = {
      ...baseProps,
      displayMode: 'range',
      date: undefined,
    };

    test('both endpoints null renders no inRange/startEdge/endEdge spans', () => {
      const day = new Date(2025, 5, 15);
      render(
        <DayCell
          {...rangeBaseProps}
          day={day}
          ranges={[{ startDate: null, endDate: null, key: 'selection' }]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.querySelectorAll('.rdrInRange')).toHaveLength(0);
      expect(button.querySelectorAll('.rdrStartEdge')).toHaveLength(0);
      expect(button.querySelectorAll('.rdrEndEdge')).toHaveLength(0);
    });

    test('empty ranges array renders no placeholder spans', () => {
      const day = new Date(2025, 5, 15);
      render(<DayCell {...rangeBaseProps} day={day} ranges={[]} />);
      const button = screen.getByRole('gridcell');
      expect(button.querySelectorAll('.rdrInRange')).toHaveLength(0);
      expect(button.querySelectorAll('.rdrStartEdge')).toHaveLength(0);
      expect(button.querySelectorAll('.rdrEndEdge')).toHaveLength(0);
    });

    test('fully-populated range renders inRange span for intermediate day', () => {
      const day = new Date(2025, 5, 15);
      render(
        <DayCell
          {...rangeBaseProps}
          day={day}
          ranges={[
            {
              startDate: new Date(2025, 5, 10),
              endDate: new Date(2025, 5, 20),
              key: 'selection',
            },
          ]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.querySelectorAll('.rdrInRange')).toHaveLength(1);
    });

    test('fully-populated range renders startEdge on startDate boundary day', () => {
      const day = new Date(2025, 5, 10);
      render(
        <DayCell
          {...rangeBaseProps}
          day={day}
          ranges={[
            {
              startDate: new Date(2025, 5, 10),
              endDate: new Date(2025, 5, 20),
              key: 'selection',
            },
          ]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.querySelectorAll('.rdrStartEdge')).toHaveLength(1);
      expect(button.querySelectorAll('.rdrInRange')).toHaveLength(0);
    });

    test('fully-populated range renders endEdge on endDate boundary day', () => {
      const day = new Date(2025, 5, 20);
      render(
        <DayCell
          {...rangeBaseProps}
          day={day}
          ranges={[
            {
              startDate: new Date(2025, 5, 10),
              endDate: new Date(2025, 5, 20),
              key: 'selection',
            },
          ]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.querySelectorAll('.rdrEndEdge')).toHaveLength(1);
      expect(button.querySelectorAll('.rdrInRange')).toHaveLength(0);
    });

    test('only startDate set renders startEdge only on the matching day', () => {
      const startDate = new Date(2025, 5, 10);
      const matchingDay = new Date(2025, 5, 10);
      const otherDay = new Date(2025, 5, 15);

      // Matching day
      const { container: matchingContainer } = render(
        <DayCell
          {...rangeBaseProps}
          day={matchingDay}
          ranges={[{ startDate, endDate: null, key: 'selection' }]}
        />
      );
      expect(matchingContainer.querySelectorAll('.rdrStartEdge')).toHaveLength(1);
      expect(matchingContainer.querySelectorAll('.rdrInRange')).toHaveLength(0);
      expect(matchingContainer.querySelectorAll('.rdrEndEdge')).toHaveLength(0);

      // Other day
      const { container: otherContainer } = render(
        <DayCell
          {...rangeBaseProps}
          day={otherDay}
          ranges={[{ startDate, endDate: null, key: 'selection' }]}
        />
      );
      expect(otherContainer.querySelectorAll('.rdrStartEdge')).toHaveLength(0);
      expect(otherContainer.querySelectorAll('.rdrInRange')).toHaveLength(0);
      expect(otherContainer.querySelectorAll('.rdrEndEdge')).toHaveLength(0);
    });

    test('only endDate set renders endEdge only on the matching day', () => {
      const endDate = new Date(2025, 5, 20);
      const matchingDay = new Date(2025, 5, 20);
      const otherDay = new Date(2025, 5, 15);

      // Matching day
      const { container: matchingContainer } = render(
        <DayCell
          {...rangeBaseProps}
          day={matchingDay}
          ranges={[{ startDate: null, endDate, key: 'selection' }]}
        />
      );
      expect(matchingContainer.querySelectorAll('.rdrEndEdge')).toHaveLength(1);
      expect(matchingContainer.querySelectorAll('.rdrInRange')).toHaveLength(0);
      expect(matchingContainer.querySelectorAll('.rdrStartEdge')).toHaveLength(0);

      // Other day
      const { container: otherContainer } = render(
        <DayCell
          {...rangeBaseProps}
          day={otherDay}
          ranges={[{ startDate: null, endDate, key: 'selection' }]}
        />
      );
      expect(otherContainer.querySelectorAll('.rdrEndEdge')).toHaveLength(0);
      expect(otherContainer.querySelectorAll('.rdrInRange')).toHaveLength(0);
      expect(otherContainer.querySelectorAll('.rdrStartEdge')).toHaveLength(0);
    });
  });
});
