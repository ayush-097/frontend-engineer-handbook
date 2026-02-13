# The Event Loop

## The Fundamental Question

If JavaScript is single-threaded, how can it handle:
- setTimeout while running other code?
- Network requests without freezing?
- User input while processing data?

The answer is the **Event Loop** — JavaScript's concurrency model.

## The Architecture

JavaScript's runtime consists of several components working together:

```
┌─────────────────────────────────────────────────────┐
│                JavaScript Runtime                   │
│                                                     │
│  ┌──────────────────┐    ┌───────────────────────┐  │
│  │   Call Stack     │    │    Memory Heap        │  │
│  │                  │    │                       │  │
│  │  [function3()]   │    │  { objects, arrays,  }│  │
│  │  [function2()]   │    │  { closures, etc.    }│  │
│  │  [function1()]   │    │                       │  │
│  │  [main()]        │    │                       │  │
│  └──────────────────┘    └───────────────────────┘  │
│                                                     │
└────────────────────────┬────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │      Web APIs / Node APIs   │
          │  (setTimeout, fetch, DOM,   │
          │   fs, http, setInterval...) │
          └──────────────┬──────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Microtask  │  │  Macrotask  │  │   Other     │
│   Queue     │  │   Queue     │  │  Queues     │
│             │  │             │  │             │
│ Promises    │  │ setTimeout  │  │ requestAnim │
│ queueMicro  │  │ setInterval │  │ Frame, etc  │
│ task()      │  │ I/O, UI     │  │             │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────▼────────────────┘
                        │
               ┌────────▼────────┐
               │   Event Loop    │
               │                 │
               │  1. Run stack   │
               │  2. Run ALL     │
               │     microtasks  │
               │  3. Run ONE     │
               │     macrotask   │
               │  4. Repeat      │
               └─────────────────┘
```

## The Call Stack

The call stack tracks which function is currently executing.

```javascript
function multiply(a, b) {
  return a * b;
}

function square(n) {
  return multiply(n, n);
}

function main() {
  const result = square(4);
  console.log(result);
}

main();
```

**Call stack evolution:**

```
Step 1:    Step 2:    Step 3:       Step 4:      Step 5:    Step 6:
           main()     square(4)     multiply()   square(4)  main()
main()     main()     main()        square(4)    main()     main()
                                    main()
  ↑push      ↑push      ↑push        ↑push        ↑pop       ↑pop
```

## Heap, Stack, Queue — Defined

| Component | Stores | Characteristics |
|-----------|--------|-----------------|
| **Heap** | Objects, arrays, functions | Unstructured, garbage collected |
| **Stack** | Execution frames (active functions) | LIFO, limited size |
| **Queue** | Callbacks waiting to run | FIFO, run when stack is empty |

## Task Queues — Two Types

JavaScript actually has **two** queues with different priorities:

### 1. Macrotask Queue (Task Queue)
Handles "large" async operations. One task per event loop iteration.

**Sources:**
- `setTimeout`
- `setInterval`
- `setImmediate` (Node.js)
- I/O events (file read, network)
- UI events (click, keypress)
- `MessageChannel`

### 2. Microtask Queue
Higher priority — **all microtasks drain** before any macrotask runs.

**Sources:**
- `Promise.then()` / `.catch()` / `.finally()`
- `queueMicrotask()`
- `MutationObserver` callbacks
- `await` (resumes as microtask)

## The Event Loop Algorithm

```
while (true) {
  // 1. Execute current call stack to completion
  runCallStack();

  // 2. Drain the ENTIRE microtask queue
  while (microtaskQueue.length > 0) {
    const task = microtaskQueue.shift();
    task();
    // Note: new microtasks added here run too!
  }

  // 3. Run ONE macrotask (if any)
  if (macrotaskQueue.length > 0) {
    const task = macrotaskQueue.shift();
    task();
  }

  // 4. Render (browser only, if needed)
  if (timeToRender) {
    render();
  }

  // Repeat forever
}
```

## Proving the Priority Order

```javascript
console.log('1 — synchronous');

setTimeout(() => console.log('2 — macrotask'), 0);

Promise.resolve().then(() => console.log('3 — microtask'));

queueMicrotask(() => console.log('4 — microtask'));

console.log('5 — synchronous');

// Output:
// 1 — synchronous      ← runs immediately (call stack)
// 5 — synchronous      ← runs immediately (call stack)
// 3 — microtask        ← microtask queue drains first
// 4 — microtask        ← microtask queue drains first
// 2 — macrotask        ← macrotask runs after
```

**Why does this order happen?**

