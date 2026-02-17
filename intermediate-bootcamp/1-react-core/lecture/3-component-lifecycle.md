# Component Lifecycle in the Hooks Model

## Mapping Class Lifecycle to Hooks

Class components had explicit lifecycle methods. Hooks don't map one-to-one — they express the same concepts differently.

```
Class lifecycle               →  Hooks equivalent
─────────────────────────────────────────────────
constructor()                 →  useState(initialValue) / lazy initializer
componentDidMount()           →  useEffect(() => {...}, [])
componentDidUpdate(prev)      →  useEffect(() => {...}, [dep]) + compare inside
componentWillUnmount()        →  useEffect(() => { return () => cleanup }, [])
shouldComponentUpdate()       →  React.memo + useMemo + useCallback
getSnapshotBeforeUpdate()     →  useLayoutEffect (before paint)
getDerivedStateFromProps()    →  Derive during render (no hook needed)
componentDidCatch()           →  Error boundaries (still class-only)
```

## The Three Phases

Every component goes through three phases. Understanding exactly when each runs prevents timing bugs.

### Phase 1 — Mount

```jsx
function Component({ userId }) {
  // ── Render (synchronous, pure) ──────────────────────────────
  // 1. useState lazy initializer runs (once only)
  const [user, setUser] = useState(() => {
    console.log("1. useState initializer — runs once");
    return null;
  });

  // 2. Render function body runs
  console.log("2. Render");

  // 3. useMemo runs synchronously during render
  const displayName = useMemo(() => {
    console.log("3. useMemo");
    return user?.name.toUpperCase() ?? "Loading...";
  }, [user]);

  // ── After React commits to DOM ──────────────────────────────
  // 4. useLayoutEffect (before paint — synchronous)
  useLayoutEffect(() => {
    console.log("4. useLayoutEffect setup");
    return () => console.log("4b. useLayoutEffect cleanup");
  }, []);

  // 5. useEffect (after paint — async)
  useEffect(() => {
    console.log("5. useEffect setup — fetch data here");
    fetchUser(userId).then(setUser);
    return () => console.log("5b. useEffect cleanup");
  }, [userId]);

  return <div>{displayName}</div>;
}

// Mount order:
// 1. useState initializer
// 2. Render
// 3. useMemo (during render)
// [DOM updated]
// 4. useLayoutEffect setup
// [Browser paints]
// 5. useEffect setup
```

### Phase 2 — Update

```jsx
// When userId prop changes:
// 1. Render runs again with new userId
// 2. useMemo recomputes (userId is in deps)
// [DOM updated with new output]
// 3. useLayoutEffect cleanup (from previous run)
// 4. useLayoutEffect setup (new run)
// [Browser paints]
// 5. useEffect cleanup (from previous run)
// 6. useEffect setup (new run)

// When unrelated state changes (e.g., a sibling setCount):
// 1. Render runs
// 2. useMemo: deps [user] haven't changed → cached value returned
// [DOM updated only if output changed]
// 3. Effects with changed deps run; others are skipped
```

### Phase 3 — Unmount

```jsx
// When component is removed from tree:
// 1. useLayoutEffect cleanup (all effects, in reverse order)
// 2. useEffect cleanup (all effects, in reverse order)
// Component's fiber node is discarded
```

## Effect Execution Order (Multiple Effects)

```jsx
function Component() {
  useEffect(() => {
    console.log("Effect A setup");
    return () => console.log("Effect A cleanup");
  }, []);

  useEffect(() => {
    console.log("Effect B setup");
    return () => console.log("Effect B cleanup");
  }, []);

  useEffect(() => {
    console.log("Effect C setup");
    return () => console.log("Effect C cleanup");
  }, []);
}

// Mount:   Effect A setup → Effect B setup → Effect C setup
// Unmount: Effect C cleanup → Effect B cleanup → Effect A cleanup
// (reverse order on cleanup — like stack unwinding)
```

## StrictMode Double-Invoke

In React 18 + StrictMode, React mounts → unmounts → remounts every component to detect cleanup bugs.

```jsx
// In development with StrictMode:
// Mount #1: useEffect setup
// Unmount:  useEffect cleanup
// Mount #2: useEffect setup (same effect runs again)

// If your effect doesn't clean up properly:
function BuggyComponent() {
  useEffect(() => {
    document.addEventListener("keydown", handleKey); // Added twice!
    // Missing return () => removeEventListener...
  }, []);
}

// In production: mount once, effect runs once — bug hidden
// In StrictMode dev: mount/unmount/remount — bug surfaces (listener added twice)
```

This is why StrictMode exists — it forces you to write correct cleanup code.

## Derived State — Don't Sync State With State

A common anti-pattern: using `useEffect` to sync one piece of state to another.

```jsx
// ❌ Anti-pattern: effect syncing state to state
function UserGreeting({ userId }) {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  useEffect(() => {
    // This effect only exists to sync greeting with user
    setGreeting(user ? `Hello, ${user.name}!` : "");
  }, [user]); // ← synchronizing state to state — extra render cycle!
}

// ✅ Derive during render instead
function UserGreeting({ userId }) {
  const [user, setUser] = useState(null);

  // Computed during render — no extra effect, no extra render
  const greeting = user ? `Hello, ${user.name}!` : "";

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
}
```

