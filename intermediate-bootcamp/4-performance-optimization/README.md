# Module 4: Performance Optimization

**Duration:** 3 weeks | **Level:** Intermediate  
**Prerequisites:** React Core, State Management, Component Architecture

## Overview

Master React performance optimization: eliminate unnecessary re-renders, virtualize long lists, optimize bundles, understand Web Vitals, and use profiling tools to diagnose bottlenecks. This module teaches you to build apps that stay fast as they scale.

## Learning Objectives

By the end of this module you will be able to:

- **Identify** performance bottlenecks using React DevTools Profiler and Chrome DevTools
- **Eliminate** unnecessary re-renders with React.memo, useMemo, useCallback
- **Virtualize** long lists (10,000+ items) with react-window
- **Optimize** bundle size through code splitting, tree shaking, and compression
- **Measure** Core Web Vitals (LCP, FID, CLS) and meet Google targets
- **Debug** performance issues using flame charts and user timing API
- **Set** performance budgets and enforce them in CI/CD

## Module Structure

```
4-performance-optimization/
├── README.md
├── lecture/
│   ├── 1-rendering-performance.md    ← Re-render causes, React.memo
│   ├── 2-memoization-strategies.md   ← useMemo, useCallback, when NOT to
│   ├── 3-virtualization.md           ← react-window, infinite scroll
│   ├── 4-bundle-optimization.md      ← Code splitting, tree shaking
│   ├── 5-web-vitals.md               ← LCP, FID, CLS metrics
│   └── 6-profiling-debugging.md      ← Profiler, flame charts, performance tab
├── lab/
│   ├── virtual-scroll-list/          ← Virtualize 50k item list
│   ├── code-splitting-demo/          ← Route + component splitting
│   ├── image-optimization/           ← Lazy loading, responsive images
│   └── performance-budget/           ← Set budgets, measure metrics
├── homework/
│   ├── optimize-slow-app.md          ← Fix 10 performance issues
│   ├── bundle-analysis.md            ← Analyze bundle, reduce 30%
│   └── lighthouse-audit.md           ← Score 90+ on Lighthouse
└── tests/
    ├── performance.test.ts           ← Render performance tests
    └── bundle-size.test.js           ← Bundle size assertions
```

## Schedule

| Days | Topic | Activity |
|------|-------|----------|
| 1–3  | Rendering performance | Lecture 1–2 + memo/callback exercises |
| 4–6  | Virtualization | Lecture 3 + virtual scroll lab |
| 7–9  | Bundle optimization | Lecture 4 + code splitting lab |
| 10–12| Web Vitals | Lecture 5 + image optimization lab |
| 13–15| Profiling | Lecture 6 + performance budget lab |
| 16–21| Homework | Optimize app + bundle + Lighthouse |

## Key Concepts

### Re-render Optimization

```tsx
// ❌ Re-renders on every parent render
function TodoItem({ todo }) {
  console.log("Rendering", todo.id);
  return <li>{todo.text}</li>;
}

// ✅ Only re-renders when todo changes
const TodoItem = React.memo(function TodoItem({ todo }) {
  console.log("Rendering", todo.id);
  return <li>{todo.text}</li>;
});
```

### Virtualization

```tsx
// ❌ Renders 50,000 DOM nodes
<ul>
  {items.map(item => <li key={item.id}>{item.text}</li>)}
</ul>

// ✅ Renders only visible items (~20 DOM nodes)
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={600}
  itemCount={50000}
  itemSize={35}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>{items[index].text}</div>
  )}
</FixedSizeList>
```

### Code Splitting

```tsx
// ❌ Dashboard loaded upfront (500kb bundle)
import Dashboard from "./Dashboard";

// ✅ Dashboard loaded on route visit (dashboard.chunk.js)
const Dashboard = lazy(() => import("./Dashboard"));
```

### Web Vitals Targets

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

## Setup

```bash
npm create vite@latest perf-labs -- --template react-ts
cd perf-labs
npm install

# Performance dependencies
npm install react-window web-vitals
npm install -D lighthouse webpack-bundle-analyzer

# Profiling
npm install -D @craco/craco
```

## Assessment

- **Lab: Virtual Scroll List** — 20 pts
- **Lab: Code Splitting Demo** — 20 pts
- **Lab: Image Optimization** — 15 pts
- **Lab: Performance Budget** — 15 pts
- **Homework: Optimize Slow App** — 15 pts
- **Homework: Bundle Analysis** — 10 pts
- **Homework: Lighthouse Audit** — 5 pts

**Total: 100 pts | Pass: 70+**

## Performance Checklist

### Initial Load
- [ ] Bundle size < 200kb (gzipped)
- [ ] Time to Interactive < 3s (3G)
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s

### Runtime
- [ ] No layout shifts (CLS < 0.1)
- [ ] Smooth 60fps scrolling
- [ ] Input response < 100ms
- [ ] No unnecessary re-renders

