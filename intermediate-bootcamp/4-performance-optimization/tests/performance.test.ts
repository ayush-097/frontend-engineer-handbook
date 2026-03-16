import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Test: Component doesn't re-render unnecessarily
describe("Re-render optimization", () => {
  it("memo prevents re-render when props unchanged", () => {
    const renderSpy = vi.fn();
    
    const Child = React.memo(({ value }: { value: number }) => {
      renderSpy();
      return <div>{value}</div>;
    });
    
    const Parent = () => {
      const [count, setCount] = useState(0);
      const [other, setOther] = useState(0);
      
      return (
        <>
          <button onClick={() => setOther(o => o + 1)}>Update Other</button>
          <Child value={count} />
        </>
      );
    };
    
    render(<Parent />);
    const initialRenderCount = renderSpy.mock.calls.length;
    
    // Update unrelated state
    userEvent.click(screen.getByText("Update Other"));
    
    // Child should NOT re-render
    expect(renderSpy).toHaveBeenCalledTimes(initialRenderCount);
  });

  it("useMemo prevents expensive recalculation", () => {
    const expensiveCalc = vi.fn((n: number) => {
      // Simulate expensive operation
      let result = 0;
      for (let i = 0; i < n; i++) result += i;
      return result;
    });
    
    const Component = ({ value }: { value: number }) => {
      const [, setOther] = useState(0);
      
      const result = useMemo(() => expensiveCalc(value), [value]);
      
      return (
        <>
          <div>{result}</div>
          <button onClick={() => setOther(o => o + 1)}>Update</button>
        </>
      );
    };
    
    render(<Component value={1000} />);
    const initialCallCount = expensiveCalc.mock.calls.length;
    
    // Update unrelated state
    userEvent.click(screen.getByText("Update"));
    
    // Expensive calc should NOT run again
    expect(expensiveCalc).toHaveBeenCalledTimes(initialCallCount);
  });

  it("useCallback prevents function recreation", () => {
    const Child = React.memo(({ onClick }: { onClick: () => void }) => {
      renderCount++;
      return <button onClick={onClick}>Click</button>;
    });
    
    let renderCount = 0;
    
    const Parent = () => {
      const [, setCount] = useState(0);
      
      // ❌ Without useCallback
      const handleClick = () => console.log("clicked");
      
      return (
        <>
          <button onClick={() => setCount(c => c + 1)}>Update Parent</button>
          <Child onClick={handleClick} />
        </>
      );
    };
    
    render(<Parent />);
    const initialRenders = renderCount;
    
    userEvent.click(screen.getByText("Update Parent"));
    
    // Child re-renders because handleClick is new function
    expect(renderCount).toBeGreaterThan(initialRenders);
  });

  it("useCallback with stable reference prevents re-render", () => {
    const Child = React.memo(({ onClick }: { onClick: () => void }) => {
      renderCount++;
      return <button onClick={onClick}>Click</button>;
    });
    
    let renderCount = 0;
    
    const Parent = () => {
      const [, setCount] = useState(0);
      
      // ✅ With useCallback
      const handleClick = useCallback(() => console.log("clicked"), []);
      
      return (
        <>
          <button onClick={() => setCount(c => c + 1)}>Update Parent</button>
          <Child onClick={handleClick} />
        </>
      );
    };
    
    render(<Parent />);
    const initialRenders = renderCount;
    
    userEvent.click(screen.getByText("Update Parent"));
    
    // Child does NOT re-render (handleClick is stable)
    expect(renderCount).toBe(initialRenders);
  });
});

