This component extends all the props of **[Calendar](#calendar)** component. In addition to those props, it has the following props: 

| Prop Name  |  Type |
|---|---|
|  **moveRangeOnFirstSelection** |  boolean |
|  **retainEndDateOnFirstSelection** |  boolean |
|  **onRangeFocusChange** |  function |
|  **rangeColors**  |  array |
|  **ranges**  |  array |

#### Accessibility: Selection Live Region

`DateRange` announces committed range selections through a polite, atomic live region after the component normalizes the selected range. Hover, preview, and drag-move updates stay visual only and do not announce.

Customize the announcement with `ariaLabels.liveRegionSelection`:

```jsx inside Markdown
<DateRange
  onChange={item => setState([item.selection])}
  ranges={state}
  ariaLabels={{
    liveRegionSelection: ({ startDate, endDate }) =>
      `Selected from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
  }}
/>
```


#### Example: Editable Date Inputs
```jsx inside Markdown
import {useState} from 'react'
const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: 'selection'
    }
  ]);
  
<DateRange
  editableDateInputs={true}
  onChange={item => setState([item.selection])}
  moveRangeOnFirstSelection={false}
  ranges={state}
/>
```
