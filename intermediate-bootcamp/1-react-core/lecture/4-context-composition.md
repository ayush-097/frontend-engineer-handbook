# Context & Composition

## Context — What It's For

Context solves **prop drilling** — the need to pass props through many intermediate components that don't use them.

```jsx
// Without context — every layer must forward userId
function App() {
  const [userId, setUserId] = useState(1);
  return <Layout userId={userId} />;       // Layout doesn't use userId
}
function Layout({ userId }) {
  return <Sidebar userId={userId} />;      // Sidebar doesn't use userId
}
function Sidebar({ userId }) {
  return <UserWidget userId={userId} />;   // UserWidget finally uses it
}

// With context — skip the middle layers
const UserContext = React.createContext(null);

function App() {
  const [userId, setUserId] = useState(1);
  return (
    <UserContext.Provider value={userId}>
      <Layout />   {/* no prop needed */}
    </UserContext.Provider>
  );
}
function Layout() { return <Sidebar />; }     // completely unaware
function Sidebar() { return <UserWidget />; }  // completely unaware
function UserWidget() {
  const userId = useContext(UserContext);  // reads directly
  return <div>User {userId}</div>;
}
```

## Creating and Consuming Context

```tsx
// Step 1: Define the shape
interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// Step 2: Create context with a meaningful default
// null + type assertion = force consumer to be inside a provider
const ThemeContext = React.createContext<ThemeContextValue | null>(null);

// Step 3: Custom hook that validates the context
function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

// Step 4: Provider component owns the state
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = useCallback(() => {
    setTheme(t => t === "light" ? "dark" : "light");
  }, []);

  // Memoize the value object to prevent unnecessary re-renders
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Step 5: Use anywhere in the tree
function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header data-theme={theme}>
      <button onClick={toggleTheme}>Toggle</button>
    </header>
  );
}
```

## Context Performance — Avoiding Unnecessary Re-renders

**Every consumer re-renders when the context value changes.** Since objects are compared by reference, a new object on every render = every consumer re-renders.

```jsx
// ❌ New object on every Provider render — all consumers re-render every time
function BadProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");

  return (
    <AppContext.Provider value={{ user, theme, setUser, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

// ✅ Fix 1: Memoize the value
function GoodProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");

  const setUserStable = useCallback(setUser, []);
  const setThemeStable = useCallback(setTheme, []);

  const value = useMemo(
    () => ({ user, theme, setUser: setUserStable, setTheme: setThemeStable }),
    [user, theme, setUserStable, setThemeStable]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ✅ Fix 2: Split contexts by update frequency
// State that changes often should NOT share context with rarely-changing state
const UserContext  = React.createContext(null); // user object — changes on login
const ThemeContext = React.createContext(null); // theme — changes rarely
const DispatchContext = React.createContext(null); // dispatch — never changes

// ThemeContext consumers don't re-render when user changes!
```

## Context + useReducer — The Poor Man's Redux

```tsx
// Full app state management without external libraries

type AppState = {
  user: User | null;
  notifications: Notification[];
  sidebarOpen: boolean;
};

type AppAction =
  | { type: "LOGIN";  payload: User }
  | { type: "LOGOUT" }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "DISMISS_NOTIFICATION"; payload: string }
  | { type: "TOGGLE_SIDEBAR" };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null, notifications: [] };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case "DISMISS_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
  }
}

// Separate state and dispatch contexts — dispatch never changes!
const StateContext    = React.createContext<AppState | null>(null);
const DispatchContext = React.createContext<React.Dispatch<AppAction> | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    notifications: [],
    sidebarOpen: false,
  });

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Selector hooks — only the state slice you need
export function useAppState() {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("Must be inside AppProvider");
  return ctx;
}

export function useDispatch() {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error("Must be inside AppProvider");
  return ctx;
}

// Component that only cares about notifications won't re-render on user change
function NotificationBell() {
  const { notifications } = useAppState();
  const dispatch = useDispatch();
  // ...
}
```

## Composition Patterns

### 1. Children as API

The most underutilized React pattern — using `children` as the primary composition point.

```jsx
// ❌ Props for everything — rigid, impossible to extend
<Modal
  title="Confirm"
  body="Are you sure?"
  primaryButton="Yes"
  secondaryButton="No"
  onPrimary={handleConfirm}
  onSecondary={handleCancel}
  footerExtra={<HelpLink />}
/>

// ✅ Composition — consumer controls the structure
<Modal>
  <Modal.Header>Confirm</Modal.Header>
  <Modal.Body>
    <p>Are you sure?</p>
    <WarningMessage />  {/* Can add anything here */}
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleCancel}>No</Button>
    <Button variant="primary" onClick={handleConfirm}>Yes</Button>
    <HelpLink />        {/* Can add anything here too */}
  </Modal.Footer>
</Modal>
```

