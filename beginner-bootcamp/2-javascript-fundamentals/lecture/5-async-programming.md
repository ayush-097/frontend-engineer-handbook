# Async Programming

## Why Async Exists

JavaScript runs on a **single thread** — only one thing can execute at a time. Without async patterns, fetching data, reading files, or waiting for timers would completely freeze the browser or server.

```javascript
// Without async — this would freeze the page for 3 seconds:
function freeze() {
  const start = Date.now();
  while (Date.now() - start < 3000) {} // Block everything
  console.log('Done');
}

// With async — non-blocking:
setTimeout(() => console.log('Done'), 3000);
// Browser stays responsive the entire time
```

## Synchronous vs Asynchronous

```javascript
// Synchronous — executes line by line, waits for each
console.log('1');
console.log('2');
console.log('3');
// Output: 1, 2, 3 (always in order)

// Asynchronous — doesn't block, continues running
console.log('1');
setTimeout(() => console.log('2'), 1000);
console.log('3');
// Output: 1, 3, 2 (2 comes after the wait)
```

## Callbacks — The Original Solution

A **callback** is a function passed as an argument, to be called later when an operation completes.

```javascript
// Callback pattern
function fetchUser(id, onSuccess, onError) {
  setTimeout(() => {
    if (id > 0) {
      onSuccess({ id, name: `User ${id}` });
    } else {
      onError(new Error('Invalid ID'));
    }
  }, 1000);
}

// Usage
fetchUser(
  1,
  (user) => console.log('Got user:', user),  // success callback
  (err)  => console.error('Error:', err)     // error callback
);
```

### Node.js Error-First Callback Convention

```javascript
// The Node.js standard: first arg is always error
function readFile(path, callback) {
  // Simulated
  setTimeout(() => {
    if (path === 'missing.txt') {
      callback(new Error('File not found'), null); // error first!
    } else {
      callback(null, 'file contents here'); // null error = success
    }
  }, 100);
}

readFile('data.txt', (err, data) => {
  if (err) {
    console.error('Failed:', err.message);
    return; // Early return — critical!
  }
  console.log('Data:', data);
});
```

## Callback Hell

The fundamental problem with callbacks: **nesting**.

```javascript
// Get user → Get their posts → Get comments on first post → Get author of first comment
fetchUser(1, (err, user) => {
  if (err) return handleError(err);

  fetchPosts(user.id, (err, posts) => {
    if (err) return handleError(err);

    fetchComments(posts[0].id, (err, comments) => {
      if (err) return handleError(err);

      fetchUser(comments[0].authorId, (err, author) => {
        if (err) return handleError(err);

        console.log('Author:', author.name);
        // ← We are now 4 levels deep
        // This is "callback hell" or the "pyramid of doom"
      });
    });
  });
});
```

**Problems with callback hell:**
- Hard to read (horizontal growth)
- Error handling at every level
- Hard to share values between levels
- Can't use `try/catch`
- Difficult to run things in parallel

## Fixing Callback Hell — Named Functions

One mitigation: extract to named functions.

```javascript
// ❌ Anonymous nested callbacks
fetchUser(1, (err, user) => {
  fetchPosts(user.id, (err, posts) => {
    // ...
  });
});

// ✅ Named callback chain — still callbacks, but readable
function handleUser(err, user) {
  if (err) return handleError(err);
  fetchPosts(user.id, handlePosts.bind(null, user));
}

function handlePosts(user, err, posts) {
  if (err) return handleError(err);
  fetchComments(posts[0].id, handleComments.bind(null, user, posts));
}

function handleComments(user, posts, err, comments) {
  if (err) return handleError(err);
  console.log('Done!', { user, posts, comments });
}

fetchUser(1, handleUser);
```

## Async Patterns Before Promises

### The `async.js` Pattern (concept)

