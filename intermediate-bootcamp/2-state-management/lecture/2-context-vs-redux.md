# Context vs Redux

## The Flux Architecture

```
Action → Dispatcher → Store → View
   ↑_________________________________|
         (view dispatches actions)
```

**Flux principles:**
1. Unidirectional data flow
2. Single source of truth (store)
3. State is read-only (only actions mutate)
4. Changes are made with pure functions (reducers)

## Context + useReducer — The "Poor Man's Redux"

```tsx
type State = { count: number; user: User | null };
type Action =
  | { type: "INCREMENT" }
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INCREMENT": return { ...state, count: state.count + 1 };
    case "LOGIN":     return { ...state, user: action.payload };
    case "LOGOUT":    return { ...state, user: null };
  }
}

const StateContext = createContext<State | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}
```

**When Context + useReducer is enough:**
- Simple global state (theme, auth, 1-2 slices)
- No need for middleware, devtools, time-travel
- Team is comfortable with hooks

## Redux — When You Need More

**Use Redux when:**
- Complex state logic (multiple interdependent slices)
- Middleware needed (logging, analytics, thunks)
- Debugging with Redux DevTools time-travel
- Team knows Redux, not worth migration cost

**Redux Toolkit (RTK) — Modern Redux**

```tsx
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    incremented: (state) => { state.value++; }, // Immer auto-applied!
    decremented: (state) => { state.value--; },
    addedBy: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { incremented, decremented, addedBy } = counterSlice.actions;

const store = configureStore({
  reducer: { counter: counterSlice.reducer },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Key Differences:**

| Feature | Context + useReducer | Redux (RTK) |
|---------|---------------------|-------------|
| Setup complexity | Low | Medium |
| Devtools | No | Yes |
| Middleware | Manual | Built-in |
| Performance | Re-renders all consumers | Selector-based |
| Async | useEffect in components | Thunks / Sagas |
| Learning curve | Small | Medium |

**Key Takeaway:** Start with Context. Add Redux when you outgrow it.
