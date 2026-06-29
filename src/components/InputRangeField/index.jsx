import React, { useCallback } from 'react';

const MIN = 0;
const MAX = 99999;

const InputRangeField = React.memo(
  function InputRangeField({
    value = '',
    label,
    placeholder = '-',
    styles,
    onBlur,
    onFocus,
    onChange,
  }) {
    const handleChange = useCallback(e => {
      let value = parseInt(e.target.value, 10);
      value = isNaN(value) ? 0 : Math.max(Math.min(MAX, value), MIN);

      onChange(value);
    }, [onChange]);

    return (
      <div className={styles.inputRange}>
        <input
          className={styles.inputRangeInput}
          placeholder={placeholder}
          value={value}
          min={MIN}
          max={MAX}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <span className={styles.inputRangeLabel}>{label}</span>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.value === nextProps.value &&
    prevProps.label === nextProps.label &&
    prevProps.placeholder === nextProps.placeholder
);

InputRangeField.displayName = 'InputRangeField';

export default InputRangeField;
