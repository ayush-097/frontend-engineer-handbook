# Unit Testing

## Pure Functions

```tsx
// formatters.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// formatters.test.ts
describe("formatCurrency", () => {
  it("formats positive numbers", () => {
    expect(formatCurrency(100)).toBe("$100.00");
  });
  
  it("formats negative numbers", () => {
    expect(formatCurrency(-50)).toBe("-$50.00");
  });
  
  it("rounds to 2 decimals", () => {
    expect(formatCurrency(99.999)).toBe("$100.00");
  });
});
```

## Custom Hooks

```tsx
// useCounter.ts
export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initial);
  return { count, increment, decrement, reset };
}

// useCounter.test.ts
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("initializes with default value", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });
  
  it("increments count", () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });
  
  it("resets to initial value", () => {
    const { result } = renderHook(() => useCounter(10));
    act(() => {
      result.current.increment();
      result.current.reset();
    });
    expect(result.current.count).toBe(10);
  });
});
```

## Testing Reducers

```tsx
// todosReducer.ts
export function todosReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, action.payload];
    case "REMOVE_TODO":
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
}

// todosReducer.test.ts
describe("todosReducer", () => {
  it("adds todo", () => {
    const state = [];
    const action = { type: "ADD_TODO", payload: { id: 1, text: "Test" } };
    expect(todosReducer(state, action)).toEqual([{ id: 1, text: "Test" }]);
  });
  
  it("removes todo", () => {
    const state = [{ id: 1, text: "Test" }];
    const action = { type: "REMOVE_TODO", payload: 1 };
    expect(todosReducer(state, action)).toEqual([]);
  });
});
```
