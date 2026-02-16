# Events & Delegation

## The Browser Event Model

Events are notifications that something happened — a click, keypress, network response, timer firing. The browser's event system has three phases for each event dispatch.

```
Event Phases (click on an <a> inside a <li> inside a <ul>):

1. CAPTURING (top → target):
   document → html → body → ul → li → a

2. AT TARGET:
   a (target element)

3. BUBBLING (target → top):
   a → li → ul → body → html → document
```

Most events bubble. A few do not: `focus`, `blur`, `load`, `unload`, `scroll` (on elements), `mouseenter`, `mouseleave`.

## addEventListener

```javascript
element.addEventListener(type, listener, options);

// Basic usage
button.addEventListener('click', function(event) {
  console.log('Clicked!', event);
});

// Options object
button.addEventListener('click', handler, {
  capture: false,   // Run in bubbling phase (default)
  once: true,       // Auto-remove after first fire
  passive: true,    // Won't call preventDefault() — performance hint for scroll
});

// Capture phase (runs before bubbling listeners)
document.addEventListener('click', handler, { capture: true });
// or shorthand:
document.addEventListener('click', handler, true);
```

## The Event Object

```javascript
document.addEventListener('click', (event) => {
  // Target and current
  event.target;          // Element that was actually clicked
  event.currentTarget;   // Element the listener is attached to
  event.type;            // 'click'

  // Stop propagation
  event.stopPropagation();          // Stop bubbling/capturing
  event.stopImmediatePropagation(); // Also stop other listeners on THIS element

  // Prevent default browser action
  event.preventDefault(); // Stop link navigation, form submit, etc.

  // Mouse events
  event.clientX; event.clientY;  // Position relative to viewport
  event.pageX;   event.pageY;    // Position relative to document
  event.offsetX; event.offsetY;  // Position relative to target element
  event.button;                  // 0=left, 1=middle, 2=right
  event.buttons;                 // Bitmask of held buttons

  // Keyboard events
  event.key;          // 'Enter', 'ArrowUp', 'a', 'A'
  event.code;         // 'KeyA', 'Enter', 'ArrowUp' (physical key)
  event.ctrlKey;      // true if Ctrl held
  event.shiftKey;
  event.altKey;
  event.metaKey;      // Cmd on Mac, Win on Windows

  // Touch events
  event.touches;          // All active touch points
  event.targetTouches;    // Touches on this element
  event.changedTouches;   // Changed touches in this event
});
```

## Event Bubbling in Depth

```javascript
// HTML: <div.outer> <div.inner> <button> </div> </div>

document.querySelector('.outer').addEventListener('click', () => {
  console.log('outer');
});

document.querySelector('.inner').addEventListener('click', () => {
  console.log('inner');
});

document.querySelector('button').addEventListener('click', () => {
  console.log('button');
});

// Click the button → Output:
// button  ← target fires first
// inner   ← bubbles up
// outer   ← bubbles up further

// Capture phase (fires in reverse — top-down):
document.querySelector('.outer').addEventListener('click', () => {
  console.log('outer capture');
}, { capture: true });

// Click the button → Output with capture:
// outer capture  ← capture fires first (top-down)
// button
// inner
// outer
```

## removeEventListener

For `removeEventListener` to work, you need the **exact same function reference**:

```javascript
// ❌ Won't work — different function references
element.addEventListener('click', () => doThing());
element.removeEventListener('click', () => doThing()); // Different anonymous fn!

// ✅ Named function reference
function handleClick() { doThing(); }
element.addEventListener('click', handleClick);
element.removeEventListener('click', handleClick); // Same reference ✅

// ✅ Once option — auto-removes
element.addEventListener('click', handleClick, { once: true });

// ✅ AbortController — remove multiple listeners at once
const controller = new AbortController();
const { signal } = controller;

element.addEventListener('click', handler1, { signal });
element.addEventListener('mouseover', handler2, { signal });
document.addEventListener('keydown', handler3, { signal });

// Remove ALL of them at once:
controller.abort(); // All three removed!
```

## Event Delegation

Instead of attaching a listener to each item, attach ONE listener to a parent and use `event.target` to determine what was clicked.

### The problem delegation solves

```javascript
// ❌ Bad — 1000 event listeners for 1000 list items
document.querySelectorAll('.list li').forEach(li => {
  li.addEventListener('click', handleItemClick);
});
// Problems:
// - Memory: 1000 listeners
// - Dynamic: new items added later have no listener!

// ✅ Good — 1 listener handles everything, including future items
document.querySelector('.list').addEventListener('click', (event) => {
  const li = event.target.closest('li'); // Works even if clicked on child
  if (!li) return; // Clicked outside any li

  handleItemClick(li);
});
```

