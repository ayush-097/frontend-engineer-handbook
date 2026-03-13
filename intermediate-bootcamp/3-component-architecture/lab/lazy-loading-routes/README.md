# Lab: Lazy Loading Routes

Implement code splitting with React.lazy for routes and components.

## Tasks

### 1. Route-Based Splitting
Split each route into separate bundle:
- Dashboard → dashboard.chunk.js
- Profile → profile.chunk.js
- Settings → settings.chunk.js

### 2. Component-Level Splitting
Lazy load heavy components:
- Chart library (only loads when chart visible)
- Rich text editor (only when editing)
- Map component (only when map tab opened)

### 3. Prefetching
Prefetch next route on hover:
```tsx
<Link to="/dashboard" onMouseEnter={() => import("./Dashboard")}>
  Dashboard
</Link>
```

### 4. Loading States
- Route-level: Full-page spinner
- Component-level: Skeleton/placeholder

## Bundle Analysis
Use `npm run build -- --analyze` to verify bundles are split.

## Time: 2-3 hours
