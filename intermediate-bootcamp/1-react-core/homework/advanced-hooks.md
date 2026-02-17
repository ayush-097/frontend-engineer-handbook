# Homework: Advanced Hooks

## Overview

Implement three hooks that use advanced React 18 APIs: `useSyncExternalStore`, `useTransition`, and `useDeferredValue`. These are the hooks that bridge React's concurrent rendering with external state.

---

## Part 1: `useStore<T>` — Type-safe external store subscription

Implement a Zustand-like `createStore` factory and a `useStore` hook using `useSyncExternalStore`.

### API

```typescript
// 1. Create a store
const counterStore = createStore({
  count: 0,
  increment() { this.count++; },
  decrement() { this.count--; },
});

// 2. Subscribe to it with a selector
function Counter() {
  const count = useStore(counterStore, s => s.count);
  const { increment } = useStore(counterStore, s => s); // Full store

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

### Requirements

- `createStore<T>(initialState: T)` returns a store object with:
  - `getState(): T`
  - `setState(updater: Partial<T> | ((prev: T) => T)): void`
  - `subscribe(listener: () => void): () => void`
- `useStore<T, S>(store, selector)` uses `useSyncExternalStore` under the hood
- Only re-renders when the **selected slice** changes
- Store methods (like `increment`) should work when called as plain functions (not bound to `this`)

---

## Part 2: `useAsync<T>` — async state with concurrent features

Implement `useAsync` that wraps an async operation and uses `useTransition` to keep the UI responsive.

### API

```typescript
function UserSearch() {
  const [query, setQuery] = useState("");

  const {
    data,
    error,
    isPending,    // ← useTransition isPending
    run,          // ← triggers the async operation
  } = useAsync<User[]>(
    (signal) => searchUsers(query, { signal }),
    { immediate: false }
  );

  return (
    <div>
      <input
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          run(); // Wrapped in startTransition internally
        }}
      />
      {isPending && <span>Searching…</span>}
      {error && <ErrorMessage error={error} />}
      {data && <UserList users={data} />}
    </div>
  );
}
```

### Requirements

- Uses `useTransition` to wrap the state update — input stays responsive
- Cancels previous request when `run()` is called again (AbortController)
- `immediate: true` runs on mount; `immediate: false` waits for `run()`
- Returns `{ data, error, isPending, run }`
- Fully typed — `data` is `T | null`

---

## Part 3: `useLiveSearch<T>` — combining all three

Build `useLiveSearch` that:
1. Debounces the search query (300ms)
2. Fetches results using `useSyncExternalStore`-based caching
3. Uses `useDeferredValue` to keep results visible while new ones load

### API

```typescript
function SearchPage() {
  const [query, setQuery] = useState("");

  const { results, isSearching, cachedCount } = useLiveSearch<Product>(
    query,
    (q) => searchProducts(q),
    { debounce: 300, cacheSize: 20 }
  );

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {isSearching && <LoadingIndicator />}
      <span>{cachedCount} searches cached</span>
      {/* Results shown immediately, new results replace when ready */}
      <ProductGrid items={results} />
    </div>
  );
}
```

---

## Deliverables

- `src/hooks/useStore.ts`
- `src/hooks/useAsync.ts`
- `src/hooks/useLiveSearch.ts`
- `src/hooks/__tests__/useStore.test.ts`
- `src/hooks/__tests__/useAsync.test.ts`

## Grading

| Criterion | Points |
|-----------|--------|
| `useStore` with `useSyncExternalStore` | 30 |
| `useAsync` with `useTransition` + cancellation | 35 |
| `useLiveSearch` combining all three | 25 |
| Tests for useStore and useAsync | 10 |

## Time Estimate: 4–6 hours
