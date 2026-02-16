# Browser Rendering Pipeline

## The Critical Rendering Path

Every time a browser loads a page or updates the DOM, it follows a sequence of steps to turn your HTML/CSS/JS into pixels on screen. Understanding this pipeline lets you write code that renders fast.

```
URL → Network → Parse → Style → Layout → Paint → Composite → Screen
```

## Step 1: Navigation & Network

```
1. DNS lookup: "example.com" → 93.184.216.34
2. TCP connection (+ TLS handshake for HTTPS)
3. HTTP request sent
4. Server responds with HTML bytes
5. Browser starts parsing immediately (streaming)
```

The key insight: **the browser doesn't wait for the full HTML before parsing**. It processes bytes as they arrive.

## Step 2: HTML Parsing & DOM Construction

The HTML parser reads bytes → tokens → nodes → DOM tree.

```
Bytes: 3C 68 74 6D 6C 3E...
  ↓ Encoding detection
Characters: <html>...
  ↓ Tokenizer
Tokens: StartTag(html), StartTag(head), ...
  ↓ Tree construction
DOM: Document → html → head, body → ...
```

### Parser blocking — scripts

```html
<!-- ❌ Blocks parser — must download + execute before continuing -->
<script src="heavy.js"></script>

<!-- ✅ Downloads in parallel, executes after HTML parsed -->
<script src="app.js" defer></script>

<!-- ✅ Downloads in parallel, executes immediately when ready -->
<script src="analytics.js" async></script>

<!-- ✅ Inline module — deferred by default -->
<script type="module">
  import { init } from './app.js';
  init();
</script>
```

**Attribute comparison:**

| | `<script>` | `async` | `defer` | `type="module"` |
|---|---|---|---|---|
| Download | Blocks | Parallel | Parallel | Parallel |
| Execute | Immediately | When ready | After parse | After parse |
| Order | In order | Any order | In order | In order |

### Preload scanner

While the main parser is blocked on a script, the browser runs a **preload scanner** in parallel — it scans ahead and starts fetching resources it finds.

```html
<!-- These get preloaded even while parser is blocked -->
<link rel="preload" href="hero.jpg" as="image">
<link rel="preload" href="main.css" as="style">
<link rel="preload" href="app.js" as="script">
```

## Step 3: CSS Parsing & CSSOM Construction

While HTML is parsed, CSS is parsed into the **CSSOM** (CSS Object Model) — a tree similar to the DOM.

```css
body { font-size: 16px; }
h1   { font-size: 2em; color: navy; }
p    { color: #333; }
```

```
CSSOM:
body (font-size: 16px)
├── h1 (font-size: 2em = 32px, color: navy)
└── p (color: #333)
```

**Critical:** CSS blocks rendering. The browser won't display anything until it has parsed all CSS. This is why you put `<link>` stylesheets in `<head>`.

```html
<!-- ✅ In <head> — parsed early, doesn't block HTML parsing -->
<link rel="stylesheet" href="styles.css">

<!-- ❌ In <body> — causes flash of unstyled content -->
<link rel="stylesheet" href="styles.css">
```

## Step 4: Render Tree Construction

The **render tree** combines DOM + CSSOM. It includes only visible nodes.

```
DOM + CSSOM → Render Tree

DOM:                      Render Tree:
html                      body (display: block)
├── head                  ├── p (display: block, color: #333)
│   └── title (ignored)  └── div (display: block)
└── body                      └── span (display: inline)
    ├── p
    └── div
        ├── span
        └── p [display: none]  ← NOT in render tree (hidden)
```

Elements excluded from render tree:
- `display: none` elements
- `<head>` and its children
- `<script>` and `<style>` elements

Note: `visibility: hidden` IS in the render tree (takes up space, just invisible).

## Step 5: Layout (Reflow)

The browser calculates the **exact position and size** of every render tree node. This phase is expensive.

```javascript
// Triggers that cause layout (reflow):
// - Reading: offsetWidth, offsetHeight, offsetTop, offsetLeft
// - Reading: scrollWidth, scrollHeight, scrollTop, scrollLeft  
// - Reading: clientWidth, clientHeight, clientTop, clientLeft
// - Reading: getComputedStyle(), getBoundingClientRect()
// - Writing: el.style.width, height, margin, padding, etc.
// - DOM changes: appendChild, removeChild, innerHTML
// - Window resize, font size change
```

