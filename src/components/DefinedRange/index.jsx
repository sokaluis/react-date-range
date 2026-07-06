import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import styles from '../../styles';
import { defaultInputRanges, defaultStaticRanges } from '../../defaultRanges';
import InputRangeField from '../InputRangeField';
import cx from 'classnames';

const getSelectedRange = (ranges, staticRange, props) => {
  const focusedRangeIndex = ranges.findIndex(range => {
    if (!range.startDate || !range.endDate || range.disabled) return false;
    return staticRange.isSelected(range, props);
  });
  const selectedRange = ranges[focusedRangeIndex];
  return { selectedRange, focusedRangeIndex };
};

const DefinedRange = forwardRef((props, ref) => {
  const {
    headerContent,
    footerContent,
    onPreviewChange,
    inputRanges = defaultInputRanges,
    staticRanges = defaultStaticRanges,
    ranges = [],
    focusedRange = [0, 0],
    renderStaticRangeLabel,
    rangeColors = ['#3d91ff', '#3ecf8e', '#fed14c'],
    className,
    onChange,
  } = props;
  const [, setRangeOffset] = useState(0);
  const [, setFocusedInput] = useState(-1);

  useImperativeHandle(ref, () => ({}), []);

  const handleRangeChange = useCallback(
    range => {
      const selectedRange = ranges[focusedRange[0]];
      if (!onChange || !selectedRange) return;
      onChange({
        [selectedRange.key || `range${focusedRange[0] + 1}`]: { ...selectedRange, ...range },
      });
    },
    [focusedRange, onChange, ranges]
  );

  const getRangeOptionValue = useCallback(
    option => {
      if (typeof option.getCurrentValue !== 'function') {
        return '';
      }

      const selectedRange = ranges[focusedRange[0]] || {};
      return option.getCurrentValue(selectedRange) || '';
    },
    [focusedRange, ranges]
  );

  return (
    <div className={cx(styles.definedRangesWrapper, className)}>
      {headerContent}
      <div className={styles.staticRanges}>
        {staticRanges.map((staticRange, i) => {
          const { selectedRange, focusedRangeIndex } = getSelectedRange(ranges, staticRange, props);
          let labelContent;

          if (staticRange.hasCustomRendering) {
            labelContent = renderStaticRangeLabel(staticRange);
          } else {
            labelContent = staticRange.label;
          }

          return (
            <button
              type="button"
              aria-pressed={Boolean(selectedRange)}
              className={cx(styles.staticRange, {
                [styles.staticRangeSelected]: Boolean(selectedRange),
              })}
              style={{
                color: selectedRange ? selectedRange.color || rangeColors[focusedRangeIndex] : null,
              }}
              key={i}
              onClick={() => handleRangeChange(staticRange.range(props))}
              onFocus={() => onPreviewChange && onPreviewChange(staticRange.range(props))}
              onMouseOver={() => onPreviewChange && onPreviewChange(staticRange.range(props))}
              onMouseLeave={() => {
                onPreviewChange && onPreviewChange();
              }}>
              <span tabIndex={-1} className={styles.staticRangeLabel}>
                {labelContent}
              </span>
            </button>
          );
        })}
      </div>
      <div className={styles.inputRanges}>
        {inputRanges.map((rangeOption, i) => (
          <InputRangeField
            key={i}
            styles={styles}
            label={rangeOption.label}
            onFocus={() => {
              setFocusedInput(i);
              setRangeOffset(0);
            }}
            onBlur={() => setRangeOffset(0)}
            onChange={value => handleRangeChange(rangeOption.range(value, props))}
            value={getRangeOptionValue(rangeOption)}
          />
        ))}
      </div>
      {footerContent}
    </div>
  );
});

DefinedRange.displayName = 'DefinedRange';

export default DefinedRange;
