# Homework: Implement Lodash Functions

## 🎯 Objective

Recreate these Lodash utilities from scratch with identical APIs.

## 📋 Functions to Implement

### 1. \_.debounce

```javascript
function debounce(func, wait, options = {}) {
  // Support options: { leading: boolean, trailing: boolean, maxWait: number }
}
```

### 2. \_.throttle

```javascript
function throttle(func, wait, options = {}) {
  // Support options: { leading: boolean, trailing: boolean }
}
```

### 3. \_.memoize

```javascript
function memoize(func, resolver) {
  // Cache function results
  // Optional resolver for custom cache keys
}
```

### 4. \_.curry

```javascript
function curry(func, arity = func.length) {
  // Support partial application
}
```

### 5. \_.compose

```javascript
function compose(...funcs) {
  // Right-to-left function composition
}
```

## ✅ Requirements

- Match Lodash API exactly
- Full test coverage (>90%)
- Performance comparable to Lodash
- Handle edge cases

## 📝 Example Tests

```javascript
// Debounce
const debounced = debounce(() => console.log("Called"), 100);
debounced();
debounced();
debounced();
// Only logs once after 100ms

// Memoize
const fibonacci = memoize((n) => {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

// Curry
const add = curry((a, b, c) => a + b + c);
add(1)(2)(3); // 6
add(1, 2)(3); // 6
add(1)(2, 3); // 6
```

---

**Time estimate:** 8-10 hours
