# Homework: Cache Invalidation Strategy

## Objective

Design comprehensive cache invalidation strategies for a social media application using React Query. You'll analyze four common scenarios and decide when to invalidate, when to update optimistically, and how to handle failures.

## Application Context

You're building a social media app with these entities:
- **Users** — profiles, follower counts, following lists
- **Posts** — text content, like counts, author info
- **Comments** — replies to posts
- **Notifications** — real-time events

## Scenario 1: User Likes a Post ❤️

### Problem
User clicks "like" button on a post. This affects:
- Post's like count
- User's liked posts list
- Possibly trending algorithm

### Questions to Answer

1. **Should you invalidate the posts query?**
   - Consider: Likes happen frequently (hundreds per minute)
   - Refetching entire posts list is expensive
   - Staleness is acceptable for a few seconds

2. **Should you optimistically update?**
   - UI feedback must be instant
   - User expects immediate visual response
   - Rollback if API fails

3. **What's the rollback strategy?**
   - Decrement like count
   - Show error toast
   - Optionally re-enable button for retry

### Your Design

Write code showing:

```tsx
// hooks/useLikePost.ts
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => api.likePost(postId),
    
    onMutate: async (postId) => {
      // YOUR IMPLEMENTATION HERE
      // - Cancel outgoing queries?
      // - Snapshot previous state?
      // - Optimistically update cache?
    },
    
    onError: (error, postId, context) => {
      // YOUR IMPLEMENTATION HERE
      // - Rollback cache?
      // - Show error message?
    },
    
    onSuccess: (data, postId) => {
      // YOUR IMPLEMENTATION HERE
      // - Invalidate queries?
      // - Update cache directly?
      // - Refetch specific queries?
    },
  });
}
```

**In your writeup, justify:**
- Why you chose optimistic vs invalidation
- How you handle race conditions
- When you refetch (never? on error? on success? background?)
- Trade-offs of your approach

---

## Scenario 2: User Comments on Post 💬

### Problem
User submits a comment. This affects:
- Post's comment count
- Comments list for that post
- User's activity feed
- Notifications for post author

### Questions

1. **Multi-query invalidation:**
   - Post detail (`["posts", postId]`)
   - Comments list (`["posts", postId, "comments"]`)
   - User activity (`["users", userId, "activity"]`)
   - Which should invalidate? Which update directly?

2. **Optimistic comment with temp ID:**
   - How do you replace temp ID with real ID from server?
   - What if server assigns different timestamp?
   - How to handle username/avatar in optimistic comment?

3. **Real-time updates:**
   - Other users viewing same post should see new comment
   - Do you use WebSocket? Polling? Refetch on focus?

### Your Design

```tsx
// hooks/useCreateComment.ts
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();

  return useMutation({
    mutationFn: (text: string) => api.createComment(postId, text),
    
    onMutate: async (text) => {
      // YOUR IMPLEMENTATION
      // - How do you create temp comment?
      // - Include author info from currentUser?
      // - Generate temp ID?
    },
    
    onSuccess: (createdComment, text, context) => {
      // YOUR IMPLEMENTATION
      // - Replace temp with real comment?
      // - Invalidate related queries?
    },
  });
}
```

**Justify:**
- Temp ID strategy (UUID? timestamp? negative number?)
- How you populate author info optimistically
- Whether you invalidate or update directly
- How other users see the comment

---

## Scenario 3: User Follows Someone 👥

### Problem
User clicks "Follow" button. This affects:
- Target user's follower count
- Current user's following count
- Current user's following list
- Target user's followers list
- "Suggested users" algorithm

### Questions

1. **Optimistic or invalidate?**
   - Follow is important UX (instant feedback)
   - But affects many queries (follower count, lists, suggestions)
   - Can't manually update all caches

2. **Partial invalidation:**
   - Invalidate counts but not entire lists?
   - Update only current user's following list?
   - Refetch suggestions in background?

3. **Undo flow:**
   - User clicks follow, then immediately unfollow
   - How to handle overlapping mutations?
   - Should second mutation cancel first?

### Your Design

```tsx
// hooks/useFollowUser.ts
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api.followUser(userId),
    
    onMutate: async (userId) => {
      // YOUR IMPLEMENTATION
      // - Which queries to cancel?
      // - Which caches to update optimistically?
      // - Which to leave alone?
    },
    
    onSuccess: (data, userId) => {
      // YOUR IMPLEMENTATION
      // - Broad invalidation?
      // - Targeted refetch?
      // - Update specific caches?
    },
  });
}
```

**Justify:**
- Which queries you update directly vs invalidate
- How you handle suggested users cache
- Whether you refetch follower/following lists
- Performance implications of your choices

---

## Scenario 4: Real-Time Notification 🔔

### Problem
WebSocket message arrives: "Alice commented on your post"

This should:
- Increment notification badge count
- Add to notifications list
- Optionally invalidate the post (to show new comment)
- Update unread count

### Questions

1. **Push vs Pull:**
   - WebSocket sends full notification object?
   - Or just notification ID (then fetch)?
   - Trade-off: payload size vs freshness

2. **Cache update strategy:**
   - Add to cache directly (from WebSocket data)?
   - Invalidate and refetch (guarantees consistency)?
   - Hybrid: add optimistically, refetch in background?