### Resources
- [ ] Images lazy-loaded below fold
- [ ] Images properly sized (responsive)
- [ ] Fonts preloaded
- [ ] Critical CSS inlined

### Code
- [ ] Code splitting per route
- [ ] Heavy libraries lazy-loaded
- [ ] Tree shaking enabled
- [ ] Dependencies up-to-date

## Common Performance Killers

### 1. Massive Component Re-renders
```tsx
// ❌ Parent re-render → all children re-render
function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ExpensiveList /> {/* Re-renders on every click! */}
    </>
  );
}

// ✅ Memoize expensive child
const ExpensiveList = React.memo(() => {
  // Only re-renders when props change
});
```

### 2. Long Lists Without Virtualization
```tsx
// ❌ 10,000 DOM nodes
{items.map(item => <Item key={item.id} item={item} />)}

// ✅ Only ~20 DOM nodes (visible window)
<VirtualList items={items} />
```

### 3. Giant Bundles
```tsx
// ❌ 2MB initial bundle
import Chart from "chart.js";
import Moment from "moment";
import Lodash from "lodash";

// ✅ Lazy load, use smaller alternatives
const Chart = lazy(() => import("./Chart"));
import { format } from "date-fns"; // Lighter than moment
import debounce from "lodash-es/debounce"; // Just what you need
```

### 4. Unoptimized Images
```html
<!-- ❌ Full resolution for all devices -->
<img src="photo-4000x3000.jpg" width="400" />

<!-- ✅ Responsive, lazy, modern formats -->
<picture>
  <source srcset="photo-400.webp" media="(max-width: 600px)" type="image/webp" />
  <source srcset="photo-800.webp" media="(max-width: 1200px)" type="image/webp" />
  <img src="photo-400.jpg" loading="lazy" />
</picture>
```

### 5. State Updates That Cause Cascading Re-renders
```tsx
// ❌ Every keystroke updates state → re-renders list
function SearchPage() {
  const [query, setQuery] = useState("");
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <FilteredList query={query} /> {/* Re-renders 50 times typing "performance" */}
    </>
  );
}

// ✅ Debounce state updates
const [query, setQuery] = useState("");
const [debouncedQuery, setDebouncedQuery] = useState("");

useEffect(() => {
  const timer = setTimeout(() => setDebouncedQuery(query), 300);
  return () => clearTimeout(timer);
}, [query]);

<FilteredList query={debouncedQuery} /> {/* Re-renders once after typing stops */}
```

## Profiling Workflow

### 1. Identify the Problem
- Run Lighthouse audit → See where you're slow
- Chrome DevTools Performance tab → Record user interaction
- React DevTools Profiler → See which components render

### 2. Measure Baseline
```tsx
// Use performance marks
performance.mark("search-start");
// ... search logic
performance.mark("search-end");
performance.measure("search", "search-start", "search-end");
```

### 3. Fix the Issue
- Memo expensive components
- Virtualize long lists
- Split large bundles
- Optimize images

### 4. Verify Improvement
- Re-run Lighthouse → Score improved?
- Re-profile → Flame chart smaller?
- Re-measure → Marks faster?

## Performance Budget Example

```json
{
  "budgets": [
    {
      "path": "/*",
      "resourceSizes": [
        { "resourceType": "script", "budget": 200 },
        { "resourceType": "image", "budget": 300 },
        { "resourceType": "total", "budget": 500 }
      ],
      "resourceCounts": [
        { "resourceType": "script", "budget": 10 },
        { "resourceType": "third-party", "budget": 5 }
      ]
    }
  ],
  "metrics": [
    { "metric": "interactive", "budget": 3000 },
    { "metric": "first-contentful-paint", "budget": 1800 },
    { "metric": "largest-contentful-paint", "budget": 2500 }
  ]
}
```

## Tools

### Profiling
- **React DevTools Profiler** — Component render times
- **Chrome DevTools Performance** — Flame charts, main thread activity
- **Lighthouse** — Overall performance score
- **WebPageTest** — Real-world performance testing

### Bundle Analysis
- **webpack-bundle-analyzer** — Visual bundle breakdown
- **source-map-explorer** — What's in each chunk
- **bundlephobia** — NPM package impact

### Monitoring
- **web-vitals** library — Measure Core Web Vitals
- **performance.mark()** — Custom metrics
- **PerformanceObserver** — Watch for slow resources

## Deliverables

By the end of this module, you will have:

1. **Virtual scroll list** — 50,000 items, smooth 60fps
2. **Optimized bundle** — Route-based + component splitting
3. **Responsive images** — Lazy loading, WebP, srcset
4. **Performance dashboard** — Real-time Web Vitals display
5. **Optimized app** — Fixed 10 performance issues
6. **Bundle report** — Reduced bundle by 30%+
7. **Lighthouse 90+** — All categories scored

## Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [react-window Docs](https://react-window.vercel.app/)
- [webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