### `event.target` vs `event.currentTarget`

```javascript
// HTML: <ul> <li> <span>Text</span> </li> </ul>

document.querySelector('ul').addEventListener('click', (event) => {
  event.target;        // The actual clicked element (could be <span>!)
  event.currentTarget; // Always the <ul> (where listener is attached)

  // Problem: clicking the span gives us the span, not the li
  // Solution: closest()
  const li = event.target.closest('li');
  if (!li || !event.currentTarget.contains(li)) return;
  // ↑ Safety check: ensure the li is actually inside our list
});
```

### Robust delegation pattern

```javascript
function delegate(parent, selector, eventType, handler) {
  parent.addEventListener(eventType, (event) => {
    // Walk up from target to find matching ancestor
    const target = event.target.closest(selector);

    // Make sure the match is actually inside our parent
    if (!target || !parent.contains(target)) return;

    // Call handler with correct `this` and matching element
    handler.call(target, event, target);
  });
}

// Usage
const list = document.querySelector('.list');

delegate(list, 'li', 'click', function(event, li) {
  console.log('Clicked item:', li.dataset.id);
  li.classList.toggle('selected');
});

delegate(list, '.delete-btn', 'click', function(event, btn) {
  event.stopPropagation(); // Don't trigger li click handler
  btn.closest('li').remove();
});
```

## Common Event Types

### Mouse Events

```javascript
element.addEventListener('click', handler);        // Left click (after mouseup)
element.addEventListener('dblclick', handler);     // Double click
element.addEventListener('mousedown', handler);    // Mouse button pressed
element.addEventListener('mouseup', handler);      // Mouse button released
element.addEventListener('mousemove', handler);    // Mouse moved over element
element.addEventListener('mouseenter', handler);   // Mouse enters (no bubble)
element.addEventListener('mouseleave', handler);   // Mouse leaves (no bubble)
element.addEventListener('mouseover', handler);    // Mouse over (bubbles)
element.addEventListener('mouseout', handler);     // Mouse out (bubbles)
element.addEventListener('contextmenu', handler);  // Right click

// Drag events
element.addEventListener('dragstart', handler);
element.addEventListener('drag', handler);
element.addEventListener('dragend', handler);
element.addEventListener('dragover', handler);
element.addEventListener('drop', handler);
```

### Keyboard Events

```javascript
// Best practices: keydown for everything (keypress deprecated)
document.addEventListener('keydown', (event) => {
  // Specific key combinations
  if (event.key === 'Escape') closeModal();
  if (event.key === 'Enter' && event.ctrlKey) submitForm();
  if (event.key === '/' && !isInputFocused()) openSearch();

  // Arrow keys for navigation
  if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault(); // Prevent page scroll
    navigateList(event.key);
  }
});

document.addEventListener('keyup', handler);   // Key released

// ❌ keypress is deprecated — use keydown
document.addEventListener('keypress', handler); // Don't use
```

### Form Events

```javascript
const form = document.querySelector('form');

form.addEventListener('submit', (event) => {
  event.preventDefault(); // Stop page reload!
  const data = new FormData(form);
  console.log(Object.fromEntries(data));
});

form.addEventListener('input', (event) => {
  // Fires on every keystroke in any input
  console.log(event.target.name, event.target.value);
});

form.addEventListener('change', (event) => {
  // Fires when value COMMITTED (on blur or select change)
});

form.addEventListener('reset', handler);

// Individual input events
const input = document.querySelector('input');
input.addEventListener('focus', () => input.classList.add('focused'));
input.addEventListener('blur', () => input.classList.remove('focused'));
input.addEventListener('input', validate);
```

### Window & Document Events

```javascript
// DOMContentLoaded — HTML parsed, DOM ready (no images/stylesheets needed)
document.addEventListener('DOMContentLoaded', () => {
  init(); // Best place to initialize app
});

// load — everything loaded including images, stylesheets, fonts
window.addEventListener('load', () => {
  hideLoadingScreen();
});

// Scroll
window.addEventListener('scroll', (event) => {
  const y = window.scrollY;
  header.classList.toggle('sticky', y > 60);
});

// Resize
window.addEventListener('resize', () => {
  updateLayout(window.innerWidth, window.innerHeight);
});

// Visibility — tab switching
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseVideo();
  } else {
    resumeVideo();
  }
});

// Before unload — unsaved changes warning
window.addEventListener('beforeunload', (event) => {
  if (hasUnsavedChanges) {
    event.preventDefault();
    event.returnValue = ''; // Required for Chrome
  }
});
```

