# Lab: Debounce & Throttle

## 🎯 Objective

Implement debounce and throttle utilities from scratch. These are critical performance optimization patterns.

## 💡 Use Cases

**Debounce:**
- Search input (wait for user to stop typing)
- Window resize handlers
- Auto-save functionality

**Throttle:**
- Scroll event handlers
- Mouse move tracking
- API rate limiting

## 🛠️ Requirements

### Debounce
```javascript
function debounce(func, delay) {
  // Returns a debounced version of func
  // that delays execution by 'delay' ms
}

// Usage
const search = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

search('a'); // Won't execute
search('ab'); // Won't execute  
search('abc'); // Will execute after 300ms
```

### Throttle
```javascript
function throttle(func, interval) {
  // Returns a throttled version of func
  // that executes at most once per 'interval' ms
}

// Usage
const log = throttle(() => {
  console.log('Scrolling...');
}, 1000);

window.addEventListener('scroll', log);
// Logs at most once per second
```

## ✅ Tests

Your implementations must:
- Preserve function context (`this`)
- Pass arguments correctly
- Handle edge cases (null, undefined)
- Clean up timers properly

## 🚀 Challenge

Add `leading` and `trailing` options like lodash:
```javascript
debounce(func, delay, { leading: true, trailing: false })
```

## 📖 Resources

- [Lodash Implementation](https://github.com/lodash/lodash/blob/master/debounce.js)
- [CSS Tricks Article](https://css-tricks.com/debouncing-throttling-explained-examples/)
