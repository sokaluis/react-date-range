# Controlled State

Manage `<DateRangePicker />` state from a parent component using the `ranges` + `onChange` pattern.

```tsx
import { useState } from 'react';
import { DateRangePicker } from '@cyberlz/react-date-range';
import type { Range } from '@cyberlz/react-date-range';

export default function MyPage() {
  const [ranges, setRanges] = useState<Range[]>([{
    startDate: undefined,
    endDate: undefined,
    key: 'selection',
  }]);

  return (
    <DateRangePicker
      ranges={ranges}
      onChange={(rangesByKey) => setRanges([rangesByKey.selection])}
    />
  );
}
```

**Gotcha:** The `key` (`'selection'` here) must match the key the component uses internally. If you use a different key, `rangesByKey` will not contain the expected entry because the component writes the active selection under the same key it reads from `ranges`.

See also: [evaluation-guide](../evaluation-guide.md)
