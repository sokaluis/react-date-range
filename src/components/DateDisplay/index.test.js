import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import DateDisplay from './index.jsx';

const baseStyles = {
  dateDisplayWrapper: 'ddw',
  dateDisplay: 'dd',
  dateDisplayItem: 'ddi',
  dateDisplayItemActive: 'ddi-active',
  dateDisplayLabel: 'ddl',
};

const setup = props =>
  render(
    <DateDisplay
      ranges={[{ startDate: null, endDate: null, key: 'selection' }]}
      focusedRange={[0, 0]}
      rangeColors={[]}
      color="#0000ff"
      dateDisplayFormat="yyyy-MM-dd"
      startDatePlaceholder="Start"
      endDatePlaceholder="End"
      ariaLabels={{
        dateInput: {
          selection: { startDate: 'Check-in date', endDate: 'Check-out date' },
          alt: { startDate: 'Alt start', endDate: 'Alt end' },
        },
      }}
      disabledDates={[]}
      onChange={jest.fn()}
      onRangeFocusChange={jest.fn()}
      styles={baseStyles}
      {...props}
    />
  );

describe('DateDisplay', () => {
  test('Should resolve as a function component without runtime defaultProps', () => {
    expect(DateDisplay).toEqual(expect.any(Function));
    expect(DateDisplay.defaultProps).toBeUndefined();
  });

  test('renders wrapper with no inputs when ranges is empty', () => {
    const { container } = setup({ ranges: [] });

    expect(container.querySelector('.ddw')).toBeInTheDocument();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });

  test('renders the DateDisplay wrapper as a named group by default', () => {
    setup({ ariaLabels: undefined });

    expect(screen.getByRole('group', { name: 'Selected date range' })).toBeInTheDocument();
  });

  test('uses custom DateDisplay group label and preserves DateInput labels', () => {
    setup({
      ariaLabels: {
        dateDisplay: 'Dates selected',
        dateInput: {
          selection: { startDate: 'Check-in date', endDate: 'Check-out date' },
        },
      },
    });

    expect(screen.getByRole('group', { name: 'Dates selected' })).toBeInTheDocument();
    expect(screen.getByLabelText('Check-in date')).toBeInTheDocument();
    expect(screen.getByLabelText('Check-out date')).toBeInTheDocument();
  });

  describe('range visibility', () => {
    test('does not render a range where showDateDisplay === false', () => {
      setup({ ranges: [{ startDate: null, endDate: null, key: 'selection', showDateDisplay: false }] });

      expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    });

    test('renders range when showDateDisplay === true even if disabled', () => {
      setup({ ranges: [{ startDate: null, endDate: null, key: 'selection', showDateDisplay: true, disabled: true }] });

      expect(screen.getByLabelText('Check-in date')).toBeDisabled();
      expect(screen.getByLabelText('Check-out date')).toBeDisabled();
    });

    test('renders range when showDateDisplay is not explicitly false', () => {
      setup();

      expect(screen.getAllByRole('textbox')).toHaveLength(2);
    });
  });

  describe('onRangeFocusChange callbacks', () => {
    test('start DateInput onFocus calls onRangeFocusChange(i, 0)', () => {
      const onRangeFocusChange = jest.fn();
      setup({ onRangeFocusChange });

      fireEvent.focus(screen.getByLabelText('Check-in date'));

      expect(onRangeFocusChange).toHaveBeenCalledWith(0, 0);
    });

    test('end DateInput onFocus calls onRangeFocusChange(i, 1)', () => {
      const onRangeFocusChange = jest.fn();
      setup({ onRangeFocusChange });

      fireEvent.focus(screen.getByLabelText('Check-out date'));

      expect(onRangeFocusChange).toHaveBeenCalledWith(0, 1);
    });

    test('uses correct range index for multiple ranges', () => {
      const onRangeFocusChange = jest.fn();
      setup({
        ranges: [
          { startDate: null, endDate: null, key: 'selection' },
          { startDate: null, endDate: null, key: 'alt' },
        ],
        focusedRange: [1, 0],
        onRangeFocusChange,
      });

      fireEvent.focus(screen.getByLabelText('Alt start'));
      fireEvent.focus(screen.getByLabelText('Alt end'));

      expect(onRangeFocusChange).toHaveBeenNthCalledWith(1, 1, 0);
      expect(onRangeFocusChange).toHaveBeenNthCalledWith(2, 1, 1);
    });
  });

  test('readOnly and disabled are correctly wired to inputs', () => {
    setup({
      ranges: [
        { startDate: null, endDate: null, key: 'selection', disabled: true, showDateDisplay: true },
        { startDate: null, endDate: null, key: 'alt', disabled: false },
      ],
      editableDateInputs: false,
    });

    expect(screen.getByLabelText('Check-in date')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Check-in date')).toBeDisabled();
    expect(screen.getByLabelText('Check-out date')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Check-out date')).toBeDisabled();
    expect(screen.getByLabelText('Alt start')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Alt start')).not.toBeDisabled();
    expect(screen.getByLabelText('Alt end')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Alt end')).not.toBeDisabled();
  });

  test('editableDateInputs=false by default via destructuring defaults', () => {
    setup({ editableDateInputs: undefined });

    expect(screen.getByLabelText('Check-in date')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Check-out date')).toHaveAttribute('readonly');
  });

  test('dateDisplayFormat, dateOptions, and placeholders are used by DateInput', () => {
    setup({
      ranges: [{ startDate: new Date(2025, 3, 10), endDate: new Date(2025, 3, 12), key: 'selection' }],
      startDatePlaceholder: 'From',
      endDatePlaceholder: 'To',
      dateDisplayFormat: 'yyyy-MM-dd',
    });

    expect(screen.getByLabelText('Check-in date')).toHaveValue('2025-04-10');
    expect(screen.getByLabelText('Check-in date')).toHaveAttribute('placeholder', 'From');
    expect(screen.getByLabelText('Check-out date')).toHaveValue('2025-04-12');
    expect(screen.getByLabelText('Check-out date')).toHaveAttribute('placeholder', 'To');
  });

  test('ariaLabels.dateInput is forwarded to start and end DateInput elements', () => {
    setup({
      ranges: [
        { startDate: null, endDate: null, key: 'selection' },
        { startDate: null, endDate: null, key: 'alt' },
      ],
    });

    expect(screen.getByLabelText('Check-in date')).toBeInTheDocument();
    expect(screen.getByLabelText('Check-out date')).toBeInTheDocument();
    expect(screen.getByLabelText('Alt start')).toBeInTheDocument();
    expect(screen.getByLabelText('Alt end')).toBeInTheDocument();
  });

  describe('active class (dateDisplayItemActive)', () => {
    test('applies active class to start input when focusedRange matches', () => {
      setup({ focusedRange: [0, 0] });

      expect(screen.getByLabelText('Check-in date').parentElement).toHaveClass('ddi-active');
      expect(screen.getByLabelText('Check-out date').parentElement).not.toHaveClass('ddi-active');
    });

    test('applies active class to end input when focusedRange matches', () => {
      setup({ focusedRange: [0, 1] });

      expect(screen.getByLabelText('Check-in date').parentElement).not.toHaveClass('ddi-active');
      expect(screen.getByLabelText('Check-out date').parentElement).toHaveClass('ddi-active');
    });

    test('applies active class to correct range when multiple ranges present', () => {
      setup({
        ranges: [
          { startDate: null, endDate: null, key: 'selection' },
          { startDate: null, endDate: null, key: 'alt' },
        ],
        focusedRange: [1, 0],
      });

      expect(screen.getByLabelText('Check-in date').parentElement).not.toHaveClass('ddi-active');
      expect(screen.getByLabelText('Alt start').parentElement).toHaveClass('ddi-active');
      expect(screen.getByLabelText('Alt end').parentElement).not.toHaveClass('ddi-active');
    });
  });

  describe('wrapper color style', () => {
    test('uses range.color when provided', () => {
      const { container } = setup({ ranges: [{ startDate: null, endDate: null, key: 'selection', color: '#ff0000' }] });

      expect(container.querySelector('.dd')).toHaveStyle({ color: '#ff0000' });
    });

    test('falls back to rangeColors[focusedRange[0]] when range has no color', () => {
      const { container } = setup({ rangeColors: ['#abcdef', '#fedcba'], focusedRange: [0, 0] });

      expect(container.querySelector('.dd')).toHaveStyle({ color: '#abcdef' });
    });

    test('falls back to color prop when rangeColors[focusedRange[0]] is falsy', () => {
      const { container } = setup({ rangeColors: [], color: '#00ff00', focusedRange: [0, 0] });

      expect(container.querySelector('.dd')).toHaveStyle({ color: '#00ff00' });
    });

    test('default color applies per rendered range from focusedRange index', () => {
      const { container } = setup({
        ranges: [
          { startDate: null, endDate: null, key: 'selection' },
          { startDate: null, endDate: null, key: 'alt' },
        ],
        rangeColors: ['#aaa', '#bbb'],
        color: '#000',
        focusedRange: [1, 0],
      });

      expect(container.querySelectorAll('.dd')[0]).toHaveStyle({ color: '#bbb' });
      expect(container.querySelectorAll('.dd')[1]).toHaveStyle({ color: '#bbb' });
    });
  });

  describe('uiSlots', () => {
    test('appends dateDisplay class and merges style while preserving range group semantics', () => {
      const { container } = setup({
        ranges: [{ startDate: null, endDate: null, key: 'selection', label: 'Trip' }],
        uiSlots: {
          dateDisplay: { className: 'host-date-display', style: { borderColor: 'red' } },
        },
      });

      const rangeGroup = screen.getByRole('group', { name: 'Trip' });
      expect(rangeGroup).toHaveClass('dd', 'host-date-display');
      expect(rangeGroup).toHaveStyle('color: rgb(0, 0, 255); border-color: red;');
      expect(container.querySelector('.ddw')).not.toHaveClass('host-date-display');
    });

    test('appends dateDisplayItem class and style without changing DateInput labels or focus callbacks', () => {
      const onRangeFocusChange = jest.fn();
      setup({
        onRangeFocusChange,
        uiSlots: {
          dateDisplayItem: { className: 'host-date-item', style: { backgroundColor: 'yellow' } },
          day: { className: 'should-not-render-on-date-display' },
        },
      });

      const startInput = screen.getByLabelText('Check-in date');
      expect(startInput.parentElement).toHaveClass('ddi', 'host-date-item');
      expect(startInput.parentElement).toHaveStyle('background-color: rgb(255, 255, 0);');
      expect(screen.getByLabelText('Check-out date').parentElement).toHaveClass('host-date-item');
      expect(document.querySelector('.should-not-render-on-date-display')).toBeNull();

      fireEvent.focus(startInput);
      expect(onRangeFocusChange).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('range labels', () => {
    test('labelled range renders visible label text', () => {
      setup({
        ranges: [{ startDate: null, endDate: null, key: 'selection', label: 'Trip 1' }],
      });

      expect(screen.getByText('Trip 1')).toBeInTheDocument();
    });

    test('per-range group accessible name resolves to label', () => {
      setup({
        ranges: [{ startDate: null, endDate: null, key: 'selection', label: 'Trip 1' }],
      });

      expect(screen.getByRole('group', { name: 'Trip 1' })).toBeInTheDocument();
    });

    test('no label preserves bare wrapper with no inner role group', () => {
      setup({
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
      });

      const groups = screen.getAllByRole('group');
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveAccessibleName('Selected date range');
    });

    test('two ranges with same label get distinct aria-labelledby ids', () => {
      const { container } = setup({
        ranges: [
          { startDate: null, endDate: null, key: 'trip1', label: 'Trip' },
          { startDate: null, endDate: null, key: 'trip2', label: 'Trip' },
        ],
      });

      const innerGroups = container.querySelectorAll('[role="group"][aria-labelledby]');
      expect(innerGroups).toHaveLength(2);
      const idA = innerGroups[0].getAttribute('aria-labelledby');
      const idB = innerGroups[1].getAttribute('aria-labelledby');
      expect(idA).toBeTruthy();
      expect(idB).toBeTruthy();
      expect(idA).not.toBe(idB);
    });

    test('label renders as plain text, HTML is not interpreted', () => {
      setup({
        ranges: [{ startDate: null, endDate: null, key: 'selection', label: '<img src=x onerror=alert(1)>' }],
      });

      expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    });
  });
});
