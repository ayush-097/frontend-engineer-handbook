# Lab: Build Flux/Redux from Scratch

Implement Redux core to understand state management internals.

## APIs to Implement

### createStore(reducer, initialState)
```tsx
const store = createStore(counterReducer, { count: 0 });
store.getState();    // { count: 0 }
store.dispatch({ type: "INC" });
store.getState();    // { count: 1 }
const unsub = store.subscribe(() => console.log(store.getState()));
```

### combineReducers(reducers)
```tsx
const rootReducer = combineReducers({
  counter: counterReducer,
  todos: todosReducer
});
```

### applyMiddleware(...middlewares)
```tsx
const logger = store => next => action => {
  console.log("dispatching", action);
  const result = next(action);
  console.log("next state", store.getState());
  return result;
};

const store = createStore(reducer, applyMiddleware(logger, thunk));
```

## Implementation Guide

```tsx
// src/createStore.ts
export function createStore(reducer, initialState, enhancer) {
  if (enhancer) return enhancer(createStore)(reducer, initialState);
  
  let state = initialState;
  let listeners = [];
  
  return {
    getState: () => state,
    dispatch: (action) => {
      state = reducer(state, action);
      listeners.forEach(fn => fn());
      return action;
    },
    subscribe: (listener) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(fn => fn !== listener);
      };
    }
  };
}
```

## Tests (Must Pass)
1. getState returns current state
2. dispatch updates state
3. subscribe calls listener
4. unsubscribe removes listener
5. combineReducers merges slices
6. middleware receives store/next/action
7. middleware chain executes in order
8. thunk middleware delays dispatch

## Time: 2-3 hours
