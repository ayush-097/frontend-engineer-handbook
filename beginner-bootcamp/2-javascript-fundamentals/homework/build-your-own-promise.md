# Homework: Build Your Own Promise

## 🎯 Objective

Extend the Promise implementation from the lab to include:

- `Promise.race`
- `Promise.allSettled`
- `Promise.any`
- `.finally()` method

## 📋 Requirements

### 1. Promise.race

Returns a promise that resolves/rejects as soon as any promise resolves/rejects.

```javascript
const p1 = new MyPromise((resolve) => setTimeout(() => resolve("slow"), 1000));
const p2 = new MyPromise((resolve) => setTimeout(() => resolve("fast"), 100));

MyPromise.race([p1, p2]).then((value) => {
  console.log(value); // 'fast'
});
```

### 2. Promise.allSettled

Returns a promise that resolves after all promises have settled (resolved or rejected).

```javascript
const promises = [
  MyPromise.resolve(1),
  MyPromise.reject("error"),
  MyPromise.resolve(3),
];

MyPromise.allSettled(promises).then((results) => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});
```

### 3. Promise.any

Returns a promise that resolves as soon as any promise resolves.  
Rejects only if ALL promises reject.

```javascript
const p1 = MyPromise.reject("error1");
const p2 = MyPromise.resolve("success");
const p3 = MyPromise.reject("error2");

MyPromise.any([p1, p2, p3]).then((value) => {
  console.log(value); // 'success'
});
```

### 4. .finally() method

Executes code regardless of promise outcome.

```javascript
new MyPromise((resolve) => resolve("done"))
  .finally(() => console.log("Cleanup"))
  .then((value) => console.log(value));
// Output: Cleanup, done
```

## ✅ Testing

Your implementation must pass:

```bash
npm test promise-extended.test.js
```

## 🚀 Bonus

Make your Promise implementation faster than native for micro-benchmarks!

---

**Time estimate:** 4-6 hours
