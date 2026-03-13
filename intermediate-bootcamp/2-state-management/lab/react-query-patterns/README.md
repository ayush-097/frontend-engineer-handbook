# Lab: React Query Patterns

Master React Query for server state management: infinite scroll, optimistic mutations, prefetching, and dependent queries.

## Learning Objectives

- Implement infinite scroll with `useInfiniteQuery`
- Handle optimistic updates with rollback on error
- Prefetch data on hover for instant navigation
- Chain dependent queries (user → posts → comments)
- Manage cache invalidation strategies
- Use React Query DevTools for debugging

## Features to Implement

### 1. Infinite Scroll Post List ⭐️
- Load 10 posts initially
- "Load More" button fetches next page
- Cursor-based pagination
- Loading states (initial, next page)
- Error handling with retry

### 2. Optimistic Mutations ⭐️⭐️
- **Create post**: Add to cache immediately, rollback on error
- **Update post**: Edit in place, revert on failure
- **Delete post**: Remove from list, restore on error
- **Like post**: Increment count, undo on failure

### 3. Prefetching ⭐️
- Prefetch post details on card hover
- Prefetch next page on scroll proximity
- Cache remains fresh (no re-fetch on navigate)

### 4. Dependent Queries ⭐️⭐️
- Fetch user → fetch their posts → fetch post comments
- Disable queries until dependencies ready
- Loading states for each stage
- Error boundary for failed dependencies

## Architecture

```
src/
├── api/
│   ├── client.ts          ← Fetch wrapper + base URL
│   ├── posts.ts           ← Post CRUD operations
│   ├── users.ts           ← User operations
│   └── types.ts           ← TypeScript interfaces
├── components/
│   ├── InfinitePostList.tsx   ← useInfiniteQuery demo
│   ├── PostCard.tsx           ← Single post with prefetch
│   ├── CreatePostForm.tsx     ← Optimistic create
│   ├── EditPostModal.tsx      ← Optimistic update
│   └── UserDashboard.tsx      ← Dependent queries
├── hooks/
│   ├── usePosts.ts            ← Query hooks
│   ├── useCreatePost.ts       ← Create mutation
│   ├── useUpdatePost.ts       ← Update mutation
│   ├── useDeletePost.ts       ← Delete mutation
│   └── useLikePost.ts         ← Like mutation
└── App.tsx                    ← QueryClientProvider setup
```

## Implementation Guide

### Step 1: Setup (15 min)

```tsx
// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,        // Fresh for 1 min
      cacheTime: 300_000,       // Cache for 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Step 2: Infinite Scroll (30 min)

```tsx
// src/components/InfinitePostList.tsx
import { useInfiniteQuery } from "@tanstack/react-query";

