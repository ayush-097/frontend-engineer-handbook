# Execution Context & Call Stack

## What is an Execution Context?

An **execution context** is an abstract concept that holds information about the environment where JavaScript code is evaluated and executed.

Think of it as a wrapper that contains:

- Variables
- Functions
- The value of `this`
- Lexical environment

## Types of Execution Contexts

### 1. Global Execution Context (GEC)

- Created when JavaScript first runs
- One per program
- Creates a global object (`window` in browsers, `global` in Node.js)
- Sets `this` to the global object

### 2. Function Execution Context (FEC)

- Created whenever a function is invoked
- Many can exist
- Each function call creates a new context

### 3. Eval Execution Context

- Created when code runs inside `eval()` (rarely used, avoid!)

## Execution Context Lifecycle

Each execution context goes through two phases:

### Phase 1: Creation Phase

**What happens:**

1. **Variable Environment** created

   - `var` declarations are hoisted (set to `undefined`)
   - Function declarations are hoisted (fully)
   - `let` and `const` are hoisted but uninitialized (Temporal Dead Zone)

2. **Lexical Environment** created

   - Determines scope chain

3. **`this` binding** determined

```javascript
console.log(name); // undefined (hoisted but not assigned)
console.log(greet); // [Function: greet] (fully hoisted)
// console.log(age); // ReferenceError (TDZ)

var name = "Alice";
let age = 25;

function greet() {
  console.log("Hello!");
}
```

### Phase 2: Execution Phase

**What happens:**

- Code runs line by line
- Variables get assigned their values
- Functions are executed

```javascript
var x; // Creation phase: x = undefined
console.log(x); // undefined
x = 10; // Execution phase: x = 10
console.log(x); // 10
```

## Hoisting Explained

### Variable Hoisting

```javascript
// What you write:
console.log(a); // undefined
var a = 5;

// How JavaScript sees it (conceptually):
var a; // Hoisted to top
console.log(a); // undefined
a = 5;
```

### Function Hoisting

```javascript
// Function declarations are fully hoisted
greet(); // "Hello!" - works!

function greet() {
  console.log("Hello!");
}

// Function expressions are NOT fully hoisted
// sayHi(); // TypeError: sayHi is not a function

var sayHi = function () {
  console.log("Hi!");
};
```

### let/const Hoisting (Temporal Dead Zone)

```javascript
// TDZ starts
console.log(name); // ReferenceError: Cannot access 'name' before initialization
let name = "Bob"; // TDZ ends
```

## The Call Stack

The **call stack** is a LIFO (Last In, First Out) data structure that keeps track of function execution.

### Call Stack Operations

```javascript
function first() {
  console.log("First");
  second();
  console.log("First again");
}

function second() {
  console.log("Second");
  third();
  console.log("Second again");
}

function third() {
  console.log("Third");
}

first();
```

**Call Stack Visualization:**

```
Step 1:           Step 2:           Step 3:           Step 4:
┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐
│         │       │ first() │       │ second()│       │ third() │
│         │       └─────────┘       ├─────────┤       ├─────────┤
│         │       Global EC         │ first() │       │ second()│
│         │                         └─────────┘       ├─────────┤
│         │                         Global EC         │ first() │
│         │                                           └─────────┘
Global EC                                             Global EC

Execution:        "First" logged    "Second" logged   "Third" logged

Step 5:           Step 6:           Step 7:
┌─────────┐       ┌─────────┐       ┌─────────┐
│ second()│       │ first() │       │         │
├─────────┤       └─────────┘       │         │
│ first() │       Global EC         │         │
└─────────┘                         │         │
Global EC                           Global EC

"Second again"    "First again"     Done
```

### Stack Overflow

What happens when the call stack gets too deep?

```javascript
function recursiveFunction() {
  recursiveFunction(); // Calls itself infinitely
}

recursiveFunction();
// RangeError: Maximum call stack size exceeded
```

**Why it happens:**

