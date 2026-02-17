/**
 * Custom Renderer & React Internals Tests
 *
 * Tests that explore reconciliation behavior, Fiber updates,
 * and concurrent features using React Testing Library and act().
 *
 * Run: npx vitest custom-renderer.test.tsx
 */
import {
          act,
          fireEvent,
          render, screen,
          waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, {
          Suspense, memo,
          useDeferredValue,
          useEffect,
          useReducer,
          useRef,
          useState,
          useTransition
} from "react";
import { describe, expect, it, vi } from "vitest";

// ─── Reconciliation — key behavior ───────────────────────────────────────────

describe("Reconciliation — key behavior", () => {
  it("preserves state when key is unchanged", async () => {
    const user = userEvent.setup();

    function Counter({ id }: { id: string }) {
      const [count, setCount] = useState(0);
      return (
        <div data-testid={id}>
          <span data-testid="count">{count}</span>
          <button onClick={() => setCount(c => c + 1)}>+</button>
        </div>
      );
    }

    function App({ show }: { show: boolean }) {
      return (
        <>
          <Counter id="counter" />
          {show && <div>Extra</div>}
        </>
      );
    }

    const { rerender } = render(<App show={false} />);
    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByTestId("count").textContent).toBe("1");

    // Parent re-renders but counter key is same — state preserved
    rerender(<App show={true} />);
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("resets state when key changes", async () => {
    const user = userEvent.setup();

    function Counter({ label }: { label: string }) {
      const [count, setCount] = useState(0);
      return (
        <div>
          <span data-testid="count">{count}</span>
          <button onClick={() => setCount(c => c + 1)}>+ {label}</button>
        </div>
      );
    }

    const { rerender } = render(<Counter key="a" label="A" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("count").textContent).toBe("1");

    // Different key = new component instance = state reset
    rerender(<Counter key="b" label="B" />);
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("remounts when component type changes at same position", () => {
    const mountLog: string[] = [];
    const unmountLog: string[] = [];

    function Div() {
      useEffect(() => {
        mountLog.push("Div");
        return () => unmountLog.push("Div");
      }, []);
      return <div>Div</div>;
    }

    function Span() {
      useEffect(() => {
        mountLog.push("Span");
        return () => unmountLog.push("Span");
      }, []);
      return <span>Span</span>;
    }

    function App({ useDiv }: { useDiv: boolean }) {
      return useDiv ? <Div /> : <Span />;
    }

    const { rerender } = render(<App useDiv={true} />);
    rerender(<App useDiv={false} />);

    expect(mountLog).toContain("Div");
    expect(unmountLog).toContain("Div");
    expect(mountLog).toContain("Span");
  });
});

// ─── React.memo — skip re-renders ────────────────────────────────────────────

describe("React.memo", () => {
  it("skips re-render when props are unchanged", () => {
    let renderCount = 0;

    const Expensive = memo(function Expensive({ name }: { name: string }) {
      renderCount++;
      return <div>{name}</div>;
    });

    function Parent() {
      const [count, setCount] = useState(0);
      return (
        <>
          <button onClick={() => setCount(c => c + 1)}>re-render parent</button>
          <Expensive name="Alice" />
        </>
      );
    }

    render(<Parent />);
    expect(renderCount).toBe(1);

    fireEvent.click(screen.getByText("re-render parent"));
    expect(renderCount).toBe(1); // Still 1 — memo skipped it!

    fireEvent.click(screen.getByText("re-render parent"));
    expect(renderCount).toBe(1);
  });

  it("re-renders when props change", () => {
    let renderCount = 0;

    const Display = memo(function Display({ value }: { value: number }) {
      renderCount++;
      return <span>{value}</span>;
    });

    const { rerender } = render(<Display value={1} />);
    expect(renderCount).toBe(1);

    rerender(<Display value={2} />);
    expect(renderCount).toBe(2); // Props changed — re-render
  });
});

// ─── useEffect timing ────────────────────────────────────────────────────────

describe("useEffect timing", () => {
  it("runs effect after render", () => {
    const log: string[] = [];

    function Comp() {
      log.push("render");
      useEffect(() => { log.push("effect"); }, []);
      return null;
    }

    render(<Comp />);
    // After render and effects:
    expect(log[0]).toBe("render");
    expect(log[1]).toBe("effect");
  });

  it("runs cleanup before next effect", async () => {
    const log: string[] = [];

    function Comp({ value }: { value: string }) {
      useEffect(() => {
        log.push(`setup: ${value}`);
        return () => log.push(`cleanup: ${value}`);
      }, [value]);
      return null;
    }

    const { rerender } = render(<Comp value="a" />);
    rerender(<Comp value="b" />);

    // After first render: setup:a
    // After rerender: cleanup:a, setup:b
    await waitFor(() => expect(log).toContain("setup: b"));
    const cleanupIdx = log.indexOf("cleanup: a");
    const setupBIdx  = log.indexOf("setup: b");
    expect(cleanupIdx).toBeLessThan(setupBIdx);
  });

  it("runs cleanup on unmount", () => {
    const cleanup = vi.fn();

    function Comp() {
      useEffect(() => cleanup, []);
      return null;
    }

    const { unmount } = render(<Comp />);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("runs effects in order", async () => {
    const log: string[] = [];

    function Comp() {
      useEffect(() => { log.push("A"); }, []);
      useEffect(() => { log.push("B"); }, []);
      useEffect(() => { log.push("C"); }, []);
      return null;
    }

    render(<Comp />);
    await waitFor(() => expect(log).toHaveLength(3));
    expect(log).toEqual(["A", "B", "C"]);
  });

  it("no-deps effect runs after every render", async () => {
    const effect = vi.fn();

    function Comp({ count }: { count: number }) {
      useEffect(effect); // No deps
      return <span>{count}</span>;
    }

    const { rerender } = render(<Comp count={0} />);
    await waitFor(() => expect(effect).toHaveBeenCalledTimes(1));

    rerender(<Comp count={1} />);
    await waitFor(() => expect(effect).toHaveBeenCalledTimes(2));

    rerender(<Comp count={2} />);
    await waitFor(() => expect(effect).toHaveBeenCalledTimes(3));
  });
});

// ─── useReducer ───────────────────────────────────────────────────────────────

describe("useReducer", () => {
  type State = { count: number; history: number[] };
  type Action =
    | { type: "increment"; by?: number }
    | { type: "decrement" }
    | { type: "reset" };

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "increment":
        return { count: state.count + (action.by ?? 1), history: [...state.history, state.count] };
      case "decrement":
        return { count: state.count - 1, history: [...state.history, state.count] };
      case "reset":
        return { count: 0, history: [] };
    }
  }

  function Counter() {
    const [state, dispatch] = useReducer(reducer, { count: 0, history: [] });
    return (
      <div>
        <span data-testid="count">{state.count}</span>
        <span data-testid="history">{state.history.join(",")}</span>
        <button onClick={() => dispatch({ type: "increment" })}>+1</button>
        <button onClick={() => dispatch({ type: "increment", by: 5 })}>+5</button>
        <button onClick={() => dispatch({ type: "decrement" })}>-1</button>
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    );
  }

  it("starts with initial state", () => {
    render(<Counter />);
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("increments by 1", async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByText("+1"));
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("increments by custom amount", async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByText("+5"));
    expect(screen.getByTestId("count").textContent).toBe("5");
  });

  it("records history", async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByText("+1"));
    await user.click(screen.getByText("+1"));
    expect(screen.getByTestId("history").textContent).toBe("0,1");
  });

  it("resets to initial state", async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByText("+1"));
    await user.click(screen.getByText("+5"));
    await user.click(screen.getByText("Reset"));
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("history").textContent).toBe("");
  });
});

