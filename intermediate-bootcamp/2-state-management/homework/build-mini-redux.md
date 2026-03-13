# Homework: Build Mini Redux

## Objective

Implement Redux core from scratch: `createStore`, `combineReducers`, and `applyMiddleware`. This homework deepens your understanding of state management internals and middleware patterns.

## Setup

```bash
npm create vite@latest mini-redux -- --template vanilla-ts
cd mini-redux
npm install
npm install -D vitest @vitest/ui
```

## Part 1: createStore (40 pts)

Implement the core store with subscribe/dispatch/getState:

```tsx
// src/createStore.ts
export interface Store<S> {
  getState(): S;
  dispatch(action: any): any;
  subscribe(listener: () => void): () => void;
}

export function createStore<S>(
  reducer: (state: S, action: any) => S,
  initialState: S,
  enhancer?: (createStore: any) => any
): Store<S> {
  if (enhancer) {
    return enhancer(createStore)(reducer, initialState);
  }

  let state = initialState;
  let listeners: (() => void)[] = [];

  return {
    getState() {
      return state;
    },

    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach(listener => listener());
      return action;
    },

    subscribe(listener) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(fn => fn !== listener);
      };
    },
  };
}
```

**Tests (4 required):**

```tsx
// tests/createStore.test.ts
import { describe, it, expect } from "vitest";
import { createStore } from "../src/createStore";

describe("createStore", () => {
  it("returns initial state", () => {
    const store = createStore((s) => s, { count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it("dispatches actions through reducer", () => {
    const reducer = (state: { count: number }, action: any) => {
      if (action.type === "INC") return { count: state.count + 1 };
      return state;
    };
    const store = createStore(reducer, { count: 0 });
    store.dispatch({ type: "INC" });
    expect(store.getState()).toEqual({ count: 1 });
  });

  it("notifies subscribers on dispatch", () => {
    const store = createStore(
      (s: { count: number }) => ({ count: s.count + 1 }),
      { count: 0 }
    );
    
    let notified = false;
    store.subscribe(() => { notified = true; });
    store.dispatch({ type: "ANY" });
    
    expect(notified).toBe(true);
  });

  it("unsubscribe removes listener", () => {
    const store = createStore((s) => s, {});
    let callCount = 0;
    const unsubscribe = store.subscribe(() => { callCount++; });
    
    store.dispatch({ type: "A" });
    expect(callCount).toBe(1);
    
    unsubscribe();
    store.dispatch({ type: "B" });
    expect(callCount).toBe(1); // Should not increment
  });
});
```

## Part 2: combineReducers (30 pts)

Merge multiple reducers into a single root reducer:

```tsx
// src/combineReducers.ts
export function combineReducers<S>(reducers: {
  [K in keyof S]: (state: S[K] | undefined, action: any) => S[K];
}): (state: S | undefined, action: any) => S {
  const reducerKeys = Object.keys(reducers) as Array<keyof S>;

  return (state: S | undefined = {} as S, action: any): S => {
    const nextState = {} as S;
    let hasChanged = false;

    for (const key of reducerKeys) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}
```

**Example usage:**

```tsx
const counterReducer = (state = 0, action: any) => {
  if (action.type === "INC") return state + 1;
  return state;
};

const todosReducer = (state: string[] = [], action: any) => {
  if (action.type === "ADD_TODO") return [...state, action.text];
  return state;
};

const rootReducer = combineReducers({
  counter: counterReducer,
  todos: todosReducer,
});

const store = createStore(rootReducer, undefined as any);
store.dispatch({ type: "INC" });
store.getState(); // { counter: 1, todos: [] }
```

**Tests (2 required):**

```tsx
// tests/combineReducers.test.ts
import { describe, it, expect } from "vitest";
import { combineReducers } from "../src/combineReducers";

describe("combineReducers", () => {
  it("merges multiple reducer slices", () => {
    const reducers = {
      a: (s = 0, action: any) => action.type === "INC_A" ? s + 1 : s,
      b: (s = 0, action: any) => action.type === "INC_B" ? s + 1 : s,
    };
    
    const combined = combineReducers(reducers);
    const state = combined(undefined, { type: "@@INIT" });
    expect(state).toEqual({ a: 0, b: 0 });
    
    const next = combined(state, { type: "INC_A" });
    expect(next).toEqual({ a: 1, b: 0 });
  });

  it("calls each reducer with its state slice", () => {
    let aCallCount = 0;
    let bCallCount = 0;
    
    const combined = combineReducers({
      a: (s = {}) => { aCallCount++; return s; },
      b: (s = {}) => { bCallCount++; return s; },
    });
    
    combined(undefined, { type: "TEST" });
    expect(aCallCount).toBe(1);
    expect(bCallCount).toBe(1);
  });
});
```

## Part 3: applyMiddleware (30 pts)

Enable middleware chain for cross-cutting concerns (logging, thunks, etc):

```tsx
// src/compose.ts
export function compose(...fns: Function[]) {
  if (fns.length === 0) return (arg: any) => arg;
  if (fns.length === 1) return fns[0];
  return fns.reduce((a, b) => (...args: any[]) => a(b(...args)));
}

// src/applyMiddleware.ts
import { compose } from "./compose";

export type Middleware = (api: MiddlewareAPI) => (next: Dispatch) => Dispatch;
export type Dispatch = (action: any) => any;
export type MiddlewareAPI = {
  getState: () => any;
  dispatch: (action: any) => any;
};

export function applyMiddleware(...middlewares: Middleware[]) {
  return (createStore: any) => (reducer: any, initialState: any) => {
    const store = createStore(reducer, initialState);
    let dispatch: Dispatch = () => {
      throw new Error("Dispatching while constructing middleware");
    };

    const middlewareAPI: MiddlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action),
    };

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
}
```

