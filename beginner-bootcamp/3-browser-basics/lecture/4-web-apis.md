# Web APIs

## The Fetch API

Fetch is the modern way to make HTTP requests — Promise-based, cancellable, and streaming-capable.

```javascript
// Basic GET
const response = await fetch('/api/users/1');
const user = await response.json();

// POST with JSON body
const newUser = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
}).then(r => r.json());
```

### The Response object

```javascript
const response = await fetch('/api/data');

// Status checking
response.ok;         // true if status 200-299
response.status;     // 200, 404, 500, etc.
response.statusText; // "OK", "Not Found"
response.url;        // Final URL (after redirects)
response.redirected; // true if redirected

// ⚠️ fetch() only rejects on NETWORK errors — not HTTP errors!
// A 404 or 500 still "succeeds" from fetch's perspective
if (!response.ok) {
  throw new Error(`HTTP error: ${response.status}`);
}

// Reading the body — can only be read ONCE
await response.json();       // Parse as JSON
await response.text();       // Plain text
await response.blob();       // Binary data (images, files)
await response.arrayBuffer();// Raw binary
await response.formData();   // FormData object

// Check before reading:
response.bodyUsed; // true after body has been consumed
```

### Cancelling requests

```javascript
const controller = new AbortController();

const fetchUser = fetch('/api/users/1', {
  signal: controller.signal
});

// Cancel after 5 seconds
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetchUser;
  clearTimeout(timeout);
  return await response.json();
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Request cancelled');
  } else {
    throw err;
  }
}
```

### Streaming responses

```javascript
// Stream a large response (e.g., ChatGPT-style output)
const response = await fetch('/api/stream');
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  appendToUI(chunk); // Show each chunk as it arrives!
}
```

### Upload with progress

```javascript
// XMLHttpRequest still needed for upload progress
function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded / event.total);
      }
    });

    xhr.addEventListener('load', () => resolve(xhr.response));
    xhr.addEventListener('error', reject);

    xhr.open('POST', '/api/upload');
    xhr.responseType = 'json';
    xhr.send(form);
  });
}

// Usage
await uploadFile(file, (progress) => {
  progressBar.style.width = `${progress * 100}%`;
});
```

## Storage APIs

### localStorage & sessionStorage

```javascript
// localStorage — persists until explicitly cleared
localStorage.setItem('theme', 'dark');
localStorage.getItem('theme');    // 'dark'
localStorage.removeItem('theme');
localStorage.clear();             // Remove everything
localStorage.length;              // Number of items

// sessionStorage — cleared when tab closes
sessionStorage.setItem('draft', 'Work in progress...');

// Only stores STRINGS — must serialize objects
const user = { id: 1, name: 'Alice' };
localStorage.setItem('user', JSON.stringify(user));
const restored = JSON.parse(localStorage.getItem('user'));

// Safe helper
function storageGet(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    // QuotaExceededError if storage is full
    console.error('Storage error:', err);
    return false;
  }
}

// Listen to storage changes (fires in OTHER tabs!)
window.addEventListener('storage', (event) => {
  event.key;       // Changed key
  event.newValue;  // New value (null if removed)
  event.oldValue;  // Previous value
  event.url;       // URL of the tab that made the change
  // Sync state across tabs!
  if (event.key === 'theme') {
    applyTheme(JSON.parse(event.newValue));
  }
});
```

### IndexedDB — Large Structured Data

For storing large amounts of structured data, binary data, or anything that needs querying.

```javascript
// Open database
const dbPromise = new Promise((resolve, reject) => {
  const request = indexedDB.open('myApp', 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Create object store (like a table)
    const store = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
    store.createIndex('email', 'email', { unique: true });
    store.createIndex('name', 'name', { unique: false });
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

// Add a record
async function addUser(user) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    const request = store.add(user);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Modern: use idb library for cleaner Promise API
import { openDB } from 'idb';

const db = await openDB('myApp', 1, {
  upgrade(db) {
    const store = db.createObjectStore('users', { keyPath: 'id' });
    store.createIndex('email', 'email');
  }
});

await db.add('users', { id: 1, name: 'Alice', email: 'a@example.com' });
const user = await db.get('users', 1);
const allUsers = await db.getAll('users');
await db.delete('users', 1);
```

### Cache API (Service Workers)