### What layout calculates

```
For each element:
- Box model (content box, padding, border, margin)
- Position (relative to parent, floats, positioning)
- Size (based on content, width/height rules, flexbox/grid)
- Text wrapping and line heights
```

## Step 6: Paint

The browser converts the render tree into draw calls — colors, borders, shadows, text, images. This creates **paint records** (like a canvas API calls list).

**What triggers paint:**
- Color changes (`color`, `background-color`, `border-color`)
- Visibility changes
- Opacity changes (partially — see compositing)
- Reflows always trigger repaint

**What does NOT trigger paint:**
- `transform` (position changes via GPU)
- `opacity` (handled by compositor)

## Step 7: Compositing & GPU Acceleration

The browser splits the page into **layers**, paints each layer, then the compositor assembles them on screen. The GPU handles this — it's fast.

### Promoting elements to their own layer

```css
/* These properties create a new compositing layer: */
.gpu-accelerated {
  transform: translateZ(0);     /* Classic hack */
  transform: translate3d(0,0,0); /* Same effect */
  will-change: transform;       /* Modern — hints to browser */
  will-change: opacity;
}
```

**Why this matters for animation:**

```css
/* ❌ Triggers layout + paint on every frame (janky!) */
@keyframes slide-bad {
  from { left: 0; }
  to   { left: 300px; }
}

/* ✅ Handled by compositor only (smooth 60fps!) */
@keyframes slide-good {
  from { transform: translateX(0); }
  to   { transform: translateX(300px); }
}
```

### Properties by rendering cost

| Cost | Properties |
|------|-----------|
| **Layout** | `width`, `height`, `padding`, `margin`, `top`, `left`, `font-size`, `display`, `float` |
| **Paint** | `color`, `background`, `border-color`, `box-shadow`, `border-radius` |
| **Composite only** | `transform`, `opacity` |

## The Pixel Pipeline

For each frame (at 60fps, you have 16ms):

```
JavaScript → Style → Layout → Paint → Composite
    ↓           ↓       ↓        ↓         ↓
Run JS      Recalc   Boxes   Pixels    Screen
animate     styles   sizes
```

**Optimizing the pixel pipeline:**

```javascript
// ❌ JS animation — uses setTimeout, often jank
function animate() {
  el.style.left = parseFloat(el.style.left) + 1 + 'px';
  setTimeout(animate, 16);
}

// ✅ requestAnimationFrame — synced with browser's render cycle
function animate(timestamp) {
  el.style.transform = `translateX(${position}px)`;
  position++;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// ✅ CSS animation — browser-optimized, can run off main thread
el.classList.add('animating');
// .animating { animation: slide 0.3s ease forwards; }
```

## Forced Synchronous Layout (Layout Thrash)

The single most common performance mistake:

```javascript
// ❌ Layout thrash — 1000 reflows!
const items = document.querySelectorAll('.item');
items.forEach(item => {
  // Write (invalidates layout)...
  item.style.width = item.parentElement.offsetWidth / 3 + 'px';
  // ...then READ (forces synchronous layout calculation)
  const height = item.offsetHeight;
  item.style.height = height * 2 + 'px';
  // ...then WRITE again → another reflow!
});

// ✅ Batch all reads, then all writes — ONE reflow
const parentWidth = items[0].parentElement.offsetWidth; // Read once
const heights = [...items].map(item => item.offsetHeight); // Read all
items.forEach((item, i) => {
  item.style.width  = parentWidth / 3 + 'px';  // Write
  item.style.height = heights[i] * 2 + 'px';   // Write
});
```

## FastDOM — Library for Safe DOM Access

```javascript
// fastdom queues reads and writes to prevent thrash
import fastdom from 'fastdom';

items.forEach(item => {
  fastdom.measure(() => {
    const height = item.offsetHeight; // Safe read
    
    fastdom.mutate(() => {
      item.style.height = height * 2 + 'px'; // Safe write
    });
  });
});
```

## Reflow vs Repaint

