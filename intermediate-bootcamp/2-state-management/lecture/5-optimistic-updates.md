# Optimistic Updates

Optimistic UI updates the interface *before* the server responds, then rolls back on failure.

## The Pattern

```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["posts", variables.id] });
    
    // Snapshot current value
    const previous = queryClient.getQueryData(["posts", variables.id]);
    
    // Optimistically update cache
    queryClient.setQueryData(["posts", variables.id], variables);
    
    // Return context with snapshot
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previous) {
      queryClient.setQueryData(["posts", variables.id], context.previous);
    }
  },
  onSettled: (data, error, variables) => {
    // Always refetch after success or error
    queryClient.invalidateQueries({ queryKey: ["posts", variables.id] });
  },
});
```

## List Updates — Add/Remove

```tsx
// Optimistically add to list
onMutate: async (newPost) => {
  await queryClient.cancelQueries({ queryKey: ["posts"] });
  const previous = queryClient.getQueryData(["posts"]);
  
  queryClient.setQueryData(["posts"], (old: Post[]) => [
    { ...newPost, id: `temp-${Date.now()}`, isPending: true },
    ...old,
  ]);
  
  return { previous };
},
onSuccess: (createdPost, variables, context) => {
  // Replace temp with real
  queryClient.setQueryData(["posts"], (old: Post[]) =>
    old.map(p => p.id === context.tempId ? createdPost : p)
  );
},
```

## UI Feedback During Optimistic State

```tsx
function Post({ id }: { id: string }) {
  const { data: post } = useQuery({ queryKey: ["posts", id] });
  const isPending = post?.isPending;
  
  return (
    <div style={{ opacity: isPending ? 0.5 : 1 }}>
      {post?.title}
      {isPending && <Spinner size="sm" />}
    </div>
  );
}
```

**Key Takeaways:**
- Optimistic = assume success, rollback on error
- Always cancel queries before optimistic update
- Always refetch after settled (success or error)
- Visual feedback for pending state