```javascript
// In a service worker:
const CACHE = 'app-v1';

// Cache resources
const cache = await caches.open(CACHE);
await cache.addAll(['/index.html', '/app.js', '/styles.css', '/logo.svg']);

// Retrieve from cache
const cached = await caches.match('/app.js');
if (cached) return cached;

// Cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
```

## History API — Client-Side Routing

```javascript
// pushState — navigate without page reload
history.pushState(
  { userId: 42 },    // State object (accessible via history.state)
  '',                // Title (ignored by most browsers)
  '/users/42'        // New URL (must be same origin)
);

// replaceState — replace current entry (back button won't go here)
history.replaceState({ filter: 'active' }, '', '/todos?filter=active');

// Navigation
history.back();    // = history.go(-1)
history.forward(); // = history.go(1)
history.go(-2);    // Two pages back

// Current state
history.state;     // { userId: 42 }
history.length;    // Number of entries

// Listen for back/forward navigation
window.addEventListener('popstate', (event) => {
  const state = event.state; // State from pushState
  renderPage(window.location.pathname, state);
});

// Simple SPA router
function navigate(path, state = {}) {
  history.pushState(state, '', path);
  renderPage(path, state);
}

function renderPage(path, state) {
  const routes = {
    '/': () => render(HomePage),
    '/users': () => render(UsersPage),
    '/users/:id': (params) => render(UserPage, params),
  };

  // Match route and render
  matchRoute(path, routes);
}

// Intercept link clicks for SPA navigation
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  const url = new URL(link.href);
  if (url.origin !== location.origin) return; // External link — let browser handle

  event.preventDefault();
  navigate(url.pathname + url.search);
});
```

## URL API

```javascript
const url = new URL('https://example.com/users?page=2&sort=name#results');

url.href;       // 'https://example.com/users?page=2&sort=name#results'
url.protocol;   // 'https:'
url.hostname;   // 'example.com'
url.port;       // '' (empty for default 80/443)
url.pathname;   // '/users'
url.search;     // '?page=2&sort=name'
url.hash;       // '#results'
url.origin;     // 'https://example.com'

// URLSearchParams — query string manipulation
const params = url.searchParams;
params.get('page');      // '2'
params.get('sort');      // 'name'
params.has('page');      // true
params.set('page', '3');
params.append('filter', 'active');
params.delete('sort');
params.toString();       // 'page=3&filter=active'

// Build URL from params
const search = new URLSearchParams({ page: 2, limit: 10, sort: 'name' });
fetch(`/api/users?${search}`); // /api/users?page=2&limit=10&sort=name
```

## Intersection Observer

Efficiently detect when elements enter/leave the viewport — no scroll event needed!

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.isIntersecting;      // true if element is visible
    entry.intersectionRatio;   // 0.0 to 1.0 — how much is visible
    entry.boundingClientRect;  // Element position
    entry.intersectionRect;    // The visible portion
    entry.target;              // The observed element

    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  root: null,           // null = viewport; or a scrollable element
  rootMargin: '0px',    // Expand/contract root bounds ('100px 0px' = 100px before)
  threshold: [0, 0.5, 1] // Fire at 0%, 50%, and 100% visible
});

// Observe elements
document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});

// Unobserve when done
observer.unobserve(element);
observer.disconnect(); // Stop all observations

// Lazy loading images
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imageObserver.unobserve(img);
    }
  });
}, { rootMargin: '200px' }); // Start loading 200px before visible

lazyImages.forEach(img => imageObserver.observe(img));

// Infinite scroll
const sentinel = document.querySelector('.load-more-sentinel');
const scrollObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadNextPage();
  }
});
scrollObserver.observe(sentinel);
```

## ResizeObserver

React to element size changes — more flexible than window resize events.

```javascript
const observer = new ResizeObserver((entries) => {
  entries.forEach(entry => {
    const { width, height } = entry.contentRect;
    console.log(`Element resized: ${width}x${height}`);

    // Update layout based on element size (not window size)
    if (width < 400) {
      entry.target.classList.add('compact');
    } else {
      entry.target.classList.remove('compact');
    }
  });
});

observer.observe(document.querySelector('.sidebar'));

// Responsive chart
const chart = document.querySelector('.chart');
const resizeObserver = new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  redrawChart(chart, width, height); // Redraw when container resizes
});
resizeObserver.observe(chart);
```

## Web Workers — Parallel JavaScript

Run heavy computation off the main thread to keep UI responsive.

```javascript
// main.js
const worker = new Worker('/workers/sort-worker.js');

