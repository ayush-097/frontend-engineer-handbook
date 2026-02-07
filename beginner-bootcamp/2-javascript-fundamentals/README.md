# JavaScript Fundamentals

> Master the language that powers the web—from execution models to async mastery

## 🎯 Learning Objectives

By the end of this module, you will:

- **Understand** JavaScript's execution model (call stack, heap, event loop)
- **Explain** scope, closures, and how they enable powerful patterns
- **Master** `this` binding in all contexts
- **Comprehend** prototypal inheritance and the prototype chain
- **Write** sophisticated async code with Promises and async/await
- **Debug** complex timing issues using event loop knowledge
- **Use** modules effectively (ESM, CommonJS)

## 📋 Prerequisites

- Basic programming knowledge (variables, functions, loops)
- HTML/CSS fundamentals completed
- A code editor and Node.js installed

## 🗓️ Time Commitment

**4 weeks** (12-15 hours/week)
- Lectures: 6 hours
- Labs: 20 hours
- Homework: 15 hours
- Reading: 4 hours

## 📚 Module Structure

### Lectures

1. **[Execution Context & Call Stack](lecture/1-execution-context.md)** (45 min)
   - Global vs function execution contexts
   - Creation and execution phases
   - Call stack mechanics
   - Stack overflow

2. **[Scope & Closures](lecture/2-scope-closures.md)** (60 min)
   - Lexical scope
   - Function scope vs block scope
   - Closure mechanics and memory
   - Practical closure patterns

3. **[The `this` Keyword](lecture/3-this-binding.md)** (45 min)
   - Default binding
   - Implicit binding
   - Explicit binding (call, apply, bind)
   - Arrow functions and `this`
   - Common pitfalls

4. **[Prototypes & Inheritance](lecture/4-prototypes-inheritance.md)** (60 min)
   - The prototype chain
   - Constructor functions
   - ES6 classes (syntactic sugar)
   - Composition vs inheritance

5. **[Async Programming](lecture/5-async-programming.md)** (45 min)
   - Callbacks and callback hell
   - Why async matters
   - Async patterns evolution

6. **[Promises & Async/Await](lecture/6-promises-async-await.md)** (90 min)
   - Promise states and lifecycle
   - Chaining and error handling
   - Promise.all, race, allSettled
   - Async/await syntax and patterns
   - Error handling in async functions

7. **[The Event Loop](lecture/7-event-loop.md)** (60 min)
   - Call stack, task queue, microtask queue
   - How the event loop works
   - SetTimeout vs setImmediate vs process.nextTick
   - Performance implications

8. **[Modules & Bundling Basics](lecture/8-modules-bundling.md)** (30 min)
   - CommonJS vs ESM
   - Import/export syntax
   - Module resolution
   - Why bundlers exist

### Labs (Hands-On)

#### 1. [Promise Implementation](lab/promise-implementation/)
Build a Promise/A+ compliant promise from scratch.

**What you'll learn:**
- Promise state machine
- Async resolution mechanics
- Chaining implementation
- Error propagation

---

#### 2. [Debounce & Throttle](lab/debounce-throttle/)
Implement performance optimization utilities from scratch.

**What you'll learn:**
- Closure-based timing control
- Function context preservation
- Real-world performance patterns
- Testing async utilities

**Real-world applications:**
- Search input debouncing
- Scroll event throttling
- Resize handlers
- API call rate limiting

---

#### 3. [Custom Event Emitter](lab/custom-event-emitter/)
Build a Node.js-style event emitter.

**What you'll learn:**
- Publisher/subscriber pattern
- Memory management (listener cleanup)
- Once, removeListener, removeAllListeners
- Wildcard events

---

#### 4. [Async Queue](lab/async-queue/)
Implement a queue that processes async tasks with concurrency control.

**What you'll learn:**
- Concurrency vs parallelism
- Queue data structures
- Promise coordination
- Error handling in queues

**Real-world applications:**
- API request batching
- File upload queues
- Task processing systems

### Homework (Open-Ended)

#### 1. [Build Your Own Promise](homework/build-your-own-promise.md)
Extend the lab promise implementation with:
- Promise.race
- Promise.allSettled
- Promise.any
- Finally handler

**Challenge mode**: Make it faster than native promises for microbenchmarks.

---

#### 2. [Implement Lodash Functions](homework/implement-lodash-functions.md)
Recreate these lodash utilities from scratch:
- `_.debounce` (with leading/trailing options)
- `_.throttle`
- `_.memoize`
- `_.curry`
- `_.compose`

**Requirements:**
- Match lodash API exactly
- Full test coverage
- Performance comparable to lodash

---

#### 3. [Event Loop Challenges](homework/event-loop-challenges.md)
Predict the output of 10 increasingly complex async code snippets, then explain why.

Example:
```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// What's the output? Why?
```

**Deliverable**: Markdown file with predictions, actual output, and detailed explanations.

## ✅ Tests

All code includes comprehensive test suites:

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test promise.test.js
```

**Coverage requirements**: >90% for all implementations.

## 📖 Required Reading

- [You Don't Know JS: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures) - Kyle Simpson
- [JavaScript Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) - MDN
- [Promises/A+ Specification](https://promisesaplus.com/)

## 🎓 Assessment

Complete the final challenge to demonstrate mastery:

**Build a Mini Task Runner**
- Supports sync and async tasks
- Dependency graph resolution
- Parallel execution with concurrency limits
- Error handling and retry logic
- Progress reporting

## 🚀 What's Next?

After completing this module:
1. Move to [Browser Basics](../3-browser-basics/) to see JavaScript in action
2. Or jump to [TypeScript Basics](../4-typescript-basics/) to add type safety

## 💡 Pro Tips

- **Use the debugger**: Set breakpoints in Chrome DevTools to visualize execution
- **Read error messages**: Stack traces tell you exactly where things went wrong
- **Console.log liberally**: When learning async, log everything
- **Test edge cases**: Null, undefined, empty arrays—break your code intentionally

## ❓ Common Questions

**Q: Do I need to memorize the event loop?**
A: No, but you should understand it conceptually. Drawing it helps.

**Q: Should I learn callbacks if everyone uses async/await?**
A: Yes—many libraries still use callbacks, and you'll need to wrap them.

**Q: Are closures really that important?**
A: Absolutely. They're everywhere in React (hooks), Node.js, and functional programming.

## 📞 Get Help

Stuck? Here's how to get unstuck:
1. Review the lecture material
2. Check the test files for hints
3. Search MDN documentation
4. Ask in [our Discord](../../communities.md#discord)

---

**Ready to start? Begin with [Lecture 1: Execution Context](lecture/1-execution-context.md) →**
