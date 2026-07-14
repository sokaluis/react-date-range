import React from 'react';
import { render, screen } from '@testing-library/react';

import DateRangePicker from './index.jsx';

const startDate = new Date(2025, 3, 10);
const endDate = new Date(2025, 3, 12);

const baseProps = {
  ranges: [{ startDate, endDate, key: 'selection' }],
  onChange: jest.fn(),
  staticRanges: [],
  inputRanges: [],
  shownDate: startDate,
};

describe('DateRangePicker selectedDisplay integration', () => {
  test('preserves top placement and existing dateDisplayFormat by default', () => {
    render(<DateRangePicker {...baseProps} dateDisplayFormat="MMM d, yyyy" />);

    const display = screen.getByRole('group', { name: 'Selected date range' });
    const grid = screen.getByRole('grid', { name: 'Calendar' });

    expect(screen.getAllByRole('textbox')[0]).toHaveValue('Apr 10, 2025');
    expect(display.compareDocumentPosition(grid)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  test('renders formatted selected display after the calendar with a separator', () => {
    render(
      <DateRangePicker
        {...baseProps}
        dateDisplayFormat="MMM d, yyyy"
        selectedDisplay={{ format: 'yyyy-MM-dd', placement: 'bottom', separator: ' – ' }}
      />
    );

    const grid = screen.getByRole('grid', { name: 'Calendar' });
    const display = screen.getByRole('group', { name: 'Selected date range' });
    const separator = screen.getByText('–');

    expect(screen.getAllByRole('textbox')[0]).toHaveValue('2025-04-10');
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('2025-04-12');
    expect(grid.compareDocumentPosition(display)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(display).toContainElement(separator);
  });
});
