# Static Presets

Replace the default sidebar presets with app-specific ranges.

```tsx
import { useState } from 'react';
import { addDays, isSameDay } from 'date-fns';
import { DateRangePicker, createStaticRanges } from '@cyberlz/react-date-range';
import type { Range } from '@cyberlz/react-date-range';

const presets = createStaticRanges([
  {
    label: 'Next 7 days',
    range: () => ({ startDate: new Date(), endDate: addDays(new Date(), 6) }),
    isSelected: (range) =>
      isSameDay(range.startDate!, new Date()) &&
      isSameDay(range.endDate!, addDays(new Date(), 6)),
  },
]);

export default function BookingRange() {
  const [ranges, setRanges] = useState<Range[]>([{ key: 'selection' }]);

  return (
    <DateRangePicker
      ranges={ranges}
      staticRanges={presets}
      inputRanges={[]}
      onChange={(rangesByKey) => setRanges([rangesByKey.selection])}
    />
  );
}
```

**Gotcha:** `staticRanges` replaces the default presets. Pass `inputRanges={[]}` only if you also want to hide the default numeric inputs.

See also: [evaluation-guide](../evaluation-guide.md)
