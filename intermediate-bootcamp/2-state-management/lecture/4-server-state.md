# Server State with React Query

Server state is fundamentally different from client state:
- You don't own it (server is source of truth)
- It's asynchronous
- It can be stale
- Multiple components might request the same data

## React Query Basics

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function UserProfile({ userId }: { userId: number }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    staleTime: 60_000, // Fresh for 60s
    cacheTime: 300_000, // Cache for 5min after last use
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;
  return <UserCard user={user} />;
}
```

## Query Keys — The Cache Index

```tsx
// ✅ Structured keys
["users"]                    // All users list
["users", userId]            // Single user
["users", userId, "posts"]   // User's posts
["posts", { status: "draft", author: userId }] // Filtered posts

// Query key determines:
// 1. Cache identity (same key = same cache entry)
// 2. Refetch triggers (invalidate by prefix)
// 3. Dependency tracking
```

## Refetch Strategies

```tsx
useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  // When to refetch?
  refetchOnWindowFocus: true,  // Refetch when tab gains focus
  refetchOnReconnect: true,    // Refetch when internet reconnects
  refetchInterval: 30_000,     // Poll every 30s
  staleTime: 0,                // Data is stale immediately (default)
});
```

## Mutations

```tsx
function CreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost: PostInput) => api.createPost(newPost),
    onSuccess: (createdPost) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // OR optimistically update cache
      queryClient.setQueryData(["posts"], (old: Post[]) => 
        [...old, createdPost]
      );
    },
  });

  return (
    <button onClick={() => mutation.mutate({ title: "New Post" })}>
      {mutation.isPending ? "Creating..." : "Create"}
    </button>
  );
}
```

## Cache Invalidation Patterns

```tsx
// 1. Invalidate all posts
queryClient.invalidateQueries({ queryKey: ["posts"] });

// 2. Invalidate specific user's posts
queryClient.invalidateQueries({ queryKey: ["users", userId, "posts"] });

// 3. Invalidate all queries with a prefix
queryClient.invalidateQueries({ queryKey: ["users"], refetchType: "all" });

// 4. Manually update cache without refetch
queryClient.setQueryData(["user", userId], updatedUser);
```

**Key Takeaways:**
- React Query manages async state lifecycle
- Query keys = cache identity
- Mutations invalidate or update cache
- `staleTime` vs `cacheTime` — fresh vs garbage collection