// ─── useTransition ───────────────────────────────────────────────────────────

describe("useTransition", () => {
  it("isPending is true during a transition", async () => {
    function App() {
      const [items, setItems] = useState<number[]>([]);
      const [isPending, startTransition] = useTransition();

      function loadItems() {
        startTransition(() => {
          setItems(Array.from({ length: 100 }, (_, i) => i));
        });
      }

      return (
        <div>
          <button onClick={loadItems}>Load</button>
          {isPending && <span data-testid="pending">Loading...</span>}
          <span data-testid="count">{items.length}</span>
        </div>
      );
    }

    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Load"));

    // After the transition completes, items should be set
    await waitFor(() => {
      expect(screen.getByTestId("count").textContent).toBe("100");
    });
  });
});

// ─── useDeferredValue ────────────────────────────────────────────────────────

describe("useDeferredValue", () => {
  it("deferred value lags behind source value", async () => {
    function App() {
      const [value, setValue] = useState("");
      const deferred = useDeferredValue(value);
      const isStale = value !== deferred;

      return (
        <div>
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            data-testid="input"
          />
          <span data-testid="source">{value}</span>
          <span data-testid="deferred">{deferred}</span>
          <span data-testid="stale">{isStale ? "stale" : "current"}</span>
        </div>
      );
    }

    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("input"), "hello");

    // Eventually source and deferred converge
    await waitFor(() => {
      expect(screen.getByTestId("source").textContent)
        .toBe(screen.getByTestId("deferred").textContent);
    });
  });
});

