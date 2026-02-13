# The `this` Keyword

## What is `this`?

`this` is a special keyword that refers to the **context** in which a function is executed — not where it was defined, but where and how it was **called**.

This is the most commonly misunderstood concept in JavaScript. Let's make it crystal clear.

## Rule 1: Default Binding

When a function is called standalone (not as a method), `this` refers to the global object in non-strict mode, or `undefined` in strict mode.

```javascript
function showThis() {
  console.log(this);
}

// Non-strict mode
showThis(); // window (browser) or global (Node.js)

// Strict mode
function showThisStrict() {
  'use strict';
  console.log(this);
}
showThisStrict(); // undefined
```

**Why strict mode matters:**

```javascript
function Person(name) {
  // Without strict mode, forgetting 'new' corrupts global!
  this.name = name;
}

Person('Alice'); // Accidentally sets global.name = 'Alice'!

// Strict mode protects you:
function PersonStrict(name) {
  'use strict';
  this.name = name; // TypeError: Cannot set property 'name' of undefined
}
```

## Rule 2: Implicit Binding

When a function is called **as a method** of an object, `this` refers to that object.

```javascript
const user = {
  name: 'Alice',
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

user.greet(); // "Hello, I'm Alice"
// 'this' = user (the object before the dot)
```

### The Implicit Binding Pitfall

```javascript
const user = {
  name: 'Alice',
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

// ✅ Called as method - works
user.greet(); // "Hello, I'm Alice"

// ❌ Function extracted - loses 'this'
const greetFn = user.greet;
greetFn(); // "Hello, I'm undefined"
// 'this' is now global/undefined!
```

### Why this happens:

```javascript
// These are conceptually the same:
user.greet();          // 'this' = user
greetFn();             // 'this' = global (no context)

// Only the CALL SITE matters, not where function is defined
```

### Real-world example — callbacks:

```javascript
const timer = {
  seconds: 10,
  start() {
    // ❌ 'this' is lost inside setTimeout
    setTimeout(function() {
      console.log(this.seconds); // undefined (this = window)
    }, 1000);
  }
};

timer.start();
```

## Rule 3: Explicit Binding

Force `this` to be a specific object using `call`, `apply`, or `bind`.

### `call` — invoke immediately with arguments

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: 'Bob' };

greet.call(user, 'Hello', '!'); // "Hello, Bob!"
//          ^       ^      ^
//          this   arg1   arg2
```

### `apply` — invoke immediately with array of arguments

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: 'Carol' };
const args = ['Hi', '?'];

greet.apply(user, args); // "Hi, Carol?"
//           ^     ^
//           this  [arg1, arg2]
```

### `bind` — returns a NEW function with `this` locked in

```javascript
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const user = { name: 'Dave' };

const boundGreet = greet.bind(user);
boundGreet('Hey'); // "Hey, Dave"
boundGreet('Hi');  // "Hi, Dave"
// 'this' is permanently bound to user
```

### Practical uses of `bind`:

```javascript
// Fix the timer example:
const timer = {
  seconds: 10,
  start() {
    // ✅ Bind 'this' explicitly
    setTimeout(function() {
      console.log(this.seconds); // 10
    }.bind(this), 1000);
  }
};

timer.start(); // 10

// Event listeners
class Button {
  constructor(label) {
    this.label = label;
    this.clicks = 0;
    
    // Bind once in constructor
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    this.clicks++;
    console.log(`${this.label} clicked ${this.clicks} times`);
  }
  
  attach(element) {
    element.addEventListener('click', this.handleClick);
    // ✅ 'this' stays bound to Button instance
  }
}

// Partial application with bind
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2); // null = don't care about 'this'
const triple = multiply.bind(null, 3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

## Rule 4: `new` Binding

When a function is called with the `new` keyword, `this` refers to the **newly created object**.

```javascript
function Person(name, age) {
  // 'this' = new empty object {}
  this.name = name;
  this.age = age;
  // automatically returns 'this'
}

const alice = new Person('Alice', 30);
console.log(alice.name); // 'Alice'
console.log(alice.age);  // 30
```

**What `new` does:**

```javascript
// When you call: const alice = new Person('Alice', 30);
// JavaScript does this internally:

function Person(name, age) {
  // 1. Creates new object: const this = Object.create(Person.prototype);
  // 2. Executes function body with 'this' = new object
  this.name = name;
  this.age = age;
  // 3. Returns 'this' (unless function explicitly returns an object)
}
```

## Rule 5: Arrow Functions

Arrow functions **do NOT have their own `this`**. They inherit `this` from the surrounding lexical scope.

```javascript
const user = {
  name: 'Eve',
  greetNormal: function() {
    console.log(this.name); // 'Eve' ✅
  },
  greetArrow: () => {
    console.log(this.name); // undefined ❌ (this = global)
  }
};

user.greetNormal(); // 'Eve'
user.greetArrow();  // undefined
```

### Arrow functions FIX the callback problem:

```javascript
// ❌ Old solution: save 'this' in a variable
const timer1 = {
  seconds: 10,
  start() {
    const self = this; // Save reference
    setTimeout(function() {
      console.log(self.seconds); // 10
    }, 1000);
  }
};

