import React from 'react';
import fs from 'fs';
import path from 'path';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Calendar from '../Calendar/index.jsx';
import DateDisplay from '../DateDisplay/index.jsx';
import { isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { es } from 'date-fns/locale/es';

let mockVirtualizerInstance;
let mockDateDisplayProps;

jest.mock('@tanstack/react-virtual', () => {
  const React = require('react');

  const buildVirtualItems = visibleRange =>
    visibleRange.map(index => ({ index, key: index, start: index * 240, size: 240 }));

  const useVirtualizer = options => {
    const [visibleRange, setVisibleRange] = React.useState([0, 1]);
    const visibleRangeRef = React.useRef(visibleRange);
    visibleRangeRef.current = visibleRange;

    const instance = React.useMemo(
      () => ({
        getTotalSize: () => options.count * 240,
        getVirtualItems: () => buildVirtualItems(visibleRangeRef.current),
        scrollToIndex: index => setVisibleRange([index, index + 1]),
        measure: jest.fn(),
        estimateSize: options.estimateSize,
        setVisibleRange,
      }),
      [options.count, options.estimateSize]
    );

    mockVirtualizerInstance = instance;
    return instance;
  };

  return { useVirtualizer };
}, { virtual: true });

jest.mock('../DateDisplay/index.jsx', () => {
  const DateDisplayMock = props => {
    mockDateDisplayProps = props;
    return <div data-testid="date-display" />;
  };
  DateDisplayMock.displayName = 'DateDisplayMock';
  return { __esModule: true, default: DateDisplayMock };
});

const selectionRange = {
  startDate: new Date(2025, 5, 10),
  endDate: new Date(2025, 5, 12),
  key: 'selection',
};

const baseProps = {
  showMonthArrow: true,
  showMonthAndYearPickers: true,
  disabledDates: [],
  disabledDay: () => {},
  classNames: {},
  locale: enUS,
  ranges: [],
  focusedRange: [0, 0],
  dateDisplayFormat: 'MMM d, yyyy',
  monthDisplayFormat: 'MMM yyyy',
  weekdayDisplayFormat: 'E',
  dayDisplayFormat: 'd',
  showDateDisplay: true,
  showPreview: true,
  displayMode: 'date',
  months: 1,
  color: '#3d91ff',
  scroll: { enabled: false },
  direction: 'vertical',
  maxDate: new Date(2090, 0, 1),
  minDate: new Date(1925, 0, 1),
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  startDatePlaceholder: 'Early',
  endDatePlaceholder: 'Continuous',
  editableDateInputs: false,
  dragSelectionEnabled: true,
  fixedHeight: false,
  calendarFocus: 'forwards',
  preventSnapRefocus: false,
  ariaLabels: {},
  shownDate: new Date(2025, 5, 15),
  minDate: new Date(2025, 0, 1),
  maxDate: new Date(2025, 11, 31),
  ranges: [selectionRange],
  scroll: { enabled: false },
  showDateDisplay: false,
  locale: enUS,
  ariaLabels: {
    prevButton: 'Previous month',
    nextButton: 'Next month',
    monthPicker: 'Month',
    yearPicker: 'Year',
  },
};

const renderCalendar = props => {
  mockDateDisplayProps = undefined;
  mockVirtualizerInstance = undefined;
  return render(<Calendar {...baseProps} {...props} />);
};

const rerenderCalendar = (view, props) => {
  mockDateDisplayProps = undefined;
  view.rerender(<Calendar {...baseProps} {...props} />);
};

const findButtonByLabel = label => screen.getByRole('button', { name: label });

const findSelectByLabel = label => screen.getByLabelText(label);

const selectOptionTexts = select => Array.from(select.options).map(option => option.textContent);

const visibleMonthLabels = container =>
  Array.from(container.querySelectorAll('.rdrMonthName')).map(node => node.textContent);

const weekdayLabels = container =>
  Array.from(container.querySelectorAll('.rdrWeekDay')).map(node => node.textContent);

const calendarDayButtons = () =>
  screen
    .getAllByRole('gridcell')
    .filter(button => /^\d+$/.test(button.textContent));

const dayButtons = () => calendarDayButtons().filter(button => button.tabIndex !== -1);

const findDayButton = dayNumber => dayButtons().find(button => button.textContent === String(dayNumber));

const findCalendarDayButton = dayNumber =>
  calendarDayButtons().find(button => button.textContent === String(dayNumber));

const findLiveRegion = container => container.querySelector('.rdrLiveRegion');

const readDefaultTheme = () =>
  fs.readFileSync(path.resolve(__dirname, '../../theme/default.scss'), 'utf8');

const readCalendarComponentStyles = () =>
  fs.readFileSync(path.resolve(__dirname, './index.scss'), 'utf8');

const readTypeDeclarations = () =>
  fs.readFileSync(path.resolve(__dirname, '../../index.d.ts'), 'utf8');

const expectSameDay = (actual, expected) => {
  expect(isSameDay(actual, expected)).toBe(true);
};

describe('Calendar', () => {
  test('Should resolve', () => {
    expect(Calendar).toEqual(expect.anything());
  });

  describe('RTL direction wrapper contract', () => {
    test('dir="rtl" renders an explicit RTL attribute and resolved RTL class', () => {
      const { container } = renderCalendar({ dir: 'rtl' });
      const calendarRoot = container.firstChild;

      expect(calendarRoot).toHaveAttribute('dir', 'rtl');
      expect(calendarRoot).toHaveClass('rdrRtl');
    });

    test('dir="ltr" renders an explicit LTR attribute without the RTL class', () => {
      const { container } = renderCalendar({ dir: 'ltr' });
      const calendarRoot = container.firstChild;

      expect(calendarRoot).toHaveAttribute('dir', 'ltr');
      expect(calendarRoot).not.toHaveClass('rdrRtl');
    });

    test('omitted dir keeps the calendar root inheritable without an RTL class', () => {
      const { container } = render(
        <div dir="rtl">
          <Calendar {...baseProps} />
        </div>
      );
      const calendarRoot = container.querySelector('.rdrCalendarWrapper');

      expect(calendarRoot).not.toHaveAttribute('dir');
      expect(calendarRoot).not.toHaveClass('rdrRtl');
      expect(calendarRoot.closest('[dir="rtl"]')).toBe(container.firstChild);
      // Backward-compat: default no-prop render preserves the pre-RTL class set
      expect(calendarRoot.classList.contains('rdrCalendarWrapper')).toBe(true);
      expect(calendarRoot.classList.length).toBe(1);
    });

    test('custom rtl className replaces the default rdrRtl hook', () => {
      const { container } = renderCalendar({ dir: 'rtl', classNames: { rtl: 'app-rtl' } });
      const calendarRoot = container.firstChild;

      expect(calendarRoot).toHaveClass('app-rtl');
      expect(calendarRoot).not.toHaveClass('rdrRtl');
    });
  });

  describe('RTL logical edge styles', () => {
    test('date range and preview edges use logical border and inset properties', () => {
      const scss = readDefaultTheme();

      expect(scss).toContain('border-start-start-radius');
      expect(scss).toContain('border-end-start-radius');
      expect(scss).toContain('border-start-end-radius');
      expect(scss).toContain('border-end-end-radius');
      expect(scss).toContain('border-inline-start-width');
      expect(scss).toContain('border-inline-end-width');
      expect(scss).toContain('inset-inline-start');
      expect(scss).toContain('inset-inline-end');
      expect(scss).not.toMatch(/border-(top|bottom)-(left|right)-radius/);
      expect(scss).not.toMatch(/border-(left|right)-width/);
    });
  });

  describe('RTL visual mirroring styles', () => {
    test('rtl wrappers mirror navigation arrow glyphs without changing ltr glyph styles', () => {
      const scss = readDefaultTheme();

      expect(scss).toMatch(/\.rdrCalendarWrapper\[dir=['"]rtl['"]\].*\.rdrNextPrevButton\s+i\s*\{[^}]*scaleX\(-1\)/s);
      expect(scss).not.toMatch(/\.rdrCalendarWrapper\[dir=['"]ltr['"]\].*scaleX\(-1\)/s);
    });

    test('horizontal rtl calendars apply row-reverse styling to the month container', () => {
      const { container } = renderCalendar({ direction: 'horizontal', dir: 'rtl', months: 2 });
      const monthsContainer = container.querySelector('.rdrMonthsHorizontal');
      const scss = readCalendarComponentStyles();

      expect(monthsContainer).toBeInTheDocument();
      // JSDOM does not compute CSS layout so getBoundingClientRect() cannot prove
      // the first Month is visually rightmost.  We assert the strongest
      // runtime-observable contracts: the RTL class/dir DOM shape *and* the
      // source-level row-reverse rule.
      expect(monthsContainer.closest('[dir="rtl"]')).toBe(container.firstChild);
      expect(monthsContainer.closest('.rdrRtl')).toBe(container.firstChild);
      expect(container.firstChild).toHaveClass('rdrRtl');
      expect(scss).toMatch(/\.rdrRtl\s+\.rdrMonthsHorizontal\s*\{[^}]*flex-direction:\s*row-reverse/s);
    });
  });

  describe('scroll layout styles', () => {
    test('horizontal scroll months do not inherit the non-virtualized nested row layout', () => {
      const scss = readCalendarComponentStyles();

      expect(scss).toContain('.rdrMonthsHorizontal:not(.rdrInfiniteMonths) > div > div > div');
      expect(scss).not.toContain('.rdrMonthsHorizontal > div > div > div');
    });
  });

  describe('responsive layout contract', () => {
    test('keeps the reference wrapper by default', () => {
      const { container } = renderCalendar();

      expect(container.firstChild).toHaveClass('rdrCalendarWrapper');
      expect(container.firstChild).not.toHaveClass('rdrCalendarWrapperResponsive');
    });

    test('stacks multiple mobile months vertically', () => {
      const { container } = renderCalendar({ layout: 'mobile', months: 2, direction: 'horizontal' });

      expect(container.firstChild).toHaveClass('rdrCalendarWrapperResponsive');
      expect(container.querySelector('.rdrMonthsVertical')).toBeInTheDocument();
      expect(container.querySelectorAll('.rdrMonth')).toHaveLength(2);
    });

    test('uses mobileBreakpoint when resolving auto layout', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = jest.fn(query => ({
        matches: query === '(max-width: 640px)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      try {
        const { container } = renderCalendar({ layout: 'auto', mobileBreakpoint: 640, months: 2 });

        expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 640px)');
        expect(container.firstChild).toHaveClass('rdrCalendarWrapperResponsive');
      } finally {
        window.matchMedia = originalMatchMedia;
      }
    });

    test('keeps virtualized scroll geometry outside the responsive layout', () => {
      const { container } = renderCalendar({
        layout: 'mobile',
        months: 2,
        direction: 'horizontal',
        scroll: { enabled: true },
      });

      expect(container.firstChild).not.toHaveClass('rdrCalendarWrapperResponsive');
      expect(container.querySelector('.rdrMonthsHorizontal')).toBeInTheDocument();
    });
  });

  describe('fluid width-mode calendar contract', () => {
    test('does not add fluid class when _calendarIsFluidWidthMode is falsy', () => {
      const { container } = renderCalendar();

      expect(container.firstChild).toHaveClass('rdrCalendarWrapper');
      expect(container.firstChild).not.toHaveClass('rdrCalendarWrapperFluid');
    });

    test('adds fluid class when _calendarIsFluidWidthMode is true', () => {
      const { container } = renderCalendar({ _calendarIsFluidWidthMode: true });

      expect(container.firstChild).toHaveClass('rdrCalendarWrapperFluid');
    });

    test('public widthMode="fluid" adds fluid class without private prop', () => {
      const { container } = renderCalendar({ widthMode: 'fluid' });

      expect(container.firstChild).toHaveClass('rdrCalendarWrapperFluid');
    });

    test('public widthMode="content" does not add fluid class', () => {
      const { container } = renderCalendar({ widthMode: 'content' });

      expect(container.firstChild).not.toHaveClass('rdrCalendarWrapperFluid');
    });

    test('omitted widthMode does not add fluid class', () => {
      const { container } = renderCalendar();

      expect(container.firstChild).not.toHaveClass('rdrCalendarWrapperFluid');
    });

    test('private _calendarIsFluidWidthMode still adds fluid class independently', () => {
      const { container } = renderCalendar({ _calendarIsFluidWidthMode: true });

      expect(container.firstChild).toHaveClass('rdrCalendarWrapperFluid');
    });

    test('public widthMode and private prop are OR-combined (either triggers fluid)', () => {
      const { container } = renderCalendar({ widthMode: 'fluid', _calendarIsFluidWidthMode: false });

      expect(container.firstChild).toHaveClass('rdrCalendarWrapperFluid');
    });

    test('CalendarProps exposes widthMode type declaration', () => {
      const declarations = readTypeDeclarations();

      expect(declarations).toMatch(/widthMode\?:\s*['"]content['"]\s*\|\s*['"]fluid['"]\s*\|\s*undefined/);
    });

    test('fluid styles target the calendar wrapper and months grid without responsive layout coupling', () => {
      const scss = readCalendarComponentStyles();

      expect(scss).toMatch(/--rdr-calendar-month-min-width:\s*400px/);
      expect(scss).toMatch(/\.rdrCalendarWrapperFluid\s*\{[^}]*flex:\s*1 1 0/s);
      expect(scss).toMatch(/\.rdrCalendarWrapperFluid\s+\.rdrMonths\s*\{[^}]*width:\s*100%/s);
      expect(scss).toMatch(/\.rdrCalendarWrapperFluid\s+\.rdrMonth\s*\{[^}]*flex:\s*1 1 0/s);
      expect(scss).toMatch(/\.rdrCalendarWrapperFluid\s+\.rdrMonth\s*\{[^}]*min-width:\s*0/s);
    });

    test('fluid class does not affect layout orientation (horizontal months stay horizontal)', () => {
      const { container } = renderCalendar({
        _calendarIsFluidWidthMode: true,
        direction: 'horizontal',
        months: 2,
      });

      expect(container.firstChild).toHaveClass('rdrCalendarWrapperFluid');
      expect(container.querySelector('.rdrMonthsHorizontal')).toBeInTheDocument();
      expect(container.querySelector('.rdrMonthsVertical')).not.toBeInTheDocument();
    });

    test('auto fluid horizontal months stack vertically when container cannot preserve month min-width', async () => {
      const originalResizeObserver = window.ResizeObserver;
      const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
      window.ResizeObserver = class ResizeObserverMock {
        constructor(callback) {
          this.callback = callback;
        }
        observe() {
          this.callback();
        }
        disconnect() {}
      };
      HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
        width: 700,
        height: 0,
        top: 0,
        right: 700,
        bottom: 0,
        left: 0,
      }));

      try {
        const { container } = renderCalendar({
          layout: 'auto',
          widthMode: 'fluid',
          direction: 'horizontal',
          months: 2,
        });

        await waitFor(() => expect(container.querySelector('.rdrMonthsVertical')).toBeInTheDocument());
        expect(container.querySelector('.rdrMonthsHorizontal')).not.toBeInTheDocument();
      } finally {
        window.ResizeObserver = originalResizeObserver;
        HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
      }
    });

    test('auto fluid horizontal months stay horizontal when container preserves month min-width', async () => {
      const originalResizeObserver = window.ResizeObserver;
      const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
      window.ResizeObserver = class ResizeObserverMock {
        constructor(callback) {
          this.callback = callback;
        }
        observe() {
          this.callback();
        }
        disconnect() {}
      };
      HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
        width: 900,
        height: 0,
        top: 0,
        right: 900,
        bottom: 0,
        left: 0,
      }));

      try {
        const { container } = renderCalendar({
          layout: 'auto',
          widthMode: 'fluid',
          direction: 'horizontal',
          months: 2,
        });

        await waitFor(() => expect(container.querySelector('.rdrMonthsHorizontal')).toBeInTheDocument());
        expect(container.querySelector('.rdrMonthsVertical')).not.toBeInTheDocument();
      } finally {
        window.ResizeObserver = originalResizeObserver;
        HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
      }
    });

    test('explicit desktop fluid layout does not auto-stack even when narrow', async () => {
      const originalResizeObserver = window.ResizeObserver;
      const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
      window.ResizeObserver = class ResizeObserverMock {
        constructor(callback) {
          this.callback = callback;
        }
        observe() {
          this.callback();
        }
        disconnect() {}
      };
      HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
        width: 700,
        height: 0,
        top: 0,
        right: 700,
        bottom: 0,
        left: 0,
      }));

      try {
        const { container } = renderCalendar({
          layout: 'desktop',
          widthMode: 'fluid',
          direction: 'horizontal',
          months: 2,
        });

        await waitFor(() => expect(container.querySelector('.rdrMonthsHorizontal')).toBeInTheDocument());
        expect(container.querySelector('.rdrMonthsVertical')).not.toBeInTheDocument();
      } finally {
        window.ResizeObserver = originalResizeObserver;
        HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
      }
    });
  });

  describe('RTL public type surface', () => {
    test('CalendarProps and ClassNames expose additive dir and rtl declarations', () => {
      const declarations = readTypeDeclarations();

      expect(declarations).toMatch(/rtl\?:\s*string\s*\|\s*undefined/);
      expect(declarations).toMatch(/dir\?:\s*['"]ltr['"]\s*\|\s*['"]rtl['"]\s*\|\s*undefined/);
    });
  });

  describe('RTL navigatorRenderer contract', () => {
    test('custom navigatorRenderer receives raw props and renders unwrapped under RTL', () => {
      const renderer = jest.fn((date, changeDate, props) => (
        <div data-testid="custom-nav">
          {props.dir === 'rtl' ? 'RTL' : 'LTR'}
        </div>
      ));
      const { container } = renderCalendar({ navigatorRenderer: renderer, dir: 'rtl', months: 2 });

      expect(screen.getByTestId('custom-nav')).toHaveTextContent('RTL');
      expect(renderer).toHaveBeenCalledTimes(1);
      expect(renderer.mock.calls[0][0]).toBeInstanceOf(Date);
      expect(renderer.mock.calls[0][1]).toEqual(expect.any(Function));
      expect(renderer.mock.calls[0][2].dir).toBe('rtl');
      // Renderer output is inserted directly without a wrapper element
      expect(container.querySelector('[data-testid="custom-nav"]').parentElement).toBe(
        container.firstChild
      );
    });
  });

  describe('RTL vertical direction contract', () => {
    test('vertical calendars with dir=rtl preserve vertical month stacking', () => {
      const { container } = renderCalendar({ direction: 'vertical', dir: 'rtl', months: 2 });

      expect(container.querySelector('.rdrMonthsVertical')).toBeInTheDocument();
      expect(container.querySelector('.rdrMonthsHorizontal')).not.toBeInTheDocument();
      expect(container.firstChild).toHaveClass('rdrRtl');
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('RTL keyboard regression guard', () => {
    test('ArrowLeft and ArrowRight navigate physically regardless of RTL direction', () => {
      renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        direction: 'vertical',
        showMonthAndYearPickers: false,
        showDateDisplay: false,
        dir: 'rtl',
      });

      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'ArrowLeft' });
      expect(document.activeElement.textContent).toBe('14');

      fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
      expect(document.activeElement.textContent).toBe('15');
    });
  });

  describe('forwardRef scaffold and metadata', () => {
    test('exports a forwardRef component without static defaultProps', () => {
      expect(Calendar.$$typeof).toBe(Symbol.for('react.forward_ref'));
      expect(Calendar.defaultProps).toBeUndefined();
      // ariaLabels defaults are observable through rendering
      renderCalendar();
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
      expect(screen.getByLabelText('Month')).toBeInTheDocument();
      expect(screen.getByLabelText('Year')).toBeInTheDocument();
    });

    test('forwards refs to the compatibility instance seam', () => {
      const calendarRef = React.createRef();

      renderCalendar({ ref: calendarRef });

      expect(calendarRef.current.focusToDate).toEqual(expect.any(Function));
      expect(calendarRef.current.updateShownDate).toEqual(expect.any(Function));
    });

    test('non-scroll ref exposes calendar actions without leaking class instance state', () => {
      const calendarRef = React.createRef();

      renderCalendar({ ref: calendarRef, scroll: { enabled: false } });

      expect(calendarRef.current.focusToDate).toEqual(expect.any(Function));
      expect(calendarRef.current.changeShownDate).toEqual(expect.any(Function));
      expect(calendarRef.current.updateShownDate).toEqual(expect.any(Function));
      expect(calendarRef.current.setState).toBeUndefined();
    });
  });

  describe('rendered navigation and shown-date behavior', () => {
    test('headerConfig can hide the year while keeping month and navigation controls', () => {
      renderCalendar({ headerConfig: { year: false } });

      expect(findSelectByLabel('Month')).toBeInTheDocument();
      expect(screen.queryByLabelText('Year')).not.toBeInTheDocument();
      expect(findButtonByLabel('Previous month')).toBeInTheDocument();
      expect(findButtonByLabel('Next month')).toBeInTheDocument();
    });

    test('headerConfig can hide the month while keeping year and navigation controls', () => {
      renderCalendar({ headerConfig: { month: false } });

      expect(screen.queryByLabelText('Month')).not.toBeInTheDocument();
      expect(findSelectByLabel('Year')).toBeInTheDocument();
      expect(findButtonByLabel('Previous month')).toBeInTheDocument();
      expect(findButtonByLabel('Next month')).toBeInTheDocument();
    });

    test('headerConfig can hide navigation while keeping month and year controls', () => {
      renderCalendar({ headerConfig: { navigation: false } });

      expect(findSelectByLabel('Month')).toBeInTheDocument();
      expect(findSelectByLabel('Year')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Previous month' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next month' })).not.toBeInTheDocument();
    });

    test('fully hidden header leaves no empty header chrome', () => {
      const { container } = renderCalendar({
        headerConfig: { month: false, year: false, navigation: false },
      });

      expect(container.querySelector('.rdrMonthAndYearWrapper')).toBeNull();
    });

    test('uiSlots appends classes and merges styles on calendar chrome without replacing legacy classes', () => {
      const { container } = renderCalendar({
        uiSlots: {
          root: { className: 'host-root', style: { borderColor: 'red' } },
          header: { className: 'host-header', style: { backgroundColor: 'yellow' } },
          monthYear: { className: 'host-month-year', style: { color: 'purple' } },
          monthPicker: { className: 'host-month-picker', style: { outlineColor: 'blue' } },
          yearPicker: { className: 'host-year-picker', style: { outlineColor: 'green' } },
          months: { className: 'host-months', style: { gap: '12px' } },
        },
      });

      expect(container.firstChild).toHaveClass('rdrCalendarWrapper', 'host-root');
      expect(container.firstChild).toHaveStyle('border-color: red;');
      expect(container.querySelector('.rdrMonthAndYearWrapper')).toHaveClass('host-header');
      expect(container.querySelector('.rdrMonthAndYearWrapper')).toHaveStyle('background-color: rgb(255, 255, 0);');
      expect(container.querySelector('.rdrMonthAndYearPickers')).toHaveClass('host-month-year');
      expect(container.querySelector('.rdrMonthAndYearPickers')).toHaveStyle('color: rgb(128, 0, 128);');
      expect(container.querySelector('.rdrMonthPicker')).toHaveClass('host-month-picker');
      expect(container.querySelector('.rdrMonthPicker')).toHaveStyle('outline-color: rgb(0, 0, 255);');
      expect(container.querySelector('.rdrYearPicker')).toHaveClass('host-year-picker');
      expect(container.querySelector('.rdrYearPicker')).toHaveStyle('outline-color: rgb(0, 128, 0);');
      expect(container.querySelector('.rdrMonths')).toHaveClass('host-months');
      expect(container.querySelector('.rdrMonths')).toHaveStyle({ gap: '12px' });
    });

    test('uiSlots appends navigation classes and preserves button labels and click handlers', () => {
      const onShownDateChange = jest.fn();
      renderCalendar({
        onShownDateChange,
        uiSlots: {
          nav: { className: 'host-nav', style: { borderColor: 'blue' } },
          navPrev: { className: 'host-prev', style: { color: 'red' } },
          navNext: { className: 'host-next', style: { color: 'green' } },
          definedRanges: { className: 'should-not-render-on-calendar' },
        },
      });

      const previousButton = findButtonByLabel('Previous month');
      const nextButton = findButtonByLabel('Next month');
      expect(previousButton).toHaveClass('rdrNextPrevButton', 'rdrPprevButton', 'host-nav', 'host-prev');
      expect(previousButton).toHaveStyle('border-color: blue; color: rgb(255, 0, 0);');
      expect(nextButton).toHaveClass('rdrNextPrevButton', 'rdrNextButton', 'host-nav', 'host-next');
      expect(nextButton).toHaveStyle('border-color: blue; color: rgb(0, 128, 0);');
      expect(document.querySelector('.should-not-render-on-calendar')).toBeNull();

      fireEvent.click(nextButton);
      expect(onShownDateChange).toHaveBeenCalledWith(new Date(2025, 6, 15));
    });

    test('renders one polite atomic live region outside rendered month content', () => {
      const { container } = renderCalendar({
        scroll: { enabled: true, monthHeight: 240, longMonthHeight: 280, calendarHeight: 420 },
        minDate: new Date(2025, 0, 1),
        maxDate: new Date(2025, 11, 31),
        shownDate: new Date(2025, 5, 15),
      });

      const liveRegions = container.querySelectorAll('.rdrLiveRegion');

      expect(liveRegions).toHaveLength(1);
      expect(liveRegions[0]).toHaveAttribute('aria-live', 'polite');
      expect(liveRegions[0]).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegions[0].closest('.rdrMonth')).toBeNull();
      expect(liveRegions[0].closest('.rdrInfiniteMonths')).toBeNull();
    });

    test('scroll month size estimation respects fixedHeight month rendering', () => {
      renderCalendar({
        scroll: { enabled: true, monthHeight: 240, longMonthHeight: 280, calendarHeight: 420 },
        fixedHeight: true,
        minDate: new Date(2025, 0, 1),
        maxDate: new Date(2025, 11, 31),
        shownDate: new Date(2025, 1, 15),
      });

      // February 2025 is a short month unless fixedHeight extends it to a
      // 6-week grid. The virtualizer must reserve the long-month height that
      // Month will actually render, otherwise months visually overlap.
      expect(mockVirtualizerInstance.estimateSize(1)).toBe(280);
    });

    test('vertical scroll reserves scrollbar width instead of producing an invalid auto width', () => {
      const { container } = renderCalendar({
        scroll: { enabled: true, monthHeight: 240, longMonthHeight: 280, calendarHeight: 420 },
        minDate: new Date(2025, 0, 1),
        maxDate: new Date(2025, 11, 31),
        shownDate: new Date(2025, 1, 15),
      });

      const scrollContainer = container.querySelector('.rdrInfiniteMonths');

      expect(scrollContainer).toHaveStyle({
        width: '343px',
        overflowX: 'hidden',
        overflowY: 'auto',
      });
      expect(scrollContainer.firstElementChild).toHaveStyle({ width: '332px' });
    });

    test('previous and next arrows update visible month and report clamped shown dates', () => {
      const onShownDateChange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 6, 31),
        onShownDateChange,
      });

      fireEvent.click(findButtonByLabel('Previous month'));

      expect(findSelectByLabel('Month')).toHaveValue('5');
      expectSameDay(onShownDateChange.mock.calls[0][0], new Date(2025, 5, 1));

      fireEvent.click(findButtonByLabel('Next month'));

      expect(findSelectByLabel('Month')).toHaveValue('6');
      expectSameDay(onShownDateChange.mock.calls[1][0], new Date(2025, 6, 1));
    });

    test('navigation arrows announce committed shown month and year', () => {
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 6, 31),
      });

      fireEvent.click(findButtonByLabel('Previous month'));

      expect(findLiveRegion(container)).toHaveTextContent('Now showing June 2025');

      fireEvent.click(findButtonByLabel('Next month'));

      expect(findLiveRegion(container)).toHaveTextContent('Now showing July 2025');
    });

    test('month and year pickers update visible values and report selected dates', () => {
      const onShownDateChange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
        onShownDateChange,
      });

      fireEvent.change(findSelectByLabel('Month'), { target: { value: '8' } });

      expect(findSelectByLabel('Month')).toHaveValue('8');
      expectSameDay(onShownDateChange.mock.calls[0][0], new Date(2025, 8, 15));

      fireEvent.change(findSelectByLabel('Year'), { target: { value: '2026' } });

      expect(findSelectByLabel('Year')).toHaveValue('2026');
      expectSameDay(onShownDateChange.mock.calls[1][0], new Date(2026, 8, 15));
    });

    test('month and year pickers announce committed shown month and year', () => {
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
      });

      fireEvent.change(findSelectByLabel('Month'), { target: { value: '8' } });

      expect(findLiveRegion(container)).toHaveTextContent('Now showing September 2025');

      fireEvent.change(findSelectByLabel('Year'), { target: { value: '2026' } });

      expect(findLiveRegion(container)).toHaveTextContent('Now showing September 2026');
    });

    test('custom live region month/year formatter receives the committed date', () => {
      const liveRegionMonthYear = jest.fn(date => `Showing ${date.getFullYear()}-${date.getMonth() + 1}`);
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
        ariaLabels: {
          ...baseProps.ariaLabels,
          liveRegionMonthYear,
        },
      });

      fireEvent.change(findSelectByLabel('Month'), { target: { value: '8' } });

      expect(liveRegionMonthYear).toHaveBeenCalledWith(new Date(2025, 8, 15));
      expect(findLiveRegion(container)).toHaveTextContent('Showing 2025-9');
    });

    test('non-scroll rendered months derive from updated focused date without virtualizer refs', () => {
      const { container } = renderCalendar({
        shownDate: new Date(2025, 0, 15),
        months: 2,
        direction: 'horizontal',
        showMonthAndYearPickers: false,
      });

      expect(visibleMonthLabels(container)).toEqual(['Jan 2025', 'Feb 2025']);

      fireEvent.click(findButtonByLabel('Next month'));

      expect(visibleMonthLabels(container)).toEqual(['Feb 2025', 'Mar 2025']);
    });

    test('non-scroll date mode syncs visible month when external date becomes defined', () => {
      const view = renderCalendar({
        displayMode: 'date',
        date: undefined,
        direction: 'horizontal',
        shownDate: new Date(2025, 5, 15),
        showMonthAndYearPickers: false,
      });

      expect(visibleMonthLabels(view.container)).toEqual(['Jun 2025']);

      rerenderCalendar(view, {
        displayMode: 'date',
        date: new Date(2025, 8, 20),
        direction: 'horizontal',
        shownDate: new Date(2025, 5, 15),
        showMonthAndYearPickers: false,
      });

      expect(visibleMonthLabels(view.container)).toEqual(['Sep 2025']);
    });
  });

  describe('rendered selection interactions', () => {
    test('hover and drag preview movement leave live region text unchanged', () => {
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'dateRange',
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
      });

      fireEvent.mouseEnter(findDayButton(10));
      fireEvent.mouseDown(findDayButton(10));
      fireEvent.mouseEnter(findDayButton(12));

      expect(findLiveRegion(container)).toHaveTextContent('');
    });

    test('drag selection end does not announce selection in the month/year-only slice', () => {
      const updateRange = jest.fn();
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'dateRange',
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        updateRange,
      });

      fireEvent.mouseDown(findDayButton(10));
      fireEvent.mouseEnter(findDayButton(12));
      fireEvent.mouseUp(findDayButton(12));

      expect(updateRange).toHaveBeenCalledTimes(1);
      expect(findLiveRegion(container)).toHaveTextContent('');
    });

    test('dragging a date range calls updateRange with start and end dates without using onChange', () => {
      const updateRange = jest.fn();
      const onChange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'dateRange',
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        updateRange,
        onChange,
      });

      fireEvent.mouseDown(findDayButton(10));
      fireEvent.mouseEnter(findDayButton(12));
      fireEvent.mouseUp(findDayButton(12));

      expectSameDay(updateRange.mock.calls[0][0].startDate, new Date(2025, 5, 10));
      expectSameDay(updateRange.mock.calls[0][0].endDate, new Date(2025, 5, 12));
      expect(onChange).not.toHaveBeenCalled();
    });

    test('single-date mouse selection calls onChange with the selected date', () => {
      const onChange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'date',
        date: new Date(2025, 5, 10),
        onChange,
      });

      fireEvent.mouseDown(findDayButton(18));
      fireEvent.mouseUp(findDayButton(18));

      expectSameDay(onChange.mock.calls[0][0], new Date(2025, 5, 18));
    });

    test('keyboard activation on an active day forwards selection through onChange', () => {
      const onChange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'date',
        date: new Date(2025, 5, 10),
        onChange,
      });

      fireEvent.keyDown(findDayButton(20), { key: 'Enter', keyCode: 13 });
      fireEvent.keyUp(findDayButton(20), { key: 'Enter', keyCode: 13 });

      expectSameDay(onChange.mock.calls[0][0], new Date(2025, 5, 20));
    });

    test('disabled days clear preview without forwarding selection callbacks', () => {
      const onPreviewChange = jest.fn();
      const onChange = jest.fn();
      const updateRange = jest.fn();
      renderCalendar({
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 30),
        displayMode: 'dateRange',
        disabledDates: [new Date(2025, 5, 18)],
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        onPreviewChange,
        onChange,
        updateRange,
      });
      const disabledDay = findCalendarDayButton(18);

      fireEvent.mouseEnter(disabledDay);
      fireEvent.mouseDown(disabledDay);
      fireEvent.mouseUp(disabledDay);

      expect(disabledDay.tabIndex).toBe(-1);
      expect(onPreviewChange).toHaveBeenCalledTimes(3);
      expect(onPreviewChange.mock.calls).toEqual([[], [], []]);
      expect(onChange).not.toHaveBeenCalled();
      expect(updateRange).not.toHaveBeenCalled();
    });

    test('cross-month mouse drag with selectablePassive spans both months', () => {
      const updateRange = jest.fn();
      const { container } = renderCalendar({
        selectablePassive: true,
        months: 2,
        shownDate: new Date(2025, 5, 1),
        displayMode: 'dateRange',
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        updateRange,
      });

      // Scoped to month containers — first month shows June, second shows July
      const months = container.querySelectorAll('.rdrMonth');
      expect(months.length).toBeGreaterThanOrEqual(2);

      const month1Cells = months[0].querySelectorAll('[role="gridcell"]');
      const month2Cells = months[1].querySelectorAll('[role="gridcell"]');

      // Outside-month cells in the 6-week grid: month1 has May fill days at start
      const passiveDayM1 = month1Cells[0]; // first cell = May fill day
      // month2 has August fill days at end
      const passiveDayM2 = month2Cells[month2Cells.length - 1]; // last cell = August fill day

      fireEvent.mouseDown(passiveDayM1);
      fireEvent.mouseEnter(passiveDayM2);
      fireEvent.mouseUp(passiveDayM2);

      expect(updateRange).toHaveBeenCalledTimes(1);
      // startDate from month-1 passive cell, endDate from month-2 passive cell
      const { startDate, endDate } = updateRange.mock.calls[0][0];
      expect(startDate.getMonth()).toBeLessThan(endDate.getMonth());
    });

    test('selectablePassive gives passive cell tabIndex 0 and keyboard selection', () => {
      const onChange = jest.fn();
      renderCalendar({
        selectablePassive: true,
        shownDate: new Date(2025, 7, 15), // August 2025: Aug 1 = Friday → July 27–31 filler
        minDate: new Date(2025, 6, 1),
        maxDate: new Date(2025, 8, 31),
        displayMode: 'date',
        date: new Date(2025, 7, 15),
        onChange,
      });

      // Day 27: first grid cell = July 27 (passive), second = Aug 27 (in-month).
      // findCalendarDayButton returns the first match → July passive cell.
      const passiveCell = findCalendarDayButton(27);
      expect(passiveCell).toBeDefined();
      expect(passiveCell.tabIndex).toBe(0);

      fireEvent.keyDown(passiveCell, { key: 'Enter', keyCode: 13 });
      fireEvent.keyUp(passiveCell, { key: 'Enter', keyCode: 13 });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].getDate()).toBe(27);
    });

    test('scroll mode suppresses selectablePassive keeping tabIndex -1 and passive class', () => {
      const { container } = renderCalendar({
        selectablePassive: true,
        scroll: { enabled: true },
        shownDate: new Date(2025, 7, 15),
        minDate: new Date(2025, 6, 1),
        maxDate: new Date(2025, 8, 31),
        showMonthAndYearPickers: false,
      });

      // In scroll mode, the first month is July. July 1 = Tuesday → grid
      // starts Sunday June 29 (2 filler cells). The first gridcell is a
      // passive cell and must retain tabIndex -1 + rdrDayPassive class.
      const months = container.querySelectorAll('.rdrMonth');
      expect(months.length).toBeGreaterThan(0);
      const firstMonthCells = months[0].querySelectorAll('[role="gridcell"]');
      const passiveCell = firstMonthCells[0];
      expect(passiveCell.tabIndex).toBe(-1);
      expect(passiveCell.className).toContain('rdrDayPassive');
    });

    test('REGRESSION: default (no selectablePassive prop) leaves outside-month cells passive', () => {
      // June 2025: June 1 = Sunday, so the 6-week grid ends on Saturday July 4.
      // No filler cells appear at the start, but there ARE outside-month fill days
      // at the end (July 1-4) that must remain passive by default.
      const { container } = renderCalendar({
        shownDate: new Date(2025, 5, 15),
        displayMode: 'dateRange',
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
      });

      const months = container.querySelectorAll('.rdrMonth');
      const lastMonthCells = months[months.length - 1].querySelectorAll('[role="gridcell"]');
      const lastCell = lastMonthCells[lastMonthCells.length - 1];
      // Last gridcell is a filler day (outside the month) and must stay passive
      expect(lastCell.className).toContain('rdrDayPassive');
      expect(lastCell.className).not.toContain('rdrDayStartOfMonth');
      expect(lastCell.className).not.toContain('rdrDayEndOfMonth');
    });
  });

  describe('locale and week start recalculation', () => {
    test('locale changes update rendered month picker labels', () => {
      const view = renderCalendar({ locale: enUS });

      expect(selectOptionTexts(findSelectByLabel('Month')).slice(0, 3)).toEqual([
        'January',
        'February',
        'March',
      ]);

      rerenderCalendar(view, { locale: es });

      expect(selectOptionTexts(findSelectByLabel('Month')).slice(0, 3)).toEqual([
        'enero',
        'febrero',
        'marzo',
      ]);
    });

    test('weekStartsOn changes update rendered weekday order', () => {
      const view = renderCalendar({ weekStartsOn: 0 });

      expect(weekdayLabels(view.container)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

      rerenderCalendar(view, { weekStartsOn: 1 });

      expect(weekdayLabels(view.container)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });
  });

  describe('StrictMode scroll safety (#577, #653)', () => {
    let scrollViews = [];

    beforeEach(() => {
      scrollViews = [];
      jest.useFakeTimers();
    });

    afterEach(() => {
      scrollViews.forEach(view => view.unmount());
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    const renderScrollCalendar = props => {
      const calendarRef = React.createRef();
      const view = renderCalendar({
        ref: calendarRef,
        scroll: { enabled: true, monthHeight: 240, longMonthHeight: 280, calendarHeight: 420 },
        minDate: new Date(2020, 0, 1),
        maxDate: new Date(2025, 11, 31),
        shownDate: new Date(2025, 5, 15),
        ...props,
      });
      scrollViews.push(view);
      return { calendarRef, view };
    };

    const findScrollContainer = container => container.querySelector('.rdrInfiniteMonths');

    test('scroll ref exposes hook actions without Calendar.Inner class leakage', () => {
      const { calendarRef } = renderScrollCalendar();

      expect(Calendar.Inner).toBeUndefined();
      expect(calendarRef.current.focusToDate).toEqual(expect.any(Function));
      expect(calendarRef.current.changeShownDate).toEqual(expect.any(Function));
      expect(calendarRef.current.updateShownDate).toEqual(expect.any(Function));
      expect(calendarRef.current.setState).toBeUndefined();
    });

    test('scroll focus measures after scrollToIndex (#577, #653)', () => {
      const { calendarRef } = renderScrollCalendar();
      const virtualizer = mockVirtualizerInstance;
      const measure = jest.spyOn(virtualizer, 'measure').mockImplementation(() => {});
      const getVirtualItems = jest
        .spyOn(virtualizer, 'getVirtualItems')
        .mockReturnValue([{ index: 0 }, { index: 10 }]);
      const scrollToIndex = jest.spyOn(virtualizer, 'scrollToIndex').mockImplementation(() => {});

      act(() => {
        calendarRef.current.focusToDate(new Date(2025, 5, 15));
      });

      expect(getVirtualItems).toHaveBeenCalled();
      expect(scrollToIndex).toHaveBeenCalledWith(65);
      expect(measure).toHaveBeenCalledTimes(1);
      expect(scrollToIndex.mock.invocationCallOrder[0]).toBeLessThan(
        measure.mock.invocationCallOrder[0]
      );
    });

    test('scroll focus is safe when measure is missing', () => {
      const { calendarRef } = renderScrollCalendar();
      const virtualizer = mockVirtualizerInstance;
      jest.spyOn(virtualizer, 'getVirtualItems').mockReturnValue([{ index: 0 }, { index: 10 }]);
      const scrollToIndex = jest.spyOn(virtualizer, 'scrollToIndex').mockImplementation(() => {});
      const originalMeasure = virtualizer.measure;
      virtualizer.measure = undefined;

      expect(() => {
        act(() => {
          calendarRef.current.focusToDate(new Date(2025, 5, 15));
        });
      }).not.toThrow();

      expect(scrollToIndex).toHaveBeenCalledWith(65);
      virtualizer.measure = originalMeasure;
    });

    test('handleScroll measures before reading visible range and reports later scrolls', () => {
      const onShownDateChange = jest.fn();
      const { view } = renderScrollCalendar({ onShownDateChange });
      const virtualizer = mockVirtualizerInstance;
      const measure = jest.spyOn(virtualizer, 'measure').mockImplementation(() => {});
      const getVirtualItems = jest
        .spyOn(virtualizer, 'getVirtualItems')
        .mockReturnValueOnce([{ index: 65 }, { index: 66 }])
        .mockReturnValueOnce([{ index: 66 }, { index: 67 }]);
      const scrollContainer = findScrollContainer(view.container);

      fireEvent.scroll(scrollContainer);
      fireEvent.scroll(scrollContainer);

      expect(measure).toHaveBeenCalledTimes(2);
      expect(measure.mock.invocationCallOrder[0]).toBeLessThan(
        getVirtualItems.mock.invocationCallOrder[0]
      );
      expect(onShownDateChange).toHaveBeenCalledTimes(1);
      expectSameDay(onShownDateChange.mock.calls[0][0], new Date(2025, 6, 1));
    });

    test('scroll-driven shown date changes do not announce transient movement', () => {
      const onShownDateChange = jest.fn();
      const { view } = renderScrollCalendar({ onShownDateChange });
      const virtualizer = mockVirtualizerInstance;
      jest
        .spyOn(virtualizer, 'getVirtualItems')
        .mockReturnValueOnce([{ index: 65 }, { index: 66 }])
        .mockReturnValueOnce([{ index: 66 }, { index: 67 }]);
      const scrollContainer = findScrollContainer(view.container);

      fireEvent.scroll(scrollContainer);
      fireEvent.scroll(scrollContainer);

      expect(onShownDateChange).toHaveBeenCalledTimes(1);
      expect(findLiveRegion(view.container)).toHaveTextContent('');
    });

    test('handleScroll is safe when visible range is empty or measure is missing', () => {
      const { view } = renderScrollCalendar();
      const virtualizer = mockVirtualizerInstance;
      jest.spyOn(virtualizer, 'getVirtualItems').mockReturnValue([]);
      const originalMeasure = virtualizer.measure;
      virtualizer.measure = undefined;
      const scrollContainer = findScrollContainer(view.container);

      expect(() => {
        fireEvent.scroll(scrollContainer);
      }).not.toThrow();

      virtualizer.measure = originalMeasure;
    });

    test('scroll virtualization renders only the current virtual window and can move back', () => {
      const { view } = renderScrollCalendar({
        scroll: { enabled: true, monthHeight: 240, longMonthHeight: 280, calendarHeight: 420 },
        minDate: new Date(1900, 0, 1),
        maxDate: new Date(2019, 11, 31),
        shownDate: new Date(1900, 0, 15),
        showMonthAndYearPickers: false,
      });

      expect(visibleMonthLabels(view.container)).toEqual(['Jan 1900', 'Feb 1900']);

      act(() => {
        mockVirtualizerInstance.setVisibleRange([120, 121]);
      });

      expect(visibleMonthLabels(view.container)).toEqual(['Jan 1910', 'Feb 1910']);
      expect(view.container.querySelectorAll('.rdrMonth')).toHaveLength(2);

      act(() => {
        mockVirtualizerInstance.setVisibleRange([0, 1]);
      });

      expect(visibleMonthLabels(view.container)).toEqual(['Jan 1900', 'Feb 1900']);
      expect(view.container.querySelectorAll('.rdrMonth')).toHaveLength(2);
    });

    test('scroll focus timer is cleaned up on unmount', () => {
      const { view } = renderScrollCalendar();

      view.unmount();

      expect(() => {
        act(() => {
          jest.runOnlyPendingTimers();
        });
      }).not.toThrow();
    });
  });

  describe('REQ-UBF-003 / #607: disabledDates array guard', () => {
    test('null disabledDates does not crash Month.some()', () => {
      expect(() =>
        renderCalendar({
          shownDate: new Date(2025, 5, 1),
          disabledDates: null,
        })
      ).not.toThrow();

      const dayCells = calendarDayButtons();
      expect(dayCells.length).toBeGreaterThanOrEqual(35);
      expect(dayCells.length).toBeLessThanOrEqual(42);
    });

    test('single-Date disabledDates does not crash Month.some()', () => {
      expect(() =>
        renderCalendar({
          shownDate: new Date(2025, 5, 1),
          disabledDates: new Date(2025, 5, 18),
        })
      ).not.toThrow();

      const dayCells = calendarDayButtons();
      expect(dayCells.length).toBeGreaterThanOrEqual(35);
      // Single Date treated as "no disabled dates" — day 18 is NOT disabled
      const day18 = findCalendarDayButton(18);
      expect(day18).toBeDefined();
      expect(day18.tabIndex).not.toBe(-1);
    });

    test('valid array disabledDates marks the right day', () => {
      renderCalendar({
        shownDate: new Date(2025, 5, 1),
        disabledDates: [new Date(2025, 5, 18)],
      });

      const disabledDay = findCalendarDayButton(18);
      expect(disabledDay).toBeDefined();
      expect(disabledDay.tabIndex).toBe(-1);

      // Non-disabled date is reachable and interactive
      const activeDay = findCalendarDayButton(10);
      expect(activeDay).toBeDefined();
      expect(activeDay.tabIndex).not.toBe(-1);
    });
  });

  describe('keyboard navigation (REQ-CG-005)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 5, 15));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const navBaseProps = {
      shownDate: new Date(2025, 5, 15),
      minDate: new Date(2025, 5, 1),
      maxDate: new Date(2025, 5, 30),
      direction: 'vertical',
      showMonthAndYearPickers: false,
      showDateDisplay: false,
    };

    test('ArrowLeft on a focused day moves focus to the previous day', () => {
      renderCalendar(navBaseProps);
      const day15 = findDayButton(15);
      day15.focus();
      expect(document.activeElement).toBe(day15);

      fireEvent.keyDown(day15, { key: 'ArrowLeft' });
      expect(document.activeElement).not.toBe(day15);
      expect(document.activeElement.textContent).toBe('14');
    });

    test('date keyboard navigation still works when all header chrome is hidden', () => {
      const { container } = renderCalendar({
        ...navBaseProps,
        headerConfig: { month: false, year: false, navigation: false },
      });
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'ArrowRight' });

      expect(container.querySelector('.rdrMonthAndYearWrapper')).toBeNull();
      expect(document.activeElement.textContent).toBe('16');
    });

    test('ArrowRight on a focused day moves focus to the next day', () => {
      renderCalendar(navBaseProps);
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'ArrowRight' });
      expect(document.activeElement.textContent).toBe('16');
    });

    test('ArrowUp moves focus to the same weekday in the previous week (−7 days)', () => {
      renderCalendar(navBaseProps);
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'ArrowUp' });
      expect(document.activeElement.textContent).toBe('8');
    });

    test('ArrowDown moves focus to the same weekday in the next week (+7 days)', () => {
      renderCalendar(navBaseProps);
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'ArrowDown' });
      expect(document.activeElement.textContent).toBe('22');
    });

    test('PageUp moves focus to the same day-of-month in the previous month', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 6, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 11, 31),
      });
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'PageUp' });
      // In June, day 15 should exist
      expect(document.activeElement.textContent).toBe('15');
    });

    test('PageDown moves focus to the same day-of-month in the next month', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 11, 31),
      });
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'PageDown' });
      // Moves to July 15 — should be focusable (not disabled)
      const newFocused = document.activeElement;
      expect(newFocused).toBeTruthy();
      expect(newFocused.textContent).toBe('15');
    });

    test('Shift+PageUp moves focus to the same day-of-month in the previous year', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
      });
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'PageUp', shiftKey: true });
      // Moves to June 15, 2024 — should exist
      expect(document.activeElement.textContent).toBe('15');
    });

    test('Shift+PageDown moves focus to the same day-of-month in the next year', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2026, 11, 31),
      });
      const day15 = findDayButton(15);
      day15.focus();

      fireEvent.keyDown(day15, { key: 'PageDown', shiftKey: true });
      expect(document.activeElement.textContent).toBe('15');
    });

    test('focus does not move outside minDate/maxDate boundaries', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 5, 1),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 15),
      });
      const day1 = findDayButton(1);
      day1.focus();

      // ArrowLeft should be clamped to minDate (June 1)
      fireEvent.keyDown(day1, { key: 'ArrowLeft' });
      expect(document.activeElement.textContent).toBe('1');
    });

    test('focus does not move beyond maxDate', () => {
      renderCalendar({
        ...navBaseProps,
        shownDate: new Date(2025, 5, 15),
        minDate: new Date(2025, 5, 1),
        maxDate: new Date(2025, 5, 15),
      });
      const day15 = findDayButton(15);
      day15.focus();

      // ArrowRight at max boundary should stay at day 15
      fireEvent.keyDown(day15, { key: 'ArrowRight' });
      expect(document.activeElement.textContent).toBe('15');
    });

    test('Enter keyDown/keyUp still triggers onChange (regression guard)', () => {
      const onChange = jest.fn();
      renderCalendar({
        ...navBaseProps,
        displayMode: 'date',
        date: new Date(2025, 5, 15),
        onChange,
      });
      const day20 = findDayButton(20);

      fireEvent.keyDown(day20, { key: 'Enter', keyCode: 13 });
      fireEvent.keyUp(day20, { key: 'Enter', keyCode: 13 });

      expectSameDay(onChange.mock.calls[0][0], new Date(2025, 5, 20));
    });
  });

  describe('ARIA roles and states (REQ-CG-006)', () => {
    const ariaBaseProps = {
      shownDate: new Date(2025, 5, 15),
      minDate: new Date(2025, 5, 1),
      maxDate: new Date(2025, 5, 30),
      direction: 'vertical',
      showMonthAndYearPickers: false,
      showDateDisplay: false,
    };

    test('calendar root exposes role="grid"', () => {
      const { container } = renderCalendar(ariaBaseProps);
      const grid = container.querySelector('[role="grid"]');
      expect(grid).toBeInTheDocument();
    });

    test('calendar grid exposes default accessible name and role description', () => {
      renderCalendar(ariaBaseProps);

      const grid = screen.getByRole('grid', { name: 'Calendar' });
      expect(grid).toHaveAttribute('aria-roledescription', 'month grid');
    });

    test('calendar grid uses custom accessible name and role description', () => {
      renderCalendar({
        ...ariaBaseProps,
        ariaLabels: {
          ...baseProps.ariaLabels,
          calendar: 'Calendrier',
          calendarRoleDescription: 'grille mensuelle',
        },
      });

      const grid = screen.getByRole('grid', { name: 'Calendrier' });
      expect(grid).toHaveAttribute('aria-roledescription', 'grille mensuelle');
    });

    test('calendar grid name remains distinct from DateDisplay labels', () => {
      renderCalendar({
        ...ariaBaseProps,
        showDateDisplay: true,
        ariaLabels: {
          ...baseProps.ariaLabels,
          dateDisplay: 'Selected dates',
        },
      });

      expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();
      expect(screen.queryByRole('grid', { name: 'Selected dates' })).not.toBeInTheDocument();
      expect(mockDateDisplayProps.ariaLabels.dateDisplay).toBe('Selected dates');
    });

    test('each day cell exposes role="gridcell"', () => {
      renderCalendar(ariaBaseProps);
      const cells = calendarDayButtons();
      expect(cells.length).toBeGreaterThan(28);
      cells.forEach(cell => {
        expect(cell).toHaveAttribute('role', 'gridcell');
      });
    });

    test('disabled day cells expose aria-disabled="true"', () => {
      renderCalendar({
        ...ariaBaseProps,
        disabledDates: [new Date(2025, 5, 18)],
      });
      const disabledDay = findCalendarDayButton(18);
      expect(disabledDay).toBeDefined();
      expect(disabledDay).toHaveAttribute('aria-disabled', 'true');
    });

    test('selected day cell exposes aria-selected="true" in date mode', () => {
      renderCalendar({
        ...ariaBaseProps,
        displayMode: 'date',
        date: new Date(2025, 5, 15),
      });
      const selectedDay = findCalendarDayButton(15);
      expect(selectedDay).toHaveAttribute('aria-selected', 'true');
    });

    test('today exposes aria-current="date"', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 5, 15));
      renderCalendar(ariaBaseProps);
      const todayCell = calendarDayButtons().find(btn => btn.textContent === '15');
      expect(todayCell).toHaveAttribute('aria-current', 'date');
      jest.useRealTimers();
    });
  });

  describe('DateDisplay delegation', () => {
    const min = new Date(2025, 0, 1);
    const max = new Date(2025, 11, 31);
    const disabled = [new Date(2025, 6, 4)];

    test('renders DateDisplay with constraints propagated', () => {
      const onRangeFocusChange = jest.fn();
      renderCalendar({
        showDateDisplay: true,
        minDate: min,
        maxDate: max,
        disabledDates: disabled,
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
        onRangeFocusChange,
      });

      expect(screen.getByTestId('date-display')).toBeInTheDocument();
      expect(mockDateDisplayProps.minDate).toBe(min);
      expect(mockDateDisplayProps.maxDate).toBe(max);
      expect(mockDateDisplayProps.disabledDates).toBe(disabled);
      expect(mockDateDisplayProps.ranges).toEqual([
        { startDate: null, endDate: null, key: 'selection' },
      ]);
      expect(mockDateDisplayProps.onRangeFocusChange).toEqual(expect.any(Function));
      expect(mockDateDisplayProps.styles.calendarWrapper).toBe('rdrCalendarWrapper');
      expect(mockDateDisplayProps.dateOptions.locale).toBe(enUS);

      act(() => {
        mockDateDisplayProps.onRangeFocusChange(0, 1);
      });

      expect(onRangeFocusChange).toHaveBeenCalledWith([0, 1]);
    });

    test('forwards uiSlots to DateDisplay', () => {
      const uiSlots = { dateDisplay: { className: 'host-date-display' } };
      renderCalendar({ showDateDisplay: true, uiSlots });

      expect(mockDateDisplayProps.uiSlots).toBe(uiSlots);
    });

    test('DateDisplay onChange forwards selected date through Calendar selection handler', () => {
      const onChange = jest.fn();
      const view = renderCalendar({
        displayMode: 'date',
        showDateDisplay: false,
        onChange,
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
      });

      expect(screen.queryByTestId('date-display')).not.toBeInTheDocument();

      rerenderCalendar(view, {
        showDateDisplay: true,
        displayMode: 'date',
        onChange,
        ranges: [{ startDate: null, endDate: null, key: 'selection' }],
      });

      act(() => {
        mockDateDisplayProps.onChange(new Date(2025, 6, 4));
      });

      expectSameDay(onChange.mock.calls[0][0], new Date(2025, 6, 4));
    });
  });
});