## Custom Events

Create and dispatch your own events for component communication.

```javascript
// Dispatch custom event
const event = new CustomEvent('userLoggedIn', {
  bubbles: true,       // Can bubble up the DOM
  cancelable: true,    // Can be prevented
  detail: {            // Custom data payload
    user: { id: 1, name: 'Alice', role: 'admin' },
    timestamp: Date.now(),
  }
});

document.dispatchEvent(event);

// Listen anywhere in the app
document.addEventListener('userLoggedIn', (event) => {
  const { user } = event.detail;
  updateNavbar(user);
  loadDashboard(user.role);
});

// Component-to-component communication
class SearchInput extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input');
    this.input.addEventListener('input', this.#handleInput.bind(this));
  }

  #handleInput(event) {
    this.dispatchEvent(new CustomEvent('search', {
      bubbles: true,
      detail: { query: event.target.value }
    }));
  }
}

// Parent listens:
document.querySelector('.search-wrapper').addEventListener('search', (e) => {
  filterResults(e.detail.query);
});
```

## Passive Event Listeners

Telling the browser a listener won't call `preventDefault()` allows performance optimizations for scroll and touch:

```javascript
// ✅ Passive — browser can scroll immediately without waiting for handler
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('touchstart', onTouch, { passive: true });

// ❌ Non-passive — browser must wait for handler to check preventDefault
window.addEventListener('scroll', onScroll); // Blocks scrolling!

// Only make it non-passive if you ACTUALLY need preventDefault
window.addEventListener('touchmove', (e) => {
  e.preventDefault(); // Disable pull-to-refresh (needs non-passive)
}, { passive: false });
```

## Event Throttling & Debouncing

High-frequency events (scroll, resize, mousemove) need rate-limiting:

```javascript
// Throttle — fire at most once per interval (good for scroll position tracking)
function throttle(fn, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

window.addEventListener('scroll', throttle(() => {
  updateScrollIndicator(window.scrollY);
}, 16)); // ~60fps

// Debounce — fire only after idle period (good for resize, search input)
function debounce(fn, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

window.addEventListener('resize', debounce(() => {
  recalculateLayout();
}, 250));
```

## Pointer Events — Unified Mouse + Touch + Stylus

```javascript
// Replaces both mouse events AND touch events
element.addEventListener('pointerdown', handler);   // Press start
element.addEventListener('pointermove', handler);   // Move
element.addEventListener('pointerup', handler);     // Press end
element.addEventListener('pointercancel', handler); // Cancelled
element.addEventListener('pointerenter', handler);  // Enter element
element.addEventListener('pointerleave', handler);  // Leave element

// Pointer capture — keep receiving events even if pointer moves outside
element.addEventListener('pointerdown', (event) => {
  element.setPointerCapture(event.pointerId);
  // Now mousemove/pointerup fire on element even if pointer leaves!
});

// Check pointer type
element.addEventListener('pointerdown', (event) => {
  event.pointerType; // 'mouse', 'touch', 'pen'
  event.pressure;    // 0.0-1.0 (stylus pressure)
  event.width;       // Contact geometry (touch)
  event.height;
});
```

## Practice Exercises

### Exercise 1: Event delegation system

```javascript
// Implement a jQuery-like on() with delegation:
function on(root, eventType, selector, handler) {
  // TODO: Add delegated listener to root
  // Only call handler when event.target matches selector
  // Pass matched element as 'this'
}

on(document.body, 'click', '.btn', function() {
  console.log('Clicked button:', this);
});
```

### Exercise 2: Keyboard shortcut system

```javascript
// Build a shortcut registry that supports:
// - Single keys: 'Escape', 'Enter'
// - Combinations: 'ctrl+s', 'cmd+k', 'ctrl+shift+z'
// - Sequences: 'g g' (vim-style, two 'g' presses)
const shortcuts = new ShortcutManager();
shortcuts.register('ctrl+s', saveDocument);
shortcuts.register('ctrl+k', openCommandPalette);
shortcuts.register('Escape', closeModal);
```

## Key Takeaways

- Events flow: capture (top→target) → at target → bubble (target→top)
- `event.target` = clicked element; `event.currentTarget` = listener's element
- **Delegation** = one listener on parent; use `closest()` to find target
- Always remove listeners when components unmount — use `AbortController` for groups
- Passive listeners enable scroll performance optimization
- Throttle scroll/mousemove; debounce resize/input
- Custom events enable decoupled component communication
- Use Pointer Events for unified mouse/touch/pen handling

---

**Next:** [Lecture 3: Browser Rendering →](3-browser-rendering.md)