// ✅ Modern solution: arrow function
const timer2 = {
  seconds: 10,
  start() {
    setTimeout(() => {
      console.log(this.seconds); // 10 (inherits 'this' from start())
    }, 1000);
  }
};
```

### Arrow functions in classes:

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }
  
  // ❌ Regular method — 'this' context can be lost
  incrementRegular() {
    setTimeout(function() {
      this.count++; // 'this' is undefined/window
    }, 1000);
  }
  
  // ✅ Arrow function — 'this' inherited from class
  incrementArrow() {
    setTimeout(() => {
      this.count++; // 'this' = Counter instance ✅
    }, 1000);
  }
}
```

### When NOT to use arrow functions:

```javascript
// ❌ Object methods (need their own 'this')
const obj = {
  value: 42,
  getValue: () => this.value // Wrong! 'this' = global
};

// ✅ Regular function for object methods
const obj2 = {
  value: 42,
  getValue() { return this.value; } // Correct!
};

// ❌ Constructor functions
const Person = (name) => {
  this.name = name; // TypeError: arrow functions can't be constructors
};
new Person('Alice'); // Error!

// ✅ Regular function for constructors
function PersonFn(name) {
  this.name = name;
}
new PersonFn('Alice'); // Works!
```

## Priority of `this` Rules

When multiple rules could apply, this priority order determines `this`:

```
1. new binding         (highest priority)
2. Explicit binding    (call, apply, bind)
3. Implicit binding    (method call)
4. Default binding     (lowest priority)

Special: Arrow functions (lexical 'this', ignores all rules above)
```

```javascript
function show() {
  console.log(this.name);
}

const obj1 = { name: 'obj1', show };
const obj2 = { name: 'obj2', show };

// Implicit binding
obj1.show();               // 'obj1'

// Explicit beats implicit
obj1.show.call(obj2);      // 'obj2'

// new beats explicit
function Person(name) {
  this.name = name;
}

const boundPerson = Person.bind({ name: 'bound' });
const p = new boundPerson('new binding wins'); // 'new binding wins'
// new wins!
```

## Common Patterns & Solutions

### Pattern 1: Method Shorthand

```javascript
// ❌ Old style
const api = {
  fetchUser: function() { ... }
};

// ✅ ES6 shorthand
const api = {
  fetchUser() { ... }
  // 'this' works correctly
};
```

### Pattern 2: Class Fields (Modern)

```javascript
class Button {
  label = 'Click me';
  clicks = 0;
  
  // Arrow function as class field = auto-bound!
  handleClick = () => {
    this.clicks++;
    console.log(`${this.label}: ${this.clicks}`);
  }
}

const btn = new Button();
document.addEventListener('click', btn.handleClick);
// ✅ 'this' always refers to Button instance
```

### Pattern 3: Chaining with `this`

```javascript
class QueryBuilder {
  constructor() {
    this.conditions = [];
    this.columns = '*';
  }
  
  select(cols) {
    this.columns = cols;
    return this; // Return 'this' for chaining!
  }
  
  where(condition) {
    this.conditions.push(condition);
    return this;
  }
  
  build() {
    const where = this.conditions.join(' AND ');
    return `SELECT ${this.columns}${where ? ` WHERE ${where}` : ''}`;
  }
}

const query = new QueryBuilder()
  .select('id, name')
  .where('age > 18')
  .where('active = true')
  .build();

console.log(query);
// "SELECT id, name WHERE age > 18 AND active = true"
```

## Debugging `this`

```javascript
function debugThis() {
  console.log('this is:', this);
  console.log('this.constructor:', this?.constructor?.name);
}

// Identify what 'this' is at any point:
const obj = { name: 'test', debugThis };
obj.debugThis();        // 'this' = obj
debugThis.call(window); // 'this' = window
```

## Practice Exercises

### Exercise 1: Predict the output

```javascript
const obj = {
  x: 10,
  getX() { return this.x; },
  getXArrow: () => this.x
};

console.log(obj.getX());           // ?
console.log(obj.getXArrow());      // ?

const { getX } = obj;
console.log(getX());               // ?
console.log(getX.call({ x: 99 })); // ?
```

<details>
<summary>Answer</summary>

```
10       (method call, this = obj)
undefined (arrow inherits global this)
undefined (extracted, this = global/undefined)
99        (explicit bind with call)
```

</details>

### Exercise 2: Fix the bug

```javascript
class EventHandler {
  constructor() {
    this.events = [];
  }

  addEvent(event) {
    this.events.push(event);
  }

  setup() {
    ['click', 'keydown', 'scroll'].forEach(function(eventName) {
      this.addEvent(eventName); // Bug: 'this' is undefined!
    });
  }
}

// Fix it two ways: arrow function AND bind
```

<details>
<summary>Solution</summary>

```javascript
// Arrow function fix:
setup() {
  ['click', 'keydown', 'scroll'].forEach((eventName) => {
    this.addEvent(eventName); // ✅ Arrow inherits 'this'
  });
}

// forEach thisArg fix:
setup() {
  ['click', 'keydown', 'scroll'].forEach(function(eventName) {
    this.addEvent(eventName);
  }, this); // ✅ Pass 'this' as second arg to forEach
}
```

</details>

## Key Takeaways

| Scenario | `this` value |
|----------|-------------|
| `func()` | `global` / `undefined` (strict) |
| `obj.func()` | `obj` |
| `func.call(ctx)` | `ctx` |
| `new func()` | new object |
| Arrow function | inherits from outer scope |

---

**Next:** [Lecture 4: Prototypes & Inheritance →](4-prototypes-inheritance.md)
