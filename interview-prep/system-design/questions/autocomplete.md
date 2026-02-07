# System Design: Autocomplete/Typeahead

## Problem

Design an autocomplete system like Google Search suggestions.

## Requirements Clarification

### Functional
- Show suggestions as user types
- Support keyboard navigation
- Handle clicks on suggestions
- Clear on selection

### Non-Functional
- Low latency (<100ms)
- Works on slow networks
- Handles millions of queries/day
- Supports mobile and desktop

### Out of Scope (for this interview)
- Backend ranking algorithm
- Spell checking
- Analytics

## High-Level Architecture

```
┌─────────────────┐
│   Input Box     │
│   (Component)   │
└────────┬────────┘
         │
    ┌────▼────┐
    │  State  │
    │ Manager │
    └────┬────┘
         │
  ┌──────▼──────┐
  │   API Layer │
  │  (debounced)│
  └──────┬──────┘
         │
    ┌────▼────┐
    │   CDN   │
    │  Cache  │
    └────┬────┘
         │
  ┌──────▼──────┐
  │   Backend   │
  │   Service   │
  └─────────────┘
```

## Component Architecture

```typescript
interface AutocompleteProps {
  onSelect: (value: string) => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
  debounceMs?: number;
  minChars?: number;
}

function Autocomplete({ 
  onSelect, 
  fetchSuggestions,
  debounceMs = 300,
  minChars = 2 
}: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced fetch
  const debouncedFetch = useMemo(
    () => debounce(async (q: string) => {
      if (q.length < minChars) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const results = await fetchSuggestions(q);
        setSuggestions(results);
      } catch (error) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [fetchSuggestions, debounceMs, minChars]
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => 
          Math.min(i + 1, suggestions.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          onSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        break;
    }
  };

  // ... render logic
}
```

## Key Design Decisions

### 1. Debouncing

**Why:** Reduce API calls (300ms delay)

**Tradeoff:**
- ✅ Fewer API calls
- ❌ Slight delay in showing suggestions

**Alternative:** Throttling (worse for this use case)

### 2. Caching Strategy

**Client-side cache:**
```typescript
const cache = new Map<string, string[]>();

async function fetchWithCache(query: string) {
  const cached = cache.get(query);
  if (cached) return cached;
  
  const results = await api.search(query);
  cache.set(query, results);
  return results;
}
```

**Cache invalidation:** Time-based (5 min TTL)

### 3. Network Optimization

**Request cancellation:**
```typescript
const abortControllerRef = useRef<AbortController>();

const debouncedFetch = useMemo(
  () => debounce(async (q: string) => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    
    // New request with abort signal
    abortControllerRef.current = new AbortController();
    const results = await fetch(url, {
      signal: abortControllerRef.current.signal
    });
    
    // ...
  }, 300),
  []
);
```

### 4. Accessibility

**Required:**
- ARIA role="combobox"
- aria-autocomplete="list"
- aria-expanded
- aria-activedescendant
- Keyboard navigation
- Screen reader announcements

### 5. Mobile Considerations

**Challenges:**
- Smaller screen
- Touch targets
- Virtual keyboard

**Solutions:**
- Larger hit targets (44×44px)
- Prevent zoom on input focus
- Sticky positioning for suggestions

## Scaling Considerations

### 10x Traffic

**Problem:** API overload

**Solutions:**
1. CDN caching for popular queries
2. Client-side caching (localStorage)
3. Request coalescing (same query, multiple users)

### Global Users

**Problem:** Latency

**Solutions:**
1. Edge caching (Cloudflare, Fastly)
2. Regional API endpoints
3. Prefetching popular queries

### Slow Networks

**Problem:** Timeout, slow responses

**Solutions:**
1. Longer debounce on slow connections
2. Show cached results while fetching
3. Offline support (service worker)

## Performance Metrics

**Targets:**
- Time to first suggestion: <100ms
- Keystroke to API call: ~300ms
- Render time: <16ms (60fps)

**Monitoring:**
```typescript
performance.mark('search-start');
await fetchSuggestions(query);
performance.mark('search-end');
performance.measure('search', 'search-start', 'search-end');

// Send to analytics
sendMetric('autocomplete_latency', measure.duration);
```

## Follow-up Questions

**Q: How would you handle highlighting matching text?**
A: Mark match positions in response, use CSS/dangerouslySetInnerHTML

**Q: What about handling typos?**
A: Fuzzy matching on backend, show "did you mean" suggestions

**Q: How to prevent race conditions?**
A: Request cancellation (AbortController), track request IDs

**Q: Mobile keyboard covering suggestions?**
A: Position suggestions above input on mobile, use viewport units

## Summary

**Key points:**
1. Debouncing reduces API calls
2. Caching improves performance
3. Request cancellation prevents races
4. Accessibility is non-negotiable
5. Mobile requires special attention

**Tradeoffs discussed:**
- Debounce delay vs responsiveness
- Cache size vs memory
- Client vs server-side filtering

---

**Next:** Try [Google Docs](google-docs.md) (harder) →
