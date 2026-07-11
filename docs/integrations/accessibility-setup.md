# Accessibility Setup

Pass `ariaLabels` and range `label` values when the default copy is not specific enough for your flow.

```tsx
import { DateRangePicker } from '@cyberlz/react-date-range';

export default function AccessibleRangePicker() {
  return (
    <DateRangePicker
      ranges={[{
        startDate: undefined,
        endDate: undefined,
        key: 'booking',
        label: 'Booking dates',
      }]}
      ariaLabels={{
        dateRangePicker: 'Booking date range picker',
        prevButton: 'Previous month',
        nextButton: 'Next month',
        dateInput: {
          booking: {
            startDate: 'Booking start date',
            endDate: 'Booking end date',
          },
        },
      }}
    />
  );
}
```

**Gotcha:** `dateInput` keys must match your range `key`. If the range key is `booking`, put its input labels under `ariaLabels.dateInput.booking`.

See also: [evaluation-guide](../evaluation-guide.md)
