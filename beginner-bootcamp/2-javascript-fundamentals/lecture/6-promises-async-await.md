# Promises & Async/Await

## What is a Promise?

A **Promise** is an object representing the eventual completion (or failure) of an asynchronous operation. It's a placeholder for a value that doesn't exist yet.

Think of it like ordering food at a restaurant: you get a **receipt** (the promise) immediately. Later, your food either **arrives** (resolves) or the kitchen says they're **out of it** (rejects).

```javascript
// A Promise exists in one of three states:
const promise = new Promise((resolve, reject) => {
  // State 1: PENDING — initial state, neither resolved nor rejected

  setTimeout(() => {
    const success = true;

    if (success) {
      resolve('Data loaded!'); // State 2: FULFILLED
    } else {
      reject(new Error('Failed!')); // State 3: REJECTED
    }
  }, 1000);
});

// State transitions are irreversible — once fulfilled/rejected, stays that way
```

## Creating Promises

```javascript
// Basic Promise constructor
const fetchUser = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) {
        reject(new Error(`Invalid ID: ${id}`));
        return;
      }
      resolve({ id, name: `User ${id}`, email: `user${id}@example.com` });
    }, 500);
  });
};

// Promise.resolve — create an already-resolved promise
const immediate = Promise.resolve(42);
const fromValue = Promise.resolve({ name: 'Alice' });

// Promise.reject — create an already-rejected promise
const failed = Promise.reject(new Error('Something went wrong'));
```

## Consuming Promises — `.then()`, `.catch()`, `.finally()`

### `.then(onFulfilled, onRejected)`

```javascript
fetchUser(1)
  .then(
    (user) => console.log('Success:', user),  // onFulfilled
    (err)  => console.error('Error:', err)    // onRejected (optional)
  );
```

### `.catch(onRejected)` — preferred for errors

```javascript
fetchUser(1)
  .then((user) => console.log('User:', user))
  .catch((err) => console.error('Error:', err));
// .catch is shorthand for .then(undefined, onRejected)
```

### `.finally(onFinally)` — always runs

```javascript
fetchUser(1)
  .then((user) => displayUser(user))
  .catch((err) => showError(err))
  .finally(() => hideLoadingSpinner()); // Runs whether success or failure
```

## Promise Chaining

The most powerful feature: `.then()` returns a **new Promise**, enabling chains.

```javascript
fetchUser(1)
  .then((user) => {
    console.log('Got user:', user.name);
    return fetchPosts(user.id); // Return a new promise
  })
  .then((posts) => {
    console.log('Got posts:', posts.length);
    return fetchComments(posts[0].id); // Chain continues
  })
  .then((comments) => {
    console.log('Got comments:', comments.length);
  })
  .catch((err) => {
    // ONE catch handles errors from ANY step above!
    console.error('Something failed:', err);
  });
```

**Compared to callback hell:**
```javascript
// Callbacks (pyramid of doom ❌)
fetchUser(1, (err, user) => {
  fetchPosts(user.id, (err, posts) => {
    fetchComments(posts[0].id, (err, comments) => {
      // deeper...
    });
  });
});

// Promises (flat chain ✅)
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => console.log(comments));
```

### Transforming values in chains

```javascript
Promise.resolve(1)
  .then(n => n + 1)       // 2
  .then(n => n * 10)      // 20
  .then(n => `Result: ${n}`) // "Result: 20"
  .then(console.log);

// Each .then can:
// - Return a plain value → wrapped in resolved promise
// - Return a promise → chain waits for it
// - Throw an error → next .catch fires
```

### Error recovery in chains

```javascript
fetchUser(-1) // Will reject
  .then((user) => processUser(user))
  .catch((err) => {
    console.warn('Using fallback due to:', err.message);
    return { id: 0, name: 'Guest' }; // ← Return value RECOVERS the chain
  })
  .then((user) => {
    console.log('Continuing with:', user.name); // "Guest"
  });
```

## Static Promise Methods

### `Promise.all` — All must succeed

```javascript
// Runs all promises in PARALLEL, resolves when ALL succeed
// Rejects immediately if ANY fails

const [user, posts, settings] = await Promise.all([
  fetchUser(1),
  fetchPosts(1),
  fetchSettings(1),
]);
// All three requests fire simultaneously!

// ❌ Fails if ANY rejects:
Promise.all([
  Promise.resolve(1),
  Promise.reject('error'), // This causes all to fail
  Promise.resolve(3),
]).catch(err => console.error(err)); // 'error'
```

### `Promise.allSettled` — Wait for all, regardless of outcome

