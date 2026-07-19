import styles from './styles';

describe('core style map responsive keys', () => {
  test('exposes opt-in responsive wrapper class hooks', () => {
    expect(styles.calendarWrapperResponsive).toBe('rdrCalendarWrapperResponsive');
    expect(styles.dateRangePickerWrapperResponsive).toBe('rdrDateRangePickerWrapperResponsive');
  });
});