```javascript
// Before native async tools, libraries like async.js were common
// Here's the conceptual pattern:

function series(tasks, callback) {
  const results = [];
  
  function runNext(index) {
    if (index >= tasks.length) {
      return callback(null, results);
    }
    
    tasks[index]((err, result) => {
      if (err) return callback(err);
      results.push(result);
      runNext(index + 1);
    });
  }
  
  runNext(0);
}

// Usage
series([
  (done) => fetchUser(1, done),
  (done) => fetchPosts(1, done),
], (err, [user, posts]) => {
  console.log(user, posts);
});
```

### Parallel execution with callbacks

```javascript
function parallel(tasks, callback) {
  const results = new Array(tasks.length);
  let completed = 0;
  let failed = false;

  tasks.forEach((task, index) => {
    task((err, result) => {
      if (failed) return;
      
      if (err) {
        failed = true;
        return callback(err);
      }
      
      results[index] = result;
      completed++;
      
      if (completed === tasks.length) {
        callback(null, results);
      }
    });
  });
}

// Runs all simultaneously, waits for all to finish
parallel([
  (done) => fetchUser(1, done),
  (done) => fetchPosts(1, done),
  (done) => fetchComments(1, done),
], (err, [user, posts, comments]) => {
  console.log('All done!');
});
```

## Timers — Core Async Primitives

```javascript
// setTimeout — run once after delay
const id = setTimeout(() => {
  console.log('Fires once after 1s');
}, 1000);

clearTimeout(id); // Cancel it

// setInterval — run repeatedly
const intervalId = setInterval(() => {
  console.log('Fires every 500ms');
}, 500);

clearInterval(intervalId); // Cancel it

// setImmediate (Node.js) — run after current event loop iteration
setImmediate(() => {
  console.log('Runs after I/O events');
});

// queueMicrotask — run in microtask queue (after current task)
queueMicrotask(() => {
  console.log('Runs before next macro task');
});
```

### Timer precision gotcha

```javascript
// setTimeout(fn, 0) is NOT instant!
console.log('1');
setTimeout(() => console.log('2'), 0);
console.log('3');
// Output: 1, 3, 2
// setTimeout always yields to the event loop
```

## XMLHttpRequest — Async HTTP (Legacy)

```javascript
// The original async HTTP API (still used in some legacy code)
function get(url, callback) {
  const xhr = new XMLHttpRequest();
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) { // 4 = DONE
      if (xhr.status === 200) {
        callback(null, JSON.parse(xhr.responseText));
      } else {
        callback(new Error(`HTTP ${xhr.status}`), null);
      }
    }
  };
  
  xhr.open('GET', url);
  xhr.send();
}

get('/api/user/1', (err, user) => {
  if (err) return console.error(err);
  console.log(user);
});
```

## The Fetch API — Modern HTTP

```javascript
// fetch() returns a Promise — covered in next lecture
fetch('/api/users/1')
  .then(response => response.json())
  .then(user => console.log(user))
  .catch(err => console.error(err));
```

## Event-Driven Async

In both browsers and Node.js, much of async is event-driven.

```javascript
// Browser
document.addEventListener('click', (event) => {
  console.log('Clicked at:', event.clientX, event.clientY);
});

// Node.js EventEmitter
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('data', (chunk) => {
  console.log('Received:', chunk);
});

emitter.on('end', () => {
  console.log('Stream ended');
});

// Simulate data arriving asynchronously
setTimeout(() => emitter.emit('data', 'chunk1'), 100);
setTimeout(() => emitter.emit('data', 'chunk2'), 200);
setTimeout(() => emitter.emit('end'), 300);
```

## Streams — Async Data Flow

```javascript
// Node.js readable stream (conceptual)
const fs = require('fs');
const readable = fs.createReadStream('large-file.txt', { encoding: 'utf8' });

readable.on('data', (chunk) => {
  // Process each chunk as it arrives — doesn't load whole file!
  process.stdout.write(chunk);
});

readable.on('end', () => {
  console.log('File fully read');
});

readable.on('error', (err) => {
  console.error('Read error:', err);
});
```

