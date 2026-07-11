# RTL

Use `dir="rtl"` when the picker should render inside a right-to-left layout.

```tsx
import { useState } from 'react';
import { DateRangePicker } from '@cyberlz/react-date-range';
import type { Range } from '@cyberlz/react-date-range';

export default function RtlRangePicker() {
  const [ranges, setRanges] = useState<Range[]>([{
    startDate: undefined,
    endDate: undefined,
    key: 'selection',
  }]);

  return (
    <section dir="rtl" lang="ar">
      <DateRangePicker
        dir="rtl"
        ranges={ranges}
        onChange={(rangesByKey) => setRanges([rangesByKey.selection])}
      />
    </section>
  );
}
```

**Gotcha:** `dir` controls text direction. It does not translate labels or change date formatting by itself, so pair it with your app's i18n and `date-fns` locale setup.

See also: [evaluation-guide](../evaluation-guide.md)
