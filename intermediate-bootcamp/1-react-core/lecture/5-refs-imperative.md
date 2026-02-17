# Refs & Imperative APIs

## What Are Refs?

A **ref** is a mutable container that persists across renders but does **not** trigger re-renders when changed. React manages two types of refs:

1. **DOM refs** — a reference to an actual DOM node
2. **Value refs** — a mutable value that survives re-renders without causing them

```jsx
const myRef = useRef(initialValue);
// myRef = { current: initialValue }
// myRef.current = anything — no re-render triggered!
```

## DOM Refs

Attach a ref to a JSX element with the `ref` prop to get a direct reference to the DOM node.

```jsx
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    // Access the real DOM node
    inputRef.current?.focus();
  }

  return (
    <>
      <input ref={inputRef} type="text" placeholder="Type here" />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}
```

**When to use DOM refs:**
- Focus management (open modal → focus first input)
- Triggering animations programmatically
- Integrating with non-React libraries (charts, maps, editors)
- Measuring DOM element dimensions
- Calling `play()`/`pause()` on `<video>` or `<audio>`

```jsx
// Measurements
function MeasuredBox({ children }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!boxRef.current) return;
    const { width, height } = boxRef.current.getBoundingClientRect();
    setDimensions({ width, height });
  }, []);

  return <div ref={boxRef}>{children}</div>;
}

// Video player
function VideoPlayer({ src, isPlaying }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isPlaying]);

  return <video ref={videoRef} src={src} />;
}

// Third-party integration
function MapComponent({ center, zoom }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // Initialize once on mount
    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      center,
      zoom,
    });
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Update map when props change (without re-mounting)
  useEffect(() => {
    mapRef.current?.setCenter(center);
  }, [center]);

  useEffect(() => {
    mapRef.current?.setZoom(zoom);
  }, [zoom]);

  return <div ref={mapContainerRef} style={{ width: "100%", height: 400 }} />;
}
```

## Value Refs — Storing Mutable Values

Refs store any mutable value that should persist across renders without triggering re-renders.

```jsx
// Store the previous value of a prop/state
function usePrevious<T>(value: T): T | undefined {
  const prevRef = useRef<T>();

  useEffect(() => {
    prevRef.current = value; // Updated after render
  });

  return prevRef.current; // Returns previous value during render
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  return <div>Now: {count}, Before: {prevCount}</div>;
}

// Store a stable callback that always reads the latest value
// (the "latest ref" pattern)
function useLatestCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
    // useLayoutEffect — updates before any effects run
    // Ensures the ref is up to date before event handlers fire
  });

  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    [] // Stable reference — never changes
  );
}

// Track whether a component is mounted (avoid "setState on unmounted component")
function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  return isMounted;
}

function AsyncComponent() {
  const [data, setData] = useState(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    fetchData().then(result => {
      if (isMounted.current) setData(result); // Safe
    });
  }, []);
}

// Store a mutable counter that doesn't trigger re-render
function EventTracker() {
  const clickCount = useRef(0); // Doesn't trigger re-renders when incremented

  return (
    <button onClick={() => {
      clickCount.current++;
      // We don't need to display this — just track it for analytics
      if (clickCount.current === 10) sendAnalytics("power_user");
    }}>
      Click me
    </button>
  );
}
```

## forwardRef — Passing Refs Through Components

By default, you can't put a `ref` on a custom component — refs are special, not regular props. `forwardRef` explicitly opts in.

```tsx
// Without forwardRef — ref is ignored!
function Input(props) {
  return <input {...props} />;
}

const inputRef = useRef(null);
<Input ref={inputRef} /> // ❌ ref doesn't reach the <input>!

// With forwardRef — ref is forwarded to the DOM element
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return <input ref={ref} {...props} />;
  }
);

// Now ref works
const inputRef = useRef<HTMLInputElement>(null);
<Input ref={inputRef} placeholder="Type here" />
inputRef.current?.focus(); // ✅ Points to the real <input>
```

### Combining Multiple Refs

```tsx
// Component needs both a forwarded ref AND an internal ref
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ onFocus, ...props }, forwardedRef) {
    const internalRef = useRef<HTMLInputElement>(null);

    // Sync both refs with a callback ref
    const ref = useMergedRefs(internalRef, forwardedRef);

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      // Use internal ref for internal logic
      internalRef.current?.select(); // Select all text on focus
      onFocus?.(e);
    }

    return <input ref={ref} onFocus={handleFocus} {...props} />;
  }
);

// useMergedRefs — merges any number of refs
function useMergedRefs<T>(...refs: React.Ref<T>[]) {
  return useCallback((node: T | null) => {
    refs.forEach(ref => {
      if (!ref) return;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    });
  }, refs); // eslint-disable-line react-hooks/exhaustive-deps
}
```

