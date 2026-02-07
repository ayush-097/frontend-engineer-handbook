# Array Methods Implementation

## Problem: Implement map, filter, reduce

Implement these array methods from scratch:
- `Array.prototype.myMap`
- `Array.prototype.myFilter`
- `Array.prototype.myReduce`

## Requirements

Match the native API exactly, including:
- Callback signature `(element, index, array)`
- Optional `thisArg` parameter
- Proper context binding
- Edge cases (sparse arrays, empty arrays)

## Examples

```javascript
const arr = [1, 2, 3, 4, 5];

// myMap
arr.myMap(x => x * 2); // [2, 4, 6, 8, 10]

// myFilter  
arr.myFilter(x => x % 2 === 0); // [2, 4]

// myReduce
arr.myReduce((acc, x) => acc + x, 0); // 15
```

## Starter Code

```javascript
Array.prototype.myMap = function(callback, thisArg) {
  // Your implementation
};

Array.prototype.myFilter = function(callback, thisArg) {
  // Your implementation
};

Array.prototype.myReduce = function(callback, initialValue) {
  // Your implementation
};
```

## Test Cases

```javascript
// Test 1: Basic functionality
const nums = [1, 2, 3];
console.assert(
  JSON.stringify(nums.myMap(x => x * 2)) === 
  JSON.stringify([2, 4, 6])
);

// Test 2: thisArg binding
const multiplier = { factor: 10 };
console.assert(
  JSON.stringify(nums.myMap(function(x) { 
    return x * this.factor; 
  }, multiplier)) === 
  JSON.stringify([10, 20, 30])
);

// Test 3: Empty array
console.assert(
  JSON.stringify([].myMap(x => x)) === 
  JSON.stringify([])
);

// Test 4: Sparse arrays
const sparse = [1, , 3];
console.assert(
  sparse.myMap(x => x).length === 3
);

// Add more tests...
```

## Solution

<details>
<summary>Click to reveal solution</summary>

```javascript
Array.prototype.myMap = function(callback, thisArg) {
  if (this == null) {
    throw new TypeError('Array.prototype.myMap called on null or undefined');
  }
  
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  
  const arr = Object(this);
  const len = arr.length >>> 0;
  const result = new Array(len);
  
  for (let i = 0; i < len; i++) {
    if (i in arr) {
      result[i] = callback.call(thisArg, arr[i], i, arr);
    }
  }
  
  return result;
};

Array.prototype.myFilter = function(callback, thisArg) {
  if (this == null) {
    throw new TypeError('Array.prototype.myFilter called on null or undefined');
  }
  
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  
  const arr = Object(this);
  const len = arr.length >>> 0;
  const result = [];
  
  for (let i = 0; i < len; i++) {
    if (i in arr) {
      const val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  
  return result;
};

Array.prototype.myReduce = function(callback, initialValue) {
  if (this == null) {
    throw new TypeError('Array.prototype.myReduce called on null or undefined');
  }
  
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  
  const arr = Object(this);
  const len = arr.length >>> 0;
  
  let k = 0;
  let accumulator;
  
  if (arguments.length >= 2) {
    accumulator = initialValue;
  } else {
    // Find first element
    while (k < len && !(k in arr)) {
      k++;
    }
    
    if (k >= len) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    
    accumulator = arr[k++];
  }
  
  while (k < len) {
    if (k in arr) {
      accumulator = callback(accumulator, arr[k], k, arr);
    }
    k++;
  }
  
  return accumulator;
};
```

</details>

## Follow-up Questions

1. What's the time/space complexity?
2. How do you handle sparse arrays?
3. Why use `>>> 0` for length?
4. What's the difference between `in` operator and checking undefined?

## Key Learnings

- Context binding with `thisArg`
- Sparse array handling
- Type coercion (`>>> 0`)
- Error handling for edge cases