```
Call Stack runs:
  → console.log('1')      ✓ Done
  → setTimeout registered → Goes to Web API (starts timer)
  → Promise.resolve().then → Callback queued in Microtask queue
  → queueMicrotask        → Callback queued in Microtask queue
  → console.log('5')      ✓ Done

Call stack empty!

Event loop checks Microtask queue (FIRST):
  → console.log('3')  ✓
  → console.log('4')  ✓
  (queue empty)

Event loop runs ONE Macrotask:
  → console.log('2')  ✓
```

## Nested Microtasks

Microtasks generated from microtasks run in the **same drain cycle**:

```javascript
Promise.resolve()
  .then(() => {
    console.log('Microtask 1');
    // This .then generates a new microtask:
    return Promise.resolve();
  })
  .then(() => console.log('Microtask 2'));

setTimeout(() => console.log('Macrotask'), 0);

// Output:
// Microtask 1    ← first microtask runs
// Microtask 2    ← new microtask runs before macrotask!
// Macrotask      ← finally runs
```

## A Complete Mental Model

```javascript
console.log('script start');                          // 1

setTimeout(function() {
  console.log('setTimeout');                          // 7
}, 0);

Promise.resolve()
  .then(function() {
    console.log('promise 1');                         // 4
  })
  .then(function() {
    console.log('promise 2');                         // 5
  });

async function asyncFn() {
  console.log('async fn start');                      // 2
  await Promise.resolve();
  console.log('async fn after await');                // 6
}

asyncFn();

console.log('script end');                            // 3

// Exact output:
// script start
// async fn start
// script end
// promise 1
// async fn after await   ← await resumes as microtask
// promise 2
// setTimeout
```

**Trace through:**

```
Synchronous execution:
  'script start' logged
  setTimeout → Web API (0ms timer starts)
  .then(promise1) → Microtask queue: [promise1]
  asyncFn() called:
    'async fn start' logged
    await → suspends asyncFn, resumes as microtask later
    Microtask queue: [promise1, asyncFn-resume]
  'script end' logged

Stack empty → drain microtasks:
  promise1 runs → 'promise 1' logged → schedules promise2
  asyncFn resumes → 'async fn after await' logged
  promise2 runs → 'promise 2' logged
  (queue empty)

Run macrotask:
  setTimeout fires → 'setTimeout' logged
```

## `await` Under the Hood

`await` is syntactic sugar for `.then()`:

```javascript
// What you write:
async function example() {
  const result = await somePromise;
  console.log(result);
}

// What it compiles to (roughly):
function example() {
  return somePromise.then(result => {
    console.log(result);
  });
}
```

This is why `await` resumes as a **microtask**:

```javascript
async function fn() {
  console.log('1');         // Sync
  await Promise.resolve();  // Suspend — schedule microtask to resume
  console.log('3');         // Microtask (runs after sync code)
}

fn();
console.log('2');           // Sync (runs before fn resumes)

// Output: 1, 2, 3
```

## Blocking the Event Loop

Because JavaScript is single-threaded, blocking the call stack blocks EVERYTHING:

```javascript
// ❌ Blocking — freezes the entire app for 5 seconds!
function blockFor5Seconds() {
  const end = Date.now() + 5000;
  while (Date.now() < end) {}
}

blockFor5Seconds();
// UI is frozen, no events processed, nothing async runs

// ✅ Non-blocking — break work into chunks
function processChunk(data, index = 0) {
  const chunkSize = 1000;
  const chunk = data.slice(index, index + chunkSize);

  chunk.forEach(item => process(item));

  if (index + chunkSize < data.length) {
    // Yield to event loop between chunks
    setTimeout(() => processChunk(data, index + chunkSize), 0);
  }
}
```

## Real-World Scenarios

### Scenario 1: Why UI feels frozen

```javascript
button.addEventListener('click', () => {
  // ❌ Sorting 1 million items blocks the event loop
  const sorted = hugeArray.sort();
  display(sorted);
  // User can't scroll, click anything, or see any updates during this
});

// ✅ Use Web Workers for CPU-intensive tasks
const worker = new Worker('sort-worker.js');
button.addEventListener('click', () => {
  worker.postMessage({ data: hugeArray });
});
worker.onmessage = (e) => {
  display(e.data.sorted);
};
```

### Scenario 2: Understanding setTimeout(fn, 0)

