# Hooks Deep Dive

## Why Hooks Have Rules

The Hook rules aren't arbitrary — they're enforced to make React's internal bookkeeping work. Understanding the mechanism makes the rules obvious.

### How React Stores Hook State

React stores hook state in a **linked list on the fiber node**. Each hook call appends to this list. React doesn't know your variable names — it tracks hooks by **call order**.

```
Fiber.memoizedState →  Hook1 → Hook2 → Hook3 → null
                       useState  useEffect  useRef
                       { state: 0  { effect: fn  { current: null
                         queue: [] }  cleanup: fn } }
```

```jsx
function Counter() {
  // Call 1: Hook1 = { state: 0, queue: [] }
  const [count, setCount] = useState(0);

  // Call 2: Hook2 = { effect: ..., deps: [] }
  useEffect(() => { document.title = count; }, [count]);

  // Call 3: Hook3 = { current: null }
  const ref = useRef(null);

  return <div ref={ref}>{count}</div>;
}
```

On re-render, React walks the same linked list in the same order, matching each `useState` call to its stored value. **If the number of hooks changes between renders, the list is misaligned — state goes to the wrong hook.**

```jsx
// ❌ This would corrupt the hook list:
function BadComponent({ show }) {
  if (show) {
    const [value, setValue] = useState(""); // Sometimes call 1, sometimes skipped!
  }
  const [count, setCount] = useState(0); // Sometimes call 1, sometimes call 2
  // React reads the stored state for call 1 — but now it could mean either hook!
}
```

**Rules:**
1. Only call hooks at the top level — never inside conditionals, loops, or nested functions
2. Only call hooks from React function components or custom hooks — not plain JS functions

## `useState` — The Full API

```jsx
// Lazy initializer — only runs once on mount (expensive computation)
const [state, setState] = useState(() => {
  const saved = localStorage.getItem("todos");
  return saved ? JSON.parse(saved) : [];
});

// Functional update — always uses latest state (avoid stale closures)
setState(prev => prev + 1);        // ✅ Safe
setState(count + 1);               // ❌ Stale if batched

// Object state — must spread (React compares by reference, not deep equals)
const [user, setUser] = useState({ name: "Alice", age: 30 });
setUser(prev => ({ ...prev, age: 31 })); // ✅ Creates new object
setUser({ ...user, age: 31 });           // ✅ Also fine
setUser(prev => { prev.age = 31; return prev; }); // ❌ Mutates — no re-render!

// Batching — React 18+ batches all setState calls (even in async)
async function handleClick() {
  setA(1);   // React 18: batched with setB, setC
  setB(2);   // Single re-render at the end
  setC(3);
  // React 17: only batched inside React event handlers
  // React 18: batched everywhere (fetchData callbacks, setTimeout, etc.)
}
```

## `useEffect` — The Mental Model

`useEffect` is not a lifecycle method — it's a **synchronization mechanism**. It synchronizes an external system with the current props/state values.

```
useEffect(setup, deps)
           ↑       ↑
           |       What values does this effect depend on?
           What external system to sync (DOM, network, timer, subscription)
```

```jsx
// Pattern: Effect syncs a document title with count
useEffect(() => {
  // setup: sync external system (document title) with React state
  document.title = `Count: ${count}`;

  // cleanup: undo the sync when unmounting or before next run
  return () => {
    document.title = "My App";
  };
}, [count]); // Re-run when count changes
```

### Dependency Array Rules

```jsx
// No array — runs after EVERY render (almost never what you want)
useEffect(() => { ... });

// Empty array [] — runs once on mount, cleanup on unmount
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);

// With deps — runs on mount AND whenever deps change
useEffect(() => {
  fetchUser(userId);
}, [userId]); // Re-fetch when userId changes

// ⚠️ The eslint-plugin-react-hooks exhaustive-deps rule enforces
// that every reactive value used inside the effect is in the deps array
```

### Stale Closure — The #1 Hook Bug

```jsx
// ❌ Stale closure — count is captured at mount (value: 0)
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // Always sets to 0 + 1 = 1!
      // 'count' is the mount-time value, never updates
    }, 1000);
    return () => clearInterval(id);
  }, []); // ← Empty deps means closure captures count=0 forever
}

// ✅ Fix 1: Use functional update (no closure needed)
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1); // Uses latest value — no closure
  }, 1000);
  return () => clearInterval(id);
}, []);

// ✅ Fix 2: Add count to deps (recreates interval when count changes)
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);

// ✅ Fix 3: useRef to hold latest value
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count; // Always up to date

  useEffect(() => {
    const id = setInterval(() => {
      setCount(countRef.current + 1); // Always reads latest
    }, 1000);
    return () => clearInterval(id);
  }, []); // ref is stable — no closure issue
}
```

### Effect Cleanup Patterns

```jsx
// Subscription cleanup
useEffect(() => {
  const subscription = store.subscribe(handler);
  return () => subscription.unsubscribe();
}, [store]);

// Event listener cleanup
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, [handleResize]);

// Abort fetch on cleanup
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(err => {
      if (err.name !== "AbortError") setError(err);
    });

  return () => controller.abort();
}, [userId]);

// Timer cleanup
useEffect(() => {
  const timer = setTimeout(() => setVisible(false), delay);
  return () => clearTimeout(timer);
}, [delay]);
```

## `useReducer` — When State Has Logic

