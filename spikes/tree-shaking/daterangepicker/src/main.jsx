import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { DateRangePicker } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';

function App() {
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  return (
    <div style={{ padding: 20 }}>
      <h2>DateRangePicker import</h2>
      <DateRangePicker ranges={range} onChange={(r) => setRange([r.selection])} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
