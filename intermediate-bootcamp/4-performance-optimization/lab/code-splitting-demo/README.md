# Lab: Code Splitting Demo

Demonstrate route-based and component-level code splitting.

## Tasks

### 1. Route-Based Splitting
Split each route into separate bundle:
```tsx
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
```

### 2. Component-Level Splitting
Lazy load heavy components:
- Chart library (loads only when chart visible)
- Rich text editor (loads when editing)
- PDF viewer (loads on "View PDF" click)

### 3. Prefetching
Prefetch next route on hover:
```tsx
<Link
  to="/dashboard"
  onMouseEnter={() => import("./pages/Dashboard")}
>
  Dashboard
</Link>
```

### 4. Bundle Analysis
Run webpack-bundle-analyzer, screenshot showing:
- Initial bundle < 200kb
- Each route in separate chunk
- Heavy libraries in separate chunks

**Time:** 2-3 hours  
**Deliverable:** App with split bundles + analyzer screenshot
