# Performance Optimization

> Make your apps fast—really fast—with production-grade optimization techniques

## 🎯 Why Performance Matters

**Users abandon slow sites:**
- 53% of mobile users leave if load time >3s
- 1s delay = 7% reduction in conversions

**Performance is a feature**, not an afterthought.

This module teaches you to:
- Diagnose performance bottlenecks scientifically
- Optimize rendering with memoization strategies
- Handle large datasets with virtualization
- Reduce bundle sizes by 70%+
- Meet Core Web Vitals targets
- Use profiling tools like a senior engineer

## 📋 Prerequisites

- React fundamentals (hooks, component lifecycle)
- JavaScript proficiency (closures, async)
- Basic understanding of browser rendering

## 🗓️ Time Commitment

**3 weeks** (15-18 hours/week)

## 📚 Module Structure

### Lectures

#### 1. [Rendering Performance](lecture/1-rendering-performance.md)
**Key concepts:**
- Browser rendering pipeline (layout, paint, composite)
- React reconciliation & diffing algorithm
- When re-renders happen (and why)
- Virtual DOM vs real DOM updates
- Profiling with React DevTools Profiler

**Real-world problem:**
You have a table with 10,000 rows. Clicking a button causes a 2-second freeze. How do you fix it?

---

#### 2. [Memoization Strategies](lecture/2-memoization-strategies.md)
**Key concepts:**
- React.memo (when and when NOT to use)
- useMemo vs useCallback (and their costs)
- The "memoization paradox" (sometimes it's slower)
- Context optimization patterns
- Selector libraries (Reselect, Redux Toolkit)

**Code example:**
```typescript
// ❌ BAD: Creates new object on every render
function UserProfile({ userId }) {
  const config = { id: userId, theme: 'dark' }; // New reference!
  return <ExpensiveComponent config={config} />;
}

// ✅ GOOD: Stable reference
function UserProfile({ userId }) {
  const config = useMemo(
    () => ({ id: userId, theme: 'dark' }),
    [userId]
  );
  return <ExpensiveComponent config={config} />;
}

// 🤔 BETTER: Is memoization even needed?
function UserProfile({ userId }) {
  return <ExpensiveComponent userId={userId} theme="dark" />;
}
```

**When to memoize**: Measure first. Memoization has costs.

---

#### 3. [Virtualization](lecture/3-virtualization.md)
**Key concepts:**
- Why rendering 10,000 DOM nodes is slow
- Windowing vs virtualization
- react-window vs react-virtualized
- Grid virtualization
- Dynamic height items
- Scroll restoration

**Performance impact:**
- **Before**: 10,000 rows × 50px = 500,000px of DOM
- **After**: 20 visible rows × 50px = 1,000px of DOM
- **Result**: 60fps scrolling, instant renders

**Lab preview**: Build a virtualized list supporting:
- Variable row heights
- Sticky headers
- Infinite scroll
- 100,000+ items

---

#### 4. [Bundle Optimization](lecture/4-bundle-optimization.md)
**Key concepts:**
- Code splitting strategies
- Route-based splitting
- Component lazy loading
- Dynamic imports
- Tree shaking mechanics
- Analyzing bundle composition
- Optimizing dependencies

**Real-world impact:**
```
BEFORE:
main.js: 1.2MB (uncompressed)
FCP: 4.2s
TTI: 6.8s

AFTER:
main.js: 280KB
routes/*.js: 150KB avg (lazy loaded)
FCP: 1.1s
TTI: 2.3s
```

**Tools covered:**
- Webpack Bundle Analyzer
- Vite Rollup Plugin Visualizer
- Import Cost VSCode extension

---

#### 5. [Core Web Vitals](lecture/5-web-vitals.md)
**The metrics that matter:**

| Metric | Target | What it measures | Common issues |
|--------|--------|------------------|---------------|
| **LCP** | <2.5s | Largest Contentful Paint | Unoptimized images, slow server |
| **FID** | <100ms | First Input Delay | Heavy JS blocking main thread |
| **CLS** | <0.1 | Cumulative Layout Shift | Missing dimensions, web fonts |
| **INP** | <200ms | Interaction to Next Paint | Long tasks, unoptimized events |

**Measurement tools:**
- Lighthouse (lab data)
- Chrome UX Report (field data)
- Web Vitals library
- Real User Monitoring (RUM)

**Lab preview**: Take a failing site from F to A in Lighthouse.

---

#### 6. [Profiling & Debugging](lecture/6-profiling-debugging.md)
**Tools & techniques:**
- Chrome DevTools Performance tab
- React DevTools Profiler
- Performance.measure() API
- Long task detection
- Memory leak identification
- Frame drops analysis

**Methodical debugging approach:**
1. Reproduce the issue
2. Profile to identify bottleneck
3. Hypothesize root cause
4. Make targeted fix
5. Verify improvement
6. Add performance test

### Labs

#### 1. [Virtual Scroll List](lab/virtual-scroll-list/)
Build a production-ready virtualized list from scratch.

**Requirements:**
- Render 100,000 items smoothly
- Variable row heights
- Scrollbar accuracy
- Keyboard navigation (accessibility!)
- Overscan for smooth scrolling

**Acceptance criteria:**
- 60fps scrolling on low-end devices
- <100ms response to keyboard navigation
- Lighthouse Performance score >90

---

#### 2. [Code Splitting Demo](lab/code-splitting-demo/)
Optimize a bloated app using multiple splitting strategies.

**Starting state:**
- Single 2MB bundle
- 8s TTI on 3G
- Lighthouse score: 12

**Your mission:**
- Route-based splitting
- Component lazy loading
- Vendor chunk optimization
- Critical CSS inlining

**Target:**
- Main bundle <300KB
- Route bundles <200KB
- TTI <3s on 3G
- Lighthouse score >80

---

#### 3. [Image Optimization](lab/image-optimization/)
Implement modern image loading strategies.

**Techniques:**
- Responsive images (srcset, sizes)
- Lazy loading (Intersection Observer)
- WebP with fallbacks
- Blur-up placeholders
- Preloading critical images

---

#### 4. [Performance Budget](lab/performance-budget/)
Set up automated performance monitoring.

**Tools:**
- Lighthouse CI in GitHub Actions
- Bundle size checks
- Regression detection
- Performance budgets in webpack

**Budget example:**
```json
{
  "main.js": {
    "size": "300KB",
    "gzip": "100KB"
  },
  "vendor.js": {
    "size": "150KB"
  },
  "LCP": "2.5s",
  "FID": "100ms"
}
```

### Homework

#### 1. [Optimize Slow App](homework/optimize-slow-app.md)
You're given a real-world app with performance issues:
- 5s initial load
- Janky scrolling
- Unresponsive interactions

**Deliverable:**
- Performance audit report (Markdown)
- Profiling screenshots with annotations
- Pull request with optimizations
- Before/after metrics comparison

---

#### 2. [Bundle Analysis](homework/bundle-analysis.md)
Analyze three popular websites' bundles:
1. Identify optimization opportunities
2. Estimate potential savings
3. Write a "Performance Review"

**Example questions:**
- Why is Lodash the largest dependency?
- Could route-based splitting reduce initial bundle?
- Are there duplicate dependencies?

---

#### 3. [Lighthouse Audit](homework/lighthouse-audit.md)
Run Lighthouse on your personal project or portfolio:
- Achieve 90+ in all categories
- Document each optimization
- Track metrics over time

## ✅ Testing

Performance tests are challenging but critical:

```typescript
// Example: Test that list renders in <100ms
it('renders 10,000 items in under 100ms', () => {
  const start = performance.now();
  render(<VirtualList items={generateItems(10000)} />);
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100);
});

// Example: Bundle size test
it('main bundle is under 300KB', () => {
  const stats = getWebpackStats();
  const mainBundle = stats.assets.find(a => a.name === 'main.js');
  expect(mainBundle.size).toBeLessThan(300 * 1024);
});
```

## 📊 Success Metrics

After this module, you should achieve:

**For a typical SPA:**
- Lighthouse Performance score: >90
- LCP: <2.5s
- FID/INP: <100ms
- CLS: <0.1
- Main bundle: <300KB gzipped

**For dashboards with heavy data:**
- 60fps scrolling with 10,000+ rows
- <200ms interaction latency
- Optimistic UI for all mutations

## 🎓 Assessment

**Final Project**: Performance Optimization Report

Choose a real website (not yours) and:
1. Run comprehensive performance audit
2. Identify top 3 bottlenecks
3. Propose solutions with estimated impact
4. Implement fixes in a fork (if open source)
5. Present findings in a 5-minute video

**Grading criteria:**
- Scientific measurement approach
- Prioritization (biggest impact first)
- Realistic solutions
- Clear communication

## 📖 Required Reading

- [Web Performance Working Group Specs](https://www.w3.org/webperf/)
- [React Rendering Behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/) - Mark Erikson
- [The Cost of JavaScript](https://v8.dev/blog/cost-of-javascript-2019) - Addy Osmani

## 💡 Pro Tips

1. **Measure before optimizing**: Premature optimization is evil
2. **Profile in production mode**: Dev React is slower
3. **Test on real devices**: Your MacBook Pro isn't representative
4. **Use performance budgets**: Automate regression prevention
5. **Optimize for 3G**: Fast on slow = instant on fast

## 🚨 Common Mistakes

❌ Wrapping everything in `React.memo`
❌ Optimizing without profiling first
❌ Ignoring network performance
❌ Testing only on high-end devices
❌ Forgetting about memory leaks

## ❓ FAQ

**Q: Should I optimize every component?**
A: No! Only optimize components that cause measurable issues.

**Q: Is 60fps always necessary?**
A: For animations and scrolling, yes. For static content, no.

**Q: Lighthouse score of 100 or bust?**
A: Aim for >90. The last 10 points often aren't worth it.

---

**Ready to make things fast? Start with [Lecture 1: Rendering Performance](lecture/1-rendering-performance.md) →**