## Race Conditions

A critical async bug: when the ORDER of async operations isn't guaranteed.

```javascript
// ❌ Race condition example
let user = null;

function loadUser(id) {
  fetchUser(id, (err, data) => {
    user = data; // Which request finishes last?
  });
}

loadUser(1); // Starts request for user 1
loadUser(2); // Starts request for user 2
// 'user' might be user 1 OR user 2 — unpredictable!

// ✅ Fix: track which request is "current"
let currentRequestId = 0;

function loadUserSafe(id) {
  const requestId = ++currentRequestId;
  
  fetchUser(id, (err, data) => {
    if (requestId !== currentRequestId) return; // Stale response, ignore
    user = data;
  });
}
```

## Callback Best Practices

```javascript
// 1. Always handle errors
fetchData((err, data) => {
  if (err) {
    // Handle it — never ignore!
    console.error(err);
    return;
  }
  process(data);
});

// 2. Never call callbacks synchronously AND asynchronously
// ❌ BAD — inconsistent behavior
function getUser(id, callback) {
  if (cache[id]) {
    callback(null, cache[id]); // Synchronous!
  } else {
    fetch(id, callback);       // Asynchronous!
  }
}

// ✅ GOOD — always async
function getUser(id, callback) {
  if (cache[id]) {
    process.nextTick(() => callback(null, cache[id])); // Always async
  } else {
    fetch(id, callback);
  }
}

// 3. Return after calling callback to avoid double-calling
function process(data, callback) {
  if (!data) {
    callback(new Error('No data'));
    return; // ← Critical! Without this, code continues
  }
  callback(null, transform(data));
}
```

## Error Propagation in Async Code

```javascript
// ❌ try/catch does NOT catch async errors!
try {
  setTimeout(() => {
    throw new Error('Async error'); // NOT caught!
  }, 100);
} catch (e) {
  console.log('Never reaches here');
}

// ✅ Handle errors where they occur
setTimeout(() => {
  try {
    throw new Error('Async error');
  } catch (e) {
    console.log('Caught:', e.message); // ✅
  }
}, 100);

// ✅ Or use error-first callbacks
setTimeout(() => {
  const err = new Error('Async error');
  callback(err); // Pass it to caller
}, 100);
```

## Promisifying Callbacks

Converting callback-based APIs to Promises (covered fully in Lecture 6).

```javascript
// Manual promisification
function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Node.js built-in util.promisify
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

readFileAsync('file.txt', 'utf8')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## Practice Exercises

### Exercise 1: Implement `waterfall`

```javascript
// waterfall runs tasks in sequence, passing result of each to the next
function waterfall(tasks, callback) {
  // TODO: implement
  // tasks = [(done) => ..., (result, done) => ..., (result, done) => ...]
  // Each task receives the result of the previous
}

waterfall([
  (done) => setTimeout(() => done(null, 1), 100),
  (n, done) => setTimeout(() => done(null, n * 2), 100),
  (n, done) => setTimeout(() => done(null, n + 10), 100),
], (err, result) => {
  console.log(result); // 12 (1 → 2 → 12)
});
```

### Exercise 2: Implement `retry`

```javascript
// retry calls a task up to `times` times before giving up
function retry(task, times, callback) {
  // TODO: implement
  // If task succeeds, call callback(null, result)
  // If task fails and retries remain, try again
  // If all retries exhausted, call callback(error)
}
```

## Key Takeaways

- JavaScript is single-threaded — async keeps it from blocking
- Callbacks are the foundation of async, but lead to "callback hell"
- Error-first callbacks are the Node.js convention
- Always handle errors; never swallow them
- Race conditions are a common async bug — always track "current" requests
- `try/catch` doesn't work for async code inside callbacks
- Promises (next lecture) solve most callback problems elegantly

---

**Next:** [Lecture 6: Promises & Async/Await →](6-promises-async-await.md)
