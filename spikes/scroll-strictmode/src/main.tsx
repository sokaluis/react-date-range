/**
 * Spike: Scroll + StrictMode — React 19
 *
 * Reproduce/verify upstream issues #577 and #653:
 * - #577: DateRangePicker scroll blank on React 18 StrictMode
 * - #653: Strict mode does not render correctly
 *
 * This spike renders DateRange and DateRangePicker with `scroll={{ enabled: true }}`
 * both INSIDE and OUTSIDE React.StrictMode to observe rendering differences.
 */
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DateRange, DateRangePicker } from 'react-date-range-modern';
import type { Range, RangeKeyDict } from 'react-date-range-modern';

import 'react-date-range-modern/styles.css';
import 'react-date-range-modern/theme/default.css';

// =============================================================================
// Scroll config — vertical infinite scroll with fixed calendar height
// =============================================================================
const scrollConfig = {
  enabled: true,
  calendarHeight: 420,
  monthHeight: 240,
  longMonthHeight: 280,
} as const;

// =============================================================================
// Shared state for all fixtures (to demonstrate independent scroll behavior)
// =============================================================================
function useDateRangeState(initialKey: string) {
  const today = new Date();
  const [selection, setSelection] = useState<Range>({
    startDate: today,
    endDate: today,
    key: initialKey,
  });

  const handleChange = (ranges: RangeKeyDict) => {
    const range = ranges[initialKey];
    console.log(`[${initialKey}] onChange:`, range);
    if (range) setSelection(range);
  };

  return { selection, handleChange };
}

// =============================================================================
// DateRange (standalone, no sidebar) — vertical scroll
// =============================================================================
function DateRangeScrollFixture({ label }: { label: string }) {
  const { selection, handleChange } = useDateRangeState(label);

  return (
    <div className="panel">
      <h2>DateRange ({label})</h2>
      <p className="status">
        <code>{'scroll={ enabled: true, calendarHeight: 420 }'}</code> — vertical
      </p>
      <DateRange
        ranges={[selection]}
        onChange={handleChange}
        months={2}
        direction="vertical"
        scroll={scrollConfig}
        showDateDisplay={false}
        moveRangeOnFirstSelection={false}
        rangeColors={['#3d91ff']}
      />
    </div>
  );
}

// =============================================================================
// DateRangePicker — vertical scroll
// =============================================================================
function DateRangePickerScrollFixture({ label }: { label: string }) {
  const { selection, handleChange } = useDateRangeState(label);

  return (
    <div className="panel">
      <h2>DateRangePicker ({label})</h2>
      <p className="status">
        <code>{'scroll={ enabled: true, calendarHeight: 420 }'}</code> — vertical
      </p>
      <DateRangePicker
        ranges={[selection]}
        onChange={handleChange}
        months={2}
        direction="vertical"
        scroll={scrollConfig}
        showDateDisplay={true}
        moveRangeOnFirstSelection={false}
        rangeColors={['#3d91ff']}
      />
    </div>
  );
}

// =============================================================================
// Render both StrictMode and non-StrictMode roots
// =============================================================================
const strictRoot = document.getElementById('root-strict');
const noStrictRoot = document.getElementById('root-nostrict');

if (strictRoot) {
  const root = createRoot(strictRoot);
  root.render(
    <StrictMode>
      <div>
        <h1 style={{ marginTop: 0 }}>
          🔴 StrictMode <span className="badge badge-strict">ON</span>
        </h1>
        <p>
          Components inside <code>&lt;StrictMode&gt;</code> may double-mount.
          Observe console for errors, blank renders, or partial rendering.
        </p>
        <div className="layout">
          <DateRangeScrollFixture label="strict-dr" />
          <DateRangePickerScrollFixture label="strict-drp" />
        </div>
      </div>
    </StrictMode>,
  );
}

if (noStrictRoot) {
  const root = createRoot(noStrictRoot);
  root.render(
    <div>
      <h1 style={{ marginTop: 0 }}>
        🟢 Non-StrictMode <span className="badge badge-nostrict">OFF</span>
      </h1>
      <p>
        Components rendered WITHOUT <code>&lt;StrictMode&gt;</code>.
        This is the baseline for expected behavior.
      </p>
      <div className="layout">
        <DateRangeScrollFixture label="nostrict-dr" />
        <DateRangePickerScrollFixture label="nostrict-drp" />
      </div>
    </div>,
  );
}

// =============================================================================
// Guard: warn if roots not found (SSR safety / DOM check)
// =============================================================================
if (!strictRoot && !noStrictRoot) {
  console.warn(
    'react-date-range-modern scroll-strictmode spike: no root elements found. ' +
      'This spike requires a browser DOM with #root-strict and #root-nostrict elements.',
  );
}