```javascript
// Forces REFLOW (expensive — recalculates geometry):
el.offsetWidth           // Reading geometry
el.style.width = '100px' // Writing geometry

// Forces REPAINT (cheaper — redraws pixels):
el.style.color = 'red'
el.style.backgroundColor = 'blue'

// No layout or paint (cheapest — compositor only):
el.style.transform = 'translateX(10px)'
el.style.opacity = '0.5'
```

## CSS Containment

Tell the browser what can affect what — enables better optimization:

```css
/* Layout containment — internal layout changes can't affect outside */
.widget {
  contain: layout;
}

/* Paint containment — content won't paint outside this box */
.widget {
  contain: paint;
}

/* Both */
.widget {
  contain: layout paint;
}

/* Strict — layout + paint + size (nothing in this element affects outside) */
.widget {
  contain: strict;
}

/* content-visibility: auto — skip rendering off-screen content entirely! */
.section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* Estimate of content height */
}
```

## Critical CSS — Inline Above-the-Fold Styles

```html
<head>
  <!-- Inline only what's needed for the first screen (< 14KB) -->
  <style>
    /* Critical: renders the visible area immediately */
    body { font-family: sans-serif; margin: 0; }
    .hero { height: 100vh; background: #2c3e50; color: white; }
    .hero__title { font-size: 3rem; padding: 2rem; }
  </style>

  <!-- Load rest asynchronously — doesn't block rendering -->
  <link rel="preload" href="full-styles.css" as="style" onload="this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="full-styles.css"></noscript>
</head>
```

## Resource Hints

```html
<!-- dns-prefetch — resolve DNS early for external domains -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">

<!-- preconnect — DNS + TCP + TLS handshake early (for critical origins) -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- preload — download critical resource early (use for same-origin) -->
<link rel="preload" href="/fonts/hero-font.woff2" as="font" crossorigin>
<link rel="preload" href="/hero.jpg" as="image">
<link rel="preload" href="/app.js" as="script">

<!-- prefetch — download future resource during idle time -->
<link rel="prefetch" href="/next-page.js">

<!-- prerender — fully render a page in the background (aggressive!) -->
<link rel="prerender" href="https://example.com/next">
```

## Web Vitals — Measuring Render Performance

```javascript
// Core Web Vitals — Google's rendering performance metrics

// LCP — Largest Contentful Paint (< 2.5s is Good)
// Time until the largest visible element renders

// FID — First Input Delay (< 100ms is Good)
// Time from first interaction to browser response

// CLS — Cumulative Layout Shift (< 0.1 is Good)
// Unexpected layout shifts during loading

// Measuring with PerformanceObserver
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.startTime);
    }
  });
}).observe({ type: 'largest-contentful-paint', buffered: true });

// layout-shift (CLS)
new PerformanceObserver((list) => {
  let cls = 0;
  list.getEntries().forEach(entry => {
    if (!entry.hadRecentInput) {
      cls += entry.value;
    }
  });
  console.log('CLS:', cls);
}).observe({ type: 'layout-shift', buffered: true });
```

## Practice Exercises

### Exercise 1: Identify bottlenecks

```javascript
// Find and fix all performance problems:
function updateList(items) {
  const list = document.querySelector('.list');
  list.innerHTML = '';

  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    li.style.height = li.offsetHeight + 'px'; // Bug!
    list.appendChild(li);
  });
}
```

### Exercise 2: Smooth animation

```javascript
// Animate a box from left:0 to left:500px over 1 second
// Requirements:
// - Must be 60fps (use compositor-only properties)
// - Must use requestAnimationFrame
// - Must be cancellable
function animateBox(element, duration) {
  // TODO
}
```

## Key Takeaways

- HTML parsing → DOM; CSS parsing → CSSOM; DOM + CSSOM → Render Tree
- `<script>` blocks parsing; use `defer` or `async`; CSS blocks rendering
- Rendering pipeline: Layout → Paint → Composite (each more expensive than last)
- `transform` and `opacity` are compositor-only — use them for smooth animations
- Avoid layout thrash: batch all reads before writes
- `content-visibility: auto` skips rendering of off-screen content entirely
- Web Vitals measure real user rendering experience (LCP, FID, CLS)

---

**Next:** [Lecture 4: Web APIs →](4-web-apis.md)
