import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DateRangePicker,
  // Verify types are importable
  type Range,
  type DateRangePickerProps,
  type RangeKeyDict,
} from '@cyberlz/react-date-range';
// Import compiled CSS from the built package output
import '@cyberlz/react-date-range/styles.css';

// Type-check: ensure Range type is usable
const initialRange: Range = {
  startDate: new Date(),
  endDate: undefined,
  key: 'selection',
};

// Type-check: ensure DateRangePickerProps can be referenced
type AppProps = Pick<DateRangePickerProps, 'months' | 'direction'>;

function App(_props: AppProps) {
  const [ranges, setRanges] = useState<Range[]>([initialRange]);

  const handleChange = (rangesByKey: RangeKeyDict) => {
    setRanges([rangesByKey.selection]);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Consumer TSX — @cyberlz/react-date-range Smoke Test</h1>
      <DateRangePicker
        onChange={handleChange}
        ranges={ranges}
        showPreview={true}
        moveRangeOnFirstSelection={false}
        months={2}
        direction="horizontal"
      />
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App months={2} direction="horizontal" />);