// Send data to worker
worker.postMessage({ array: hugeArray, algorithm: 'quicksort' });

// Receive results
worker.addEventListener('message', (event) => {
  const { sorted } = event.data;
  renderList(sorted);
});

worker.addEventListener('error', (error) => {
  console.error('Worker error:', error);
});

// Terminate when done
worker.terminate();

// ---
// sort-worker.js (runs in separate thread, no DOM access!)
self.addEventListener('message', (event) => {
  const { array, algorithm } = event.data;
  const sorted = sort(array, algorithm); // Expensive operation, won't block UI

  self.postMessage({ sorted });
});
```

## Clipboard API

```javascript
// Modern — requires user gesture
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  } catch (err) {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

// Read from clipboard (requires permission)
const text = await navigator.clipboard.readText();

// Rich content
const items = await navigator.clipboard.read();
for (const item of items) {
  if (item.types.includes('image/png')) {
    const blob = await item.getType('image/png');
    const url = URL.createObjectURL(blob);
    imageEl.src = url;
  }
}
```

## Geolocation API

```javascript
// One-time position
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    console.log(`${latitude}, ${longitude} ± ${accuracy}m`);
  },
  (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED: console.log('User denied location'); break;
      case error.POSITION_UNAVAILABLE: console.log('Location unavailable'); break;
      case error.TIMEOUT: console.log('Location request timed out'); break;
    }
  },
  {
    enableHighAccuracy: true, // GPS (slower, drains battery)
    timeout: 5000,
    maximumAge: 60000, // Accept cached position up to 1 min old
  }
);

// Watch position (for tracking)
const watchId = navigator.geolocation.watchPosition(onPosition, onError);
navigator.geolocation.clearWatch(watchId); // Stop watching
```

## Notifications API

```javascript
// Request permission
const permission = await Notification.requestPermission();
// 'granted', 'denied', or 'default'

if (permission === 'granted') {
  // Show notification
  const notification = new Notification('New Message', {
    body: 'Alice sent you a message',
    icon: '/icon-192.png',
    badge: '/badge.png',
    image: '/preview.jpg',
    tag: 'message', // Replace previous notification with same tag
    requireInteraction: true, // Don't auto-dismiss
    data: { messageId: 42 }, // Custom data
  });

  notification.addEventListener('click', () => {
    window.focus();
    navigate(`/messages/${notification.data.messageId}`);
    notification.close();
  });
}
```

## Broadcast Channel — Cross-Tab Communication

```javascript
// Communicate between tabs of the same origin
const channel = new BroadcastChannel('app-updates');

// Tab 1: Send
channel.postMessage({ type: 'theme-changed', theme: 'dark' });

// Tab 2: Receive
channel.addEventListener('message', (event) => {
  const { type, theme } = event.data;
  if (type === 'theme-changed') {
    applyTheme(theme);
  }
});

// Close channel when done
channel.close();
```

## Practice Exercises

### Exercise 1: Fetch wrapper with retries

```javascript
// Build fetchWithRetry(url, options, retries = 3) that:
// - Retries on network errors
// - Retries on 5xx responses
// - Does NOT retry on 4xx errors
// - Uses exponential backoff (100ms, 200ms, 400ms)
// - Respects AbortSignal from options
async function fetchWithRetry(url, options = {}, retries = 3) {
  // TODO
}
```

### Exercise 2: Storage manager

```javascript
// Build a storage abstraction that:
// - Falls back from indexedDB to localStorage to memory
// - Handles quota errors gracefully
// - Supports expiry timestamps
// - Emits events when data changes
class StorageManager {
  async get(key) { /* TODO */ }
  async set(key, value, ttl) { /* TODO */ }
  async delete(key) { /* TODO */ }
}
```

## Key Takeaways

- Fetch only rejects on network failure — always check `response.ok` for HTTP errors
- Use `AbortController` to cancel fetch requests (timeouts, navigation)
- `localStorage` for small preferences; `IndexedDB` for large/structured data
- History API + `popstate` event = client-side routing without page reloads
- `IntersectionObserver` = efficient lazy loading and infinite scroll (no scroll listeners!)
- `ResizeObserver` = element-level responsive design (better than window resize)
- Web Workers = move heavy computation off the main thread
- `BroadcastChannel` = sync state across browser tabs

---

**Next:** [Lecture 5: Developer Tools →](5-developer-tools.md)
