# Developer Tools

## Why DevTools Mastery Matters

A senior engineer solves in 5 minutes what a junior spends hours debugging. The difference is usually knowing which tool to reach for. DevTools is your primary instrument for understanding what's actually happening in the browser.

## Elements Panel

### Inspecting & Editing the DOM

```
Shortcuts:
  F12 or Ctrl+Shift+I    Open DevTools
  Ctrl+Shift+C           Inspect mode (click to select)
  Escape                 Toggle console drawer
  Ctrl+[  / Ctrl+]       Switch panels

In Elements panel:
  H                      Toggle visibility (adds display:none)
  Delete                 Delete node
  Ctrl+Z                 Undo DOM changes
  Drag                   Reorder elements
  Double-click           Edit attribute/text
```

### Computed Styles

The **Computed** tab shows the final resolved value of every CSS property — invaluable for debugging cascade issues.

```
Elements panel → Computed tab

- Shows ACTUAL values (e.g., "16px" not "1rem")
- Click any property to jump to the source rule
- Checkbox to show inherited properties
- Filter box to find specific property
- Box model visualization at the top
```

### Forcing Element States

```
Elements panel → select element → toggle :hov button
  ✓ :hover    Forces hover state
  ✓ :focus    Forces focus state  
  ✓ :active   Forces active state
  ✓ :visited  Forces visited state

Useful for: debugging CSS that only appears on hover/focus
```

### CSS Changes

All live edits in DevTools are logged and downloadable:
```
Elements → select rule → edit → Changes tab (in bottom drawer)
```

## Console Panel

### Console API — Beyond console.log

```javascript
// Logging levels (filterable)
console.log('Info');
console.warn('Warning');   // Yellow, shows stack trace
console.error('Error');    // Red, shows stack trace
console.debug('Debug');    // Only shows with Verbose level

// Formatting
console.log('User: %o', user);           // Interactive object
console.log('%cStyled!', 'color: red; font-size: 20px;'); // CSS in console!
console.log('%d items, %s name', 5, 'Alice'); // Printf-style

// Grouping
console.group('Network Requests');
console.log('GET /api/users → 200');
console.log('POST /api/login → 200');
console.groupEnd();

console.groupCollapsed('Verbose output'); // Starts collapsed
// ...
console.groupEnd();

// Tables
console.table([
  { name: 'Alice', age: 30, role: 'admin' },
  { name: 'Bob',   age: 25, role: 'user' },
]);

// Timing
console.time('render');
render();
console.timeEnd('render'); // "render: 45.3ms"

console.timeLog('render'); // Log intermediate time without stopping

// Counting
console.count('button clicked');   // "button clicked: 1"
console.count('button clicked');   // "button clicked: 2"
console.countReset('button clicked');

// Assertions
console.assert(user.id > 0, 'User ID must be positive', user);
// Only logs if condition is false

// Stack trace
console.trace('Who called me?'); // Shows full call stack

// Clearing
console.clear();
```

### Console Shortcuts & Tips

```javascript
// $0 — last selected element in Elements panel
$0.classList.add('highlight');

// $1, $2, $3, $4 — previously selected elements

// $ and $$ — querySelector shortcuts
$('input[type="email"]')    // = document.querySelector(...)
$$('.list li')              // = [...document.querySelectorAll(...)]

// $_ — last evaluated expression
2 + 2        // 4
$_ * 5       // 20

// copy() — copy to clipboard
copy(JSON.stringify(bigObject, null, 2));

// getEventListeners() — see listeners on element (Chrome only)
getEventListeners(document.querySelector('button'));

// monitor() — log all calls to a function
monitor(window.fetch); // Logs every fetch() call

// inspect() — jump to element in Elements panel
inspect(document.querySelector('.hero'));

// Live expressions (pin an expression that updates in real-time):
// DevTools → Console → "eye" icon → type: document.querySelector('.count').textContent
```

## Sources Panel

### Breakpoints

```
Setting breakpoints:
  Click line number                    → Line breakpoint
  Right-click line number              → Conditional breakpoint
  Right-click line number → Logpoint   → Log without stopping
  
Breakpoint types (in Breakpoints sidebar):
  - Line-of-code breakpoints
  - DOM mutation breakpoints (in Elements panel)
  - XHR/fetch breakpoints (break when URL contains "api/users")
  - Event listener breakpoints (break on click, scroll, etc.)
  - Exception breakpoints (break on uncaught/caught exceptions)
```

### Debugging Controls

```
F8 or Ctrl+\    Resume (continue to next breakpoint)
F10             Step over (execute current line, stay in function)
F11             Step into (enter the function being called)
Shift+F11       Step out (finish current function, return to caller)

While paused:
  - Hover over variable to see its current value
  - Local/Closure/Global scope in Scope panel
  - Call Stack panel shows how we got here
  - Watch panel for custom expressions
  - Console is scoped to current frame — type variable names!
```

