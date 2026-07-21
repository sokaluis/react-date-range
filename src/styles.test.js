import styles from './styles';

describe('core style map', () => {
  test('exposes responsive wrapper class hooks', () => {
    expect(styles.calendarWrapperResponsive).toBe('rdrCalendarWrapperResponsive');
    expect(styles.dateRangePickerWrapperResponsive).toBe('rdrDateRangePickerWrapperResponsive');
  });

  test('exposes fluid width-mode wrapper class', () => {
    expect(styles.dateRangePickerWrapperFluid).toBe('rdrDateRangePickerWrapperFluid');
  });

  test('exposes fluid calendar wrapper class hook', () => {
    expect(styles.calendarWrapperFluid).toBe('rdrCalendarWrapperFluid');
  });

  test('exposes input modal class hooks', () => {
    expect(styles.datePickerInputPopoverModal).toBe('rdrDatePickerInputPopoverModal');
    expect(styles.dateRangeInputPopoverModal).toBe('rdrDateRangeInputPopoverModal');
  });
});
