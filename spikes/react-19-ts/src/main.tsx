import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DateRangePicker,
  DateRange,
  Calendar,
} from 'react-date-range-modern';
import type {
  DateRangePickerProps,
  DateRangeProps,
  CalendarProps,
  RangeKeyDict,
  Range,
} from 'react-date-range-modern';

// ---- Style imports (Vite handles SCSS via sass) ----
import 'react-date-range-modern/theme/default.scss';
import 'react-date-range-modern/styles.scss';

// =============================================================================
// Fixture: DateRangePicker (primary integration test)
// =============================================================================
function DateRangePickerFixture() {
  const [selectionRange, setSelectionRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });

  const handleSelect = (rangesByKey: RangeKeyDict) => {
    console.log('Selected range:', rangesByKey);
    setSelectionRange(rangesByKey.selection);
  };

  const props: DateRangePickerProps = {
    ranges: [selectionRange],
    onChange: handleSelect,
    showDateDisplay: true,
    moveRangeOnFirstSelection: false,
    months: 2,
    direction: 'horizontal',
  };

  return (
    <section>
      <h2>DateRangePicker</h2>
      <DateRangePicker {...props} />
    </section>
  );
}

// =============================================================================
// Fixture: DateRange (standalone, no DefinedRange sidebar)
// =============================================================================
function DateRangeFixture() {
  const [selectionRange, setSelectionRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: 'standalone',
  });

  const handleSelect = (rangesByKey: RangeKeyDict) => {
    console.log('DateRange selected:', rangesByKey);
    setSelectionRange(rangesByKey.standalone);
  };

  const props: DateRangeProps = {
    ranges: [selectionRange],
    onChange: handleSelect,
    months: 1,
    direction: 'vertical',
    moveRangeOnFirstSelection: false,
  };

  return (
    <section>
      <h2>DateRange</h2>
      <DateRange {...props} />
    </section>
  );
}

// =============================================================================
// Fixture: Calendar (single-date mode)
// =============================================================================
function CalendarFixture() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const onChange = (d: Date) => {
    console.log('Calendar selected:', d);
    setDate(d);
  };

  const props: CalendarProps = {
    date,
    onChange,
    displayMode: 'date',
    months: 1,
    direction: 'vertical',
  };

  return (
    <section>
      <h2>Calendar</h2>
      <Calendar {...props} />
    </section>
  );
}

// =============================================================================
// App Shell
// =============================================================================
function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>
      <h1>React 19 TypeScript Spike — react-date-range-modern</h1>
      <p>
        This fixture verifies whether <code>@types/react-date-range</code> v1.4.10
        works with React 19 types and whether the upstream JSX component issues
        (#661, #662) reproduce.
      </p>
      <hr />
      <DateRangePickerFixture />
      <hr />
      <DateRangeFixture />
      <hr />
      <CalendarFixture />
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
