# Form Submit

Wire `<DateRangePicker />` into a `<form>` and submit serializable date strings to your server.

```tsx
import { useState } from 'react';
import { DateRangePicker } from '@cyberlz/react-date-range';
import { format } from 'date-fns';

export default function MyForm() {
  const [ranges, setRanges] = useState([{ startDate: undefined, endDate: undefined }]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const [range] = ranges;
    if (!range?.startDate || !range?.endDate) return;
    const payload = {
      from: format(range.startDate, 'yyyy-MM-dd'),
      to:   format(range.endDate, 'yyyy-MM-dd'),
    };
    console.log(payload);
    // fetch('/api/range', { method: 'POST', body: JSON.stringify(payload) });
  }

  return (
    <form onSubmit={handleSubmit}>
      <DateRangePicker
        ranges={ranges}
        onChange={(rangesByKey) => setRanges([rangesByKey.selection])}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Gotcha:** `startDate` / `endDate` are `Date` objects — serialize them (e.g. `date-fns format`) before sending to a server. JSON.stringify does not round-trip `Date` objects.

See also: [evaluation-guide](../evaluation-guide.md)