- Each function call adds a frame to the stack
- Stack has limited memory
- Too many calls = stack overflow

**Solution:** Base case in recursion

```javascript
function countdown(n) {
  if (n === 0) return; // Base case!
  console.log(n);
  countdown(n - 1);
}

countdown(5); // 5, 4, 3, 2, 1
```

## Visualizing Execution Context

### Example 1: Simple

```javascript
var x = 10;

function foo() {
  var y = 20;
  console.log(x + y);
}

foo(); // 30
```

**Execution:**

```
1. Global Execution Context Created:
   - Variable Environment: { x: undefined }
   - foo: [Function]

2. Execution begins:
   - x = 10

3. foo() called → New Execution Context:
   - Variable Environment: { y: undefined }
   - Outer reference: Global EC

4. Inside foo():
   - y = 20
   - console.log(x + y)
   - Looks for x: not in local scope
   - Looks in outer scope (Global): finds x = 10
   - Result: 30

5. foo() returns → Context destroyed

6. Back in Global EC
```

### Example 2: Nested Functions

```javascript
var name = "Global";

function outer() {
  var name = "Outer";

  function inner() {
    var name = "Inner";
    console.log(name);
  }

  inner();
}

outer(); // "Inner"
```

**Call Stack:**

```
1. Global EC:
   name = "Global"
   outer = [Function]

2. outer() EC:
   name = "Outer"
   inner = [Function]
   Outer reference: Global EC

3. inner() EC:
   name = "Inner"
   Outer reference: outer() EC

   Lookup "name":
   ✓ Found in inner() EC

4. Unwind: inner() → outer() → Global
```

## Practical Implications

### 1. Variable Shadowing

```javascript
var name = "Global";

function test() {
  var name = "Local"; // Shadows global
  console.log(name); // "Local"
}

test();
console.log(name); // "Global"
```

### 2. Closure Preview

```javascript
function makeCounter() {
  let count = 0; // In makeCounter's EC

  return function () {
    count++; // Accesses outer EC
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
// makeCounter's EC is preserved!
```

### 3. Debugging with Call Stack

```javascript
function a() {
  b();
}

function b() {
  c();
}

function c() {
  console.trace(); // Shows call stack
  debugger; // Pause here
}

a();
// Call stack: c → b → a → global
```

## Common Mistakes

### Mistake 1: Hoisting Confusion

```javascript
// Expected: error
// Actual: undefined
console.log(x);
var x = 5;

// Fix: use let/const
console.log(y); // ReferenceError
let y = 5;
```

### Mistake 2: Function Declaration vs Expression

```javascript
// Works (hoisted)
foo();
function foo() {
  console.log("Declared");
}

// Doesn't work (expression not hoisted)
bar(); // TypeError
var bar = function () {
  console.log("Expression");
};
```

### Mistake 3: Forgetting `this` Context

```javascript
var obj = {
  name: "Object",
  greet: function () {
    console.log(this.name);
  },
};

var greet = obj.greet;
greet(); // undefined (or global name)
// 'this' changed!
```

## Key Takeaways

1. **Execution context** = environment for code execution
2. **Two phases**: Creation (hoisting) → Execution (running)
3. **Call stack** = tracks function calls (LIFO)
4. **Hoisting** = declarations moved to top of scope
5. **Stack overflow** = too many function calls

## Practice Exercise

Predict the output:

```javascript
console.log(a);
var a = 1;

function foo() {
  console.log(a);
  var a = 2;
  console.log(a);
}

foo();
console.log(a);
```

<details>
<summary>Answer</summary>

```
undefined  (var a hoisted in global, not assigned yet)
undefined  (var a hoisted in foo, shadows global)
2          (a assigned in foo)
1          (global a)
```

</details>

## Resources

- [MDN: Execution Context](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this#execution_context)
- [JavaScript Visualizer](https://www.jsv9000.app/)

---

**Next:** [Lecture 2: Scope & Closures →](2-scope-closures.md)
