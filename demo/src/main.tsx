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
// Live region helpers (pure, stable references for ariaLabels callbacks)
// ---------------------------------------------------------------------------

function liveRegionMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function liveRegionSelection(range: { startDate: Date; endDate: Date }): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `Selected range from ${fmt(range.startDate)} to ${fmt(range.endDate)}`;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  const [ranges, setRanges] = useState<Range[]>([createInitialRange()]);
  const [singleDate, setSingleDate] = useState<Date | undefined>(today);

  // States for new demo panels
  const [a11yRanges, setA11yRanges] = useState<Range[]>([createInitialRange()]);
  const [passiveDate, setPassiveDate] = useState<Date | undefined>(undefined);
  const [passiveScrollDate, setPassiveScrollDate] = useState<Date | undefined>(undefined);
  const [rtlRanges, setRtlRanges] = useState<Range[]>([createInitialRange()]);
  const [rtlDate, setRtlDate] = useState<Date | undefined>(today);

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

  // Handlers for new demo panels
  const handleA11yChange = (rangesByKey: RangeKeyDict) => {
    const next = rangesByKey.selection;
    if (next) {
      logManualQA('A11y DateRangePicker onChange', {
        startDate: toISODate(next.startDate),
        endDate: toISODate(next.endDate),
      });
      setA11yRanges([next]);
    }
  };

  const handlePassiveDateChange = (date: Date) => {
    logManualQA('selectablePassive onChange', { date: toISODate(date) });
    setPassiveDate(date);
  };

  const handlePassiveScrollDateChange = (date: Date) => {
    logManualQA('selectablePassive+scroll onChange', { date: toISODate(date) });
    setPassiveScrollDate(date);
  };

  const handleRtlChange = (rangesByKey: RangeKeyDict) => {
    const next = rangesByKey.selection;
    if (next) {
      logManualQA('RTL DateRangePicker onChange', {
        startDate: toISODate(next.startDate),
        endDate: toISODate(next.endDate),
      });
      setRtlRanges([next]);
    }
  };

  const handleRtlDateChange = (date: Date) => {
    logManualQA('RTL Calendar onChange', { date: toISODate(date) });
    setRtlDate(date);
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
          <span className="badge">Stable</span>
        </h1>
        <p>
          Modern maintained fork of{' '}
          <code>react-date-range</code>. React 18/19 compatible, TypeScript-first.
        </p>
        <div className="install-block">
          npm install @cyberlz/react-date-range
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

      {/* A11y: DateRangePicker with custom ariaLabels and live region */}

      <section className="demo-panel">
        <h2>DateRangePicker — A11y Labels &amp; Live Region</h2>
        <p>
          Custom <code>ariaLabels</code> including <code>liveRegionSelection</code>{' '}
          (committed range only — hover/preview is <em>not</em> announced) and{' '}
          <code>liveRegionMonthYear</code> for navigation feedback.
          Inspect the live-region element or use a screen reader to hear the announcement.
        </p>
        <DateRangePicker
          onChange={handleA11yChange}
          ranges={a11yRanges}
          showPreview={true}
          moveRangeOnFirstSelection={false}
          months={2}
          direction="horizontal"
          ariaLabels={{
            dateInput: {
              selection: { startDate: 'Start date input', endDate: 'End date input' },
            },
            monthPicker: 'Month picker',
            yearPicker: 'Year picker',
            prevButton: 'Previous month',
            nextButton: 'Next month',
            calendar: 'Calendar',
            calendarRoleDescription: 'Date range calendar',
            dateDisplay: 'Date display',
            dateRangePicker: 'Date range picker dialog',
            liveRegionMonthYear,
            liveRegionSelection,
          }}
        />
        <p className="state-output">
          <strong>Live region would announce:</strong>{' '}
          {a11yRanges[0]?.startDate && a11yRanges[0]?.endDate
            ? liveRegionSelection({
                startDate: a11yRanges[0].startDate,
                endDate: a11yRanges[0].endDate,
              })
            : '(awaiting full committed selection — hover/preview is suppressed)'}
        </p>
      </section>

      {/* Calendar navigation live region + labeled controls */}

      <section className="demo-panel">
        <h2>Calendar — Navigation Live Region &amp; Labeled Controls</h2>
        <p>
          <code>liveRegionMonthYear</code> announces month/year on navigation.{' '}
          <code>prevButton</code>/<code>nextButton</code> labels are forwarded to the arrow buttons.
          Use a screen reader or inspect <code>aria-label</code> on the arrows.
        </p>
        <Calendar
          onChange={handleSingleDateChange('Calendar nav-live-region')}
          date={singleDate}
          displayMode="date"
          months={1}
          direction="horizontal"
          ariaLabels={{
            prevButton: 'Go to previous month',
            nextButton: 'Go to next month',
            monthPicker: 'Select month',
            yearPicker: 'Select year',
            liveRegionMonthYear,
          }}
        />
        <p className="state-output">
          <code>date = {singleDate ? singleDate.toISOString().split('T')[0] : 'null'}</code>
        </p>
      </section>

      {/* Cross-month selectablePassive */}

      <section className="demo-panel">
        <h2>
          Calendar — Cross-Month Selectable Passive (<code>selectablePassive</code>)
        </h2>
        <p>
          With <code>selectablePassive=true</code> and scroll virtualization off,{' '}
          passive (greyed-out neighbour-month) days become clickable.
          Try clicking a dimmed day from an adjacent month in this 2-month horizontal layout.
        </p>
        <Calendar
          onChange={handlePassiveDateChange}
          date={passiveDate}
          displayMode="date"
          months={2}
          direction="horizontal"
          selectablePassive={true}
          scroll={{ enabled: false }}
        />
        <p className="state-output">
          <strong>Selected date:</strong>{' '}
          {passiveDate
            ? `${passiveDate.toISOString().split('T')[0]} (${passiveDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })})`
            : '(none — click a passive day to test)'}
        </p>
      </section>

      {/* selectablePassive guarded by scroll */}

      <section className="demo-panel">
        <h2>
          Calendar — <code>selectablePassive</code> Guarded with Scroll
        </h2>
        <p>
          When <code>scroll.enabled=true</code>, <code>selectablePassive</code> stays a no-op:{' '}
          passive days remain non-interactive regardless of the flag.
          Try clicking a dimmed day — it should <em>not</em> register.
        </p>
        <Calendar
          onChange={handlePassiveScrollDateChange}
          date={passiveScrollDate}
          displayMode="date"
          months={2}
          direction="horizontal"
          selectablePassive={true}
          scroll={{ enabled: true }}
        />
        <p className="state-output">
          <strong>Selected date:</strong>{' '}
          {passiveScrollDate
            ? `${passiveScrollDate.toISOString().split('T')[0]} (this was a regular-day selection — passive clicks are correctly ignored)`
            : '(none — passive day clicks are correctly ignored)'}
        </p>
      </section>

      {/* RTL DateRangePicker */}

      <section className="demo-panel">
        <h2>
          DateRangePicker — RTL (<code>dir=&quot;rtl&quot;</code>)
        </h2>
        <p>
          Two-month horizontal layout with <code>dir=&quot;rtl&quot;</code>. Months render
          right-to-left, arrows are visually mirrored. Keyboard arrows are{' '}
          <em>not</em> mirrored (logical direction preserved).
          The wrapper receives class <code>rdrRtl</code>.
        </p>
        <DateRangePicker
          onChange={handleRtlChange}
          ranges={rtlRanges}
          showPreview={true}
          moveRangeOnFirstSelection={false}
          months={2}
          direction="horizontal"
          dir="rtl"
        />
        <p className="state-output">
          <strong>Start:</strong> {formatDate(rtlRanges[0].startDate)}{' '}
          <small>({toISODate(rtlRanges[0].startDate)})</small>
          <br />
          <strong>End:</strong> {formatDate(rtlRanges[0].endDate)}{' '}
          <small>({toISODate(rtlRanges[0].endDate)})</small>
        </p>
      </section>

      {/* RTL Calendar */}

      <section className="demo-panel">
        <h2>Calendar — RTL Single Date</h2>
        <p>
          Single-date Calendar in RTL mode. Verify arrow positions and month label reading order.
        </p>
        <Calendar
          onChange={handleRtlDateChange}
          date={rtlDate}
          displayMode="date"
          months={2}
          direction="horizontal"
          dir="rtl"
        />
        <p className="state-output">
          <code>date = {rtlDate ? rtlDate.toISOString().split('T')[0] : 'null'}</code>
        </p>
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
