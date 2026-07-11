import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Calendar,
  DatePickerInput,
  DateRangeInput,
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
  const [inputDate, setInputDate] = useState<Date | undefined>(today);
  const [controlledInputDate, setControlledInputDate] = useState<Date | undefined>(nextWeek);
  const [inputOpen, setInputOpen] = useState(false);
  const [inputRange, setInputRange] = useState<Range[]>([createInitialRange()]);
  const [controlledInputRange, setControlledInputRange] = useState<Range[]>([createInitialRange()]);
  const [inputRangeOpen, setInputRangeOpen] = useState(false);

  // States for new demo panels
  const [a11yRanges, setA11yRanges] = useState<Range[]>([createInitialRange()]);
  const [passiveDate, setPassiveDate] = useState<Date | undefined>(undefined);
  const [passiveScrollDate, setPassiveScrollDate] = useState<Date | undefined>(undefined);
  const [rtlRanges, setRtlRanges] = useState<Range[]>([createInitialRange()]);
  const [rtlDate, setRtlDate] = useState<Date | undefined>(today);

  const [labelledRanges, setLabelledRanges] = useState<Range[]>([
    { startDate: today, endDate: nextWeek, key: 'trip1', label: 'Trip 1' },
    {
      startDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
      endDate: new Date(today.getFullYear(), today.getMonth() + 1, 7),
      key: 'trip2',
      label: 'Trip 2',
      color: '#ff6b6b',
    },
  ]);

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

  const handleInputDateChange = (source: string, setter: (date: Date) => void) => (date: Date) => {
    logManualQA(`${source} onChange`, {
      date: toISODate(date),
    });
    setter(date);
  };

  const handleInputRangeChange = (source: string) => (rangesByKey: RangeKeyDict) => {
    const next = rangesByKey.selection;
    if (next) {
      logManualQA(`${source} onChange`, {
        startDate: toISODate(next.startDate),
        endDate: toISODate(next.endDate),
      });
    }
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

  const handleLabelledChange = (rangesByKey: RangeKeyDict) => {
    const trip1 = rangesByKey.trip1;
    const trip2 = rangesByKey.trip2;
    logManualQA('Labelled multi-range onChange', {
      trip1_start: trip1 ? toISODate(trip1.startDate) : null,
      trip1_end: trip1 ? toISODate(trip1.endDate) : null,
      trip2_start: trip2 ? toISODate(trip2.startDate) : null,
      trip2_end: trip2 ? toISODate(trip2.endDate) : null,
    });
    setLabelledRanges(
      [trip1, trip2].filter(Boolean) as Range[],
    );
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
      {/* Landing hero — docs/adoption */}
      <section className="hero">
        <h1 className="hero-title">
          @cyberlz/react-date-range
          <span className="badge">1.2.x stable</span>
        </h1>
        <p className="hero-subtitle">
          Modern maintained fork of <code>react-date-range</code>.
          React 18/19 compatible, TypeScript-first.{' '}
          <a href="docs/migration-from-upstream.md">Why a fork?</a>
        </p>
        <div className="install-block hero-install">npm install @cyberlz/react-date-range</div>
      </section>

      {/* Before / After panel — docs/adoption */}
      {/* See docs/integrations/form-submit.md and docs/integrations/controlled-state.md */}
      <section className="before-after">
        <div className="before-after-col upstream">
          <h3>Before — archived upstream</h3>
          <p className="upstream-callout">
            <strong>react-date-range</strong> is read-only and no longer maintained.
            Issues include React 19 incompatibility and stale date-fns deps.
          </p>
          <div
            className="import-diff"
            dangerouslySetInnerHTML={{
              __html:
                '<span className="removed">- import { DateRangePicker } from \'react-date-range\';</span>\n' +
                '<span className="added">+ import { DateRangePicker } from \'@cyberlz/react-date-range\';</span>',
            }}
          />
          <p className="upstream-callout" style={{ margin: 0, fontSize: '0.75rem' }}>
            Archived upstream · see{' '}
            <a
              href="https://www.npmjs.com/package/react-date-range"
              target="_blank"
              rel="noopener noreferrer"
            >
              npm archived page
            </a>
          </p>
        </div>
        <div className="before-after-col fork">
          <h3>After — @cyberlz/react-date-range</h3>
          <p className="upstream-callout" style={{ color: '#1e40af', margin: '0 0 0.75rem', fontSize: '0.8rem' }}>
            Live <code>DateRangePicker</code> from local source.
          </p>
          <DateRangePicker
            onChange={handleChange}
            ranges={ranges}
            months={1}
            direction="horizontal"
          />
        </div>
      </section>

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
        <h2>DatePickerInput — Popover Trigger</h2>
        <p>
          Read-only input trigger for single-date selection. Verify click-to-open, Escape,
          outside-click dismissal, focus return, and the controlled <code>open</code> example.
        </p>
        <div className="state-output">
          <label>
            Uncontrolled:{' '}
            <DatePickerInput
              date={inputDate}
              onChange={handleInputDateChange('DatePickerInput uncontrolled', setInputDate)}
              ariaLabel="Trip date"
              popoverLabel="Choose trip date"
              placeholder="Select trip date"
              calendarProps={{ shownDate: inputDate || today }}
            />
          </label>
        </div>
        <div className="state-output">
          <label>
            Controlled:{' '}
            <DatePickerInput
              date={controlledInputDate}
              onChange={handleInputDateChange('DatePickerInput controlled', setControlledInputDate)}
              open={inputOpen}
              onOpenChange={setInputOpen}
              ariaLabel="Controlled trip date"
              popoverLabel="Choose controlled trip date"
              calendarProps={{ shownDate: controlledInputDate || today }}
            />
          </label>
        </div>
        <p className="state-output">
          <code>inputDate = {inputDate ? inputDate.toISOString().split('T')[0] : 'null'}</code>
          <br />
          <code>controlledOpen = {String(inputOpen)}</code>
        </p>
      </section>

      <section className="demo-panel">
        <h2>DateRangeInput — Popover Trigger</h2>
        <p>
          Read-only input trigger for range selection. Verify click-to-open, Escape,
          outside-click dismissal, focus return, and the controlled <code>open</code> example.
        </p>
        <div className="state-output">
          <label>
            Uncontrolled:{' '}
            <DateRangeInput
              ranges={inputRange}
              onChange={handleInputRangeChange('DateRangeInput uncontrolled')}
              ariaLabels={{ trigger: 'Trip date range' }}
              popoverLabel="Choose trip dates"
              triggerPlaceholder="Select trip dates"
              calendarProps={{ shownDate: inputRange[0]?.startDate || today }}
            />
          </label>
        </div>
        <div className="state-output">
          <label>
            Controlled:{' '}
            <DateRangeInput
              ranges={controlledInputRange}
              onChange={handleInputRangeChange('DateRangeInput controlled')}
              open={inputRangeOpen}
              onOpenChange={setInputRangeOpen}
              ariaLabels={{ trigger: 'Controlled trip date range' }}
              popoverLabel="Choose controlled trip dates"
              calendarProps={{ shownDate: controlledInputRange[0]?.startDate || today }}
            />
          </label>
        </div>
        <p className="state-output">
          <code>inputRange start = {inputRange[0]?.startDate ? inputRange[0].startDate.toISOString().split('T')[0] : 'null'}</code>
          <br />
          <code>inputRange end = {inputRange[0]?.endDate ? inputRange[0].endDate.toISOString().split('T')[0] : 'null'}</code>
          <br />
          <code>controlledOpen = {String(inputRangeOpen)}</code>
        </p>
      </section>

      <section className="demo-panel scroll-demo-panel">
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
          scroll={{ enabled: true, monthHeight: 240, longMonthHeight: 280, calendarHeight: 560 }}
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

      <section className="demo-panel scroll-demo-panel">
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
          direction="vertical"
          selectablePassive={true}
          scroll={{ enabled: true, monthHeight: 220, longMonthHeight: 260, calendarHeight: 520 }}
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

      <section className="demo-panel">
        <h2>DateRangePicker — Multi-range with Labels</h2>
        <p>
          Two labelled ranges (<code>label=&quot;Trip 1&quot;</code>,{' '}
          <code>label=&quot;Trip 2&quot;</code>). Each range renders inside a named{' '}
          <code>role=&quot;group&quot;</code> scoped by its label text.
          Inspect the DateDisplay above the calendars.
        </p>
        <DateRangePicker
          onChange={handleLabelledChange}
          ranges={labelledRanges}
          showPreview={true}
          moveRangeOnFirstSelection={false}
          months={2}
          direction="horizontal"
        />
        <p className="state-output">
          <strong>Trip 1:</strong>{' '}
          {labelledRanges[0]
            ? `${formatDate(labelledRanges[0].startDate)} → ${formatDate(labelledRanges[0].endDate)}`
            : '(empty)'}
          <br />
          <strong>Trip 2:</strong>{' '}
          {labelledRanges[1]
            ? `${formatDate(labelledRanges[1].startDate)} → ${formatDate(labelledRanges[1].endDate)}`
            : '(empty)'}
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
