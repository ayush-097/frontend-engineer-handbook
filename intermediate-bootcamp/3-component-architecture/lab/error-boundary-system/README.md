# Lab: Error Boundary System

Build a comprehensive error boundary system with fallbacks and recovery.

## Components to Build

### 1. AppErrorBoundary
Root-level boundary that catches all errors and shows full-page error screen.

### 2. RouteErrorBoundary
Per-route boundaries that show error in route content area only.

### 3. ComponentErrorBoundary
Granular boundaries around risky components (charts, third-party widgets).

### 4. ErrorFallback Component
Generic error display with:
- Error message
- Component stack trace (dev only)
- "Try Again" button
- "Report Bug" button

## Features
- Different fallbacks per boundary level
- Error logging to console (or Sentry in production)
- Reset functionality
- Error info preserved for debugging

## Example
```tsx
<AppErrorBoundary fallback={<FullPageError />}>
  <Router>
    <Routes>
      <Route path="/" element={
        <RouteErrorBoundary fallback={<RouteError />}>
          <Dashboard>
            <ComponentErrorBoundary fallback={<div>Chart failed</div>}>
              <Chart />
            </ComponentErrorBoundary>
          </Dashboard>
        </RouteErrorBoundary>
      } />
    </Routes>
  </Router>
</AppErrorBoundary>
```

## Time: 3 hours
