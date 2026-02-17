# Reconciliation & the Fiber Architecture

## The Central Question

When state changes, React needs to answer: **what changed, and what's the cheapest way to update the DOM?** The reconciliation algorithm is React's answer. Understanding it tells you *why* keys matter, *why* component order must be stable, and *why* certain patterns cause expensive re-renders.

## The Virtual DOM

React doesn't write to the real DOM directly. It maintains a **virtual DOM** — a lightweight JavaScript representation of the UI.

```
State change → New VDOM tree → Diff old vs new → Apply minimal DOM patches
```

This diff step is called **reconciliation**. React's reconciler can be swapped out (React Native uses a native renderer, React Three Fiber uses WebGL) — the reconciliation logic is shared.

```jsx
// This JSX:
const element = <div className="card"><h2>Title</h2><p>Body</p></div>;

// Compiles to:
const element = React.createElement(
  "div",
  { className: "card" },
  React.createElement("h2", null, "Title"),
  React.createElement("p",  null, "Body")
);

// Produces a plain object:
{
  type: "div",
  props: {
    className: "card",
    children: [
      { type: "h2", props: { children: "Title" } },
      { type: "p",  props: { children: "Body"  } },
    ],
  },
}
```

## The Reconciliation Heuristics

Diffing two arbitrary trees is O(n³) — unusable. React makes two assumptions that reduce this to O(n):

### Heuristic 1 — Different type = full remount

```jsx
// Before
<div><Counter /></div>

// After
<span><Counter /></span>

// React sees: type changed (div → span)
// Action: destroy entire old tree, mount new tree from scratch
// Counter's state is LOST
```

```jsx
// Before
<Counter />

// After
<Timer />

// React sees: type changed (Counter → Timer)
// Action: unmount Counter (runs its cleanup), mount Timer fresh
// If they happened to have the same DOM structure — doesn't matter
```

### Heuristic 2 — Same type, same position = update

```jsx
// Before
<Button disabled={false}>Click</Button>

// After
<Button disabled={true}>Click</Button>

// React sees: same type (Button), same position
// Action: update props only — Button instance kept alive, state preserved
```

### Keys — Override positional matching

```jsx
// ❌ Without keys — React matches by index
// Before: [A, B, C]  After: [D, A, B, C]
// React sees: index 0 changed (A→D), 1 changed (B→A), etc.
// Destroys and remounts all four items

// ✅ With keys — React matches by identity
// Before: [key:a, key:b, key:c]  After: [key:d, key:a, key:b, key:c]
// React sees: key:a, key:b, key:c still exist (just moved)
// Creates key:d, reorders existing three — no state loss
```

**The rule:** Keys must be **stable** (same across renders), **unique** among siblings, and **not indexes** when the list can be reordered or filtered.

```jsx
// ❌ Index as key — causes bugs with reordering
{items.map((item, i) => <Item key={i} data={item} />)}

// ✅ Stable unique ID
{items.map(item => <Item key={item.id} data={item} />)}

// ✅ Derived stable key
{tabs.map(tab => <Tab key={tab.slug} tab={tab} />)}
```

## The Fiber Architecture (React 16+)

Before Fiber, React's reconciler was a recursive, synchronous call stack. Once it started rendering a tree, it couldn't be interrupted. Large renders would block the main thread for hundreds of milliseconds — janky animations, dropped frames.

**Fiber solves this by making reconciliation interruptible.**

### What is a Fiber?

A Fiber is a JavaScript object representing a unit of work — one component or DOM element.

```
Fiber node structure (simplified):
{
  type:        "div" | MyComponent | ...
  key:         string | null
  stateNode:   HTMLElement | class instance | null
  
  // Tree pointers (linked list, not recursion)
  child:       Fiber | null         // First child
  sibling:     Fiber | null         // Next sibling
  return:      Fiber | null         // Parent
  
  // State
  memoizedState:  Hook | null       // Linked list of hook state
  memoizedProps:  Props
  pendingProps:   Props
  
  // Work tracking
  flags:       number               // EffectTag bitmask (Placement, Update, Deletion)
  lanes:       number               // Priority bitmask
  alternate:   Fiber | null         // Double buffer — "work in progress" twin
}
```

### Double Buffering

React keeps **two fiber trees**:

- **Current tree** — what's on screen right now
- **Work-in-progress (WIP) tree** — being built for the next render

```
Current tree ──── on screen ────────────────────────────────────────
  root → div → App → Header → main → Counter
                                         ↓
Work-in-progress tree ─── being reconciled ─────────────────────────
  root → div → App → Header → main → Counter (pending state update)
```

When WIP is finished, React atomically swaps pointers: WIP becomes Current, old Current becomes WIP (recycled). The screen updates all at once — no partial states visible.

