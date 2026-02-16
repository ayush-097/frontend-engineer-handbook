# Homework: Performance Audit

## 🎯 Objective

Run a real performance audit on an existing website, identify the top issues using browser DevTools and Lighthouse, propose solutions backed by data, and implement at least three improvements.

## 📋 The Assignment

### Part 1: Choose a Target (20 min)

Pick a public website that is visibly slow or has known performance issues. Good candidates:
- A news website with heavy ads
- An e-commerce product listing page
- Your own portfolio or side project
- A government website (notoriously slow)

**You cannot use:** Google, GitHub, or other sites already heavily optimized.

### Part 2: Baseline Measurement (1 hour)

#### A. Lighthouse Audit

Run Lighthouse in three conditions and record the scores:

```
Conditions to test:
  1. Desktop, no throttling
  2. Mobile, Moto G4, Slow 3G
  3. Mobile, Moto G4, Fast 3G

For each condition, record:
  - Performance score (0–100)
  - LCP (Largest Contentful Paint)
  - FID / TBT (Total Blocking Time)
  - CLS (Cumulative Layout Shift)
  - SI (Speed Index)
  - TTI (Time to Interactive)
```

Fill this table:

| Metric | Desktop | Mobile Slow 3G | Mobile Fast 3G | Target |
|--------|---------|----------------|----------------|--------|
| Performance Score | | | | ≥90 |
| LCP | | | | < 2.5s |
| TBT | | | | < 200ms |
| CLS | | | | < 0.1 |
| TTI | | | | < 3.8s |

#### B. Network Panel Analysis

Record a page load with Network panel and answer:

```
1. Total transfer size: _____ KB
2. Total requests: _____
3. Render-blocking resources: _____ (list them)
4. Largest single resource: _____ KB (what is it?)
5. Time to first byte (TTFB): _____ms
6. DOMContentLoaded: _____ms
7. Load event: _____ms
8. Requests from CDN vs origin: _____% CDN
```

#### C. Performance Panel Analysis

Record a page load with Performance panel:

```
1. Total blocking time: _____ms
2. Longest single task: _____ms (which function?)
3. Layout events: _____ (how many?)
4. Paint events: _____ (how many?)
5. Is there a layout thrash visible? Yes/No (screenshot if yes)
6. Main thread idle time during load: _____%
```

#### D. Memory Snapshot

```
1. JS heap size on load: _____ MB
2. JS heap size after 5 minutes of use: _____ MB
3. DOM nodes on load: _____
4. DOM nodes after heavy use: _____
5. Evidence of memory leak? Yes/No
```

### Part 3: Issue Identification (1 hour)

Based on your measurements, identify the **top 5 performance issues**. For each issue:

```
Issue #1: [Name]
  Category: [Loading | Rendering | Memory | Network]
  Metric affected: [LCP / TBT / CLS / Memory]
  Current value: _____
  Expected value: _____
  Root cause: [Detailed technical explanation]
  Evidence: [DevTools screenshot/measurement]
  Estimated impact if fixed: _____
```

**Common issues to look for:**
- Render-blocking scripts not deferred
- Oversized images (dimensions or format)
- Missing lazy loading
- No resource compression (check Content-Encoding header)
- Long tasks > 50ms (JavaScript parsing, execution)
- Layout shifts from unsized images/embeds
- Unused CSS/JS bundles
- No CDN for static assets
- Missing browser caching headers
- Synchronous XHR blocking the main thread
- Too many HTTP requests (no bundling)
- Third-party scripts (analytics, ads, chat widgets)

### Part 4: Implementation (2–3 hours)

Choose 3 issues from Part 3 and implement fixes. For each:

```
Fix #1: [What you fixed]
  Before: [metric value]
  After: [metric value]
  How: [code/config change with explanation]
  
  Code diff or config change:
  ```[language]
  // before:
  <script src="heavy.js"></script>
  
  // after:
  <script src="heavy.js" defer></script>
  ```
```

### Part 5: Before/After Report (1 hour)

Complete performance report with:

1. **Executive Summary** (non-technical, 3 sentences)
2. **Before/After Lighthouse comparison table**
3. **Top 5 issues with priority and estimated impact**
4. **Implemented fixes with measurements**
5. **Remaining recommendations** (what you'd fix next)

## 📁 Deliverables

```
performance-audit/
├── audit-report.md         ← Your written report
├── screenshots/
│   ├── lighthouse-before.png
│   ├── lighthouse-after.png
│   ├── network-waterfall.png
│   ├── performance-flamechart.png
│   └── issue-*.png         ← Evidence for each issue
└── fixes/
    └── [any code changes made]
```

## 📊 Grading Rubric

| Section | Points | Criteria |
|---------|--------|----------|
| Baseline measurements | 20 | All metrics recorded across all conditions |
| Issue identification | 25 | 5 issues with root cause analysis |
| Implementations | 30 | 3 fixes with before/after evidence |
| Report quality | 15 | Clear, data-driven, actionable |
| Screenshots | 10 | Full evidence for all claims |
| **Total** | **100** | |

## 💡 Pro Tips

```
Testing tips:
  - Always test in Incognito (extensions affect results)
  - Disable browser cache during testing (DevTools → Network → Disable cache)
  - Run Lighthouse 3 times and take the median score
  - Test on real mobile device, not just emulation (if possible)
  - Use webpagetest.org for second opinion

Common quick wins:
  - Add defer to non-critical scripts → Reduces TBT
  - Convert images to WebP → Reduces transfer size 25–35%
  - Add width/height to images → Eliminates CLS
  - Enable gzip/brotli on server → Reduces transfer 60–80%
  - Add Cache-Control headers → Eliminates repeat downloads
  - Use loading="lazy" on images → Reduces initial payload
  - Self-host Google Fonts → Eliminates extra DNS lookup

Tools to use:
  - Chrome DevTools (primary)
  - Lighthouse (built into DevTools)
  - WebPageTest.org (multiple locations, film strip view)
  - ImageOptim / Squoosh for image optimization
  - Bundlephobia.com for npm package size analysis
  - Coverage tab (DevTools) for unused CSS/JS
```

## ⏱️ Time Estimate

- Part 1-2 (measurement): 1.5 hours
- Part 3 (analysis): 1 hour
- Part 4 (fixes): 2–3 hours
- Part 5 (report): 1 hour

**Total: ~6 hours**

**Submit:** GitHub repo with `audit-report.md` and all screenshots
