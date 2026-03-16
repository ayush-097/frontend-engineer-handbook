# Lab: Virtual Scroll List

Build a virtualized list that smoothly handles 50,000+ items at 60fps.

## Objectives
- Implement FixedSizeList for uniform height items
- Implement VariableSizeList for dynamic heights
- Add infinite scroll with React Query
- Measure scroll performance (should stay at 60fps)

## Tasks

### 1. Fixed Size List (10,000 items)
```tsx
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={600}
  itemCount={10000}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style} className="item">
      Item {index}
    </div>
  )}
</FixedSizeList>
```

### 2. Variable Size List
Items with dynamic height (collapsed: 50px, expanded: 200px)

### 3. Infinite Scroll
Load next page when scrolled near bottom

### 4. Performance Test
Record Chrome Performance profile, verify 60fps scrolling

**Time:** 3-4 hours  
**Deliverable:** Working demo + performance profile screenshot
