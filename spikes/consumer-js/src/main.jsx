import React from 'react';
import { createRoot } from 'react-dom/client';
import { DateRangePicker } from '@cyberlz/react-date-range';
// Import compiled CSS from the built package output
import '@cyberlz/react-date-range/styles.css';

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
      <h1>Consumer JS — @cyberlz/react-date-range Smoke Test</h1>
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
