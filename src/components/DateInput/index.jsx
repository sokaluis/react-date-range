import React, { useCallback, useEffect, useState } from 'react';
import classnames from 'classnames';
import { format, parse, isValid, startOfDay, endOfDay, isAfter, isBefore, isSameDay } from 'date-fns';

function DateInput(props) {
  const {
    className,
    readOnly = true,
    placeholder,
    ariaLabel,
    disabled = false,
    onFocus,
    value,
    dateDisplayFormat = 'MMM D, YYYY',
    dateOptions,
    onChange,
    minDate,
    maxDate,
    disabledDates = [],
  } = props;

  const [invalid, setInvalid] = useState(false);
  const [changed, setChanged] = useState(false);

  // Lazy initializer: formatDate runs once on mount (Spec Risk #6 — arrow wrapper)
  const [inputValue, setInputValue] = useState(() =>
    formatDate({ value, dateDisplayFormat, dateOptions })
  );

  function formatDate({ value: v, dateDisplayFormat: fmt, dateOptions: opts }) {
    if (v && isValid(v)) {
      return format(v, fmt, opts);
    }
    return '';
  }

  // Controlled-sync effect: re-format when external props.value changes,
  // but skip if user is mid-edit (changed flag — REQ-HM-003, Spec Risk #1).
  // We intentionally call setInputValue inside this effect because the
  // controlled-input pattern requires syncing state from props. The changed
  // guard prevents clobbering user mid-typing on parent re-renders.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (changed) {
      return;
    }
    setInputValue(formatDate({ value, dateDisplayFormat, dateOptions }));
  }, [value, dateDisplayFormat, dateOptions, changed]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isWithinConstraints = useCallback(
    (parsed) => {
      if (minDate && isBefore(startOfDay(parsed), startOfDay(minDate))) {
        return false;
      }
      if (maxDate && isAfter(endOfDay(parsed), endOfDay(maxDate))) {
        return false;
      }
      if (disabledDates.some(d => isSameDay(d, parsed))) {
        return false;
      }
      return true;
    },
    [minDate, maxDate, disabledDates]
  );

  const update = useCallback(
    (val) => {
      if (invalid || !changed || !val) {
        return;
      }

      const parsed = parse(val, dateDisplayFormat, new Date(), dateOptions);

      if (isValid(parsed)) {
        if (isWithinConstraints(parsed)) {
          setChanged(false);
          // Spec Risk #2: onChange after setChanged — React 18+ batches both,
          // so parent reading changed synchronously sees stale value. Acceptable.
          onChange(parsed);
        } else {
          setInvalid(true);
        }
      } else {
        setInvalid(true);
      }
    },
    [invalid, changed, dateDisplayFormat, dateOptions, onChange, isWithinConstraints]
  );

  return (
    <span className={classnames('rdrDateInput', className)}>
      <input
        readOnly={readOnly}
        disabled={disabled}
        value={inputValue}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            update(inputValue);
          }
        }}
        onChange={e => {
          setInputValue(e.target.value);
          setChanged(true);
          setInvalid(false);
        }}
        onBlur={() => update(inputValue)}
        onFocus={onFocus}
      />
      {invalid && <span className="rdrWarning">&#9888;</span>}
    </span>
  );
}

export default DateInput;
