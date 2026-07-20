import { StrictMode, useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Calendar,
  DatePickerInput,
  DateRangeInput,
  DateRangePicker,
  type Range,
  type RangeKeyDict,
  type UiSlots,
} from '@cyberlz/react-date-range';
import { enUS } from 'date-fns/locale';
import '@cyberlz/react-date-range/styles.css';
import '@cyberlz/react-date-range/theme/default.css';
import '@cyberlz/react-date-range/theme/tokens.css';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

const ENABLE_MANUAL_QA_LOGS = false;
const DOCS_BASE_URL = 'https://github.com/sokaluis/react-date-range/blob/main/docs';

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

function DemoCode({ children }: { children: string }) {
  return (
    <details className="demo-code">
      <summary className="demo-code-summary">Code</summary>
      <pre className="demo-code-pre">
        <code>{children}</code>
      </pre>
    </details>
  );
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
  const [headerDemoDate, setHeaderDemoDate] = useState<Date | undefined>(today);
  const [inputDate, setInputDate] = useState<Date | undefined>(today);
  const [controlledInputDate, setControlledInputDate] = useState<Date | undefined>(nextWeek);
  const [inputOpen, setInputOpen] = useState(false);
  const [inputRange, setInputRange] = useState<Range[]>([createInitialRange()]);
  const [controlledInputRange, setControlledInputRange] = useState<Range[]>([createInitialRange()]);
  const [inputRangeOpen, setInputRangeOpen] = useState(false);
  const [slotRanges, setSlotRanges] = useState<Range[]>([createInitialRange()]);
  const [selectedDisplayRanges, setSelectedDisplayRanges] = useState<Range[]>([createInitialRange()]);
  const [layoutRanges, setLayoutRanges] = useState<Range[]>([createInitialRange()]);
  const [tokenRanges, setTokenRanges] = useState<Range[]>([createInitialRange()]);

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

  const handleSlotChange = (rangesByKey: RangeKeyDict) => {
    const next = rangesByKey.selection;
    if (next) {
      logManualQA('Stable uiSlots DateRangePicker onChange', {
        startDate: toISODate(next.startDate),
        endDate: toISODate(next.endDate),
      });
      setSlotRanges([next]);
    }
  };

  const handleSelectedDisplayChange = (rangesByKey: RangeKeyDict) => {
    const next = rangesByKey.selection;
    if (next) {
      logManualQA('Selected display DateRangePicker onChange', {
        startDate: toISODate(next.startDate),
        endDate: toISODate(next.endDate),
      });
      setSelectedDisplayRanges([next]);
    }
  };

  const handleLayoutChange = (rangesByKey: RangeKeyDict) => {
    const next = rangesByKey.selection;
    if (next) {
      logManualQA('Picker layout DateRangePicker onChange', {
        startDate: toISODate(next.startDate),
        endDate: toISODate(next.endDate),
      });
      setLayoutRanges([next]);
    }
  };

  const handleTokenChange = (rangesByKey: RangeKeyDict) => {
    const next = rangesByKey.selection;
    if (next) {
      logManualQA('Opt-in tokens DateRangePicker onChange', {
        startDate: toISODate(next.startDate),
        endDate: toISODate(next.endDate),
      });
      setTokenRanges([next]);
    }
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

  const slotDemoSlots: UiSlots = {
    root: {
      className: 'demo-ui-slots-root',
      style: { border: '1px solid #d1d5db', borderRadius: 12 },
    },
    header: { style: { borderBottom: '1px solid #e5e7eb' } },
    definedRanges: { style: { background: '#f9fafb' } },
    day: { className: 'demo-ui-slots-day' },
    dayToday: { style: { outline: '2px solid #111827', outlineOffset: 2 } },
    dateDisplayItem: { style: { borderRadius: 8 } },
  };

  const tokenDemoStyle = {
    '--rdr-color-primary': '#7c3aed',
    '--rdr-color-on-primary': '#ffffff',
    '--rdr-color-today': '#f97316',
  } as CSSProperties;

  return (
    <div className="container">
      {/* Landing hero — docs/adoption */}
      <section className="hero">
        <h1 className="hero-title">
          @cyberlz/react-date-range
          <span className="badge">1.3.0 stable</span>
        </h1>
        <p className="hero-subtitle">
          Modern maintained fork of <code>react-date-range</code>.
          React 18/19 compatible, TypeScript-first.{' '}
          <a href={`${DOCS_BASE_URL}/migration-from-upstream.md`} target="_blank" rel="noopener noreferrer">
            Why a fork?
          </a>
        </p>
        <div className="install-block hero-install">npm install @cyberlz/react-date-range</div>
      </section>

      <section className="docs-panel" aria-labelledby="docs-title">
        <div>
          <h2 id="docs-title">Documentation</h2>
          <p>
            Start with the install path, then jump into the component reference,
            accessibility notes, troubleshooting, or integration recipes.
          </p>
        </div>
        <nav className="docs-links" aria-label="Documentation links">
          <a href={`${DOCS_BASE_URL}/getting-started.md`} target="_blank" rel="noopener noreferrer">
            Getting started
          </a>
          <a href={`${DOCS_BASE_URL}/components/README.md`} target="_blank" rel="noopener noreferrer">
            Component reference
          </a>
          <a href={`${DOCS_BASE_URL}/accessibility.md`} target="_blank" rel="noopener noreferrer">
            Accessibility
          </a>
          <a href={`${DOCS_BASE_URL}/troubleshooting.md`} target="_blank" rel="noopener noreferrer">
            Troubleshooting
          </a>
          <a href={`${DOCS_BASE_URL}/integrations/README.md`} target="_blank" rel="noopener noreferrer">
            Integrations
          </a>
        </nav>
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
            Live <code>DateRangePicker</code> from local <code>src/</code> aliases.
          </p>
          <DateRangePicker
            layout="auto"
            widthMode="fluid"
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
          layout="auto"
          widthMode="fluid"
          onChange={handleChange}
          ranges={ranges}
          showPreview={true}
          moveRangeOnFirstSelection={false}
          months={2}
          direction="horizontal"
        />
        <DemoCode>
          {`<DateRangePicker
  layout="auto"
  onChange={handleChange}
  ranges={ranges}
  showPreview
  moveRangeOnFirstSelection={false}
  months={2}
  direction="horizontal"
/>`}
        </DemoCode>
      </section>

      {/* PR4: manual verification aids — hooks migration */}

      <section className="demo-panel">
        <h2>Calendar — Single Date Mode</h2>
        <p>Verifies <code>displayMode="date"</code> with hook-based state.</p>
        <Calendar
          layout="auto"
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
        <DemoCode>
          {`<Calendar
  layout="auto"
  onChange={handleSingleDateChange('Calendar single-date')}
  onShownDateChange={handleShownDateChange('Calendar single-date')}
  date={singleDate}
  displayMode="date"
  showDateDisplay
  direction="horizontal"
/>`}
        </DemoCode>
      </section>

      <section className="demo-panel">
        <h2>DateRangePicker — Selected Display</h2>
        <div className="demo-example">
          <DateRangePicker
            layout="auto"
            widthMode="fluid"
            onChange={handleSelectedDisplayChange}
            ranges={selectedDisplayRanges}
            editableDateInputs
            selectedDisplay={{ format: 'yyyy-MM-dd', placement: 'bottom', separator: ' – ' }}
          />
        </div>
        <div className="demo-callout">
          <p>
            The <code>selectedDisplay</code> prop formats the range as ISO dates,
            moves it below the calendar, and separates start/end with a custom visual
            separator. Editable date inputs still own parsing and selection state.
          </p>
        </div>
        <p className="state-output">
          <code>
            range = {formatDate(selectedDisplayRanges[0]?.startDate)} → {formatDate(selectedDisplayRanges[0]?.endDate)}
          </code>
        </p>
        <DemoCode>
          {`<DateRangePicker
  layout="auto"
  onChange={handleSelectedDisplayChange}
  ranges={selectedDisplayRanges}
  editableDateInputs
  selectedDisplay={{
    format: 'yyyy-MM-dd',
    placement: 'bottom',
    separator: ' – ',
  }}
/>`}
        </DemoCode>
      </section>

      <section className="demo-panel">
        <h2>DateRangePicker — Responsive Layout</h2>
        <div className="demo-example">
          <DateRangePicker
            layout="auto"
            widthMode="fluid"
            onChange={handleLayoutChange}
            ranges={layoutRanges}
            showPreview={true}
            moveRangeOnFirstSelection={false}
            calendarCount={2}
            scrollOrientation="horizontal"
          />
        </div>
        <div className="demo-callout">
          <p>
            <code>layout=&quot;auto&quot;</code> switches at <code>768px</code>. This two-calendar example
            stacks vertically on mobile; <code>scroll.enabled</code> keeps its legacy behavior.
          </p>
        </div>
        <p className="state-output">
          <code>
            range = {formatDate(layoutRanges[0]?.startDate)} → {formatDate(layoutRanges[0]?.endDate)}
          </code>
        </p>
        <DemoCode>
          {`<DateRangePicker
  layout="auto"
  onChange={handleLayoutChange}
  ranges={layoutRanges}
  showPreview
  moveRangeOnFirstSelection={false}
  calendarCount={2}
  scrollOrientation="horizontal"
/>`}
        </DemoCode>
      </section>

      <section className="demo-panel">
        <h2>Calendar — Configurable Header &amp; Today Label</h2>
        <div className="demo-example">
          <Calendar
            layout="auto"
            onChange={handleInputDateChange('Calendar header/today demo', setHeaderDemoDate)}
            onShownDateChange={handleShownDateChange('Calendar header/today demo')}
            date={headerDemoDate}
            displayMode="date"
            showDateDisplay={false}
            headerConfig={{ year: false, navigation: false }}
            todayAffordance="label"
          />
        </div>
        <div className="demo-callout">
          <p>
            <code>headerConfig</code> hides the year and previous/next controls, while{' '}
            <code>todayAffordance=&quot;label&quot;</code> shows a visible "Today" text.
            Keyboard navigation still works. Use <code>todayAffordance=&quot;highlight&quot;</code>{' '}
            when you only want the visual day highlight.
          </p>
        </div>
        <p className="state-output">
          <code>date = {headerDemoDate ? headerDemoDate.toISOString().split('T')[0] : 'null'}</code>
        </p>
        <DemoCode>
          {`<Calendar
  layout="auto"
  onChange={handleHeaderDemoChange}
  onShownDateChange={handleShownDateChange}
  date={headerDemoDate}
  displayMode="date"
  showDateDisplay={false}
  headerConfig={{ year: false, navigation: false }}
  todayAffordance="label"
/>`}
        </DemoCode>
      </section>

      <section className="demo-panel">
        <h2>DateRangePicker — Stable UI Slots</h2>
        <div className="demo-example">
          <DateRangePicker
            layout="auto"
            widthMode="fluid"
            onChange={handleSlotChange}
            ranges={slotRanges}
            showPreview={true}
            moveRangeOnFirstSelection={false}
            uiSlots={slotDemoSlots}
          />
        </div>
        <div className="demo-callout">
          <p>
            <code>uiSlots</code> lets host apps append classes and inline styles to stable zones
            without replacing library classes. The picker still owns labels, keyboard behavior,
            focus, and range state.
          </p>
        </div>
        <p className="state-output">
          <code>
            range = {formatDate(slotRanges[0]?.startDate)} → {formatDate(slotRanges[0]?.endDate)}
          </code>
        </p>
        <DemoCode>
          {`const slotDemoSlots: UiSlots = {
  root: { className: 'demo-ui-slots-root', style: { border: '1px solid #d1d5db', borderRadius: 12 } },
  header: { style: { borderBottom: '1px solid #e5e7eb' } },
  definedRanges: { style: { background: '#f9fafb' } },
  day: { className: 'demo-ui-slots-day' },
  dayToday: { style: { outline: '2px solid #111827', outlineOffset: 2 } },
  dateDisplayItem: { style: { borderRadius: 8 } },
};

<DateRangePicker
  layout="auto"
  onChange={handleSlotChange}
  ranges={slotRanges}
  showPreview
  moveRangeOnFirstSelection={false}
  uiSlots={slotDemoSlots}
/>`}
        </DemoCode>
      </section>

      <section className="demo-panel">
        <h2>DateRangePicker — Opt-in Tokens</h2>
        <div className="demo-example">
          <div style={tokenDemoStyle}>
            <DateRangePicker
              layout="auto"
              onChange={handleTokenChange}
              ranges={tokenRanges}
              showPreview={true}
              moveRangeOnFirstSelection={false}
            />
          </div>
        </div>
        <div className="demo-callout">
          <p>
            The optional <code>theme/tokens.css</code> stylesheet overrides CSS variables on the
            wrapper only. Existing consumers keep the default theme unless they explicitly import
            the token stylesheet.
          </p>
        </div>
        <p className="state-output">
          <code>
            range = {formatDate(tokenRanges[0]?.startDate)} → {formatDate(tokenRanges[0]?.endDate)}
          </code>
        </p>
        <DemoCode>
          {`// import '@cyberlz/react-date-range/theme/tokens.css';

const tokenDemoStyle = {
  '--rdr-color-primary': '#7c3aed',
  '--rdr-color-on-primary': '#ffffff',
  '--rdr-color-today': '#f97316',
} as CSSProperties;

<div style={tokenDemoStyle}>
  <DateRangePicker
    layout="auto"
    onChange={handleTokenChange}
    ranges={tokenRanges}
    showPreview
    moveRangeOnFirstSelection={false}
  />
</div>`}
        </DemoCode>
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
              calendarProps={{ layout: 'auto', shownDate: inputDate || today }}
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
              calendarProps={{ layout: 'auto', shownDate: controlledInputDate || today }}
            />
          </label>
        </div>
        <p className="state-output">
          <code>inputDate = {inputDate ? inputDate.toISOString().split('T')[0] : 'null'}</code>
          <br />
          <code>controlledOpen = {String(inputOpen)}</code>
        </p>
        <DemoCode>
          {`{/* Uncontrolled */}
<DatePickerInput
  date={inputDate}
  onChange={handleInputDateChange}
  ariaLabel="Trip date"
  popoverLabel="Choose trip date"
  placeholder="Select trip date"
  calendarProps={{ layout: 'auto', shownDate: inputDate || today }}
/>

{/* Controlled */}
<DatePickerInput
  date={controlledInputDate}
  onChange={handleInputDateChange}
  open={inputOpen}
  onOpenChange={setInputOpen}
  ariaLabel="Controlled trip date"
  popoverLabel="Choose controlled trip date"
  calendarProps={{ layout: 'auto', shownDate: controlledInputDate || today }}
/>`}
        </DemoCode>
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
              calendarProps={{ layout: 'auto', shownDate: inputRange[0]?.startDate || today }}
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
              calendarProps={{ layout: 'auto', shownDate: controlledInputRange[0]?.startDate || today }}
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
        <DemoCode>
          {`{/* Uncontrolled */}
<DateRangeInput
  ranges={inputRange}
  onChange={handleInputRangeChange}
  ariaLabels={{ trigger: 'Trip date range' }}
  popoverLabel="Choose trip dates"
  triggerPlaceholder="Select trip dates"
  calendarProps={{ layout: 'auto', shownDate: inputRange[0]?.startDate || today }}
/>

{/* Controlled */}
<DateRangeInput
  ranges={controlledInputRange}
  onChange={handleInputRangeChange}
  open={inputRangeOpen}
  onOpenChange={setInputRangeOpen}
  ariaLabels={{ trigger: 'Controlled trip date range' }}
  popoverLabel="Choose controlled trip dates"
  calendarProps={{ layout: 'auto', shownDate: controlledInputRange[0]?.startDate || today }}
/>`}
        </DemoCode>
      </section>

      <section className="demo-panel">
        <h2>Calendar — Vertical Scroll (hook-based)</h2>
        <p>
          Verifies scroll/seam behavior (<code>listRef</code>, timer cleanup,{' '}
          <code>updateFrameAndClearCache</code> ordering) under StrictMode.
        </p>
        <Calendar
          layout="auto"
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
        <DemoCode>
          {`<Calendar
  layout="auto"
  onChange={handleSingleDateChange('Calendar vertical-scroll')}
  onShownDateChange={handleShownDateChange('Calendar vertical-scroll')}
  date={singleDate}
  displayMode="date"
  showDateDisplay
  months={2}
  direction="vertical"
  scroll={{ enabled: true, monthHeight: 240, longMonthHeight: 280, calendarHeight: 560 }}
  fixedHeight
/>`}
        </DemoCode>
      </section>

      <section className="demo-panel">
        <h2>Calendar — DateDisplay Constraints</h2>
        <p>
          Verifies <code>editableDateInputs</code>, <code>minDate</code>,{' '}
          <code>maxDate</code>, and <code>disabledDates</code> forwarded to hook-based
          DateDisplay/Month orchestration.
        </p>
        <Calendar
          layout="auto"
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
        <DemoCode>
          {`<Calendar
  layout="auto"
  onChange={handleSingleDateChange('Calendar DateDisplay constraints')}
  onShownDateChange={handleShownDateChange('Calendar DateDisplay constraints')}
  date={singleDate}
  displayMode="date"
  showDateDisplay
  editableDateInputs
  minDate={minMaxDate.min}
  maxDate={minMaxDate.max}
  disabledDates={minMaxDate.disabled}
  direction="horizontal"
/>`}
        </DemoCode>
      </section>

      <section className="demo-panel">
        <h2>DateRangePicker — Locale / weekStartsOn</h2>
        <p>
          Verifies <code>locale</code> and <code>weekStartsOn</code> prop-derived recalculation
          via hooks <code>useMemo</code>.
        </p>
        <DateRangePicker
          layout="auto"
          onChange={handleChange}
          ranges={ranges}
          months={2}
          direction="horizontal"
          locale={{ ...enUS, options: { ...enUS.options, weekStartsOn: 1 } }}
          weekStartsOn={1}
        />
        <DemoCode>
          {`import { enUS } from 'date-fns/locale';

<DateRangePicker
  layout="auto"
  onChange={handleChange}
  ranges={ranges}
  months={2}
  direction="horizontal"
  locale={{ ...enUS, options: { ...enUS.options, weekStartsOn: 1 } }}
  weekStartsOn={1}
/>`}
        </DemoCode>
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
          layout="auto"
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
        <DemoCode>
          {`const liveRegionMonthYear = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const liveRegionSelection = (range: { startDate: Date; endDate: Date }) =>
  \`Selected range from \${range.startDate.toDateString()} to \${range.endDate.toDateString()}\`;

<DateRangePicker
  layout="auto"
  onChange={handleA11yChange}
  ranges={a11yRanges}
  showPreview
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
/>`}
        </DemoCode>
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
          layout="auto"
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
        <DemoCode>
          {`<Calendar
  layout="auto"
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
/>`}
        </DemoCode>
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
          layout="auto"
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
        <DemoCode>
          {`<Calendar
  layout="auto"
  onChange={handlePassiveDateChange}
  date={passiveDate}
  displayMode="date"
  months={2}
  direction="horizontal"
  selectablePassive
  scroll={{ enabled: false }}
/>`}
        </DemoCode>
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
          layout="auto"
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
          layout="auto"
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
          layout="auto"
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
          layout="auto"
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
