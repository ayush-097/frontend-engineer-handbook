# Lab: Intersection Observer — Lazy Load & Infinite Scroll

Build three production-ready features using the `IntersectionObserver` API: lazy image loading, scroll-triggered animations, and infinite scroll pagination. No scroll event listeners — only observers.

## Why IntersectionObserver?

```
❌ Old way: scroll event listener
  window.addEventListener('scroll', () => {
    images.forEach(img => {
      const rect = img.getBoundingClientRect(); // Forces layout!
      if (rect.top < window.innerHeight) loadImage(img);
    });
  }); // Fires hundreds of times per second, causes layout thrash

✅ IntersectionObserver:
  observer.observe(img); // Browser handles it natively
  // Zero scroll listeners, zero layout thrash, ~10x more efficient
```

## API Reference

```javascript
import { LazyImageLoader, InfiniteScroll, animateOnScroll } from './lazy-load.js';

// ── Lazy Images ──────────────────────────────────────────────────────────────
const loader = new LazyImageLoader({
  rootMargin: '200px',  // Start loading 200px before visible
  threshold: 0,
});

// Auto-observe all [data-src] images in document:
loader.observeAll();

// Or observe specific images:
loader.observe(document.querySelector('img.hero'));

console.log(loader.count); // How many images have been loaded
loader.disconnect();       // Stop all observations


// ── Infinite Scroll ──────────────────────────────────────────────────────────
const scroll = new InfiniteScroll(
  document.querySelector('.feed'),   // Container to append into
  async (page) => {
    const items = await fetchPage(page);
    items.forEach(item => container.append(render(item)));
    return items.length > 0; // Return false to stop observing
  },
  { rootMargin: '100px' }
);

scroll.disconnect(); // Stop when done


// ── Scroll Animations ────────────────────────────────────────────────────────
animateOnScroll('.card', 'slide-in', {
  threshold: 0.2,       // Fire when 20% of element is visible
  rootMargin: '-50px',  // Shrink viewport by 50px each side
  once: true,           // Don't un-animate when scrolled away
});
```

## Files

```
intersection-observer-lazy-load/
├── README.md              (this file)
├── lazy-load.js           (your LazyImageLoader, InfiniteScroll, animateOnScroll)
├── lazy-load.test.js      (tests)
└── demo.html              (interactive demo with all three features)
```

## Tasks

### Task 1 — `LazyImageLoader` class (required)

**Behaviour:**
- Observe `<img data-src="...">` elements
- When image enters viewport (with `rootMargin` buffer), set `img.src = img.dataset.src`
- Add `loading` class while fetching, `loaded` class on success, `error` class on fail
- Remove `data-src` attribute after loading
- Unobserve image after it loads (load once)
- Track count of loaded images

**HTML convention:**
```html
<!-- Before load -->
<img data-src="/images/photo.jpg"
     data-srcset="/images/photo@2x.jpg 2x"
     src="/images/placeholder.svg"
     alt="Photo description"
     width="400" height="300">

<!-- After load (your code sets these) -->
<img src="/images/photo.jpg"
     srcset="/images/photo@2x.jpg 2x"
     class="loaded"
     alt="Photo description"
     width="400" height="300">
```

### Task 2 — `InfiniteScroll` class (required)

**Behaviour:**
- Create an invisible sentinel `<div>` at bottom of container
- Observe sentinel with `IntersectionObserver`
- When sentinel is visible, call `onLoadMore(page)` — await result
- `onLoadMore` returns `true` if more pages exist, `false` when done
- After `false`, call `disconnect()` — remove sentinel, stop observing
- Prevent double-loading with `#loading` flag (debounce)
- Increment page counter after each successful load

### Task 3 — `animateOnScroll` function (required)

**Behaviour:**
- Query all elements matching `selector`
- Observe each with the given `threshold` and `rootMargin`
- Add `animationClass` when element enters viewport
- If `once: false`, remove the class when element leaves viewport
- Return the observer (so it can be disconnected)

### Task 4 — CSS for animations (required in demo.html)

```css
/* Base state — invisible, shifted down */
.card {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

/* Animated state */
.card.slide-in {
  opacity: 1;
  transform: translateY(0);
}
```

## Acceptance Criteria

- [ ] Images only load when within `rootMargin` of viewport
- [ ] Loading indicator shown while image fetches
- [ ] `img.loaded` class applied after successful load
- [ ] `data-src` removed after loading (cleanup)
- [ ] `observeAll()` observes all `[data-src]` images in document
- [ ] Infinite scroll loads next page when sentinel is visible
- [ ] No double-loading when scrolling fast
- [ ] Infinite scroll stops after `onLoadMore` returns `false`
- [ ] Animations trigger at correct scroll position
- [ ] All tests pass: `npm test lazy-load.test.js`

## Performance Notes

```javascript
// ✅ rootMargin: '200px' — preload slightly before visible
// Gives the browser time to fetch while user is still scrolling toward image
// Prevents the "blank image on fast scroll" experience

// ✅ threshold: 0 — fire as soon as ANY pixel is visible
// threshold: 0.5 — only fire when 50% is visible (useful for animations)

// ✅ Unobserve after loading — don't keep observing loaded images
imageObserver.unobserve(img); // Critical!

// ✅ Loading flag for infinite scroll — prevents simultaneous page loads
if (this.#loading) return; // Guard
this.#loading = true;
try { ... } finally { this.#loading = false; }
```

## Bonus Challenges

**B1 — `root` option:** Support scrolling inside a container (not just the window)
```javascript
new LazyImageLoader({ root: document.querySelector('.scrollable-container') });
```

**B2 — Priority loading:** Load images closest to viewport first
```javascript
loader.observeAll({ prioritize: true }); // Sort by distance from viewport
```

**B3 — LQIP (Low Quality Image Placeholder)**
```html
<img data-src="/photo-full.jpg"
     src="/photo-lqip.jpg"    ← tiny blurred placeholder shown immediately
     class="lqip">
```
Load full image on intersection, crossfade from LQIP.

**B4 — Native lazy loading fallback**
```javascript
// Use browser-native loading="lazy" if IntersectionObserver isn't supported
if (!('IntersectionObserver' in window)) {
  images.forEach(img => {
    img.src = img.dataset.src;
    img.loading = 'lazy';
  });
}
```

## Running the Demo

```bash
npx serve .
# Open http://localhost:3000/demo.html
# Scroll slowly and watch Network tab — images load just before visible
```

## Time Estimate: 2–3 hours
