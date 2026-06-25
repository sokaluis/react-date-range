import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { DateRangePicker } from 'react-date-range-modern';
import 'react-date-range-modern/styles.css';

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
