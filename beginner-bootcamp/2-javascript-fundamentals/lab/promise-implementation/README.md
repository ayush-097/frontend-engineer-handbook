# Lab: Promise Implementation

## 🎯 Objective

Build a Promise/A+ compliant promise implementation from scratch to deeply understand how promises work.

## 📚 Background

Promises are fundamental to modern JavaScript. By implementing them yourself, you'll understand:
- State machines
- Async resolution
- Callback queuing
- Error propagation

## 🛠️ Requirements

Your `MyPromise` class must:
1. Have three states: pending, fulfilled, rejected
2. Support `.then()` and `.catch()` chaining
3. Handle async resolution correctly
4. Propagate errors through the chain
5. Support Promise.all static method

## 📝 Starter Code

```javascript
class MyPromise {
  constructor(executor) {
    // Your implementation
  }

  then(onFulfilled, onRejected) {
    // Your implementation
  }

  catch(onRejected) {
    // Your implementation
  }

  static resolve(value) {
    // Your implementation
  }

  static reject(reason) {
    // Your implementation
  }

  static all(promises) {
    // Your implementation
  }
}
```

## ✅ Tests

Run: `npm test promise.test.js`

Your implementation must pass all test cases.

## 🚀 Challenge

Implement `Promise.race` and `Promise.allSettled` as well.

## 📖 Resources

- [Promises/A+ Spec](https://promisesaplus.com/)
- [MDN Promise Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
