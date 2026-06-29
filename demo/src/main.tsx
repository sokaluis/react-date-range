import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Calendar,
  DateRangePicker,
  type Range,
  type RangeKeyDict,
} from '@cyberlz/react-date-range';
import { enUS } from 'date-fns/locale';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

const ENABLE_MANUAL_QA_LOGS = false;

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

function logManualQA(label: string, payload: Record<string, unknown>) {
  if (!ENABLE_MANUAL_QA_LOGS) return;

  console.groupCollapsed(`[react-date-range demo QA] ${label}`);
  console.table(payload);
  console.groupEnd();
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  const [ranges, setRanges] = useState<Range[]>([createInitialRange()]);
  const [singleDate, setSingleDate] = useState<Date | undefined>(today);

  const currentRange = ranges[0];
  const handleChange = (rangesByKey: RangeKeyDict) => {
    const next = rangesByKey.selection;
    if (next) {
      logManualQA('DateRangePicker onChange', {
        startDate: toISODate(next.startDate),
        endDate: toISODate(next.endDate),
        key: next.key,
      });
      setRanges([next]);
    }
  };

  const handleSingleDateChange = (source: string) => (date: Date) => {
    logManualQA(`${source} onChange`, {
      date: toISODate(date),
    });
    setSingleDate(date);
  };

  const handleShownDateChange = (source: string) => (date: Date) => {
    logManualQA(`${source} onShownDateChange`, {
      shownDate: toISODate(date),
    });
  };

  // PR4: fixed constraint dates for manual verification
  const minMaxDate = {
    min: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
    max: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 25),
    disabled: [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
    ],
  };

  return (
    <div className="container">
      <header>
        <h1>
          @cyberlz/react-date-range
          <span className="badge">RC</span>
        </h1>
        <p>
          Modern maintained fork of{' '}
          <code>react-date-range</code>. React 18/19 compatible, TypeScript-first.
        </p>
        <div className="install-block">
          npm install @cyberlz/react-date-range@rc
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

      {/* PR4: manual verification aids — hooks migration */}

      <section className="demo-panel">
        <h2>Calendar — Single Date Mode</h2>
        <p>Verifies <code>displayMode="date"</code> with hook-based state.</p>
        <Calendar
          onChange={handleSingleDateChange('Calendar single-date')}
          onShownDateChange={handleShownDateChange('Calendar single-date')}
          date={singleDate}
          displayMode="date"
          showDateDisplay={true}
          direction="horizontal"
        />
        <p className="state-output">
          <code>date = {singleDate ? singleDate.toISOString().split('T')[0] : 'null'}</code>
        </p>
      </section>

      <section className="demo-panel">
        <h2>Calendar — Vertical Scroll (hook-based)</h2>
        <p>
          Verifies scroll/seam behavior (<code>listRef</code>, timer cleanup,{' '}
          <code>updateFrameAndClearCache</code> ordering) under StrictMode.
        </p>
        <Calendar
          onChange={handleSingleDateChange('Calendar vertical-scroll')}
          onShownDateChange={handleShownDateChange('Calendar vertical-scroll')}
          date={singleDate}
          displayMode="date"
          showDateDisplay={true}
          months={2}
          direction="vertical"
          scroll={{ enabled: true, monthHeight: 200, calendarHeight: 440 }}
          fixedHeight={true}
        />
      </section>

      <section className="demo-panel">
        <h2>Calendar — DateDisplay Constraints</h2>
        <p>
          Verifies <code>editableDateInputs</code>, <code>minDate</code>,{' '}
          <code>maxDate</code>, and <code>disabledDates</code> forwarded to hook-based
          DateDisplay/Month orchestration.
        </p>
        <Calendar
          onChange={handleSingleDateChange('Calendar DateDisplay constraints')}
          onShownDateChange={handleShownDateChange('Calendar DateDisplay constraints')}
          date={singleDate}
          displayMode="date"
          showDateDisplay={true}
          editableDateInputs={true}
          minDate={minMaxDate.min}
          maxDate={minMaxDate.max}
          disabledDates={minMaxDate.disabled}
          direction="horizontal"
        />
        <p className="state-output">
          <small>
            min=<code>{minMaxDate.min.toISOString().split('T')[0]}</code>,{' '}
            max=<code>{minMaxDate.max.toISOString().split('T')[0]}</code>,{' '}
            disabled=<code>{minMaxDate.disabled.map((d) => d.toISOString().split('T')[0]).join(', ')}</code>
          </small>
        </p>
      </section>

      <section className="demo-panel">
        <h2>DateRangePicker — Locale / weekStartsOn</h2>
        <p>
          Verifies <code>locale</code> and <code>weekStartsOn</code> prop-derived recalculation
          via hooks <code>useMemo</code>.
        </p>
        <DateRangePicker
          onChange={handleChange}
          ranges={ranges}
          months={2}
          direction="horizontal"
          locale={{ ...enUS, options: { ...enUS.options, weekStartsOn: 1 } }}
          weekStartsOn={1}
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
