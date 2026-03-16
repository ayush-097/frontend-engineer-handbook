# Bundle Optimization

## Code Splitting

### Route-Based
```tsx
const Dashboard = lazy(() => import("./Dashboard"));
const Profile = lazy(() => import("./Profile"));

<Routes>
  <Route path="/" element={
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  } />
  <Route path="/profile" element={
    <Suspense fallback={<Spinner />}>
      <Profile />
    </Suspense>
  } />
</Routes>
```

### Component-Based
```tsx
const Chart = lazy(() => import("./Chart"));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      {showChart && (
        <Suspense fallback={<Skeleton />}>
          <Chart />
        </Suspense>
      )}
    </>
  );
}
```

## Tree Shaking

```tsx
// ❌ Imports entire library
import _ from "lodash"; // 71kb
const result = _.debounce(fn, 300);

// ✅ Imports only what you need
import debounce from "lodash-es/debounce"; // 3kb
```

## Dependency Analysis

```bash
npm install -D webpack-bundle-analyzer
npm run build -- --analyze

# See visual breakdown:
# - Which packages are largest
// - Where code is duplicated
# - What to optimize first
```
