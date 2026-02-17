# Render Props vs HOC vs Custom Hook — When to Use Each

## Quick Decision Matrix

| Scenario | Render Prop | HOC | Custom Hook |
|----------|------------|-----|-------------|
| Reuse stateful logic | ⚠️ OK | ⚠️ OK | ✅ Best |
| Flexible rendering | ✅ Best | ❌ No | ❌ No |
| Cross-cutting concerns | ⚠️ Awkward | ✅ Good | ✅ Good |
| Wrap un-modifiable component | ❌ No | ✅ Best | ❌ No |
| Type inference quality | ✅ Good | ⚠️ Complex | ✅ Best |
| DevTools visibility | ⚠️ Nesting | ⚠️ Wrapper name | ✅ Clear |

## Scenario Analysis

### 1. Reusing fetch logic across 5 components

**Winner: Custom hook `useFetch`**

```tsx
// Hook — clearest
function UserList() {
  const { data, loading, error } = useFetch<User[]>("/api/users");
  // ...
}

// Render prop — unnecessary wrapper
<DataFetcher<User[]> url="/api/users">
  {({ data, loading, error }) => { /* ... */ }}
</DataFetcher>
```

Custom hooks compose better, have cleaner types, and show up clearly in DevTools.

### 2. Adding analytics tracking to any component

**Winner: HOC or custom hook**

```tsx
// HOC — clean for existing components
const TrackedButton = withAnalytics(Button, "checkout_clicked");

// Hook — better when you own the component
function Button({ onClick }) {
  useTrack("checkout_clicked");
  return <button onClick={onClick}>Buy</button>;
}
```

HOC when wrapping third-party components. Hook when you own the component.

### 3. Wrapping a third-party component you can't modify

**Winner: HOC**

```tsx
// The only option — you can't add a hook to a component you don't own
const SafeThirdPartyChart = withErrorBoundary(ThirdPartyChart, <ErrorFallback />);
const LoggedMap = withLogger(GoogleMap);
```

### 4. Flexible rendering of a data container

**Winner: Render prop or children prop**

```tsx
// Render prop — consumer controls the output entirely
<DataFetcher<Product[]> url="/api/products">
  {({ data }) => <ProductGrid items={data!} />}
</DataFetcher>

// Later — same component, different rendering
<DataFetcher<Product[]> url="/api/products">
  {({ data }) => <ProductTable rows={data!} />}
</DataFetcher>
```

When the consumer needs to vary the rendered output significantly, render props win.

### 5. Cross-cutting authentication check

**Winner: Custom hook (redirects) or HOC (wraps existing)**

```tsx
// Hook — you own the component
function Dashboard() {
  useRequireAuth("/login"); // Redirects if not authenticated
  return <DashboardContent />;
}

// HOC — wrapping existing or third-party
const ProtectedDashboard = withAuth(Dashboard, { redirectTo: "/login" });
```

## Historical Note

HOCs and render props were the primary patterns before hooks (React 16.8). They solve real problems but come with drawbacks:

- **HOCs**: prop name collisions, unclear origin of injected props, harder TypeScript generics
- **Render props**: "callback hell" nesting, performance issues (new function on every render)

Custom hooks solve the same problems with fewer drawbacks. Prefer hooks when possible; use HOCs/render-props when hooks can't express the pattern.
