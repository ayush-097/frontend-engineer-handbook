# Scope & Closures

## Scope Types

### Global Scope

Variables accessible everywhere.

```javascript
var globalVar = "I'm global";

function test() {
  console.log(globalVar); // Accessible
}
```

### Function Scope

Variables declared with `var` are function-scoped.

```javascript
function myFunction() {
  var functionScoped = "Only in function";
  console.log(functionScoped); // Works
}

// console.log(functionScoped); // ReferenceError
```

### Block Scope

Variables declared with `let`/`const` are block-scoped.

```javascript
if (true) {
  let blockScoped = "Only in block";
  const alsoBlockScoped = "Me too";
  console.log(blockScoped); // Works
}

// console.log(blockScoped); // ReferenceError
```

## Lexical Scope

JavaScript uses **lexical scoping** - scope is determined by where functions are _defined_, not where they're _called_.

```javascript
const name = "Global";

function outer() {
  const name = "Outer";

  function inner() {
    console.log(name); // "Outer" (lexical scope)
  }

  return inner;
}

const fn = outer();
fn(); // "Outer" - NOT "Global"
```

## Closures

A **closure** is a function that has access to its outer function's variables, even after the outer function has returned.

```javascript
function makeCounter() {
  let count = 0; // Private variable

  return function () {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
// count is preserved!
```

### Why Closures Matter

**1. Data Privacy**

```javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance; // Private!

  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) return "Insufficient funds";
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}

const account = createBankAccount(100);
account.deposit(50); // 150
// account.balance; // undefined - can't access directly!
```

**2. Function Factories**

```javascript
function multiplier(factor) {
  return function (number) {
    return number * factor;
  };
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

**3. Event Handlers**

```javascript
function setupButtons() {
  for (let i = 0; i < 3; i++) {
    const button = document.createElement("button");
    button.textContent = `Button ${i}`;

    // Closure captures the current 'i'
    button.onclick = function () {
      console.log(`Clicked button ${i}`);
    };

    document.body.appendChild(button);
  }
}
```

### Common Closure Pitfall

```javascript
// ❌ BAD: var doesn't create new scope per iteration
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // 3, 3, 3 (all closures share same 'i')
  }, 100);
}

// ✅ GOOD: let creates new scope per iteration
for (let i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // 0, 1, 2
  }, 100);
}

// ✅ ALSO GOOD: IIFE creates new scope
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j); // 0, 1, 2
    }, 100);
  })(i);
}
```

## Scope Chain

```javascript
const global = "Global";

function outer() {
  const outerVar = "Outer";

  function middle() {
    const middleVar = "Middle";

    function inner() {
      const innerVar = "Inner";

      // Can access all:
      console.log(innerVar); // Inner
      console.log(middleVar); // Middle
      console.log(outerVar); // Outer
      console.log(global); // Global
    }

    inner();
  }

  middle();
}

outer();
```

**Scope chain visualization:**

```
inner() → middle() → outer() → Global
  ✓         ✓          ✓         ✓
```

## Practice Exercises

1. Create a `createSecretKeeper` function that stores a secret and only reveals it with the correct password.

2. Fix this code:

```javascript
var funcs = [];
for (var i = 0; i < 3; i++) {
  funcs[i] = function () {
    return i;
  };
}
console.log(funcs[0]()); // Should be 0, but returns 3
```

---

**Next:** [Lecture 3: The `this` Keyword →](3-this-binding.md)
