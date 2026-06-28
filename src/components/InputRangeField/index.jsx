import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

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

InputRangeField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.node]).isRequired,
  placeholder: PropTypes.string,
  styles: PropTypes.shape({
    inputRange: PropTypes.string,
    inputRangeInput: PropTypes.string,
    inputRangeLabel: PropTypes.string,
  }).isRequired,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default InputRangeField;
