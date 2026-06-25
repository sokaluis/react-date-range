import React from 'react';
import ReactDOM from 'react-dom/client';
import { Calendar } from 'react-date-range-modern';
import 'react-date-range-modern/styles.css';

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Calendar-only import</h2>
      <Calendar date={new Date()} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