### The Two-Phase Render

**Phase 1 — Render (Reconciliation) — interruptible**  
React traverses the fiber tree building the WIP tree. This phase:
- Can be paused if higher-priority work arrives
- Can be restarted from scratch
- Must be **pure** — no side effects (this is why render functions must be pure!)

**Phase 2 — Commit — synchronous, uninterruptible**  
React walks the effect list and applies DOM mutations. Three sub-phases:
1. **Before mutation** — reads DOM snapshots (`getSnapshotBeforeUpdate`)
2. **Mutation** — inserts/updates/removes DOM nodes
3. **Layout** — runs `useLayoutEffect` cleanup + setup synchronously

```
         Render Phase           |  Commit Phase
   (interruptible, pure)        |  (synchronous, DOM)
                                |
   beginWork(fiber) →           |  commitBeforeMutationEffects
   completeWork(fiber) →        |  commitMutationEffects  ← DOM writes
   (repeat for all fibers)      |  commitLayoutEffects    ← useLayoutEffect
```

### Priority and Lanes

Fiber assigns every update a **priority lane**. Higher-priority work interrupts lower-priority work.

```
Lane hierarchy (highest → lowest):
  SyncLane         — Discrete user events (click, keypress)
  InputContinuousLane — Continuous input (drag, scroll)
  DefaultLane      — Normal state updates, fetch responses
  TransitionLane   — startTransition() updates
  IdleLane         — Background work
```

```jsx
// SyncLane — click handler fires synchronously, UI updates before next paint
button.addEventListener("click", () => {
  setCount(c => c + 1); // Sync priority
});

// TransitionLane — lower priority, deferred
startTransition(() => {
  setFilteredList(heavyFilter(allItems)); // Can be interrupted
});
```

## React.memo and Reconciliation

By default, a parent re-render triggers a child re-render even if props didn't change.

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <Child />       {/* Re-renders on every count change! */}
      <ExpensiveList items={items} />  {/* Same */}
    </>
  );
}
```

```jsx
// React.memo wraps a component — only re-renders if props changed (shallow compare)
const Child = React.memo(function Child({ name }) {
  return <div>{name}</div>;
});

const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
});

// Now Parent can re-render freely without re-rendering Child or ExpensiveList
// (assuming their props don't change)
```

### The Referential Stability Problem

`React.memo` uses shallow equality — objects/functions are compared by reference.

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ New object reference every render — breaks React.memo
  const config = { theme: "dark", size: "lg" };

  // ❌ New function reference every render — breaks React.memo
  const handleClick = () => console.log("clicked");

  return <MemoizedChild config={config} onClick={handleClick} />;
  // MemoizedChild ALWAYS re-renders because config and handleClick
  // are new references on every parent render
}

function Parent() {
  const [count, setCount] = useState(0);

  // ✅ Stable object reference
  const config = useMemo(() => ({ theme: "dark", size: "lg" }), []);

  // ✅ Stable function reference
  const handleClick = useCallback(() => console.log("clicked"), []);

  return <MemoizedChild config={config} onClick={handleClick} />;
  // MemoizedChild skips re-render — references are stable
}
```

## Profiling With React DevTools

The Profiler records every render — duration, what caused it, and which components updated.

```
React DevTools → Profiler tab → Record → interact → Stop
```

**Reading the flame chart:**
- Each bar = one component render
- Width = render duration
- Gray = did not render (skipped by memo)
- Color = relative cost (yellow/red = slower)

**"Why did this render?" tooltip:**
- "Props changed: onClick" — unstable function reference
- "State changed" — internal state update
- "Context changed" — subscribed context value changed
- "Parent re-rendered" — cascaded from parent (needs memo)

## The Strict Mode Double-Invoke

In development, `React.StrictMode` **calls render functions and effect setups twice** to surface impure behavior.

```jsx
function Component() {
  console.log("render"); // Logged TWICE in dev with StrictMode
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

This is intentional — if rendering is truly pure, running it twice produces the same result. If you see different behavior on first vs second render, your render has side effects.

## Key Takeaways

- Reconciliation is O(n) because React bets on: same type = update, different type = remount
- **Keys** let React track identity across positions — use stable IDs, never indexes on dynamic lists
- **Fiber** makes rendering interruptible — the render phase can be paused/restarted
- **Double buffering** means the current tree is never mutated mid-render
- The render phase must be **pure** — it can run multiple times per update
- `React.memo` + `useMemo` + `useCallback` work together to maintain referential stability
- Profile first, optimize second — many `memo` calls add overhead without saving work

---

**Next:** [Lecture 2: Hooks Deep Dive →](2-hooks-deep-dive.md)
