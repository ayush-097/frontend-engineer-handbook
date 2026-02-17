# Suspense & Concurrent Mode

## The Problem Concurrent Mode Solves

Classic React rendering was synchronous — once started, a render couldn't be interrupted. Slow renders blocked the main thread, freezing the UI.

```
Classic (blocking) rendering:
  User clicks → React starts rendering big component tree
  [Main thread blocked for 200ms]
  User tries to type — no response!
  [Render finishes] → DOM updated → user's typing appears all at once

Concurrent rendering:
  User clicks → React starts rendering big component tree
  User types   → React PAUSES the click render
  [Typing update] → DOM updated → keypress appears immediately
  [Resume and finish click render] → DOM updated
```

Concurrent mode makes rendering **interruptible** — React can pause work, do more urgent work, then resume.

## `startTransition` — Marking Low-Priority Updates

```jsx
import { startTransition, useTransition } from "react";

// ❌ Filtering a huge list blocks the input
function SearchBox({ items }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(items);

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);                                       // Urgent: update input
    setResults(items.filter(i => i.name.includes(q))); // Slow: filter 10k items
    // Both run synchronously — input feels laggy
  }
}

// ✅ Mark the expensive update as a transition (lower priority)
function SearchBox({ items }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(items);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q); // Urgent — processed immediately, input stays responsive

    startTransition(() => {
      // This update can be interrupted if the user keeps typing
      setResults(items.filter(i => i.name.includes(q)));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}  {/* Show while transition is running */}
      <ResultList results={results} />
    </>
  );
}
```

## Suspense — Declarative Loading States

Suspense lets components "suspend" while waiting for something (data, code, images). A parent `<Suspense>` boundary catches the suspension and shows a fallback.

```jsx
// Any component can "suspend" — throw a Promise
// React catches it, renders the fallback, and re-renders when Promise resolves

<Suspense fallback={<Spinner />}>
  <UserProfile userId={userId} />
</Suspense>

// UserProfile "suspends" while loading:
function UserProfile({ userId }) {
  const user = use(fetchUser(userId)); // 'use' suspends if promise is pending
  return <div>{user.name}</div>;
}
```

### Suspense Boundaries

Like error boundaries, you can nest Suspense boundaries for fine-grained loading states.

```jsx
// Coarse-grained: whole page waits for everything
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <MainContent />
  <Sidebar />
</Suspense>

// Fine-grained: each section loads independently
<>
  <Suspense fallback={<HeaderSkeleton />}>
    <Header />
  </Suspense>
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
</>

// Mixed: some things wait together, some don't
<Suspense fallback={<PageShell />}>
  <Header />    {/* waits for both before showing */}
  <Suspense fallback={<ArticleSkeleton />}>
    <MainArticle />  {/* shows independently when ready */}
  </Suspense>
</Suspense>
```

## The `use` Hook (React 19+)

`use` reads values from Promises and Context, and can be called conditionally (unlike other hooks).

```jsx
import { use } from "react";

// Read a cached promise — suspends until resolved
function UserCard({ userPromise }) {
  const user = use(userPromise); // Suspends here if pending
  return <div>{user.name}</div>; // Only runs when user is available
}

// Usage
function App() {
  const userPromise = fetchUser(1); // Create promise at render

  return (
    <Suspense fallback={<Skeleton />}>
      <UserCard userPromise={userPromise} />
    </Suspense>
  );
}

// use() with context (can be conditional — unlike useContext)
function Greeting({ showName }) {
  if (showName) {
    const user = use(UserContext); // ✅ Inside an if — allowed with use()
    return <p>Hello, {user.name}!</p>;
  }
  return <p>Hello!</p>;
}
```

## `lazy` — Code Splitting

`React.lazy` loads a component bundle only when it's first rendered. Combined with Suspense, this enables automatic code splitting.

```jsx
import { lazy, Suspense } from "react";

// Route-level code splitting — each page is a separate chunk
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings  = lazy(() => import("./pages/Settings"));
const Reports   = lazy(() => import("./pages/Reports"));

function Router() {
  const [page, setPage] = useState("dashboard");

  return (
    <Suspense fallback={<PageSpinner />}>
      {page === "dashboard" && <Dashboard />}
      {page === "settings"  && <Settings />}
      {page === "reports"   && <Reports />}
    </Suspense>
  );
}

// Component-level splitting — only load heavy components when needed
const HeavyChart = lazy(() => import("./components/HeavyChart"));
const RichEditor = lazy(() => import("./components/RichEditor"));

function ArticleEditor({ showChart }) {
  return (
    <div>
      <Suspense fallback={<EditorSkeleton />}>
        <RichEditor />
      </Suspense>
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />  {/* Only loaded when showChart is true */}
        </Suspense>
      )}
    </div>
  );
}

// Preloading — trigger download before the user navigates
function NavLink({ to, children }) {
  const PageComponent = pageComponents[to];
  return (
    <a
      href={to}
      onMouseEnter={() => {
        // Start loading when user hovers — ready before they click
        PageComponent._payload._status === -1 &&
          import(PageComponent._payload._result);
      }}
    >
      {children}
    </a>
  );
}
```

## Concurrent Data Fetching — Patterns

### Pattern 1: Fetch-as-you-render (with React Query)

