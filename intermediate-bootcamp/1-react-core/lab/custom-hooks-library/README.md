# Lab: Custom Hooks Library

Build a library of 8 production-ready custom hooks. Each hook must be fully typed with TypeScript, thoroughly tested, and documented with JSDoc.

## Hooks to Build

### 1. `useDebounce<T>(value, delay)` → T
Returns a debounced version of `value` that only updates after `delay` ms of inactivity.

### 2. `useLocalStorage<T>(key, initialValue)` → [T, Setter<T>]
Reads/writes a value to `localStorage`, serialized as JSON. Syncs across browser tabs via the `storage` event.

### 3. `useFetch<T>(url, options?)` → { data, loading, error, refetch }
Fetches a URL and returns typed state. Cancels in-flight requests on URL change or unmount. Supports manual refetch.

### 4. `useEventListener(target, event, handler, options?)` → void
Adds an event listener with automatic cleanup. Handles `window`, `document`, and custom `EventTarget`.

### 5. `useMediaQuery(query)` → boolean
Returns whether a CSS media query matches. Updates reactively when the viewport changes.

### 6. `useIntersectionObserver(options?)` → [ref, IntersectionObserverEntry | null]
Returns a ref to attach to an element and the latest `IntersectionObserverEntry`.

### 7. `usePrevious<T>(value)` → T | undefined
Returns the previous value of any variable.

### 8. `useClickOutside(handler)` → ref
Returns a ref. Calls `handler` when a click occurs outside the attached element.

## Files

```
custom-hooks-library/
├── README.md
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useFetch.ts
│   ├── useEventListener.ts
│   ├── useMediaQuery.ts
│   ├── useIntersectionObserver.ts
│   ├── usePrevious.ts
│   └── useClickOutside.ts
├── index.ts               ← Re-exports all hooks
└── hooks.test.ts          ← Tests
```

## Acceptance Criteria
- All hooks fully typed — no `any`
- All hooks clean up on unmount (no memory leaks)
- All tests pass: `npm test`
- Each hook documented with JSDoc example

## Time Estimate: 4–5 hours