```javascript
// Never rejects — always resolves with array of results
const results = await Promise.allSettled([
  fetchUser(1),
  fetchUser(-1),  // Will reject
  fetchUser(2),
]);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('Success:', result.value);
  } else {
    console.log('Failed:', result.reason);
  }
});
// Perfect for: sending bulk notifications, batch processing where partial failure is OK
```

### `Promise.race` — First to settle wins

```javascript
// Resolves/rejects with the FIRST promise to settle

// Timeout pattern:
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

withTimeout(fetchUser(1), 2000)
  .then(user => console.log(user))
  .catch(err => console.error(err)); // Fires if fetch takes > 2 seconds
```

### `Promise.any` — First to succeed wins

```javascript
// Resolves with the first FULFILLED promise
// Rejects only if ALL reject (AggregateError)

// Load from fastest mirror:
Promise.any([
  fetch('https://mirror1.example.com/data'),
  fetch('https://mirror2.example.com/data'),
  fetch('https://mirror3.example.com/data'),
])
  .then(response => response.json())
  .then(data => console.log('From fastest server:', data));
```

### Comparison table

| Method | Resolves when | Rejects when |
|--------|--------------|--------------|
| `Promise.all` | ALL fulfill | ANY rejects |
| `Promise.allSettled` | ALL settle (never rejects) | Never |
| `Promise.race` | FIRST settles (fulfill or reject) | FIRST rejects |
| `Promise.any` | FIRST fulfills | ALL reject |

## Async/Await

**Async/await** is syntactic sugar over Promises that makes async code look and behave like synchronous code.

### `async` functions

```javascript
// An async function ALWAYS returns a Promise
async function greet() {
  return 'Hello!'; // Automatically wrapped in Promise.resolve('Hello!')
}

greet().then(console.log); // "Hello!"

// Same as:
function greetPromise() {
  return Promise.resolve('Hello!');
}
```

### `await` — pause until promise settles

```javascript
// await can only be used INSIDE async functions
async function loadUserData(id) {
  // await pauses this function, not the whole program
  const user = await fetchUser(id);    // Wait for user
  const posts = await fetchPosts(id);  // Wait for posts (sequential)

  return { user, posts };
}

// Call it:
loadUserData(1).then(data => console.log(data));
```

### Error handling with `try/catch`

```javascript
async function loadUserData(id) {
  try {
    const user = await fetchUser(id);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (err) {
    // Catches rejections from ANY await above
    console.error('Failed:', err.message);
    return null;
  } finally {
    // Always runs
    hideSpinner();
  }
}
```

### Parallel vs Sequential

```javascript
// ❌ Sequential — slow! Each waits for the previous
async function loadSequential() {
  const user    = await fetchUser(1);   // Wait 500ms
  const posts   = await fetchPosts(1);  // Wait 500ms more
  const friends = await fetchFriends(1);// Wait 500ms more
  // Total: ~1500ms
  return { user, posts, friends };
}

// ✅ Parallel — fast! All fire simultaneously
async function loadParallel() {
  const [user, posts, friends] = await Promise.all([
    fetchUser(1),
    fetchPosts(1),
    fetchFriends(1),
  ]);
  // Total: ~500ms (duration of the slowest)
  return { user, posts, friends };
}

// ✅ Start all, await in order
async function loadParallelV2() {
  // Fire all immediately (no await yet)
  const userPromise    = fetchUser(1);
  const postsPromise   = fetchPosts(1);
  const friendsPromise = fetchFriends(1);

  // Now await in order
  const user    = await userPromise;
  const posts   = await postsPromise;
  const friends = await friendsPromise;

  return { user, posts, friends };
}
```

### Async/await in loops

```javascript
const userIds = [1, 2, 3, 4, 5];

// ❌ Sequential loop — each waits for previous (2500ms total)
async function loadAllSequential(ids) {
  const users = [];
  for (const id of ids) {
    const user = await fetchUser(id); // Waits each time
    users.push(user);
  }
  return users;
}

// ✅ Parallel — all at once (500ms total)
async function loadAllParallel(ids) {
  return Promise.all(ids.map(id => fetchUser(id)));
}

// ✅ Controlled concurrency — batch of 2 at a time
async function loadAllBatched(ids, batchSize = 2) {
  const results = [];
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(id => fetchUser(id)));
    results.push(...batchResults);
  }
  return results;
}
```

## Real-World Patterns

### API fetch wrapper

```javascript
async function apiRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  }
}

// Usage
const user = await apiRequest('/api/users/1');
const newUser = await apiRequest('/api/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'Alice' }),
});
```

### Retry with exponential backoff

```javascript
async function withRetry(fn, { retries = 3, delay = 1000, backoff = 2 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === retries) break; // Don't delay after last attempt

      const waitTime = delay * Math.pow(backoff, attempt);
      console.warn(`Attempt ${attempt + 1} failed. Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

