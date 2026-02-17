# Homework: React Internals Exploration

## Objective

Walk the React Fiber tree yourself — inspect the internal data structures that React uses to track your components. This isn't production code; it's an exploration to build intuition.

**Warning:** These APIs are private and undocumented. They change between React versions and should never be used in production.

## Setup

```bash
npm create vite@latest react-internals -- --template react-ts
cd react-internals && npm install
```

## Part 1: Accessing the Fiber Tree

React attaches the Fiber tree to DOM nodes via a special property:

```typescript
// Utility to get the Fiber node from a DOM element
function getFiber(element: Element | null): FiberNode | null {
  if (!element) return null;

  // React 18 attaches fiber under a key like __reactFiber$xxxx
  const key = Object.keys(element).find(k => k.startsWith("__reactFiber"));
  if (!key) return null;

  return (element as any)[key] as FiberNode;
}

// Minimal Fiber shape for exploration
interface FiberNode {
  type:          string | Function | null;
  key:           string | null;
  stateNode:     Element | object | null;
  child:         FiberNode | null;
  sibling:       FiberNode | null;
  return:        FiberNode | null;  // parent
  memoizedState: HookState | null;
  memoizedProps: Record<string, unknown>;
  alternate:     FiberNode | null;
  flags:         number;
  lanes:         number;
}

interface HookState {
  memoizedState: unknown;
  next: HookState | null;
}
```

## Tasks

### Task 1: Print the Fiber tree

Implement `printFiberTree(element: Element, depth = 0): void` that recursively prints:

```
<App> [flags: 0]
  <ThemeProvider> [flags: 0]
    <Layout> [flags: 0]
      <Header> [flags: 1]
        div
          h1
          nav
      <main>
        <Counter> [flags: 4] ← has pending update
          button
          span
```

```typescript
function getFiberName(fiber: FiberNode): string {
  if (typeof fiber.type === "function") return fiber.type.name || "<anonymous>";
  if (typeof fiber.type === "string")   return fiber.type;
  return "<host>";
}

function printFiberTree(element: Element, depth = 0): void {
  const fiber = getFiber(element);
  if (!fiber) return;

  // TODO: traverse child → sibling → return structure
  // Print depth-indented tree with fiber name and flags
}
```

### Task 2: List all hook states for a component

```typescript
function getHookStates(fiber: FiberNode): unknown[] {
  const states: unknown[] = [];
  let hook = fiber.memoizedState;
  while (hook) {
    states.push(hook.memoizedState);
    hook = hook.next;
  }
  return states;
}
```

Build a `<FiberInspector />` component that:
- Renders a "Inspect" button in the corner
- On click, walks the entire Fiber tree starting from `document.getElementById("root")`
- Prints every component name + its hook states to the console
- Highlights components with `flags !== 0` (they have pending work)

### Task 3: Identify re-render causes

Using `MutationObserver` + Fiber inspection, build a `useWhyDidIRender` hook that:

```typescript
function useWhyDidIRender(name: string, props: Record<string, unknown>): void {
  // TODO: compare current props to previous, log changes
  // Log: "[name] re-rendered because: prop 'count' changed from 0 to 1"
  // Log: "[name] re-rendered (parent re-render, no prop changes)"
}
```

### Task 4: Reflection

Write `reflection.md` (300–500 words) answering:

1. **Tree structure:** How does the child → sibling → return pointer structure differ from a traditional tree? Why do you think React chose a linked list?

2. **Alternate tree:** When you inspect `fiber.alternate`, what do you find? Why does React keep two trees?

3. **Hook state ordering:** Look at the `memoizedState` linked list for a component with 3 hooks. What does each node contain for `useState` vs `useEffect`?

4. **Flags:** React uses a bitmask for `flags` (Placement=2, Update=4, Deletion=8, etc.). What flags do you observe on components during normal re-renders vs when a component is first mounting?

5. **Surprise:** What was the most surprising thing you discovered while exploring the Fiber tree?

## Deliverables

- `src/utils/fiber.ts` — `getFiber`, `printFiberTree`, `getHookStates`
- `src/components/FiberInspector.tsx` — the inspector UI component
- `src/hooks/useWhyDidIRender.ts`
- `reflection.md` — 300–500 words

## Grading

| Criterion | Points |
|-----------|--------|
| `printFiberTree` traverses correctly | 30 |
| `FiberInspector` component works | 30 |
| `useWhyDidIRender` detects changes | 20 |
| Reflection quality and depth | 20 |

## Time Estimate: 3–4 hours

**Note:** If the internal React property names have changed in your version of React, you may need to search for the correct key prefix. They follow the pattern `__reactFiber$[randomSuffix]`.