**Example middleware:**

```tsx
// Middleware: Logger
export const logger: Middleware = (store) => (next) => (action) => {
  console.log("dispatching", action);
  const result = next(action);
  console.log("next state", store.getState());
  return result;
};

// Middleware: Thunk (async actions)
export const thunk: Middleware = (store) => (next) => (action) => {
  if (typeof action === "function") {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};

// Usage
const store = createStore(
  reducer,
  initialState,
  applyMiddleware(logger, thunk)
);

// Now you can dispatch functions!
store.dispatch((dispatch, getState) => {
  setTimeout(() => {
    dispatch({ type: "DELAYED_ACTION" });
  }, 1000);
});
```

**Tests (3 required):**

```tsx
// tests/applyMiddleware.test.ts
import { describe, it, expect } from "vitest";
import { createStore } from "../src/createStore";
import { applyMiddleware } from "../src/applyMiddleware";

describe("applyMiddleware", () => {
  it("executes middleware in correct order", () => {
    const calls: string[] = [];
    
    const mw1 = () => (next) => (action) => {
      calls.push("mw1-before");
      const result = next(action);
      calls.push("mw1-after");
      return result;
    };
    
    const mw2 = () => (next) => (action) => {
      calls.push("mw2-before");
      const result = next(action);
      calls.push("mw2-after");
      return result;
    };
    
    const store = createStore(
      (s) => s,
      {},
      applyMiddleware(mw1, mw2)
    );
    
    store.dispatch({ type: "TEST" });
    expect(calls).toEqual(["mw1-before", "mw2-before", "mw2-after", "mw1-after"]);
  });

  it("middleware can access getState", () => {
    let capturedState;
    
    const captureMw = (store) => (next) => (action) => {
      capturedState = store.getState();
      return next(action);
    };
    
    const store = createStore(
      (s) => s,
      { value: 42 },
      applyMiddleware(captureMw)
    );
    
    store.dispatch({ type: "TEST" });
    expect(capturedState).toEqual({ value: 42 });
  });

  it("thunk middleware handles function actions", () => {
    const thunk = (store) => (next) => (action) => {
      if (typeof action === "function") {
        return action(store.dispatch, store.getState);
      }
      return next(action);
    };
    
    const store = createStore(
      (s, a) => (a.type === "SET" ? { value: a.value } : s),
      { value: 0 },
      applyMiddleware(thunk)
    );
    
    // Dispatch a function that dispatches an action
    store.dispatch((dispatch) => {
      dispatch({ type: "SET", value: 99 });
    });
    
    expect(store.getState()).toEqual({ value: 99 });
  });
});
```

## Integration Test

```tsx
// tests/integration.test.ts
import { describe, it, expect } from "vitest";
import { createStore } from "../src/createStore";
import { combineReducers } from "../src/combineReducers";
import { applyMiddleware } from "../src/applyMiddleware";

describe("Redux Integration", () => {
  it("works end-to-end with all features", () => {
    // Reducers
    const counter = (s = 0, a: any) => (a.type === "INC" ? s + 1 : s);
    const todos = (s: string[] = [], a: any) => 
      a.type === "ADD" ? [...s, a.text] : s;

    const rootReducer = combineReducers({ counter, todos });

    // Middleware
    const logger = () => (next) => (action) => {
      console.log("Action:", action);
      return next(action);
    };

    // Create store
    const store = createStore(
      rootReducer,
      undefined,
      applyMiddleware(logger)
    );

    // Test
    expect(store.getState()).toEqual({ counter: 0, todos: [] });

    store.dispatch({ type: "INC" });
    expect(store.getState().counter).toBe(1);

    store.dispatch({ type: "ADD", text: "Learn Redux" });
    expect(store.getState().todos).toEqual(["Learn Redux"]);
  });
});
```

## Deliverables

```
mini-redux/
├── src/
│   ├── createStore.ts
│   ├── combineReducers.ts
│   ├── applyMiddleware.ts
│   └── compose.ts
├── tests/
│   ├── createStore.test.ts (4 tests)
│   ├── combineReducers.test.ts (2 tests)
│   ├── applyMiddleware.test.ts (3 tests)
│   └── integration.test.ts (1 test)
├── package.json
└── README.md (with reflection)
```

## Grading Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| createStore | 40 | All 4 tests pass |
| combineReducers | 30 | All 2 tests pass |
| applyMiddleware | 30 | All 3 tests pass |
| **Total** | **100** | **Pass: 70+** |

## Reflection Questions (in README.md)

Answer in 300-500 words:

1. **Middleware pattern:** How does the middleware chain work? Why is the signature `store => next => action => ...`?

2. **Compose function:** Explain how `compose(f, g, h)(x)` becomes `f(g(h(x)))`. Why right-to-left?

3. **Enhancer pattern:** What's the purpose of the enhancer parameter in createStore? How does it enable middleware?

4. **Comparison:** How does your implementation differ from real Redux? What features did you skip?

## Tips

1. Start with createStore (simplest)
2. Add combineReducers (medium difficulty)
3. Tackle applyMiddleware last (hardest)
4. Test each part before moving on
5. Use `console.log` to debug middleware chain

## Extension Ideas

- [ ] Add `replaceReducer` for hot module replacement
- [ ] Implement Redux DevTools protocol
- [ ] Add TypeScript strict types
- [ ] Build `redux-thunk` from scratch
- [ ] Create `redux-logger` middleware

## Time Estimate: 3-4 hours

## Resources

- [Redux Source Code](https://github.com/reduxjs/redux/tree/master/src)
- [Understanding Middleware](https://redux.js.org/understanding/history-and-design/middleware)
- [Function Composition](https://ramdajs.com/docs/#compose)
