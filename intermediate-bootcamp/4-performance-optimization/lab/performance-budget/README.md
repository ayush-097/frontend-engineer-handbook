# Lab: Performance Budget

Set performance budgets and measure real-time Web Vitals.

## Tasks

### 1. Set Budgets
Create `budgets.json`:
```json
{
  "budgets": [
    { "resourceType": "script", "budget": 200 },
    { "resourceType": "total", "budget": 500 }
  ],
  "metrics": [
    { "metric": "interactive", "budget": 3000 },
    { "metric": "first-contentful-paint", "budget": 1800 }
  ]
}
```

### 2. Measure Web Vitals
Display real-time metrics:
```tsx
import { getLCP, getFID, getCLS } from "web-vitals";

function WebVitals() {
  const [metrics, setMetrics] = useState({});
  
  useEffect(() => {
    getLCP(m => setMetrics(prev => ({ ...prev, lcp: m.value })));
    getFID(m => setMetrics(prev => ({ ...prev, fid: m.value })));
    getCLS(m => setMetrics(prev => ({ ...prev, cls: m.value })));
  }, []);
  
  return <Dashboard metrics={metrics} />;
}
```

### 3. CI/CD Check
Fail build if bundle exceeds budget

**Time:** 2 hours  
**Deliverable:** Dashboard showing live Web Vitals
