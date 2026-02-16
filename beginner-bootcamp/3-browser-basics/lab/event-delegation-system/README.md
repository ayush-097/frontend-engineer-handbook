# Lab: Event Delegation System

Build a reusable, jQuery-inspired event delegation library that handles dynamic content and multiple event types with a single parent listener per event.

## Learning Goals

- Understand why delegation outperforms per-element listeners (memory + dynamic content)
- Master `event.target`, `closest()`, and `currentTarget`
- Build a composable API used throughout the module's demos

## Core Concept

Instead of 100 listeners for 100 buttons, **one** listener on the parent handles all of them — including buttons added later.

```
Without delegation (❌):
  button#1 → listener
  button#2 → listener   ← N listeners, N memory allocations
  button#3 → listener   ← Dynamic items get no listener!

With delegation (✅):
  ul → ONE listener → checks event.target on each click
       All N buttons handled, past and future
```

## API Reference

```javascript
import { EventHub } from './event-delegation.js';

const hub = new EventHub(document.querySelector('.container'));

// Delegated listener — fires when click target matches '.btn'
const off = hub.on('click', '.btn', (event, matchedEl) => {
  console.log('Clicked:', matchedEl.dataset.action);
});

// One-time listener
hub.once('click', '.delete-btn', (event, el) => {
  el.closest('li').remove();
});

// Remove a specific listener
hub.off('click', '.btn', handler);

// Remove all listeners for an event type
hub.offAll('click');

// Emit custom event on an element
hub.emit('cart:add', productEl, { productId: 42, qty: 1 });

off(); // Also works — returns unsubscribe function
```

## Files

```
event-delegation-system/
├── README.md              (this file)
├── event-delegation.js    (your EventHub implementation)
├── event-delegation.test.js (tests — all must pass)
└── demo.html              (interactive todo demo)
```

## Tasks

### Task 1 — Core `on()` method (required)

The `on(eventType, selector, handler)` method must:

- [ ] Attach at most **one** native listener per `eventType` on the root
- [ ] Match `event.target.closest(selector)` against the selector
- [ ] Guard with `root.contains(target)` to prevent false matches
- [ ] Call `handler(event, matchedElement)` with `this` = matched element
- [ ] Return an unsubscribe function that deactivates the entry

### Task 2 — `once()` method (required)

- [ ] Auto-removes after first invocation
- [ ] Returns unsubscribe function

### Task 3 — `off()` and `offAll()` (required)

- [ ] `off(type, selector, handler)` deactivates specific entry
- [ ] `offAll(type)` deactivates all entries for that event type

### Task 4 — `emit()` helper (required)

- [ ] Dispatches a `CustomEvent` with `bubbles: true` and the given detail

### Task 5 — Dynamic content (required, tested in demo)

- [ ] Add new items to the list — delegation must handle them **without re-registering**

## Acceptance Criteria

```bash
npm test event-delegation.test.js
# All tests pass ✓
```

- [ ] Single native listener per event type on root (check with `getEventListeners` in DevTools)
- [ ] Handlers fire for dynamically added elements
- [ ] `once` fires exactly once
- [ ] Removing a listener stops it from firing
- [ ] `event` and `matchedElement` both passed correctly to handler
- [ ] No memory leaks — inactive entries are cleaned up periodically

## Bonus

**B1 — Namespace support**
```javascript
hub.on('click.modal', '.open-btn', openModal);
hub.on('click.modal', '.close-btn', closeModal);
hub.offNamespace('click.modal'); // Remove all .modal handlers
```

**B2 — `trigger()` with selector**
```javascript
// Fire all matching delegated handlers for an event type
hub.trigger('click', document.querySelector('.btn'));
```

**B3 — Priority ordering**
```javascript
hub.on('click', '.btn', handler, { priority: 10 }); // Higher fires first
```

## Running the Demo

```bash
# No build step needed — native ES modules
npx serve .
# Open http://localhost:3000/demo.html
```

## Time Estimate: 2–3 hours
