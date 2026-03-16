# Profiling & Debugging

## React DevTools Profiler

1. **Record interaction:**
   - Click ⭕ Record
   - Perform action (type, click, scroll)
   - Click ⭕ Stop

2. **Analyze flame chart:**
   - Each bar = component render
   - Width = time spent
   - Yellow/red = slow
   - Gray = fast

3. **Check "why did this render?":**
   - Click component in flame chart
   - See what caused re-render (props/state/parent)

## Chrome Performance Tab

1. **Record:**
   - Open DevTools → Performance
   - Click ⭕ Record
   - Interact with app
   - Click ⏹ Stop

2. **Analyze:**
   - Main thread activity (scripting, rendering, painting)
   - Long tasks (> 50ms blocks interactions)
   - Layout shifts (red bars)

## Custom Performance Marks

```tsx
performance.mark("search-start");
const results = searchData(query);
performance.mark("search-end");
performance.measure("search", "search-start", "search-end");

const measure = performance.getEntriesByName("search")[0];
console.log(`Search took ${measure.duration}ms`);
```
