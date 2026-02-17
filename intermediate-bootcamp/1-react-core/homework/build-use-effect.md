# Homework: Build `useEffect` From Scratch

## Objective

Reimplement `useEffect` without using the real `useEffect` — using only `useState`, `useRef`, and `useCallback`. This forces you to deeply understand what `useEffect` actually does and when it runs.

## Setup

```bash
# Use a minimal React setup — no Vite or CRA needed
npm init -y
npm install react react-dom
npm install -D @types/react typescript ts-node
```

## The Challenge

Implement `useMyEffect` that behaves identically to React's `useEffect`:

```typescript
import { useMyEffect } from "./useMyEffect";

// These must all work correctly:
function Counter() {
  const [count, setCount] = useState(0);

  // 1. No deps — runs after every render
  useMyEffect(() => {
    console.log("render:", count);
  });

  // 2. Empty deps — runs once on mount
  useMyEffect(() => {
    const id = setInterval(() => setCount(c => c + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // 3. Deps array — runs when deps change
  useMyEffect(() => {
    document.title = `Count: ${count}`;
    return () => { document.title = "App"; };
  }, [count]);
}
```

## Implementation

Start with this scaffold:

```typescript
// useMyEffect.ts

import { useRef, useState } from "react";

type EffectFn = () => void | (() => void);
type DepsArray = readonly unknown[] | undefined;

interface EffectState {
  cleanup: (() => void) | null;
  deps: DepsArray;
  hasRun: boolean;
}

export function useMyEffect(effect: EffectFn, deps?: DepsArray): void {
  // TODO: implement using only useRef and useState
  // Hint 1: Use useRef to store effect state across renders
  // Hint 2: Use a forced state update to trigger "after render" timing
  //         (React state updates are batched; a forced flush mimics async)
  // Hint 3: Compare deps arrays manually
  // Hint 4: Run cleanup before re-running the effect
}
```

## Implementation Hints

### Hint 1: Detecting "after render"

`useEffect` runs after the component renders and the DOM is updated. You can approximate this by:

```typescript
// Schedule microtask after render
queueMicrotask(() => {
  // Runs after current render cycle
  runEffect();
});
```

Or by using a ref to track whether we're in the render phase:

```typescript
const isFirstRender = useRef(true);
// This trick: set during render, read in a useState initializer
```

### Hint 2: Deps comparison

```typescript
function depsChanged(prev: DepsArray, next: DepsArray): boolean {
  if (prev === undefined || next === undefined) return true; // No array = always run
  if (prev.length !== next.length) return true;
  return prev.some((dep, i) => !Object.is(dep, next[i]));
}
```

### Hint 3: Cleanup

```typescript
interface EffectRef {
  cleanup: (() => void) | null;
  prevDeps: DepsArray;
}
```

## Test Cases

Your implementation must pass all of these:

```typescript
// Test 1: Cleanup runs before next effect
let log: string[] = [];
function TestCleanup({ value }) {
  useMyEffect(() => {
    log.push(`setup: ${value}`);
    return () => log.push(`cleanup: ${value}`);
  }, [value]);
  return null;
}

// Render value=1 then value=2:
// Expected log: ["setup: 1", "cleanup: 1", "setup: 2"]

// Test 2: No deps = runs every render
let renderCount = 0;
function TestNoDeps() {
  const [, forceRender] = useState(0);
  useMyEffect(() => { renderCount++; });
  return <button onClick={() => forceRender(n => n + 1)}>+</button>;
}
// After 3 button clicks: renderCount should be 4 (1 initial + 3 clicks)

// Test 3: Empty deps = runs once
let mountCount = 0;
function TestEmptyDeps() {
  useMyEffect(() => { mountCount++; }, []);
  const [, set] = useState(0);
  return <button onClick={() => set(n => n + 1)}>+</button>;
}
// After 3 clicks: mountCount should still be 1

// Test 4: Cleanup on unmount
let cleanupCalled = false;
function TestUnmount() {
  useMyEffect(() => {
    return () => { cleanupCalled = true; };
  }, []);
  return null;
}
// After unmounting: cleanupCalled should be true
```

## Deliverables

1. `useMyEffect.ts` — your implementation
2. `useMyEffect.test.ts` — tests for all four test cases above
3. `reflection.md` — 200–400 words:
   - What aspects were hardest to get right?
   - What does your implementation get wrong vs the real `useEffect`?
   - What does understanding this teach you about timing bugs?

## Grading

| Criterion | Points |
|-----------|--------|
| No deps runs after every render | 20 |
| Empty deps runs once | 20 |
| Deps array comparison correct | 20 |
| Cleanup runs before re-run | 20 |
| Reflection quality | 20 |

## Time Estimate: 3–4 hours
