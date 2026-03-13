# Error Boundaries

## Class Component Boundary

```tsx
class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error caught:", error, info.componentStack);
    // Send to error tracking service (Sentry, LogRocket, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

## Usage

```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

## Granular Boundaries

```tsx
<App>
  <ErrorBoundary fallback={<div>Header failed</div>}>
    <Header />
  </ErrorBoundary>
  
  <ErrorBoundary fallback={<div>Main content failed</div>}>
    <MainContent />
  </ErrorBoundary>
  
  <ErrorBoundary fallback={<div>Sidebar failed</div>}>
    <Sidebar />
  </ErrorBoundary>
</App>
```

## Reset Boundary

```tsx
function ErrorBoundary({ children, fallback }) {
  const [key, setKey] = useState(0);
  
  return (
    <ErrorBoundaryClass
      key={key}
      fallback={
        <div>
          <p>Error occurred</p>
          <button onClick={() => setKey(k => k + 1)}>Try Again</button>
        </div>
      }
    >
      {children}
    </ErrorBoundaryClass>
  );
}
```
