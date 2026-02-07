# Rendering Performance

## The Rendering Pipeline

### Browser's Work

When you update the DOM, the browser:
1. **Layout** - Calculate positions and sizes
2. **Paint** - Draw pixels
3. **Composite** - Combine layers

**Each step is expensive**. Our goal: minimize them.

### Critical Rendering Path

```
HTML → Parse → DOM Tree
CSS  → Parse → CSSOM Tree
         ↓
    Render Tree
         ↓
      Layout
         ↓
       Paint
         ↓
    Composite
```

## React's Virtual DOM

### Why Virtual DOM?

Directly manipulating DOM is slow:
```javascript
// 100 DOM operations = 100 reflows/repaints
for (let i = 0; i < 100; i++) {
  list.appendChild(createItem(i));
}
```

React batches updates:
```javascript
// 100 virtual updates → 1 real DOM update
setState(items.concat(newItems));
```

### Reconciliation Algorithm

React compares old and new virtual DOMs:

**Rules:**
1. Different types = unmount and remount
2. Same type = update props
3. Keys help identify which items changed

## Measuring Performance

### React DevTools Profiler

**Steps:**
1. Open React DevTools
2. Click "Profiler" tab
3. Click record (⏺)
4. Interact with app
5. Stop recording
6. Analyze flame graph

**What to look for:**
- Components taking >16ms (60fps threshold)
- Unnecessary re-renders
- Deep component trees

### Chrome DevTools Performance

**Record a performance profile:**
1. Open DevTools → Performance
2. Click record
3. Interact with app (3-5 seconds)
4. Stop
5. Analyze

**Look for:**
- Long tasks (>50ms)
- Layout thrashing
- Forced synchronous layouts

## Common Performance Problems

### Problem 1: Unnecessary Re-renders

```typescript
// ❌ BAD: Parent re-renders cause all children to re-render
function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <ExpensiveComponent /> {/* Re-renders on every count change! */}
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
    </>
  );
}

// ✅ GOOD: Memoize component
const MemoizedExpensive = React.memo(ExpensiveComponent);

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <MemoizedExpensive /> {/* Only re-renders when props change */}
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
    </>
  );
}
```

### Problem 2: Expensive Calculations in Render

```typescript
// ❌ BAD: Recalculates on every render
function UserList({ users }) {
  const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));
  return <div>{sortedUsers.map(renderUser)}</div>;
}

// ✅ GOOD: Memoize expensive calculation
function UserList({ users }) {
  const sortedUsers = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );
  return <div>{sortedUsers.map(renderUser)}</div>;
}
```

### Problem 3: Creating Functions in Render

```typescript
// ❌ BAD: New function on every render
function Parent() {
  return <Child onClick={() => console.log('clicked')} />;
}
const Child = React.memo(({ onClick }) => <button onClick={onClick}>Click</button>);
// Child still re-renders because onClick is a new function each time!

// ✅ GOOD: Stable function reference
function Parent() {
  const handleClick = useCallback(() => console.log('clicked'), []);
  return <Child onClick={handleClick} />;
}
```

## Exercise

Profile this component and identify the performance issue:

```typescript
function ProductList({ products }) {
  const [filter, setFilter] = useState('');
  
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <>
      <input 
        value={filter} 
        onChange={e => setFilter(e.target.value)} 
      />
      <div>
        {filtered.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            onSelect={() => console.log('selected', product.id)}
          />
        ))}
      </div>
    </>
  );
}
```

**Issues:**
1. Filter runs on every render (even when filter unchanged)
2. New onSelect function for each product on each render
3. ProductCard might re-render unnecessarily

**Fixes:**
See [lab/rendering-optimization/](../lab/rendering-optimization/)

---

**Next:** [Lecture 2: Memoization Strategies →](2-memoization-strategies.md)
