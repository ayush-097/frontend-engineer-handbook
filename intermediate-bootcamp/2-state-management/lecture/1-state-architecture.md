# State Architecture

## The Four Kinds of State

**1. UI State** — Ephemeral, lives in components
- Modal open/closed, dropdown expanded, form focused field
- Tool: `useState`, component-local

**2. URL State** — Encoded in the browser URL
- Current page, filters, search query, sort order
- Tool: React Router params/searchParams, Next.js router

**3. Server Cache** — Data from the backend, cached client-side
- User profile, product list, blog posts
- Tool: React Query, SWR, RTK Query
- Characteristics: async, can be stale, needs refetch strategy

**4. Global Client State** — Shared across the app
- Current user, auth token, theme, shopping cart
- Tool: Context + useReducer, Zustand, Redux

## Colocation Principle

**Keep state as close to where it's used as possible.**

```tsx
// ❌ Anti-pattern: global state for local concern
const globalStore = { modalOpen: false };

// ✅ Local state
function UserProfile() {
  const [modalOpen, setModalOpen] = useState(false);
  // Only UserProfile needs to know
}
```

## Lifting State Up (When Needed)

```tsx
// If two siblings need to share state, lift to common parent
function Parent() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <ProductList onSelect={setSelected} />
      <ProductDetail id={selected} />
    </>
  );
}
```

## Normalized State Shape

```tsx
// ❌ Nested duplication — stale data, complex updates
const state = {
  posts: [
    { id: 1, title: "Post 1", author: { id: 5, name: "Alice" } },
    { id: 2, title: "Post 2", author: { id: 5, name: "Alice" } }, // duplicated!
  ],
};

// ✅ Normalized — single source of truth
const state = {
  posts: {
    1: { id: 1, title: "Post 1", authorId: 5 },
    2: { id: 2, title: "Post 2", authorId: 5 },
  },
  users: {
    5: { id: 5, name: "Alice" },
  },
};
```

## Decision Tree

```
Does this state need to persist across page reloads?
  Yes → localStorage / URL / backend
  No  ↓

Does this state control navigation or filter visible content?
  Yes → URL state (searchParams)
  No  ↓

Is this state fetched from an API?
  Yes → React Query / server cache
  No  ↓

Is this state needed in 3+ unrelated components?
  Yes → Global store (Zustand / Context)
  No  → Component-local useState
```

**Key Takeaways:**
- Most state should be component-local
- Server data is NOT the same as client state — use different tools
- Normalize to avoid duplication
- URL is underutilized state storage