## `useImperativeHandle` — Controlled Imperative API

Sometimes you want to expose a custom API from a component rather than the raw DOM node.

```tsx
// VideoPlayer that exposes play/pause/seek without exposing the raw DOM
interface VideoPlayerHandle {
  play(): void;
  pause(): void;
  seek(time: number): void;
  getCurrentTime(): number;
}

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
}

const VideoPlayer = React.forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ src, autoPlay }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      play()  { videoRef.current?.play(); },
      pause() { videoRef.current?.pause(); },
      seek(time: number) {
        if (videoRef.current) videoRef.current.currentTime = time;
      },
      getCurrentTime() {
        return videoRef.current?.currentTime ?? 0;
      },
    }), []); // Deps for recreating the handle

    return <video ref={videoRef} src={src} autoPlay={autoPlay} />;
  }
);

// Usage — consumer gets a clean API, not a raw HTMLVideoElement
function MoviePlayer() {
  const playerRef = useRef<VideoPlayerHandle>(null);

  function handleSkipIntro() {
    playerRef.current?.seek(90); // Skip to 1:30
  }

  return (
    <>
      <VideoPlayer ref={playerRef} src="/movie.mp4" />
      <button onClick={handleSkipIntro}>Skip Intro</button>
      <button onClick={() => playerRef.current?.play()}>Play</button>
      <button onClick={() => playerRef.current?.pause()}>Pause</button>
    </>
  );
}
```

Another common use case: focusing from a parent.

```tsx
interface DialogHandle {
  focus(): void;
  scrollToTop(): void;
}

const Dialog = React.forwardRef<DialogHandle, DialogProps>(
  function Dialog({ title, children }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => ({
      focus() {
        closeButtonRef.current?.focus(); // Focus close button when opened
      },
      scrollToTop() {
        containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      },
    }), []);

    return (
      <div ref={containerRef} role="dialog" aria-modal>
        <h2>{title}</h2>
        <button ref={closeButtonRef}>✕</button>
        {children}
      </div>
    );
  }
);
```

## Callback Refs — Advanced Patterns

Instead of an object ref `useRef()`, you can pass a function as the ref.

```tsx
// Callback ref — called with node when mounted, null when unmounted
function AutoFocus() {
  const callbackRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.focus();
      node.select();
    }
  }, []); // Stable reference — only called on mount/unmount

  return <input ref={callbackRef} />;
}

// Callback ref with state (re-renders when element mounts)
function MeasuredContainer() {
  const [height, setHeight] = useState(0);

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <div>
      <div ref={measuredRef}>Content with dynamic height</div>
      <p>Content height: {height}px</p>
    </div>
  );
}
```

## When NOT to Use Refs

```jsx
// ❌ Using a ref to store state that affects rendering
function Counter() {
  const count = useRef(0);
  return (
    <button onClick={() => count.current++}>
      {count.current} {/* Won't update! Ref changes don't re-render */}
    </button>
  );
}
// Use useState instead

// ❌ Reading ref during render (it's always the same object)
function Component() {
  const valueRef = useRef(0);
  return <div>{valueRef.current}</div>; // Won't update on ref change
}

// ❌ Using refs to avoid passing props (prop drilling workaround)
// Use Context instead

// ✅ Refs are for:
// - Direct DOM manipulation (focus, scroll, measure, play)
// - Third-party library integration
// - Storing mutable values that don't affect rendering
// - Keeping latest value without stale closure
// - Tracking render counts, intervals, animation frames
```

## Key Takeaways

- `useRef()` returns `{ current: value }` — mutating it doesn't trigger re-renders
- DOM refs give you direct access to DOM nodes for imperative operations
- `forwardRef` passes a ref through a component to a DOM element or child component
- `useImperativeHandle` lets you expose a **custom API** instead of the raw DOM node
- Callback refs are called when the element mounts/unmounts — useful for dynamic measurement
- The "latest ref" pattern stores the newest callback without adding it to effect deps
- Never use refs to store values that affect what the component renders — use state

---

**Next:** [Lecture 6: Suspense & Concurrent Mode →](6-suspense-concurrent.md)
