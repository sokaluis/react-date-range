import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DateRangePicker,
  type Range,
  type RangeKeyDict,
} from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

function createInitialRange(): Range {
  return {
    startDate: today,
    endDate: nextWeek,
    key: 'selection',
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date | undefined): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function toISODate(date: Date | undefined): string {
  if (!date) return 'null';
  return date.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  const [ranges, setRanges] = useState<Range[]>([createInitialRange()]);

  const currentRange = ranges[0];
  const handleChange = (rangesByKey: RangeKeyDict) => {
    const next = rangesByKey.selection;
    if (next) setRanges([next]);
  };

  return (
    <div className="container">
      <header>
        <h1>
          @cyberlz/react-date-range
          <span className="badge">Alpha</span>
        </h1>
        <p>
          Modern maintained fork of{' '}
          <code>react-date-range</code>. React 18/19 compatible, TypeScript-first.
        </p>
        <div className="install-block">
          npm install @cyberlz/react-date-range@alpha
        </div>
      </header>

      <section className="demo-panel">
        <h2>DateRangePicker — Interactive Demo</h2>
        <DateRangePicker
          onChange={handleChange}
          ranges={ranges}
          showPreview={true}
          moveRangeOnFirstSelection={false}
          months={2}
          direction="horizontal"
        />
      </section>

      <section className="demo-panel">
        <h2>Selection Output</h2>
        <p>
          <strong>Start:</strong> {formatDate(currentRange.startDate)}{' '}
          <small>({toISODate(currentRange.startDate)})</small>
          <br />
          <strong>End:</strong> {formatDate(currentRange.endDate)}{' '}
          <small>({toISODate(currentRange.endDate)})</small>
        </p>
        <div className="state-output">
          <code>{JSON.stringify(currentRange, null, 2)}</code>
        </div>
      </section>

      <footer>
        <p>
          <a
            href="https://github.com/sokaluis/react-date-range"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          {' · '}
          <a
            href="https://www.npmjs.com/package/@cyberlz/react-date-range"
            target="_blank"
            rel="noopener noreferrer"
          >
            npm
          </a>
        </p>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
