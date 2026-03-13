# Code Splitting

## React.lazy

```tsx
const Dashboard = lazy(() => import("./Dashboard"));
const Profile = lazy(() => import("./Profile"));
const Settings = lazy(() => import("./Settings"));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

## Component-Level Splitting

```tsx
function HomePage() {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      
      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <Chart />
        </Suspense>
      )}
    </div>
  );
}

const Chart = lazy(() => import("./Chart"));
```

## Prefetching

```tsx
function HomePage() {
  const prefetchDashboard = () => {
    import("./Dashboard"); // Starts loading, doesn't render
  };
  
  return (
    <Link to="/dashboard" onMouseEnter={prefetchDashboard}>
      Go to Dashboard
    </Link>
  );
}
```

## Named Exports

```tsx
// charts.tsx
export function LineChart() { ... }
export function BarChart() { ... }
export function PieChart() { ... }

// App.tsx
const LineChart = lazy(() =>
  import("./charts").then(module => ({ default: module.LineChart }))
);
```

## Bundle Analysis

```bash
npm run build -- --analyze
# See which chunks are large, split them further
```
