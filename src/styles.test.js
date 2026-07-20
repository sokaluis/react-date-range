import styles from './styles';

describe('core style map', () => {
  test('exposes responsive wrapper class hooks', () => {
    expect(styles.calendarWrapperResponsive).toBe('rdrCalendarWrapperResponsive');
    expect(styles.dateRangePickerWrapperResponsive).toBe('rdrDateRangePickerWrapperResponsive');
  });

  test('exposes fluid width-mode wrapper class', () => {
    expect(styles.dateRangePickerWrapperFluid).toBe('rdrDateRangePickerWrapperFluid');
  });
});