### Source Maps

```javascript
// webpack.config.js
module.exports = {
  devtool: 'source-map', // Full source maps
  // Options: 'eval', 'cheap-source-map', 'inline-source-map', etc.
};

// Source maps let you debug your original TypeScript/JSX/SCSS
// even though the browser runs transpiled/minified code
// DevTools automatically maps between the two
```

### Snippets — Save & Run Code

```
Sources → Snippets tab → New snippet
```

```javascript
// Example snippet: find all images missing alt text
document.querySelectorAll('img:not([alt])').forEach(img => {
  img.style.outline = '3px solid red';
  console.warn('Missing alt:', img.src);
});
```

## Network Panel

### Reading the Waterfall

```
Request timeline columns:
  Queuing        Waiting to be sent (too many requests, low priority)
  Stalled        Queued but waiting for connection
  DNS Lookup     Resolving hostname to IP
  Initial conn.  TCP handshake (+ TLS for HTTPS)
  SSL            TLS handshake
  Request sent   Sending request bytes
  Waiting (TTFB) Time To First Byte — server processing time
  Content down.  Receiving response body
```

### Network Panel Tips

```javascript
// Filters
-domain:cdn.example.com   // Exclude CDN requests
method:POST               // Only POST requests
status-code:404           // Only 404s
larger-than:100k          // Files > 100KB
mime-type:application/json // Only JSON responses

// Right-click request → "Copy as fetch" or "Copy as cURL"
// → paste into console or terminal to replay

// Throttling profiles (dropdown in toolbar):
// "Slow 3G" — 400ms latency, 400kbps download
// Custom — create your own profile

// Preserve log — keep entries after navigation
// Disable cache — test without browser cache (check while DevTools open)
```

### Headers & Payload inspection

```
Click request → Headers tab:
  General:      URL, method, status code
  Response:     Server, Content-Type, Cache-Control, etc.
  Request:      Authorization, Cookie, Content-Type, custom headers
  
Click request → Payload tab:
  Form data (key-value pairs)
  JSON body (formatted)
  Query string parameters

Click request → Timing tab:
  Full timing breakdown for this single request

Click request → Preview tab:
  Rendered preview of JSON/HTML/image response
```

## Performance Panel

The most powerful panel — records every event during a time period.

### Recording a performance trace

```
1. Open Performance panel
2. Check "Screenshots" checkbox
3. Click record (⏺)
4. Interact with the page
5. Click stop (⏹)
6. Analyze the recording
```

### Reading the flame chart

```
Main thread (largest section):
  Long tasks (red triangles) = > 50ms blocks the main thread
  
  ┌─────────────────────────────────────────────────────────────┐
  │ Task (87ms) ◄── Red triangle = Long task!                   │
  ├───────────────────────┐                                     │
  │ Evaluate Script       │                                     │
  ├──────────┐            │                                     │
  │ foo()    │            │                                     │
  ├────┐     │            │                                     │
  │bar()│    │            │                                     │
  └────┴─────┴────────────┴─────────────────────────────────────┘
  time →
  
Reading the chart:
  - Width = duration
  - Height = call depth (lower = called from above)
  - Red tasks need investigation
  - Click on task to see details
```

### Key metrics to look for

```
FPS (frames per second):
  Green bars = > 30fps (OK)
  Yellow bars = 15-30fps (degraded)
  Red bars = < 15fps (janky)

CPU:
  Yellow = scripting
  Purple = rendering (layout + paint)
  Green = painting
  Gray = other

Network waterfall (top section):
  Blue = HTML
  Purple = CSS
  Yellow = JavaScript
  Green = images
```

## Memory Panel

Detect memory leaks — a critical skill for long-running SPAs.

### Heap snapshot

```
Memory panel → Heap snapshot → Take snapshot

Columns in snapshot:
  Constructor — type of object
  Distance — hops from root (shorter = less likely to be leaked)
  Shallow Size — bytes for the object itself
  Retained Size — bytes freed if this object were GC'd (total including refs)
  
Finding leaks:
  1. Take snapshot A (baseline)
  2. Do the action (open/close modal, add/remove items)
  3. Take snapshot B
  4. Select "Comparison" view
  5. Sort by "# Delta" — positive = potential leak
```

### Allocation timeline

```
Memory panel → Allocation instrumentation on timeline → Record
Interact → Stop → Look for blue bars that don't get GC'd
```

### Common memory leaks