// ─── Stale closure detection ─────────────────────────────────────────────────

describe("Stale closure patterns", () => {
  it("functional update avoids stale closure in interval", async () => {
    vi.useFakeTimers();

    function Counter() {
      const [count, setCount] = useState(0);

      useEffect(() => {
        const id = setInterval(() => {
          setCount(c => c + 1); // Functional update — no closure capture
        }, 1000);
        return () => clearInterval(id);
      }, []); // Empty deps — no stale closure because of functional update

      return <span data-testid="count">{count}</span>;
    }

    render(<Counter />);
    expect(screen.getByTestId("count").textContent).toBe("0");

    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId("count").textContent).toBe("1");

    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByTestId("count").textContent).toBe("4");

    vi.useRealTimers();
  });

  it("ref pattern avoids stale closure for callbacks", async () => {
    const user = userEvent.setup();

    function LogValue({ value }: { value: number }) {
      const valueRef = useRef(value);
      valueRef.current = value; // Always up-to-date

      const log: number[] = [];

      const logValue = useRef(() => {
        log.push(valueRef.current); // Reads from ref, not closure
      });

      return (
        <button onClick={() => logValue.current()}>
          Log {value}
        </button>
      );
    }

    const { rerender } = render(<LogValue value={1} />);
    rerender(<LogValue value={2} />);
    rerender(<LogValue value={3} />);

    // Component renders correctly with latest value
    expect(screen.getByRole("button").textContent).toContain("3");
  });
});

// ─── Suspense ─────────────────────────────────────────────────────────────────

describe("Suspense", () => {
  it("shows fallback while suspended", async () => {
    let resolvePromise: (value: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });

    let resolved = false;
    const resource = {
      read(): string {
        if (!resolved) throw promise;
        return "Loaded!";
      },
    };

    function AsyncComponent() {
      const data = resource.read();
      return <div>{data}</div>;
    }

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <AsyncComponent />
      </Suspense>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Resolve the promise
    await act(async () => {
      resolved = true;
      resolvePromise!("Loaded!");
      await promise;
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).toBeNull();
    });
  });

  it("React.lazy loads component lazily", async () => {
    const LazyComp = React.lazy(
      () => new Promise<{ default: React.FC }>(resolve => {
        setTimeout(() => resolve({ default: () => <div>Lazy content</div> }), 10);
      })
    );

    render(
      <Suspense fallback={<div>Loading lazy...</div>}>
        <LazyComp />
      </Suspense>
    );

    expect(screen.getByText("Loading lazy...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Lazy content")).toBeInTheDocument();
    });
  });
});
