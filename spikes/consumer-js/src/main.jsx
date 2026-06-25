import React from 'react';
import { createRoot } from 'react-dom/client';
import { DateRangePicker } from 'react-date-range-modern';
// Import compiled CSS from the built package output
import 'react-date-range-modern/styles.css';

function App() {
  const [state, setState] = React.useState([
    {
      startDate: new Date(),
      endDate: null,
      key: 'selection',
    },
  ]);

  return (
    <div style={{ padding: 40 }}>
      <h1>Consumer JS — react-date-range-modern Smoke Test</h1>
      <DateRangePicker
        onChange={(item) => setState([item.selection])}
        ranges={state}
        showPreview={true}
        moveRangeOnFirstSelection={false}
        months={2}
        direction="horizontal"
      />
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