```javascript
// ❌ Leak 1: Forgotten event listeners
class Modal {
  open() {
    document.addEventListener('keydown', this.handleKey); // Added...
  }
  close() {
    // ...but never removed!
    // Fix: document.removeEventListener('keydown', this.handleKey);
  }
}

// ❌ Leak 2: Growing arrays never cleared
const log = [];
setInterval(() => {
  log.push(getMetrics()); // Grows forever!
  // Fix: log.splice(0, log.length - 1000); // Keep only last 1000
}, 100);

// ❌ Leak 3: Closures holding DOM references
let element = document.querySelector('.heavy');
const callback = () => {
  element.style.display = 'none'; // 'element' can't be GC'd!
};
// Later: element = null; // Still held by callback!
// Fix: pass ID instead, re-query in callback

// ❌ Leak 4: Global variables
function init() {
  window.app = { data: hugeDataset }; // Never cleaned up
}
```

## Application Panel

### Inspect Storage

```
Application panel tabs:
  Storage:
    Local Storage — key/value pairs per origin
    Session Storage — same but cleared on tab close
    Cookies — name, value, expiry, flags (HttpOnly, Secure, SameSite)
    IndexedDB — browse object stores and records
    Cache Storage — Service Worker cache entries

  Service Workers:
    Register/unregister
    Force update
    Bypass for network (for debugging)
    Push/Sync emulation

  Manifest (PWA):
    Installability checks
    Icons preview
    Shortcuts
```

## Lighthouse

Built-in performance auditing:

```
Lighthouse tab → select categories → Analyze page load
  
Categories:
  Performance (Core Web Vitals + other metrics)
  Accessibility (WCAG checks)
  Best Practices
  SEO
  PWA

Each audit has:
  - Score (0-100)
  - Specific findings
  - "Learn more" link
  - Estimated savings

Run in: Desktop vs Mobile (different throttling)
```

### Key performance opportunities Lighthouse finds

```
Eliminate render-blocking resources   → defer/async scripts, preload CSS
Properly size images                  → serve responsive images
Defer offscreen images               → lazy load with IntersectionObserver
Minify CSS/JS                        → bundler config
Remove unused CSS                    → PurgeCSS
Use efficient image formats          → WebP/AVIF
Enable text compression              → gzip/brotli on server
Reduce server response time (TTFB)   → server/CDN optimizations
```

## Useful DevTools Tricks

### CSS specificity calculator

```
Elements → Computed → click rule source → jumps to Styles
Hover the selector → tooltip shows specificity score (0,1,0 etc.)
```

### Design mode — edit page text

```javascript
// Console:
document.designMode = 'on';
// Now click any text on the page and edit it!
// Great for screenshot mockups
```

### Override network responses

```
Network panel → right-click request → "Override content"
Now you can edit the response body and it serves your version!
Great for testing edge cases without changing backend.
```

### Mobile emulation

```
Toggle device toolbar (Ctrl+Shift+M)
  - Device presets (iPhone, iPad, Pixel)
  - Custom resolution
  - Touch simulation
  - Media features: prefers-color-scheme, prefers-reduced-motion
  - Network throttling
  - CPU throttling (6x slowdown simulates mobile CPU)
```

### Performance monitor (live metrics)

```
⋮ menu → More tools → Performance monitor
Live display of:
  CPU usage
  JS heap size
  DOM nodes
  JS event listeners
  Documents, frames, layouts/sec, style recalcs/sec
```

## Debugging Strategy

### Systematic debugging process

```
1. Reproduce reliably
   - Minimal reproduction case
   - What conditions trigger it?
   - Does it happen in Incognito? (rules out extensions)

2. Locate the source
   - Console errors → click file:line link
   - Network panel → is request failing/returning wrong data?
   - Elements panel → is DOM as expected?

3. Set a breakpoint
   - At the point where the bug first becomes apparent
   - Or on the relevant event listener

4. Step through code
   - Watch variables in Scope panel
   - Check Call Stack to understand how we got here

5. Fix and verify
   - Fix in Sources panel
   - Override file in DevTools (local overrides)
   - Test same scenario in multiple browsers
```

## Key Takeaways

- `console.table()`, `console.group()`, and `console.time()` are game-changers for structured logging
- Conditional breakpoints and logpoints let you debug without stopping execution
- Long tasks (> 50ms in Performance panel) are the enemy of responsive UIs
- Memory panel heap snapshots identify leaked objects by Retained Size
- Lighthouse audits give you a checklist of actionable performance improvements
- Local Overrides in Sources panel let you persist changes across refreshes
- Mobile emulation + CPU/network throttling shows you what real users experience

---

**Module complete! You now understand the browser from DOM to pixels.**

**Next:** [Lab: Virtual DOM Implementation →](../lab/virtual-dom-implementation/)
