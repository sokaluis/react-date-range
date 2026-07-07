import React, { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import classnames from 'classnames';
import { format as formatDate, isValid } from 'date-fns';
import DateRange from '../DateRange';
import defaultStyles from '../../styles';
import usePopover from '../../hooks/usePopover';

const defaultFormat = 'yyyy-MM-dd';
const defaultRangeKey = 'selection';
const defaultTriggerLabel = 'Select date range';
const defaultPopoverLabel = 'Select date range';

const canUseDocument = () => typeof document !== 'undefined';
const canUseWindow = () => typeof window !== 'undefined';

const isUsableDate = date => date instanceof Date && isValid(date);

const formatRange = (range, dateFormat, formatter, dateOptions) => {
  if (formatter) {
    return formatter({ startDate: range.startDate, endDate: range.endDate });
  }

  if (!isUsableDate(range.startDate) || !isUsableDate(range.endDate)) {
    return '';
  }

  return `${formatDate(range.startDate, dateFormat, dateOptions)} – ${formatDate(range.endDate, dateFormat, dateOptions)}`;
};

function DateRangeInput(props, ref) {
  const {
    ranges,
    onChange,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    closeOnEndSelection = true,
    triggerPlaceholder,
    formatter,
    format = defaultFormat,
    rangeKey = defaultRangeKey,
    calendarProps = {},
    popoverLabel = defaultPopoverLabel,
    ariaLabels = {},
    disabled = false,
    classNames = {},
    className,
    dir,
  } = props;
  const popoverId = useId();
  const focusedRangeRef = useRef([0, 0]);
  const [mounted, setMounted] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState(undefined);
  const styles = useMemo(
    () => ({ ...defaultStyles, ...calendarProps.classNames, ...classNames }),
    [calendarProps.classNames, classNames]
  );
  const dateOptions = calendarProps.locale ? { locale: calendarProps.locale } : undefined;
  const normalizedRanges = useMemo(() => {
    const firstRange = ranges?.[0];
    return [{ ...firstRange, key: firstRange?.key || rangeKey }];
  }, [ranges, rangeKey]);
  const displayValue = formatRange(normalizedRanges[0], format, formatter, dateOptions);
  const { open, setOpen, toggleOpen, triggerRef, popoverRef } = usePopover({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && ranges && ranges.length > 1) {
      console.warn('DateRangeInput supports a single range; extra ranges are ignored.');
    }
  }, [ranges]);

  useEffect(() => {
    if (!open || !canUseWindow()) {
      setPopoverStyle(undefined);
      return;
    }

    const triggerRect = triggerRef.current?.getBoundingClientRect();
    if (!triggerRect) {
      return;
    }

    setPopoverStyle({
      top: triggerRect.bottom + window.scrollY,
      left: triggerRect.left + window.scrollX,
      minWidth: triggerRect.width,
    });
  }, [open, triggerRef]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => triggerRef.current?.focus(),
      getTriggerEl: () => triggerRef.current,
    }),
    [triggerRef]
  );

  const onTriggerClick = () => {
    if (!disabled) {
      toggleOpen();
    }
  };

  const onTriggerKeyDown = event => {
    if (disabled || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    toggleOpen();
  };

  const onRangeChange = nextRangesByKey => {
    const selectionKey = normalizedRanges[0].key || rangeKey;
    const nextRange = nextRangesByKey[selectionKey];
    onChange?.(nextRangesByKey);

    if (!closeOnEndSelection || !nextRange) {
      return;
    }

    const selectingEnd = focusedRangeRef.current[1] === 1;
    const completedDragRange =
      focusedRangeRef.current[1] === 0 &&
      !isUsableDate(normalizedRanges[0].endDate) &&
      isUsableDate(nextRange.startDate) &&
      isUsableDate(nextRange.endDate) &&
      nextRange.startDate.getTime() !== nextRange.endDate.getTime();

    if (selectingEnd || completedDragRange) {
      setOpen(false);
    }
  };

  const onRangeFocusChange = focusedRange => {
    focusedRangeRef.current = focusedRange;
    calendarProps.onRangeFocusChange?.(focusedRange);
  };

  const popover = open ? (
    <div
      ref={popoverRef}
      id={popoverId}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabels.popover || popoverLabel}
      className={styles.dateRangeInputPopover}
      style={popoverStyle}
      dir={dir}
    >
      <DateRange
        {...calendarProps}
        ranges={normalizedRanges}
        onChange={onRangeChange}
        onRangeFocusChange={onRangeFocusChange}
        classNames={styles}
        dir={dir || calendarProps.dir}
      />
    </div>
  ) : null;

  return (
    <span className={classnames(styles.dateRangeInputWrapper, className)} dir={dir}>
      <input
        ref={triggerRef}
        type="text"
        readOnly
        disabled={disabled}
        value={displayValue}
        placeholder={triggerPlaceholder}
        aria-label={ariaLabels.trigger || defaultTriggerLabel}
        aria-haspopup="dialog"
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={popoverId}
        className={styles.dateRangeInputTrigger}
        onClick={onTriggerClick}
        onKeyDown={onTriggerKeyDown}
        onChange={() => {}}
      />
      {mounted && canUseDocument() ? createPortal(popover, document.body) : popover}
    </span>
  );
}

export default forwardRef(DateRangeInput);
