import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import DateRange from '../DateRange';
import DefinedRange from '../DefinedRange';
import { findNextRangeIndex, generateStyles } from '../../utils';
import classnames from 'classnames';
import coreStyles, { getUiSlotClassName, mergeUiSlotStyles, omitUiSlotKeys } from '../../styles';

const DateRangePicker = forwardRef(function DateRangePicker(props, ref) {
  const dateRangeRef = useRef(null);
  const [focusedRangeState, setFocusedRangeState] = useState(() => [findNextRangeIndex(props.ranges), 0]);
  const focusedRange = props.focusedRange || focusedRangeState;
  const styles = useMemo(() => generateStyles([coreStyles, props.classNames]), [props.classNames]);
  const dateRangeUiSlots = useMemo(
    () => omitUiSlotKeys(props.uiSlots, ['root', 'definedRanges']),
    [props.uiSlots]
  );
  const regionProps = props.ariaLabels?.dateRangePicker === false ? {} : {
    role: 'region',
    'aria-label': props.ariaLabels?.dateRangePicker || 'Date range picker',
  };

  useImperativeHandle(ref, () => ({}), []);

  const handlePreviewChange = useCallback(
    value => {
      if (!dateRangeRef.current) return;
      dateRangeRef.current.updatePreview(
        value ? dateRangeRef.current.calcNewSelection(value, typeof value === 'string') : null
      );
      props.onPreviewChange && props.onPreviewChange(value);
    },
    [props]
  );

  const handleRangeFocusChange = useCallback(
    focusedRange => {
      setFocusedRangeState(focusedRange);
      props.onRangeFocusChange && props.onRangeFocusChange(focusedRange);
    },
    [props]
  );

  return (
    <div
      dir={props.dir}
      className={classnames(
        styles.dateRangePickerWrapper,
        props.dir === 'rtl' && (props.classNames?.rtl ?? styles.rtl),
        getUiSlotClassName(props.uiSlots, 'root'),
        props.className
      )}
      style={mergeUiSlotStyles(props.style, props.uiSlots, 'root')}
      {...regionProps}
    >
      <DefinedRange
        {...props}
        focusedRange={focusedRange}
        onPreviewChange={handlePreviewChange}
        range={props.ranges[focusedRange[0]]}
        className={getUiSlotClassName(props.uiSlots, 'definedRanges')}
        style={mergeUiSlotStyles(undefined, props.uiSlots, 'definedRanges')}
      />
      <DateRange
        {...props}
        uiSlots={dateRangeUiSlots}
        onRangeFocusChange={handleRangeFocusChange}
        focusedRange={focusedRange}
        ref={dateRangeRef}
        className={undefined}
        style={undefined}
      />
    </div>
  );
});

export default DateRangePicker;