3. **Race conditions:**
   - User already viewing notifications page when event arrives
   - User has older query result in cache
   - WebSocket might arrive before API response

### Your Design

```tsx
// hooks/useNotifications.ts
export function useNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectWebSocket();
    
    socket.on("notification", (notification) => {
      // YOUR IMPLEMENTATION
      // - Update cache directly?
      // - Invalidate and refetch?
      // - Increment badge count?
    });

    return () => socket.disconnect();
  }, [queryClient]);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: api.fetchNotifications,
  });
}
```

**Justify:**
- Direct cache update vs invalidation
- How you handle race conditions
- Whether you trust WebSocket data
- How you increment unread count
- Deduplication strategy

---

## Deliverable

### 1. Strategy Document (1000-1500 words)

Write a comprehensive document covering all four scenarios. For each:

**Structure:**
```
## Scenario: [Name]

### Strategy Overview
[High-level approach in 2-3 sentences]

### Implementation
[Code for onMutate, onError, onSuccess]

### Justification
- **Why optimistic?** / **Why invalidate?**
- **What gets invalidated?**
- **Rollback strategy:**
- **Performance considerations:**
- **Edge cases handled:**

### Alternative Approaches Considered
[What you didn't choose and why]
```

### 2. Code Examples

Provide **complete, runnable code** for all hooks:
- `useLikePost.ts`
- `useCreateComment.ts`
- `useFollowUser.ts`
- `useNotifications.ts`

### 3. Comparison Table

|  | Like Post | Create Comment | Follow User | Notification |
|--|-----------|----------------|-------------|--------------|
| **Optimistic?** | Yes/No | Yes/No | Yes/No | N/A |
| **Invalidate?** | Which queries | Which queries | Which queries | Which queries |
| **Rollback?** | Strategy | Strategy | Strategy | Strategy |
| **Refetch?** | When | When | When | When |
| **Why?** | Reasoning | Reasoning | Reasoning | Reasoning |

### 4. Reflection (300-400 words)

Answer:
1. What's the hardest part of cache invalidation?
2. When should you prefer optimistic updates vs simple invalidation?
3. How do you balance UX (instant feedback) vs consistency (accurate data)?
4. What would you do differently for a high-traffic production app?

## Grading Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| Scenario 1: Like | 20 | Complete strategy + code |
| Scenario 2: Comment | 25 | Complete strategy + code |
| Scenario 3: Follow | 25 | Complete strategy + code |
| Scenario 4: Notification | 20 | Complete strategy + code |
| Comparison table | 5 | All cells filled thoughtfully |
| Reflection | 5 | Demonstrates deep understanding |
| **Total** | **100** | **Pass: 70+** |

## Evaluation Criteria

Your strategies will be evaluated on:

- **Correctness:** No data inconsistency bugs
- **Performance:** Minimal unnecessary refetches
- **UX:** Instant feedback where appropriate
- **Resilience:** Graceful error handling
- **Clarity:** Well-reasoned justifications

## Example Strategy Snippet

```
## Scenario: Like Post

### Strategy Overview
Use optimistic updates for instant UI feedback without refetching. 
Increment like count immediately, rollback on error. No invalidation 
since likes are high-frequency and staleness is acceptable.

### Implementation
\`\`\`tsx
onMutate: async (postId) => {
  await queryClient.cancelQueries({ queryKey: ["posts", postId] });
  const previous = queryClient.getQueryData(["posts", postId]);
  
  queryClient.setQueryData(["posts", postId], (old: Post) => ({
    ...old,
    likes: old.likes + 1,
    isLiked: true,
  }));
  
  return { previous };
},

onError: (err, postId, context) => {
  queryClient.setQueryData(["posts", postId], context.previous);
  toast.error("Failed to like post");
},

onSuccess: (data, postId) => {
  // No refetch - optimistic update is enough
  // Background refetch happens on window focus (React Query default)
}
\`\`\`

### Justification
- **Optimistic:** Users expect instant heart animation
- **No invalidation:** Likes happen 100s/min, refetch too expensive
- **Rollback:** Simple decrement + toast on error
- **Performance:** Zero refetch overhead
- **Trade-off:** Slight staleness acceptable (refetch on tab focus)
```

## Tips

1. There's no single "right" answer — justify your choices
2. Consider real-world constraints (latency, server load, UX)
3. Test your strategies with React Query DevTools
4. Think about mobile users on slow connections
5. Consider what happens with concurrent mutations

## Common Pitfalls

- Not canceling queries before optimistic update (race conditions)
- Forgetting to return context from onMutate (can't rollback)
- Over-invalidating (refetching 10 queries for one like)
- Under-invalidating (stale data never updates)
- Not handling edge cases (user likes then immediately unlikes)

## Extension Ideas

- Handle offline queue (mutations retry on reconnect)
- Implement pagination invalidation (which pages to refetch?)
- Add request deduplication (multiple users like simultaneously)
- Design TTL strategy (how long until data considered stale?)

## Time Estimate: 3-4 hours

## Resources

- [React Query Mutation Docs](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Cache Invalidation](https://tanstack.com/query/latest/docs/react/guides/query-invalidation)
- [Phillip Karlsson's article on Two Hardest Things](https://martinfowler.com/bliki/TwoHardThings.html)
