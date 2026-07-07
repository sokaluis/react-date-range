import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import classnames from 'classnames';
import { format, isValid } from 'date-fns';
import Calendar from '../Calendar';
import defaultStyles from '../../styles';
import usePopover from './usePopover';

const defaultDateDisplayFormat = 'MMM d, yyyy';
const defaultAriaLabel = 'Select date';
const defaultPopoverLabel = 'Choose date';

const canUseDocument = () => typeof document !== 'undefined';
const canUseWindow = () => typeof window !== 'undefined';

const formatDate = (date, dateDisplayFormat, dateOptions) =>
  date && isValid(date) ? format(date, dateDisplayFormat, dateOptions) : '';

function DatePickerInput(props, ref) {
  const {
    date,
    onChange,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    dateDisplayFormat = defaultDateDisplayFormat,
    ariaLabel = defaultAriaLabel,
    popoverLabel = defaultPopoverLabel,
    placeholder,
    disabled = false,
    calendarProps = {},
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

  const onCalendarChange = nextDate => {
    onChange?.(nextDate);
    setOpen(false);
  };

  const popover = open ? (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      aria-label={popoverLabel}
      className={styles.datePickerInputPopover}
      style={popoverStyle}
      dir={dir}
    >
      <Calendar
        {...calendarProps}
        date={date || undefined}
        dateDisplayFormat={dateDisplayFormat}
        onChange={onCalendarChange}
        classNames={styles}
        dir={dir || calendarProps.dir}
      />
    </div>
  ) : null;

  return (
    <span className={classnames(styles.datePickerInputWrapper, className)} dir={dir}>
      <input
        ref={triggerRef}
        type="text"
        readOnly
        disabled={disabled}
        value={formatDate(date, dateDisplayFormat, dateOptions)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open ? 'true' : 'false'}
        className={styles.datePickerInputTrigger}
        onClick={onTriggerClick}
        onKeyDown={onTriggerKeyDown}
        onChange={() => {}}
      />
      {mounted && canUseDocument() ? createPortal(popover, document.body) : popover}
    </span>
  );
}

export default forwardRef(DatePickerInput);
