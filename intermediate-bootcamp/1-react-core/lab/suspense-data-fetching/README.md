# Lab: Suspense Data Fetching

Implement a dashboard that uses Suspense boundaries for every data source, demonstrating parallel fetching, transition states, and Suspense + ErrorBoundary composition.

## What You'll Build

A blog dashboard with:

1. **`/src/api/cache.ts`** — A Suspense-compatible promise cache (wraps fetch in a throw-if-pending pattern)
2. **`/src/components/PostList.tsx`** — Suspends while loading posts
3. **`/src/components/AuthorCard.tsx`** — Suspends while loading user
4. **`/src/components/CommentThread.tsx`** — Suspends while loading comments
5. **`/src/pages/Dashboard.tsx`** — Parallel loading with independent Suspense boundaries
6. **`/src/pages/PostDetail.tsx`** — Sequential load with `useTransition` for navigation

## The Suspense Cache Pattern

```typescript
// A resource wraps a promise — throws while pending, returns value when resolved
function createResource<T>(promise: Promise<T>) {
  let status: "pending" | "success" | "error" = "pending";
  let result: T | Error;

  const suspender = promise.then(
    (data) => { status = "success"; result = data; },
    (err)  => { status = "error";  result = err;  }
  );

  return {
    read(): T {
      if (status === "pending") throw suspender;    // React catches this
      if (status === "error")   throw result;       // ErrorBoundary catches this
      return result as T;                           // Resolved — return the value
    }
  };
}
```

## Files

```
suspense-data-fetching/
├── README.md
├── src/
│   ├── api/
│   │   ├── cache.ts          ← Suspense-compatible promise wrapper
│   │   └── client.ts         ← Fetch utilities (JSONPlaceholder)
│   ├── components/
│   │   ├── PostList.tsx       ← Suspending component
│   │   ├── AuthorCard.tsx     ← Suspending component
│   │   ├── CommentThread.tsx  ← Suspending component
│   │   ├── Skeletons.tsx      ← Loading state UI
│   │   └── ErrorFallback.tsx  ← Error boundary fallback
│   └── pages/
│       ├── Dashboard.tsx      ← Parallel loading
│       └── PostDetail.tsx     ← useTransition navigation
```

## Tasks

### Task 1 — Promise cache (required)
Implement `createResource<T>(promise)` with correct TypeScript types.
Add `createCachedFetch<T>(url)` that caches by URL — same URL returns same resource.

### Task 2 — Suspending components (required)
Implement `PostList`, `AuthorCard`, `CommentThread` — each calls `.read()` on its resource.
No loading states inside these components — Suspense handles it.

### Task 3 — Dashboard layout (required)
Fetch posts, user, and stats **in parallel**. Each wrapped in its own Suspense boundary.
Show the skeleton immediately; each section appears independently.

### Task 4 — Transition navigation (required)
In `PostDetail`, use `useTransition` so navigating between posts keeps the current post visible (with opacity) while the next one loads, instead of flashing to a skeleton.

### Task 5 — Error handling (required)
Wrap each Suspense boundary in an `ErrorBoundary`. If any single fetch fails, only that section shows an error — the rest of the page still works.

## Acceptance Criteria

- [ ] All three data sources start fetching before any suspend
- [ ] Navigating to a new post uses `isPending` for visual feedback
- [ ] An error in one section doesn't crash the whole page
- [ ] No `useEffect` for data fetching in Suspending components

## Time Estimate: 3–4 hours
