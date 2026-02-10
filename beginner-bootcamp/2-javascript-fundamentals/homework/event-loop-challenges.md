# Homework: Event Loop Challenges

## 🎯 Objective

Predict the output of these code snippets and explain WHY.

## Challenge 1: Basic

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

console.log("3");
```

**Your prediction:**

```
// Your answer here
```

**Explanation:**

```
// Explain the event loop mechanics
```

## Challenge 2: Promise vs setTimeout

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");
```

**Your prediction:**

```
// Your answer here
```

## Challenge 3: Microtask Queue

```javascript
setTimeout(() => console.log("1"), 0);

Promise.resolve()
  .then(() => console.log("2"))
  .then(() => console.log("3"));

setTimeout(() => console.log("4"), 0);
```

**Your prediction:**

```
// Your answer here
```

## Challenge 4: Nested

```javascript
console.log("start");

setTimeout(() => {
  console.log("timeout1");
  Promise.resolve().then(() => console.log("promise1"));
}, 0);

Promise.resolve().then(() => {
  console.log("promise2");
  setTimeout(() => console.log("timeout2"), 0);
});

console.log("end");
```

**Your prediction:**

```
// Your answer here
```

[Continue with 6 more challenges...]

## Deliverable

Create a markdown file with:

1. Your predictions
2. Actual output (run the code)
3. Detailed explanations of each

---

**Time estimate:** 3-4 hours