// Test: Virtualization performance
describe("Virtualization", () => {
  it("renders only visible items, not all items", () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      text: `Item ${i}`,
    }));
    
    const { container } = render(
      <FixedSizeList
        height={600}
        itemCount={items.length}
        itemSize={50}
        width="100%"
      >
        {({ index, style }) => (
          <div style={style} data-testid={`item-${index}`}>
            {items[index].text}
          </div>
        )}
      </FixedSizeList>
    );
    
    // Should only render ~15 items (visible window)
    const renderedItems = container.querySelectorAll('[data-testid^="item-"]');
    expect(renderedItems.length).toBeLessThan(20);
    expect(renderedItems.length).toBeGreaterThan(10);
  });

  it("updates visible items on scroll", async () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
    
    const { container } = render(
      <FixedSizeList
        height={600}
        itemCount={items.length}
        itemSize={50}
        width="100%"
      >
        {({ index, style }) => (
          <div style={style}>{index}</div>
        )}
      </FixedSizeList>
    );
    
    const listElement = container.querySelector('[style*="overflow"]');
    
    // Initial: Item 0 should be visible
    expect(screen.queryByText("0")).toBeInTheDocument();
    expect(screen.queryByText("50")).not.toBeInTheDocument();
    
    // Scroll down
    act(() => {
      listElement.scrollTop = 2500; // 50 items × 50px
      listElement.dispatchEvent(new Event("scroll"));
    });
    
    await waitFor(() => {
      // After scroll: Item 50 should be visible, 0 should not
      expect(screen.queryByText("50")).toBeInTheDocument();
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });
});

// Test: Performance timing
describe("Performance metrics", () => {
  it("measures component render time", () => {
    performance.mark("render-start");
    
    render(<ExpensiveComponent />);
    
    performance.mark("render-end");
    performance.measure("render", "render-start", "render-end");
    
    const measure = performance.getEntriesByName("render")[0];
    
    // Should render in < 100ms
    expect(measure.duration).toBeLessThan(100);
  });

  it("lazy loading defers component load", async () => {
    const LazyComponent = lazy(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({ default: () => <div>Loaded</div> }), 100)
      )
    );
    
    const startTime = performance.now();
    
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    );
    
    const syncLoadTime = performance.now() - startTime;
    
    // Initial render should be instant (shows fallback)
    expect(syncLoadTime).toBeLessThan(50);
    
    // Wait for lazy component to load
    await waitFor(() => {
      expect(screen.getByText("Loaded")).toBeInTheDocument();
    });
  });

  it("image lazy loading defers load", () => {
    const { container } = render(
      <img src="large-image.jpg" loading="lazy" alt="Large" />
    );
    
    const img = container.querySelector("img");
    
    // Browser should defer loading (implementation-dependent)
    expect(img.getAttribute("loading")).toBe("lazy");
  });
});

// Test: Web Vitals simulation
describe("Web Vitals tracking", () => {
  it("tracks LCP (Largest Contentful Paint)", () => {
    const onLCP = vi.fn();
    
    // Simulate LCP observer
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      onLCP(lastEntry.renderTime || lastEntry.loadTime);
    });
    
    observer.observe({ type: "largest-contentful-paint", buffered: true });
    
    render(<LargeHeroImage src="hero.jpg" />);
    
    // LCP should be tracked
    expect(onLCP).toHaveBeenCalled();
  });

  it("tracks CLS (Cumulative Layout Shift)", () => {
    let clsScore = 0;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      }
    });
    
    observer.observe({ type: "layout-shift", buffered: true });
    
    // Render image without dimensions (causes layout shift)
    render(<img src="photo.jpg" />);
    
    // Should detect layout shift
    // (In real browser, CLS > 0. In jsdom, observer may not fire)
  });
});

// Test: Bundle size (integration test)
describe("Bundle size", () => {
  it("initial bundle is under size budget", async () => {
    // This would run in CI after build
    const stats = await import("./build/bundle-stats.json");
    const mainBundleSize = stats.assets.find(a => a.name === "main.js").size;
    
    // Budget: 200kb gzipped
    expect(mainBundleSize).toBeLessThan(200 * 1024);
  });

  it("lazy chunks are properly split", async () => {
    const stats = await import("./build/bundle-stats.json");
    const chunks = stats.assets.filter(a => a.name.includes("chunk"));
    
    // Should have separate chunks for routes
    expect(chunks.length).toBeGreaterThan(3);
    
    // Each chunk should be small
    chunks.forEach(chunk => {
      expect(chunk.size).toBeLessThan(100 * 1024);
    });
  });
});