// Usage
const data = await withRetry(
  () => fetch('/api/unreliable-endpoint').then(r => r.json()),
  { retries: 3, delay: 500 }
);
```

### Cache with promises

```javascript
class PromiseCache {
  #cache = new Map();

  async get(key, factory) {
    if (this.#cache.has(key)) {
      return this.#cache.get(key); // Returns same promise — deduplicates!
    }

    const promise = factory();
    this.#cache.set(key, promise);

    try {
      return await promise;
    } catch (err) {
      this.#cache.delete(key); // Remove failed requests
      throw err;
    }
  }

  invalidate(key) {
    this.#cache.delete(key);
  }
}

const cache = new PromiseCache();

// Multiple calls for same key → only ONE request fires!
const [user1, user2] = await Promise.all([
  cache.get('user:1', () => fetchUser(1)),
  cache.get('user:1', () => fetchUser(1)), // Uses cached promise
]);
```

### Async initialization pattern

```javascript
class DatabasePool {
  #pool = null;
  #initPromise = null;

  async #initialize() {
    // Runs only once
    this.#pool = await createConnectionPool({
      host: 'localhost',
      database: 'myapp',
      max: 10,
    });
    return this.#pool;
  }

  async getConnection() {
    // Lazy initialization — only connects when first needed
    // Multiple calls before init completes all get the same promise
    this.#initPromise ??= this.#initialize();
    await this.#initPromise;
    return this.#pool.acquire();
  }
}

const db = new DatabasePool();
// First call connects:
const conn1 = await db.getConnection();
// Subsequent calls reuse connection:
const conn2 = await db.getConnection();
```

## Common Mistakes

### Mistake 1: Forgetting to await

```javascript
// ❌ Missing await — user is a Promise, not the value!
async function bad() {
  const user = fetchUser(1); // No await!
  console.log(user.name);    // undefined (it's a Promise object)
}

// ✅ Always await async operations
async function good() {
  const user = await fetchUser(1);
  console.log(user.name); // 'User 1'
}
```

### Mistake 2: Unhandled promise rejections

```javascript
// ❌ No error handling — unhandled rejection!
async function bad() {
  const user = await fetchUser(-1); // Rejects, but no catch
}

bad(); // UnhandledPromiseRejection warning

// ✅ Always handle rejections
async function good() {
  try {
    const user = await fetchUser(-1);
  } catch (err) {
    console.error('Handled:', err);
  }
}
```

### Mistake 3: Sequential when parallel is possible

```javascript
// ❌ 2x slower than necessary
async function bad() {
  const posts = await fetchPosts();   // 500ms
  const users = await fetchUsers();   // 500ms more
  // Total: 1000ms (posts and users are INDEPENDENT)
}

// ✅ Run independent operations in parallel
async function good() {
  const [posts, users] = await Promise.all([fetchPosts(), fetchUsers()]);
  // Total: ~500ms
}
```

### Mistake 4: Promise constructor anti-pattern

```javascript
// ❌ Wrapping a promise in a promise (redundant)
function bad() {
  return new Promise((resolve, reject) => {
    fetchUser(1)
      .then(resolve)
      .catch(reject);
  });
}

// ✅ Just return the promise
function good() {
  return fetchUser(1);
}

// ✅ Or use async/await
async function alsoGood() {
  return fetchUser(1);
}
```

## Practice Exercises

### Exercise 1: Sequential to parallel

```javascript
// Convert this sequential code to run in parallel:
async function getUserDashboard(userId) {
  const user = await fetchUser(userId);
  const posts = await fetchPosts(userId);
  const friends = await fetchFriends(userId);
  const notifications = await fetchNotifications(userId);
  return { user, posts, friends, notifications };
}
```

### Exercise 2: Implement Promise.all from scratch

```javascript
function myPromiseAll(promises) {
  // TODO: Return a promise that:
  // - Resolves with array of all values when ALL resolve
  // - Rejects immediately if ANY rejects
}
```

### Exercise 3: Rate limiter

```javascript
// Create an async function that processes items
// but only N at a time (rate limiting)
async function processWithLimit(items, limit, processor) {
  // TODO: Process items with at most `limit` concurrent operations
}
```

## Key Takeaways

- Promises represent eventual values: pending → fulfilled | rejected
- `.then()` chains transform values and return new promises
- `.catch()` handles errors from any step in the chain
- `async/await` is syntactic sugar — still Promises underneath
- Always `await` inside `try/catch` for clean error handling
- Use `Promise.all` for parallel independent operations
- Never make sequential what can be parallel
- Handle ALL rejections — unhandled ones crash Node.js

---

**Next:** [Lecture 7: The Event Loop →](7-event-loop.md)