function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: ({ pageParam = 1 }) => fetchPosts({ page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage, pages) => {
      // Return next page number or undefined if no more pages
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;

  return (
    <div>
      {data.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.posts.map(post => <PostCard post={post} />)}
        </React.Fragment>
      ))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

### Step 3: Optimistic Create (30 min)

```tsx
// src/hooks/useCreatePost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPost: CreatePostInput) => api.createPost(newPost),
    
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update cache
      queryClient.setQueryData(["posts"], (old: Post[]) => [
        {
          ...newPost,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          author: "You",
          likes: 0,
          isPending: true, // Flag for UI
        },
        ...old,
      ]);

      // Return context with snapshot
      return { previousPosts };
    },

    onError: (err, newPost, context) => {
      // Rollback on error
      queryClient.setQueryData(["posts"], context.previousPosts);
      toast.error("Failed to create post");
    },

    onSuccess: (createdPost) => {
      toast.success("Post created!");
    },

    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
```

### Step 4: Prefetching (20 min)

```tsx
// src/components/PostCard.tsx
function PostCard({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  const prefetchPost = () => {
    queryClient.prefetchQuery({
      queryKey: ["posts", post.id],
      queryFn: () => api.fetchPost(post.id),
      staleTime: 60_000, // Don't refetch if data < 1 min old
    });
  };

  return (
    <Link
      to={`/posts/${post.id}`}
      onMouseEnter={prefetchPost}
      onFocus={prefetchPost}
    >
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
    </Link>
  );
}
```

### Step 5: Dependent Queries (30 min)

```tsx
// src/components/UserDashboard.tsx
function UserDashboard({ userId }: { userId: number }) {
  // 1. Fetch user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => api.fetchUser(userId),
  });

  // 2. Fetch user's posts (only when user loaded)
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["users", userId, "posts"],
    queryFn: () => api.fetchUserPosts(userId),
    enabled: !!user, // Only run when user exists
  });

  // 3. Fetch comments for first post (only when posts loaded)
  const firstPostId = posts?.[0]?.id;
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["posts", firstPostId, "comments"],
    queryFn: () => api.fetchComments(firstPostId),
    enabled: !!firstPostId, // Only run when we have a post ID
  });

  if (userLoading) return <Spinner />;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <UserCard user={user} />
      {postsLoading ? (
        <Spinner />
      ) : (
        <PostList posts={posts} />
      )}
      {commentsLoading ? (
        <Spinner />
      ) : (
        <CommentList comments={comments} />
      )}
    </div>
  );
}
```

## API Integration

This lab uses JSONPlaceholder API (https://jsonplaceholder.typicode.com) which provides fake REST API for testing:

```
GET    /posts?_page=1&_limit=10  → List posts (paginated)
GET    /posts/:id                 → Single post
POST   /posts                     → Create post (fake)
PUT    /posts/:id                 → Update post (fake)
DELETE /posts/:id                 → Delete post (fake)
GET    /users/:id                 → User details
GET    /posts?userId=:id          → User's posts
GET    /posts/:id/comments        → Post comments
```

## Acceptance Criteria

### Infinite Scroll
- [ ] Initial load shows 10 posts
- [ ] "Load More" fetches next page
- [ ] Loading spinner during fetch
- [ ] "Load More" button disabled when no more pages
- [ ] Scrolled posts remain when loading next page

### Optimistic Create
- [ ] New post appears immediately (before API response)
- [ ] Post shows pending indicator (opacity, spinner)
- [ ] Post removed if API fails
- [ ] Toast notification on error
- [ ] List refetched after success

### Optimistic Update
- [ ] Edited title updates immediately
- [ ] Reverts to original on error
- [ ] Shows "Saving..." indicator
- [ ] Success toast on save

### Optimistic Delete
- [ ] Post removed from list immediately
- [ ] Confirmation dialog before delete
- [ ] Post restored if API fails
- [ ] Undo button in toast

### Optimistic Like
- [ ] Like count increments immediately
- [ ] Button disabled during mutation
- [ ] Count reverts on error
- [ ] No refetch (too expensive for frequent action)

### Prefetching
- [ ] Hovering post card triggers prefetch
- [ ] Navigating to post loads instantly (from cache)
- [ ] DevTools shows prefetched data
- [ ] Stale prefetch re-fetches in background

### Dependent Queries
- [ ] User loads first
- [ ] Posts load only after user
- [ ] Comments load only after posts
- [ ] Loading states for each stage
- [ ] Error in user prevents posts fetch

## Testing Checklist

```bash
# Manual testing:
1. Open React Query DevTools
2. Load infinite list → see pages in DevTools
3. Create post → see optimistic entry → API delay → real entry
4. Disconnect network → create post → see rollback
5. Hover post card → see prefetch in DevTools
6. Click post → instant load (from cache)
7. Open user dashboard → watch cascade (user → posts → comments)
8. Like post → see count increment → disconnect → see revert
```

## Common Pitfalls

### ❌ Not canceling queries before optimistic update
```tsx
onMutate: async (newPost) => {
  // Missing this causes race conditions!
  // await queryClient.cancelQueries({ queryKey: ["posts"] });
  queryClient.setQueryData(["posts"], ...);
}
```

### ❌ Forgetting to return context
```tsx
onMutate: async () => {
  const prev = queryClient.getQueryData(["posts"]);
  // Missing return means onError can't rollback!
  // return { prev };
}
```

### ❌ Not invalidating on settled
```tsx
onSuccess: () => {
  // This leaves cache stale if another tab made changes
},
// Missing onSettled refetch
```

### ✅ Complete pattern
```tsx
{
  onMutate: async (vars) => {
    await queryClient.cancelQueries({ queryKey: ["posts"] });
    const prev = queryClient.getQueryData(["posts"]);
    queryClient.setQueryData(["posts"], optimisticValue);
    return { prev };
  },
  onError: (err, vars, ctx) => {
    queryClient.setQueryData(["posts"], ctx.prev);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },
}
```

## Extension Ideas

- [ ] Add search with debounced query
- [ ] Implement pagination with page numbers
- [ ] Add sorting (by date, likes, author)
- [ ] Cache invalidation on WebSocket event
- [ ] Offline queue (mutations retry on reconnect)
- [ ] Background refetch on tab focus
- [ ] Request deduplication visualization

## Time Estimate

- **Setup + API client:** 15 min
- **Infinite scroll:** 30 min
- **Optimistic create:** 30 min
- **Optimistic update/delete:** 30 min
- **Prefetching:** 20 min
- **Dependent queries:** 30 min
- **Polish + testing:** 20 min
- **Total:** ~3 hours

## Deliverables

1. **Complete implementation** (all src/ files)
2. **README.md** with setup + run instructions
3. **Screenshots** of React Query DevTools showing:
   - Infinite query pages
   - Optimistic update lifecycle
   - Prefetched data
   - Dependent query cascade
4. **Short reflection** (300 words):
   - When to use optimistic updates vs simple invalidation?
   - How does prefetching improve UX?
   - What's the tradeoff of `enabled` in dependent queries?

## Resources

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Infinite Queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)
