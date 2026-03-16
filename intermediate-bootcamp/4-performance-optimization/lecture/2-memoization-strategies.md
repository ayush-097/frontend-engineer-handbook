# Memoization Strategies

## useMemo

Cache expensive computation results:

```tsx
function ProductList({ products, searchQuery }) {
  // ❌ Filters on every render
  const filtered = products.filter(p => 
    p.name.includes(searchQuery)
  );
  
  // ✅ Only re-filters when products or searchQuery changes
  const filtered = useMemo(
    () => products.filter(p => p.name.includes(searchQuery)),
    [products, searchQuery]
  );
  
  return filtered.map(p => <ProductCard key={p.id} product={p} />);
}
```

## useCallback

Cache function references:

```tsx
function TodoList({ todos }) {
  // ❌ New function on every render → memo'd TodoItem re-renders anyway
  const handleToggle = (id) => {
    // toggle todo
  };
  
  // ✅ Same function reference → memo'd TodoItem doesn't re-render
  const handleToggle = useCallback((id) => {
    // toggle todo
  }, []); // deps array
  
  return todos.map(todo => (
    <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
  ));
}

const TodoItem = React.memo(({ todo, onToggle }) => {
  // onToggle is stable → no re-render
});
```

## When NOT to memoize

```tsx
// ❌ Premature optimization
const sum = useMemo(() => a + b, [a, b]);
// Addition is faster than the memo check!

// ❌ Useless callback
const handleClick = useCallback(() => {
  console.log("Clicked");
}, []);
// Button always re-renders anyway (not memo'd)
```

**Rule:** Only memoize when:
- Computation is expensive (> 10ms)
- OR passed to memo'd child components
- OR used in effect deps array

## Dependency Arrays

```tsx
// ❌ Missing dependency
useMemo(() => users.filter(u => u.age > minAge), [users]);
// Bug: doesn't update when minAge changes

// ✅ Exhaustive deps
useMemo(() => users.filter(u => u.age > minAge), [users, minAge]);

// Use ESLint plugin to catch missing deps
```