### 2. Compound Components Pattern

A family of components that share implicit state through context, presenting a unified API.

```tsx
// Accordion with shared state via context
interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Must be inside <Accordion>");
  return ctx;
}

// Root component provides context
interface AccordionProps {
  defaultOpen?: string[];
  allowMultiple?: boolean;
  children: React.ReactNode;
}

function Accordion({ defaultOpen = [], allowMultiple = false, children }: AccordionProps) {
  const [openItems, setOpenItems] = useState(new Set(defaultOpen));

  const toggle = useCallback((id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }, [allowMultiple]);

  const value = useMemo(() => ({ openItems, toggle, allowMultiple }), [openItems, toggle, allowMultiple]);

  return (
    <AccordionContext.Provider value={value}>
      <div role="region">{children}</div>
    </AccordionContext.Provider>
  );
}

// Child components consume context
interface AccordionItemProps {
  id: string;
  children: React.ReactNode;
}

function AccordionItem({ id, children }: AccordionItemProps) {
  const { openItems } = useAccordionContext();
  return (
    <div data-open={openItems.has(id)} data-item-id={id}>
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  itemId: string;
  children: React.ReactNode;
}

function AccordionTrigger({ itemId, children }: AccordionTriggerProps) {
  const { openItems, toggle } = useAccordionContext();
  const isOpen = openItems.has(itemId);
  return (
    <button
      aria-expanded={isOpen}
      onClick={() => toggle(itemId)}
      style={{ width: "100%", textAlign: "left" }}
    >
      {children}
      <span aria-hidden>{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}

interface AccordionPanelProps {
  itemId: string;
  children: React.ReactNode;
}

function AccordionPanel({ itemId, children }: AccordionPanelProps) {
  const { openItems } = useAccordionContext();
  if (!openItems.has(itemId)) return null;
  return <div role="region">{children}</div>;
}

// Attach sub-components as static properties
Accordion.Item    = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Panel   = AccordionPanel;

// Usage — clean, semantic, extensible
<Accordion allowMultiple>
  <Accordion.Item id="section-1">
    <Accordion.Trigger itemId="section-1">Section One</Accordion.Trigger>
    <Accordion.Panel itemId="section-1">
      <p>Content for section one</p>
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item id="section-2">
    <Accordion.Trigger itemId="section-2">Section Two</Accordion.Trigger>
    <Accordion.Panel itemId="section-2">
      <p>Content for section two</p>
    </Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

### 3. Render Props

Pass a function as children or prop — lets consumers control rendering.

```tsx
// MouseTracker with render prop
interface MousePosition { x: number; y: number }

interface MouseTrackerProps {
  children: (position: MousePosition) => React.ReactNode;
}

function MouseTracker({ children }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return <>{children(position)}</>;
}

// Usage
<MouseTracker>
  {({ x, y }) => (
    <div style={{ position: "fixed", left: x, top: y }}>
      Cursor is here
    </div>
  )}
</MouseTracker>
```

### 4. Higher-Order Components (HOC)

A function that takes a component and returns an enhanced component. Largely superseded by hooks, but still used for cross-cutting concerns.

```tsx
// withAuth HOC — redirects if not authenticated
function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  function WithAuth(props: P) {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;

    return <WrappedComponent {...props} />;
  }

  WithAuth.displayName = `withAuth(${WrappedComponent.displayName ?? WrappedComponent.name})`;
  return WithAuth;
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);

// Prefer hooks when the logic can be expressed as a hook:
function Dashboard() {
  useRequireAuth(); // Custom hook that redirects — cleaner than HOC
  return <div>...</div>;
}
```

## Choosing the Right Pattern

```
Scenario                           →  Pattern
──────────────────────────────────────────────────
Shared implicit state (Tabs, etc.) →  Compound components
Cross-cutting (auth, logging)      →  HOC or custom hook
Flexible rendering                 →  Render props or children
Global state (theme, user, locale) →  Context + useReducer
Reusable stateful logic            →  Custom hook
Simple prop passing (2 levels)     →  Just pass the prop
```

## Key Takeaways

- Context is for **avoiding prop drilling**, not for all state — co-locate state where it's used
- Always **memoize context values** to prevent unnecessary re-renders of all consumers
- Split contexts by update frequency — fast-changing state should not share context with slow
- `Context + useReducer` gives you a clean Redux-like pattern without dependencies
- **Compound components** share state through context, providing a clean API
- **Render props** give consumers control over rendering
- **HOCs** are still useful for cross-cutting concerns, but hooks are usually cleaner
- Custom hook = `useTheme()` over `<ThemeContext.Consumer>` — always prefer the hook

---

**Next:** [Lecture 5: Refs & Imperative APIs →](5-refs-imperative.md)