```jsx
import { useQuery } from "@tanstack/react-query";

// React Query wraps its internal promise in a Suspense-compatible form
function UserProfile({ userId }) {
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn:  () => fetchUser(userId),
    suspense: true,  // Opt into Suspense mode
  });

  // TypeScript knows data is User (not User | undefined) when suspense: true
  return <div>{user.name}</div>;
}

// Parent handles loading state
<ErrorBoundary fallback={<ErrorMessage />}>
  <Suspense fallback={<UserSkeleton />}>
    <UserProfile userId={userId} />
  </Suspense>
</ErrorBoundary>
```

### Pattern 2: Parallel data fetching

```jsx
// ❌ Waterfall — fetches sequentially
function Dashboard() {
  const user  = use(fetchUser());     // Waits for user...
  const posts = use(fetchPosts());    // Then waits for posts...
  const stats = use(fetchStats());    // Then waits for stats...
}

// ✅ Parallel — all three start simultaneously
function Dashboard() {
  // Kick off all requests before any suspends
  const userPromise  = useMemo(() => fetchUser(),  []);
  const postsPromise = useMemo(() => fetchPosts(), []);
  const statsPromise = useMemo(() => fetchStats(), []);

  // Each component suspends independently
  return (
    <>
      <Suspense fallback={<UserSkeleton />}>
        <UserCard userPromise={userPromise} />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostList postsPromise={postsPromise} />
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsPanel statsPromise={statsPromise} />
      </Suspense>
    </>
  );
}
```

## `useDeferredValue` and Suspense

`useDeferredValue` + Suspense creates a "stale-while-revalidate" UI pattern.

```jsx
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    // Keep showing current results (stale) while new results load
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <Suspense fallback={<Skeleton />}>
        <ResultList query={deferredQuery} />  {/* Uses deferred (possibly old) query */}
      </Suspense>
    </div>
  );
}
```

## Server Components (React 19 / Next.js 13+)

Server Components render on the server, sending HTML (or a serialized component tree) to the client. They can directly access databases, file systems, and server-only APIs.

```jsx
// app/users/page.tsx — runs on the server
async function UsersPage() {
  // Direct database access — no useEffect, no loading state!
  const users = await db.query("SELECT * FROM users");

  return (
    <div>
      <h1>Users</h1>
      <Suspense fallback={<Skeleton />}>
        {/* This component IS a Server Component - renders on server */}
        <UserList users={users} />
      </Suspense>
    </div>
  );
}

// Nested async components work naturally
async function UserCard({ userId }) {
  const user = await db.users.find(userId);
  const posts = await db.posts.findByUser(userId);

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{posts.length} posts</p>
    </div>
  );
}

// Client Components — mark with "use client"
"use client";
import { useState } from "react";

function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(l => !l)}>{liked ? "♥" : "♡"}</button>;
}
```

## Concurrent Mode Pitfalls

### Effects run twice in StrictMode with concurrent features

```jsx
// In React 18 StrictMode + Concurrent Mode:
// React may start rendering, pause, discard the partial render, and restart
// This means side effects in render MUST be safe to run multiple times

// ❌ Side effect during render
let requestCount = 0;
function Component() {
  requestCount++; // ← Might increment twice per visible render!
  return <div>{requestCount}</div>;
}

// ✅ Side effects in effects only
function Component() {
  const [requestCount, setRequestCount] = useState(0);
  useEffect(() => {
    setRequestCount(c => c + 1);
  }, []);
  return <div>{requestCount}</div>;
}
```

### Tearing — why `useSyncExternalStore` exists

```jsx
// In concurrent mode, React may render the same component tree with
// different priorities, reading external state at different times.
// If the external store updates mid-render, different components see
// different values — "tearing".

// ❌ Vulnerable to tearing
function useExternalStore() {
  return externalStore.getState(); // Read directly — may be stale mid-render
}

// ✅ useSyncExternalStore prevents tearing
function useExternalStore() {
  return useSyncExternalStore(
    externalStore.subscribe,
    externalStore.getState,
  );
}
```

## Streaming SSR with Suspense

```jsx
// With Next.js App Router:
// Page skeleton renders immediately (HTML streaming)
// Each Suspense boundary's content streams in as it becomes ready

export default async function Page() {
  return (
    <Layout>
      {/* Streams immediately */}
      <Header />

      {/* Streams when user data is ready */}
      <Suspense fallback={<UserCardSkeleton />}>
        <UserCard />
      </Suspense>

      {/* Streams when feed data is ready */}
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />
      </Suspense>
    </Layout>
  );
}
// Browser receives HTML header → user sees shell immediately
// As server resolves each promise → more HTML chunks stream in
// No JavaScript needed for initial content
```

## Key Takeaways

- Concurrent mode makes rendering **interruptible** — urgent work can preempt lower-priority work
- `startTransition` marks updates as non-urgent — keeps the UI responsive during heavy renders
- `Suspense` lets components declare "I'm waiting" — parent shows fallback, component shows when ready
- `React.lazy` + `Suspense` = automatic code splitting with declarative loading states
- Parallel fetch: create all promises **before** suspending — avoid sequential waterfalls
- `useSyncExternalStore` prevents **tearing** in concurrent renders
- Server Components eliminate client-side loading states entirely for data that doesn't need interactivity
- Streaming SSR sends HTML chunks progressively — users see content faster

---

**Module complete!** Apply these concepts in the labs.

**Next:** [Lab: Custom Hooks Library →](../lab/custom-hooks-library/)
