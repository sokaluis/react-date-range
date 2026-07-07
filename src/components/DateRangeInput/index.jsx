import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
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

const formatRange = (range, dateFormat, formatter, dateOptions) => {
  if (formatter) {
    return formatter({ startDate: range.startDate, endDate: range.endDate });
  }

  if (!range.startDate || !range.endDate || !isValid(range.startDate) || !isValid(range.endDate)) {
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
    onChange?.(nextRangesByKey);
  };

  const popover = open ? (
    <div
      ref={popoverRef}
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
