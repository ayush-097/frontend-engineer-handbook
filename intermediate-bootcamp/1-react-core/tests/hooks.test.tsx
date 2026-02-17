/**
 * Custom Hooks Test Suite
 * Tests all 8 hooks from the custom-hooks-library lab.
 * Run: npx vitest hooks.test.tsx
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Imports ──────────────────────────────────────────────────────────────────
// Adjust paths if needed
import { useClickOutside } from "../lab/custom-hooks-library/hooks/useClickOutside";
import { useDebounce } from "../lab/custom-hooks-library/hooks/useDebounce";
import { useFetch } from "../lab/custom-hooks-library/hooks/useFetch";
import { useIntersectionObserver } from "../lab/custom-hooks-library/hooks/useIntersectionObserver";
import { useLocalStorage } from "../lab/custom-hooks-library/hooks/useLocalStorage";
import { useMediaQuery } from "../lab/custom-hooks-library/hooks/useMediaQuery";
import { usePrevious } from "../lab/custom-hooks-library/hooks/usePrevious";

// ─── useDebounce ──────────────────────────────────────────────────────────────

describe("useDebounce", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(()  => { vi.useRealTimers(); });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update before the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "hello" } }
    );
    rerender({ value: "world" });
    vi.advanceTimersByTime(200);
    expect(result.current).toBe("hello"); // Not yet
  });

  it("updates after the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "hello" } }
    );
    rerender({ value: "world" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("world");
  });

  it("resets timer if value changes within delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    vi.advanceTimersByTime(200); // 200ms in

    rerender({ value: "c" }); // Reset timer
    vi.advanceTimersByTime(200); // 200ms more — 400 total but only 200 since last change

    expect(result.current).toBe("a"); // Still hasn't updated!

    act(() => { vi.advanceTimersByTime(100); }); // Now 300ms since "c"
    expect(result.current).toBe("c");
  });

  it("cleans up timer on unmount", () => {
    const clearSpy = vi.spyOn(global, "clearTimeout");
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "hello" } }
    );
    rerender({ value: "world" });
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});

// ─── useLocalStorage ─────────────────────────────────────────────────────────

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("returns the initial value when no stored value exists", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 42));
    expect(result.current[0]).toBe(42);
  });

  it("returns stored value on initialization", () => {
    localStorage.setItem("test-key", JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("stored");
  });

  it("updates state and localStorage when setter is called", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0));
    act(() => { result.current[1](99); });
    expect(result.current[0]).toBe(99);
    expect(JSON.parse(localStorage.getItem("test-key")!)).toBe(99);
  });

  it("supports functional updates", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 10));
    act(() => { result.current[1](prev => prev + 5); });
    expect(result.current[0]).toBe(15);
  });

  it("syncs state when storage event fires from another tab", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "test-key",
          newValue: JSON.stringify("from-other-tab"),
        })
      );
    });
    expect(result.current[0]).toBe("from-other-tab");
  });

  it("ignores storage events for other keys", () => {
    const { result } = renderHook(() => useLocalStorage("my-key", "original"));
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "other-key", newValue: '"value"' })
      );
    });
    expect(result.current[0]).toBe("original");
  });
});

// ─── useFetch ─────────────────────────────────────────────────────────────────

describe("useFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("starts in loading state", () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    const { result } = renderHook(() => useFetch<string[]>("/api/items"));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it("resolves data on success", async () => {
    const mockData = [{ id: 1, name: "Alice" }];
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });
    const { result } = renderHook(() => useFetch<typeof mockData>("/api/users"));

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("sets error on non-OK response", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });
    const { result } = renderHook(() => useFetch<unknown>("/api/missing"));

    await act(async () => { await new Promise(r => setTimeout(r, 0)); });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.loading).toBe(false);
  });

  it("aborts fetch when URL changes", async () => {
    const abortSpy = vi.fn();
    const mockController = { abort: abortSpy, signal: {} };
    vi.spyOn(global, "AbortController").mockImplementation(() => mockController as any);

    (fetch as any).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const { rerender } = renderHook(
      ({ url }) => useFetch<unknown>(url),
      { initialProps: { url: "/api/v1" } }
    );

    rerender({ url: "/api/v2" });
    expect(abortSpy).toHaveBeenCalled();
  });

  it("does nothing when url is null", () => {
    const { result } = renderHook(() => useFetch<unknown>(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ─── useMediaQuery ───────────────────────────────────────────────────────────

describe("useMediaQuery", () => {
  it("returns true when query matches", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(max-width: 768px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("returns false when query does not match", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useMediaQuery("(max-width: 400px)"));
    expect(result.current).toBe(false);
  });

  it("updates when media query changes", () => {
    let changeHandler: (e: any) => void = () => {};
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: (_: string, handler: (e: any) => void) => {
          changeHandler = handler;
        },
        removeEventListener: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(result.current).toBe(false);

    act(() => { changeHandler({ matches: true }); });
    expect(result.current).toBe(true);
  });

  it("removes listener on unmount", () => {
    const removeListener = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: removeListener,
      })),
    });

    const { unmount } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    unmount();
    expect(removeListener).toHaveBeenCalled();
  });
});

// ─── usePrevious ─────────────────────────────────────────────────────────────

describe("usePrevious", () => {
  it("returns undefined on first render", () => {
    const { result } = renderHook(() => usePrevious(42));
    expect(result.current).toBeUndefined();
  });

  it("returns previous value on subsequent renders", () => {
    const { result, rerender } = renderHook(
      ({ val }) => usePrevious(val),
      { initialProps: { val: 1 } }
    );
    expect(result.current).toBeUndefined();

    rerender({ val: 2 });
    expect(result.current).toBe(1);

    rerender({ val: 3 });
    expect(result.current).toBe(2);
  });

  it("works with object values", () => {
    const obj1 = { name: "Alice" };
    const obj2 = { name: "Bob" };

    const { result, rerender } = renderHook(
      ({ val }) => usePrevious(val),
      { initialProps: { val: obj1 } }
    );
    rerender({ val: obj2 });
    expect(result.current).toBe(obj1); // Same reference
  });
});

// ─── useClickOutside ─────────────────────────────────────────────────────────

describe("useClickOutside", () => {
  it("does not call handler on click inside element", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(handler));

    // Simulate element in DOM
    const div = document.createElement("div");
    document.body.appendChild(div);
    (result.current as any).current = div;

    const event = new MouseEvent("mousedown", { bubbles: true });
    div.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it("calls handler on click outside element", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(handler));

    const div = document.createElement("div");
    document.body.appendChild(div);
    (result.current as any).current = div;

    const outside = document.createElement("button");
    document.body.appendChild(outside);

    const event = new MouseEvent("mousedown", { bubbles: true });
    outside.dispatchEvent(event);
    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(div);
    document.body.removeChild(outside);
  });

  it("cleans up listeners on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => useClickOutside(() => {}));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("touchstart", expect.any(Function));
  });
});

// ─── useIntersectionObserver ─────────────────────────────────────────────────

describe("useIntersectionObserver", () => {
  let mockObserve:    ReturnType<typeof vi.fn>;
  let mockUnobserve:  ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let observerCallback: IntersectionObserverCallback;

  beforeEach(() => {
    mockObserve    = vi.fn();
    mockUnobserve  = vi.fn();
    mockDisconnect = vi.fn();

    global.IntersectionObserver = vi.fn((cb) => {
      observerCallback = cb;
      return { observe: mockObserve, unobserve: mockUnobserve, disconnect: mockDisconnect };
    }) as any;
  });

  it("creates an IntersectionObserver", () => {
    renderHook(() => useIntersectionObserver());
    expect(IntersectionObserver).toHaveBeenCalled();
  });

  it("observes element when ref is set", () => {
    const { result } = renderHook(() => useIntersectionObserver());
    const [refCallback] = result.current;

    const el = document.createElement("div");
    act(() => { refCallback(el); });

    expect(mockObserve).toHaveBeenCalledWith(el);
  });

  it("returns entry when intersection fires", () => {
    const { result } = renderHook(() => useIntersectionObserver());
    const [refCallback] = result.current;

    const el = document.createElement("div");
    act(() => { refCallback(el); });

    const mockEntry = { isIntersecting: true, target: el } as IntersectionObserverEntry;
    act(() => { observerCallback([mockEntry], {} as IntersectionObserver); });

    expect(result.current[1]).toBe(mockEntry);
  });

  it("disconnects on unmount", () => {
    const { result, unmount } = renderHook(() => useIntersectionObserver());
    const [refCallback] = result.current;
    const el = document.createElement("div");
    act(() => { refCallback(el); });
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