```javascript
// ❌ Myth: setTimeout(fn, 0) runs immediately
console.log('A');
setTimeout(() => console.log('B'), 0); // 0ms delay
console.log('C');
// Output: A, C, B  (B is NEVER immediate — always after stack + microtasks)

// ✅ Use case: Defer to after current rendering
button.addEventListener('click', () => {
  // ❌ Width may be 0 (DOM not updated yet)
  element.style.width = '200px';
  console.log(element.offsetWidth); // 0

  // ✅ Read after browser paints
  setTimeout(() => {
    console.log(element.offsetWidth); // 200
  }, 0);
});
```

### Scenario 3: Microtask starvation

```javascript
// ⚠️ Infinite microtasks can starve macrotasks (and the render)!
function recursiveMicrotask() {
  Promise.resolve().then(recursiveMicrotask); // Never stops!
}

recursiveMicrotask();
setTimeout(() => console.log('This never runs!'), 0);
// The macrotask queue never gets a turn
```

### Scenario 4: Reading DOM before and after

```javascript
// requestAnimationFrame fires before the next paint
button.addEventListener('click', () => {
  element.style.backgroundColor = 'red';

  requestAnimationFrame(() => {
    // Runs before browser paints the red
    element.style.backgroundColor = 'blue'; // User sees blue, not red
  });
});
```

## Node.js Event Loop Phases

Node.js has additional phases in its event loop:

```
   ┌───────────────────────────┐
┌─>│           timers          │  ← setTimeout, setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O errors from previous iteration
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← Internal use
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← Retrieve new I/O events (MAIN phase)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  ← setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  ← socket.on('close', ...)
   └───────────────────────────┘

Microtasks run between EVERY phase
```

```javascript
// Node.js: setImmediate vs setTimeout(fn, 0)
setImmediate(() => console.log('setImmediate'));
setTimeout(() => console.log('setTimeout'), 0);
// Order depends on which phase we're in!
// Inside I/O: setImmediate ALWAYS before setTimeout
// Outside I/O: order is non-deterministic

// process.nextTick — even higher priority than Promises!
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
// Output: nextTick, promise
```

## Performance Implications

```javascript
// ❌ Reading layout properties in a loop forces multiple reflows
for (const el of elements) {
  el.style.width = el.offsetWidth + 'px'; // Read then write — reflow each time!
}

// ✅ Batch reads and writes separately
const widths = elements.map(el => el.offsetWidth); // Read all
elements.forEach((el, i) => {
  el.style.width = widths[i] + 'px'; // Write all
});
// One reflow total!

// ✅ Use requestAnimationFrame for visual updates
function animate() {
  update(); // Compute changes
  requestAnimationFrame(animate); // Schedule next frame
}
requestAnimationFrame(animate);
```

## Debugging the Event Loop

```javascript
// Chrome DevTools: Performance panel
// Record → interact → stop → analyze flame chart

// Measure how long tasks take:
performance.mark('task-start');
doHeavyWork();
performance.mark('task-end');
performance.measure('task', 'task-start', 'task-end');
console.log(performance.getEntriesByName('task'));

// Find long tasks (> 50ms blocks the main thread):
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.duration > 50) {
      console.warn(`Long task: ${entry.duration}ms`, entry);
    }
  });
});
observer.observe({ entryTypes: ['longtask'] });
```

## Practice Exercises

### Exercise 1: Predict every output

```javascript
console.log('a');

setTimeout(() => console.log('b'), 0);

Promise.resolve()
  .then(() => console.log('c'))
  .then(() => {
    setTimeout(() => console.log('d'), 0);
    return Promise.resolve();
  })
  .then(() => console.log('e'));

console.log('f');
```

<details>
<summary>Answer</summary>

```
a   ← synchronous
f   ← synchronous
c   ← microtask (first .then)
e   ← microtask (third .then — d's setTimeout is macrotask)
b   ← macrotask (first setTimeout)
d   ← macrotask (second setTimeout, queued during microtask)
```

</details>

### Exercise 2: Fix the blocking function

```javascript
// This freezes the UI. Rewrite it to stay non-blocking:
function processMillionItems(data) {
  return data.map(item => expensiveTransform(item));
}
// Hint: use setTimeout(fn, 0) to yield between chunks
```

## Key Takeaways

- JavaScript is single-threaded — one thing at a time on the call stack
- The event loop checks queues when the stack is empty
- **Microtasks** (Promises, queueMicrotask) run before **macrotasks** (setTimeout, I/O)
- ALL microtasks drain before ONE macrotask runs
- `await` resumes as a microtask — not immediately, not as macrotask
- Blocking the call stack blocks EVERYTHING — UI, events, timers
- Long tasks (>50ms) should be broken into chunks or moved to Web Workers

---

**Next:** [Lecture 8: Modules & Bundling →](8-modules-bundling.md)
