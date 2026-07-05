import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DateRangePicker } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/theme/default.scss';
import '@cyberlz/react-date-range/styles.scss';

function App() {
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });

  const handleSelect = (ranges) => {
    console.log('Selected range:', ranges);
    setSelectionRange(ranges.selection);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>React 19 Spike — @cyberlz/react-date-range</h1>
      <p>
        Testing <code>&lt;DateRangePicker /&gt;</code> with React 19
      </p>
      <DateRangePicker
        ranges={[selectionRange]}
        onChange={handleSelect}
        showDateDisplay={true}
        moveRangeOnFirstSelection={false}
        months={2}
        direction="horizontal"
      />
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
