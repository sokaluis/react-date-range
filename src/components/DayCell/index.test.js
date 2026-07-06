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

  describe('mouse and focus interactions', () => {
    test('mouseEnter triggers hover, mouse callbacks, and preview update', () => {
      const onMouseEnter = jest.fn();
      const onPreviewChange = jest.fn();

      render(
        <DayCell
          {...baseProps}
          onMouseEnter={onMouseEnter}
          onPreviewChange={onPreviewChange}
        />
      );
      const button = screen.getByRole('gridcell');

      fireEvent.mouseEnter(button);

      expect(onMouseEnter).toHaveBeenCalledWith(baseProps.day);
      expect(onPreviewChange).toHaveBeenCalledWith(baseProps.day);
      expect(button).toHaveClass('rdrDayHovered');
    });

    test('mouseLeave and blur clear hover state', () => {
      render(<DayCell {...baseProps} />);
      const button = screen.getByRole('gridcell');

      fireEvent.mouseEnter(button);
      expect(button).toHaveClass('rdrDayHovered');

      fireEvent.mouseLeave(button);
      expect(button).not.toHaveClass('rdrDayHovered');

      fireEvent.mouseEnter(button);
      expect(button).toHaveClass('rdrDayHovered');

      fireEvent.blur(button);
      expect(button).not.toHaveClass('rdrDayHovered');
    });

    test('mouseDown and mouseUp toggle active state and invoke callbacks', () => {
      const onMouseDown = jest.fn();
      const onMouseUp = jest.fn();

      render(
        <DayCell {...baseProps} onMouseDown={onMouseDown} onMouseUp={onMouseUp} />
      );
      const button = screen.getByRole('gridcell');

      fireEvent.mouseDown(button);
      expect(onMouseDown).toHaveBeenCalledWith(baseProps.day);
      expect(button).toHaveClass('rdrDayActive');

      fireEvent.mouseUp(button);
      expect(onMouseUp).toHaveBeenCalledWith(baseProps.day);
      expect(button).not.toHaveClass('rdrDayActive');
    });

    test('focus triggers preview update for the focused day', () => {
      const onPreviewChange = jest.fn();

      render(<DayCell {...baseProps} onPreviewChange={onPreviewChange} />);
      const button = screen.getByRole('gridcell');

      fireEvent.focus(button);

      expect(onPreviewChange).toHaveBeenCalledWith(baseProps.day);
    });

    test('disabled cell clears preview and ignores mouseEnter callback', () => {
      const onMouseEnter = jest.fn();
      const onPreviewChange = jest.fn();

      render(
        <DayCell
          {...baseProps}
          disabled={true}
          onMouseEnter={onMouseEnter}
          onPreviewChange={onPreviewChange}
        />
      );
      const button = screen.getByRole('gridcell');

      fireEvent.mouseEnter(button);

      expect(onPreviewChange).toHaveBeenCalledWith();
      expect(onMouseEnter).not.toHaveBeenCalled();
      expect(button).not.toHaveClass('rdrDayHovered');
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

  describe('focus-visible keyboard indicator', () => {
    const fs = require('fs');
    const path = require('path');

    test('rdrDay block in default.scss suppresses outline on :focus and later restores it on :focus-visible', () => {
      const scssSource = fs.readFileSync(
        path.resolve(__dirname, '../../theme/default.scss'),
        'utf8'
      );

      // Extract the .rdrDay block — find its opening and the start of the next top-level rule
      const dayBlockMatch = scssSource.match(/\.rdrDay\s*\{[^}]+\boutline:\s*0[^}]*\}/s);
      expect(dayBlockMatch).not.toBeNull();
      const focusRule = dayBlockMatch[0];
      // The :focus rule must be present (mouse click = no ring)
      expect(focusRule).toMatch(/&\s*:\s*focus\s*\{[^}]*outline:\s*0/s);

      // After the :focus block, :focus-visible must appear with a visible ring
      const afterFocusRule = scssSource.substring(scssSource.indexOf(focusRule) + focusRule.length);
      expect(afterFocusRule).toMatch(/&\s*:\s*focus-visible\s*\{[^}]*outline:\s*2px\s*solid\s*#[0-9a-fA-F]{6}/);
      expect(afterFocusRule).toMatch(/outline-offset:\s*2px/);
    });

    test('rendered day button remains focusable with gridcell role and tabIndex 0', () => {
      render(<DayCell {...baseProps} />);
      const button = screen.getByRole('gridcell');
      expect(button).toHaveClass('rdrDay');
      expect(button.tabIndex).toBe(0);
    });

    // --- Additional focus-visible controls ---

    test('rdrNextPrevButton block has &:focus { outline: 0 } then &:focus-visible ring', () => {
      const scssSource = fs.readFileSync(
        path.resolve(__dirname, '../../theme/default.scss'),
        'utf8'
      );
      // Find the start of .rdrNextPrevButton block
      const startIdx = scssSource.indexOf('.rdrNextPrevButton');
      expect(startIdx).toBeGreaterThan(-1);
      // Find the start of the next top-level class after it
      const nextRuleIdx = scssSource.indexOf('\n.rdrP', startIdx + 1);
      const nextRule2Idx = scssSource.indexOf('\n.rdrWeekDays', startIdx + 1);
      const nextRule3Idx = scssSource.indexOf('\n.rdrMonth', startIdx + 1);
      const endIdx = [nextRuleIdx, nextRule2Idx, nextRule3Idx]
        .filter(idx => idx !== -1)
        .reduce((min, idx) => Math.min(min, idx), Infinity);
      const block = scssSource.substring(startIdx, endIdx);
      // &:focus { outline: 0 } must be present
      expect(block).toMatch(/&\s*:\s*focus\s*\{\s*outline:\s*0\s*;?\s*\}/);
      // &:focus-visible ring must appear after &:focus
      const focusIdx = block.search(/&\s*:\s*focus\s*\{/);
      const afterFocus = block.substring(focusIdx);
      expect(afterFocus).toMatch(/&\s*:\s*focus-visible\s*\{\s*outline:\s*2px\s*solid\s*#3d91ff\s*;?\s*outline-offset:\s*2px\s*;?\s*\}/);
    });

    test('rdrMonthAndYearPickers select has &:focus-visible ring after base outline:0', () => {
      const scssSource = fs.readFileSync(
        path.resolve(__dirname, '../../theme/default.scss'),
        'utf8'
      );
      // Find the select block inside .rdrMonthAndYearPickers
      const startIdx = scssSource.indexOf('.rdrMonthAndYearPickers');
      expect(startIdx).toBeGreaterThan(-1);
      // select starts after the .rdrMonthAndYearPickers opening
      const selectStartIdx = scssSource.indexOf('select{', startIdx);
      expect(selectStartIdx).toBeGreaterThan(-1);
      const selectEndIdx = scssSource.indexOf('\n  }', selectStartIdx);
      const block = scssSource.substring(selectStartIdx, selectEndIdx + 4);
      // Base outline:0 must be present
      expect(block).toMatch(/outline:\s*0/);
      // &:focus-visible ring must appear after the base outline
      const outline0Idx = block.search(/outline:\s*0/);
      const afterOutline0 = block.substring(outline0Idx);
      expect(afterOutline0).toMatch(/&\s*:\s*focus-visible\s*\{\s*outline:\s*2px\s*solid\s*#3d91ff\s*;?\s*outline-offset:\s*2px\s*;?\s*\}/);
    });

    test('rdrStaticRange block has &:focus-visible ring after &:hover, &:focus block', () => {
      const scssSource = fs.readFileSync(
        path.resolve(__dirname, '../../theme/default.scss'),
        'utf8'
      );
      // Find .rdrStaticRange block
      const startIdx = scssSource.indexOf('.rdrStaticRange{');
      expect(startIdx).toBeGreaterThan(-1);
      const nextRuleIdx = scssSource.indexOf('\n.rdrStaticRangeLabel', startIdx + 1);
      const nextRule2Idx = scssSource.indexOf('\n.rdrInputRanges', startIdx + 1);
      const endIdx = [nextRuleIdx, nextRule2Idx]
        .filter(idx => idx !== -1)
        .reduce((min, idx) => Math.min(min, idx), Infinity);
      const block = scssSource.substring(startIdx, endIdx);
      // Base outline:0 must be present
      expect(block).toMatch(/outline:\s*0/);
      // &:hover, &:focus block must be present
      expect(block).toMatch(/&\s*:\s*hover\s*,\s*&\s*:\s*focus/);
      // &:focus-visible ring after the hover/focus block
      const hoverFocusIdx = block.search(/&\s*:\s*hover\s*,\s*&\s*:\s*focus/);
      const afterHoverFocus = block.substring(hoverFocusIdx);
      expect(afterHoverFocus).toMatch(/&\s*:\s*focus-visible\s*\{\s*outline:\s*2px\s*solid\s*#3d91ff\s*;?\s*outline-offset:\s*2px\s*;?\s*\}/);
    });

    test('rdrInputRangeInput splits &:focus and &:hover, preserves border-color on hover, adds &:focus-visible ring', () => {
      const scssSource = fs.readFileSync(
        path.resolve(__dirname, '../../theme/default.scss'),
        'utf8'
      );
      // Find .rdrInputRangeInput block
      const startIdx = scssSource.indexOf('.rdrInputRangeInput{');
      expect(startIdx).toBeGreaterThan(-1);
      const nextRuleIdx = scssSource.indexOf('\n.rdrCalendarWrapper', startIdx + 1);
      const endIdx = nextRuleIdx === -1 ? scssSource.indexOf('\n.rdrDay', startIdx + 1) : nextRuleIdx;
      const block = scssSource.substring(startIdx, endIdx);
      // &:focus and &:hover must NOT be combined (no &:focus, &:hover pattern)
      expect(block).not.toMatch(/&\s*:\s*focus\s*,\s*&\s*:\s*hover/);
      // &:focus { outline: 0 } must be present
      expect(block).toMatch(/&\s*:\s*focus\s*\{[^}]*outline:\s*0/);
      // &:hover must preserve border-color: rgb(180, 191, 196)
      expect(block).toMatch(/&\s*:\s*hover\s*\{[^}]*border-color:\s*rgb\(180,\s*191,\s*196\)/);
      // &:focus-visible ring present
      expect(block).toMatch(/&\s*:\s*focus-visible\s*\{\s*outline:\s*2px\s*solid\s*#3d91ff\s*;?\s*outline-offset:\s*2px\s*;?\s*\}/);
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

  describe('aria-selected null endpoint guards', () => {
    const rangeBaseProps = {
      ...baseProps,
      displayMode: 'range',
      date: undefined,
    };

    test('both-null range produces no aria-selected="true" on any day', () => {
      const day = new Date(2025, 5, 15);
      render(
        <DayCell
          {...rangeBaseProps}
          day={day}
          ranges={[{ startDate: null, endDate: null, key: 'selection' }]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).not.toBe('true');
    });

    test('empty ranges produces no aria-selected="true"', () => {
      const day = new Date(2025, 5, 15);
      render(<DayCell {...rangeBaseProps} day={day} ranges={[]} />);
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).not.toBe('true');
    });

    test('only startDate set — day strictly after startDate has no aria-selected="true"', () => {
      const startDate = new Date(2025, 5, 10);
      const dayAfter = new Date(2025, 5, 15);
      render(
        <DayCell
          {...rangeBaseProps}
          day={dayAfter}
          ranges={[{ startDate, endDate: null, key: 'selection' }]}
        />
      );
      const button = screen.getByRole('gridcell');
      // The in-range path must not produce aria-selected — startEdge is only on the exact day
      expect(button.getAttribute('aria-selected')).not.toBe('true');
    });

    test('only startDate set — the startDate day itself retains aria-selected="true" via boundary', () => {
      const startDate = new Date(2025, 5, 10);
      render(
        <DayCell
          {...rangeBaseProps}
          day={startDate}
          ranges={[{ startDate, endDate: null, key: 'selection' }]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).toBe('true');
    });

    test('only endDate set — day strictly before endDate has no aria-selected="true"', () => {
      const endDate = new Date(2025, 5, 20);
      const dayBefore = new Date(2025, 5, 15);
      render(
        <DayCell
          {...rangeBaseProps}
          day={dayBefore}
          ranges={[{ startDate: null, endDate, key: 'selection' }]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).not.toBe('true');
    });

    test('only endDate set — the endDate day itself retains aria-selected="true" via boundary', () => {
      const endDate = new Date(2025, 5, 20);
      render(
        <DayCell
          {...rangeBaseProps}
          day={endDate}
          ranges={[{ startDate: null, endDate, key: 'selection' }]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).toBe('true');
    });

    test('fully-populated range — startDate day has aria-selected="true"', () => {
      const startDate = new Date(2025, 5, 10);
      const endDate = new Date(2025, 5, 20);
      render(
        <DayCell
          {...rangeBaseProps}
          day={startDate}
          ranges={[{ startDate, endDate, key: 'selection' }]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).toBe('true');
    });

    test('fully-populated range — intermediate day has aria-selected="true"', () => {
      const startDate = new Date(2025, 5, 10);
      const endDate = new Date(2025, 5, 20);
      const intermediate = new Date(2025, 5, 15);
      render(
        <DayCell
          {...rangeBaseProps}
          day={intermediate}
          ranges={[{ startDate, endDate, key: 'selection' }]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).toBe('true');
    });

    test('fully-populated range — endDate day has aria-selected="true"', () => {
      const startDate = new Date(2025, 5, 10);
      const endDate = new Date(2025, 5, 20);
      render(
        <DayCell
          {...rangeBaseProps}
          day={endDate}
          ranges={[{ startDate, endDate, key: 'selection' }]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).toBe('true');
    });

    test('fully-populated range — day outside range has no aria-selected="true"', () => {
      const startDate = new Date(2025, 5, 10);
      const endDate = new Date(2025, 5, 20);
      const outside = new Date(2025, 5, 25);
      render(
        <DayCell
          {...rangeBaseProps}
          day={outside}
          ranges={[{ startDate, endDate, key: 'selection' }]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).not.toBe('true');
    });

    test('displayMode date, date={null} — no aria-selected="true"', () => {
      const day = new Date(2025, 5, 15);
      render(<DayCell {...baseProps} day={day} displayMode="date" date={null} />);
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).not.toBe('true');
    });

    test('displayMode date, date=matching day — aria-selected="true"', () => {
      const day = new Date(2025, 5, 15);
      render(<DayCell {...baseProps} day={day} displayMode="date" date={day} />);
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).toBe('true');
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

    test('inverted range renders inRange span after normalizing endpoints', () => {
      const day = new Date(2025, 5, 15);
      render(
        <DayCell
          {...rangeBaseProps}
          day={day}
          ranges={[
            {
              startDate: new Date(2025, 5, 20),
              endDate: new Date(2025, 5, 10),
              key: 'selection',
            },
          ]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.querySelectorAll('.rdrInRange')).toHaveLength(1);
    });

    test('inverted range still marks intermediate day aria-selected', () => {
      const day = new Date(2025, 5, 15);
      render(
        <DayCell
          {...rangeBaseProps}
          day={day}
          ranges={[
            {
              startDate: new Date(2025, 5, 20),
              endDate: new Date(2025, 5, 10),
              key: 'selection',
            },
          ]}
        />
      );
      const button = screen.getByRole('gridcell');
      expect(button.getAttribute('aria-selected')).toBe('true');
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
