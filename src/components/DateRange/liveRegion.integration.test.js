import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import DateRange from './index.jsx';

const startDate = new Date(2025, 5, 10);
const endDate = new Date(2025, 5, 12);

const baseProps = {
  ranges: [{ startDate, endDate, key: 'selection' }],
  onChange: jest.fn(),
  shownDate: new Date(2025, 5, 15),
  showDateDisplay: false,
  minDate: new Date(2025, 0, 1),
  maxDate: new Date(2025, 11, 31),
};

const liveRegions = container => Array.from(container.querySelectorAll('[aria-live="polite"]'));

const findDayButton = dayNumber =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === String(dayNumber) && button.tabIndex !== -1);

describe('DateRange live region integration', () => {
  test('hovering a real rendered day cell does not announce a selection', () => {
    const onChange = jest.fn();
    const { container } = render(<DateRange {...baseProps} onChange={onChange} />);

    expect(liveRegions(container)).toHaveLength(2);
    expect(liveRegions(container).every(region => region.textContent === '')).toBe(true);

    fireEvent.mouseEnter(findDayButton(20));

    expect(onChange).not.toHaveBeenCalled();
    expect(liveRegions(container)).toHaveLength(2);
    expect(liveRegions(container).every(region => region.textContent === '')).toBe(true);
  });
});
