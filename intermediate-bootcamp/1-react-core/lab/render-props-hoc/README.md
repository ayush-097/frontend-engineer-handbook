# Lab: Render Props & Higher-Order Components

Explore two classic React composition patterns — render props and HOCs — and understand when each is appropriate versus custom hooks.

## Patterns to Implement

### Part 1: Render Props

#### `<DataFetcher<T>>` — Generic render-prop data fetcher

```tsx
<DataFetcher<User> url="/api/users/1">
  {({ data, loading, error }) => {
    if (loading) return <Spinner />;
    if (error)   return <ErrorCard error={error} />;
    return <UserCard user={data!} />;
  }}
</DataFetcher>
```

#### `<Toggle>` — Boolean state as render prop

```tsx
<Toggle defaultOn={false}>
  {({ on, toggle, setOn, setOff }) => (
    <div>
      <button onClick={toggle}>{on ? "Hide" : "Show"}</button>
      {on && <Modal onClose={setOff} />}
    </div>
  )}
</Toggle>
```

#### `<WindowSize>` — Viewport dimensions as render prop

```tsx
<WindowSize>
  {({ width, height }) => (
    <p>Viewport: {width} × {height}</p>
  )}
</WindowSize>
```

### Part 2: Higher-Order Components

#### `withLogger(Component)` — Logs render count and prop changes

```tsx
const LoggedButton = withLogger(Button);
// Console: [Button] render #3 | props changed: disabled
```

#### `withErrorBoundary(Component, fallback)` — Wraps in ErrorBoundary

```tsx
const SafeChart = withErrorBoundary(Chart, <ChartError />);
```

#### `withTheme(Component)` — Injects theme from ThemeContext

```tsx
interface WithThemeProps { theme: Theme; }
const ThemedButton = withTheme(Button);
// Button receives `theme` prop automatically — not passed by consumer
```

## Files

```
render-props-hoc/
├── README.md
├── render-props/
│   ├── DataFetcher.tsx
│   ├── Toggle.tsx
│   └── WindowSize.tsx
├── hoc/
│   ├── withLogger.tsx
│   ├── withErrorBoundary.tsx
│   └── withTheme.tsx
└── comparison.md   ← When to use each pattern
```

## comparison.md to Write

Explain each scenario and which pattern you'd choose (with code):

1. Reusing fetch logic across 5 components
2. Adding analytics tracking to any component
3. Wrapping a third-party component you can't modify
4. Flexible rendering of a data container
5. Cross-cutting authentication check

## Acceptance Criteria

- TypeScript: HOC generics preserve the wrapped component's prop types
- `withLogger` doesn't change component behavior — only adds logging
- `DataFetcher` cancels fetch on unmount
- All render props have the correct inferred types in the children function

## Time Estimate: 2–3 hours