**Rule:** If you can compute a value from existing state/props during render, do it during render. Only use effects to synchronize with **external** systems (DOM, network, timers, subscriptions).

## Resetting State on Prop Change

```jsx
// ❌ Anti-pattern: effect to reset state when prop changes
function ProfileForm({ userId }) {
  const [formData, setFormData] = useState(getInitialData(userId));

  useEffect(() => {
    // This fires AFTER render with stale formData visible briefly
    setFormData(getInitialData(userId));
  }, [userId]);
}

// ✅ Pattern 1: key prop — unmounts and remounts cleanly
function ProfilePage({ userId }) {
  return <ProfileForm key={userId} userId={userId} />;
  // When userId changes, React sees a different key
  // Unmounts old ProfileForm, mounts fresh one with new state
}

// ✅ Pattern 2: Store userId in state as a "version"
function ProfileForm({ userId }) {
  const [currentUserId, setCurrentUserId] = useState(userId);
  const [formData, setFormData] = useState(getInitialData(userId));

  if (currentUserId !== userId) {
    // Runs synchronously during render (before effects)
    setCurrentUserId(userId);
    setFormData(getInitialData(userId));
    // React re-renders immediately — no stale state visible
  }
}
```

## Handling Async Operations Safely

```jsx
// Problem: component might unmount before fetch resolves
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // If userId changes before fetch resolves, we'll set state
    // on the OLD render — setting state for userId=1 when we're now userId=2
    fetchUser(userId).then(user => {
      setUser(user); // ❌ Might be "zombie" update
    });
  }, [userId]);
}

// ✅ Solution 1: AbortController
useEffect(() => {
  const controller = new AbortController();

  fetchUser(userId, { signal: controller.signal })
    .then(setUser)
    .catch(err => {
      if (err.name !== "AbortError") setError(err);
    });

  return () => controller.abort(); // Cancel on cleanup
}, [userId]);

// ✅ Solution 2: Ignore stale responses
useEffect(() => {
  let isActive = true;

  fetchUser(userId).then(user => {
    if (isActive) setUser(user); // Only set state if still mounted
  });

  return () => { isActive = false; };
}, [userId]);
```

## Event Handlers vs Effects

```
Event handlers:  Code that runs in RESPONSE to a specific interaction
Effects:         Code that runs because of a RENDER (state of the world)
```

```jsx
// ❌ Using effect to respond to a user action
function Form() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      // This shouldn't be an effect — it's responding to a button click
      sendAnalytics("form_submitted");
      showSuccessToast();
    }
  }, [submitted]);

  return <button onClick={() => setSubmitted(true)}>Submit</button>;
}

// ✅ Event handler is the right place
function Form() {
  function handleSubmit() {
    // Analytics and toast belong in the interaction handler
    sendAnalytics("form_submitted");
    showSuccessToast();
    submitForm();
  }

  return <button onClick={handleSubmit}>Submit</button>;
}
```

## Error Boundaries

Hooks can't catch render errors — you still need class-based error boundaries for that.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    logErrorToService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultError />;
    }
    return this.props.children;
  }
}

// Usage with Suspense:
function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<Spinner />}>
        <UserProfile />
      </Suspense>
    </ErrorBoundary>
  );
}

// react-error-boundary library provides hooks-friendly wrappers:
import { useErrorBoundary } from "react-error-boundary";

function DataComponent() {
  const { showBoundary } = useErrorBoundary();

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(err => showBoundary(err)); // Trigger parent error boundary
  }, []);
}
```

## The Render → Commit → Effect Timeline

```
React.setState() called
        │
        ▼
  [Render phase — pure]
  Component function runs
  Returns new React elements
        │
        ▼
  [Reconciliation]
  Diff with current tree
  Build effect list
        │
        ▼
  [Commit phase — DOM]
  Apply DOM mutations synchronously
        │
        ▼
  [useLayoutEffect cleanups]  ← synchronous, before paint
  [useLayoutEffect setups]    ← synchronous, before paint
        │
        ▼
  [Browser paints] ← screen updates here
        │
        ▼
  [useEffect cleanups]  ← async, after paint
  [useEffect setups]    ← async, after paint
```

## Practice Exercises

### Exercise 1: Identify the lifecycle bug

```jsx
// What's wrong? When does the bug manifest?
function SearchBox({ onResults }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(results => onResults(results));
  }, [query]);
  // Hint: what happens if the user types quickly?
  // Hint: what happens if the onResults prop changes?
}
```

### Exercise 2: Rewrite without effect

```jsx
// This component uses an effect to derive state. Eliminate the effect.
function FilteredList({ items, searchQuery }) {
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    setFiltered(items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [items, searchQuery]);

  return <ul>{filtered.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}
```

## Key Takeaways

- **Mount order:** render → useLayoutEffect → paint → useEffect
- **Update order:** render → layout cleanup → layout setup → paint → effect cleanup → effect setup
- **Unmount:** layout cleanup (reverse) → effect cleanup (reverse)
- StrictMode double-invoke forces correct cleanup code
- Derive values during render; use effects only for external system sync
- Use `key` prop to reset a component's state when an identity prop changes
- Always cancel async operations in effect cleanup (AbortController, isActive flag)
- Event handlers for interactions; effects for synchronizing with the world

---

**Next:** [Lecture 4: Context & Composition →](4-context-composition.md)