```jsx
// useState: state is a single value
// useReducer: state transitions are named, testable actions

type State = {
  status: "idle" | "loading" | "success" | "error";
  data: User[] | null;
  error: Error | null;
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: User[] }
  | { type: "FETCH_ERROR"; payload: Error }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: "loading", error: null };
    case "FETCH_SUCCESS":
      return { status: "success", data: action.payload, error: null };
    case "FETCH_ERROR":
      return { status: "error", data: null, error: action.payload };
    case "RESET":
      return { status: "idle", data: null, error: null };
    default:
      return state;
  }
}

function UserList() {
  const [state, dispatch] = useReducer(reducer, {
    status: "idle", data: null, error: null
  });

  useEffect(() => {
    dispatch({ type: "FETCH_START" });
    fetchUsers()
      .then(users => dispatch({ type: "FETCH_SUCCESS", payload: users }))
      .catch(err  => dispatch({ type: "FETCH_ERROR",   payload: err  }));
  }, []);
}
```

## `useMemo` and `useCallback`

```jsx
// useMemo — memoize expensive computed values
const sorted = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
// Only recomputes when `items` reference changes

// useCallback — memoize function references (for stable props)
const handleSubmit = useCallback(
  (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(formData);
  },
  [formData, submitForm]
);

// When to use each:
// useMemo:     expensive computation, object/array that needs stable reference
// useCallback: event handler passed to React.memo child, effect dependency

// When NOT to use:
// Cheap computations — the memo overhead costs more than the computation
// Values not used as props/deps — memoizing for fun wastes memory

// Measure first! Profile before optimizing.
```

## `useLayoutEffect` vs `useEffect`

```
useEffect:       Async — fires after paint (browser has updated screen)
useLayoutEffect: Sync  — fires before paint (DOM updated, screen not yet)
```

```jsx
// useLayoutEffect — use when you need to read/write DOM BEFORE the user sees it
function Tooltip({ text, anchorEl }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  useLayoutEffect(() => {
    // This runs before the browser paints
    // If we used useEffect, the tooltip would flash in the wrong position
    const rect = anchorEl.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top - tooltipRect.height - 8,
      left: rect.left + rect.width / 2 - tooltipRect.width / 2,
    });
  }, [anchorEl]);

  return (
    <div ref={tooltipRef} style={{ position: "fixed", ...position }}>
      {text}
    </div>
  );
}

// Rule: start with useEffect; switch to useLayoutEffect only if you
// see a visible flicker caused by DOM measurement timing
```

## Custom Hooks — Encapsulating Logic

```jsx
// Extract stateful logic into a reusable function that starts with "use"
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

// Using it:
function Layout() {
  const { width, height } = useWindowSize();
  return <div>Viewport: {width}×{height}</div>;
}

// Custom hooks can call other hooks
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof newValue === "function"
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  }, [key]);

  return [value, setStoredValue] as const;
}
```

## `useSyncExternalStore` — Subscribing to Non-React State

```jsx
// React 18 hook for subscribing to external stores safely
// Avoids "tearing" — different components seeing different store snapshots

import { useSyncExternalStore } from "react";

// Redux-lite store
const store = createStore(reducer, initialState);

function useStore<T>(selector: (state: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,        // subscribe(callback) — call callback on change
    () => selector(store.getState()), // getSnapshot — current value
    () => selector(initialState),     // getServerSnapshot — for SSR
  );
}

// Works with any pub-sub system: Zustand, Jotai, even browser APIs
function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("online",  callback);
      window.addEventListener("offline", callback);
      return () => {
        window.removeEventListener("online",  callback);
        window.removeEventListener("offline", callback);
      };
    },
    () => navigator.onLine,
    () => true, // SSR: assume online
  );
}
```

## `useId` — Stable Unique IDs

```jsx
// For accessibility — connecting labels to inputs, ARIA attributes
function FormField({ label, ...props }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </div>
  );
}

// IDs are stable across renders and unique across component instances
// Works correctly with SSR (client IDs match server IDs)
```

## `useDeferredValue` — Low-Priority Rendering

```jsx
// Defer expensive re-renders caused by fast-changing input
function SearchResults({ query }) {
  // deferredQuery lags behind query — expensive list renders at lower priority
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => search(allItems, deferredQuery), [deferredQuery]);

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {/* Input stays responsive; results may lag slightly */}
      <ResultList results={results} />
    </>
  );
}
```

## Practice Exercises

### Exercise 1: Fix the stale closure

```jsx
// This counter gets stuck. Why? Fix it three different ways.
function BrokenCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log("tick", count);
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>{count}</div>;
}
```

### Exercise 2: Custom hook

```jsx
// Build useDebounce(value, delay) that returns a debounced version of value
// It should update only after the value stops changing for `delay` milliseconds

function useDebounce<T>(value: T, delay: number): T {
  // TODO
}

// Usage:
function SearchBox() {
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    // Only fires 300ms after the user stops typing
    fetch(`/api/search?q=${debouncedInput}`);
  }, [debouncedInput]);
}
```

## Key Takeaways

- Hooks are stored as a **linked list** — call order must be stable (no conditionals)
- `useEffect` synchronizes external systems; it is not a lifecycle method
- **Stale closures** are the most common hook bug — use functional updates or refs
- Effect cleanup runs before the next effect AND before unmount
- `useReducer` over `useState` when transitions have complex logic or many sub-values
- `useMemo`/`useCallback` maintain **referential stability** for memo'd children
- `useLayoutEffect` for DOM measurements that must happen before paint
- Custom hooks = reusable logic, not reusable UI

---

**Next:** [Lecture 3: Component Lifecycle →](3-component-lifecycle.md)
