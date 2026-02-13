# Prototypes & Inheritance

## JavaScript's Inheritance Model

Unlike class-based languages (Java, C++), JavaScript uses **prototypal inheritance**. Every object has an internal link to another object called its **prototype**, forming a **prototype chain**.

```javascript
const obj = { name: 'Alice' };

// obj's internal [[Prototype]] points to Object.prototype
// Object.prototype's [[Prototype]] is null (end of chain)

console.log(obj.toString()); // "[object Object]"
// 'toString' not on obj → found on Object.prototype
```

## The Prototype Chain

```javascript
const animal = {
  breathe() {
    return 'breathing...';
  }
};

const dog = {
  bark() {
    return 'Woof!';
  }
};

// Set animal as prototype of dog
Object.setPrototypeOf(dog, animal);

console.log(dog.bark());    // 'Woof!' (own property)
console.log(dog.breathe()); // 'breathing...' (from prototype)
console.log(dog.toString()); // '[object Object]' (from Object.prototype)

// The chain: dog → animal → Object.prototype → null
```

**Property lookup:**

```
dog.breathe()
  ↓ Not on dog
  ↓ Check dog's [[Prototype]] → animal
  ↓ Found! Execute it.
```

## `__proto__` vs `Object.getPrototypeOf`

```javascript
const parent = { greet() { return 'Hello!'; } };
const child = Object.create(parent);

// Reading prototype (3 ways):
console.log(Object.getPrototypeOf(child) === parent); // true ✅ (preferred)
console.log(child.__proto__ === parent);               // true (legacy, avoid)

// Setting prototype:
Object.setPrototypeOf(child, parent);  // ✅ Preferred
child.__proto__ = parent;              // ❌ Avoid (performance issues)
```

## Constructor Functions

Before ES6 classes, constructor functions created objects with shared prototypes.

```javascript
function Animal(name, sound) {
  // Instance properties (unique per instance)
  this.name = name;
  this.sound = sound;
}

// Prototype methods (shared across all instances)
Animal.prototype.speak = function() {
  return `${this.name} says ${this.sound}!`;
};

Animal.prototype.toString = function() {
  return `Animal(${this.name})`;
};

// Create instances
const cat = new Animal('Whiskers', 'meow');
const dog = new Animal('Rex', 'woof');

console.log(cat.speak()); // "Whiskers says meow!"
console.log(dog.speak()); // "Rex says woof!"

// Shared prototype — method defined ONCE
console.log(cat.speak === dog.speak); // true ✅ (memory efficient)
```

### Memory efficiency:

```javascript
// ❌ BAD: Method defined inside constructor (new copy per instance!)
function BadAnimal(name) {
  this.name = name;
  this.speak = function() { // New function object EVERY time!
    return this.name;
  };
}

// ✅ GOOD: Method on prototype (shared reference)
function GoodAnimal(name) {
  this.name = name;
}
GoodAnimal.prototype.speak = function() {
  return this.name;
};

const a1 = new BadAnimal('Cat');
const a2 = new BadAnimal('Dog');
console.log(a1.speak === a2.speak); // false — different function objects!

const b1 = new GoodAnimal('Cat');
const b2 = new GoodAnimal('Dog');
console.log(b1.speak === b2.speak); // true — same function object!
```

## Prototypal Inheritance with Constructor Functions

```javascript
// Parent constructor
function Animal(name) {
  this.name = name;
}

Animal.prototype.breathe = function() {
  return `${this.name} is breathing`;
};

// Child constructor
function Dog(name, breed) {
  Animal.call(this, name); // Call parent constructor
  this.breed = breed;
}

// Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // Fix constructor reference

// Add Dog-specific methods
Dog.prototype.bark = function() {
  return `${this.name} says Woof!`;
};

const rex = new Dog('Rex', 'Labrador');
console.log(rex.bark());    // "Rex says Woof!"
console.log(rex.breathe()); // "Rex is breathing" (inherited!)
console.log(rex instanceof Dog);    // true
console.log(rex instanceof Animal); // true
```

## ES6 Classes

Classes are **syntactic sugar** over prototypal inheritance. Under the hood, it's the same prototype chain.

```javascript
class Animal {
  constructor(name) {
    this.name = name; // Instance property
  }
  
  speak() { // Added to Animal.prototype
    return `${this.name} makes a sound`;
  }
  
  toString() {
    return `Animal(${this.name})`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Calls Animal constructor
    this.breed = breed;
  }
  
  speak() { // Overrides Animal.speak
    return `${this.name} barks!`;
  }
  
  fetch(item) {
    return `${this.name} fetches the ${item}!`;
  }
}

const rex = new Dog('Rex', 'Labrador');
console.log(rex.speak());     // "Rex barks!" (overridden)
console.log(rex.fetch('ball')); // "Rex fetches the ball!"

// Check the chain
console.log(rex instanceof Dog);    // true
console.log(rex instanceof Animal); // true
```

### Classes are still prototypes:

```javascript
class Animal {
  speak() { return 'sound'; }
}

// Proof: methods are on the prototype
console.log(typeof Animal);                 // 'function'
console.log(Animal.prototype.speak);        // [Function: speak]

const a = new Animal();
console.log(Object.getPrototypeOf(a) === Animal.prototype); // true
```

## Static Methods & Properties

```javascript
class MathUtils {
  static PI = 3.14159;
  
  static add(a, b) { return a + b; }
  static multiply(a, b) { return a * b; }
}

// Called on the CLASS, not instances
console.log(MathUtils.PI);          // 3.14159
console.log(MathUtils.add(2, 3));   // 5

// ❌ Not available on instances
const m = new MathUtils();
console.log(m.add); // undefined
```

### Real-world static use:

```javascript
class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
  
  // Static factory method — alternative constructor
  static fromJSON(json) {
    const data = JSON.parse(json);
    return new User(data.id, data.name, data.email);
  }
  
  // Static validation
  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  toJSON() {
    return JSON.stringify({ id: this.id, name: this.name, email: this.email });
  }
}

const user = User.fromJSON('{"id":1,"name":"Alice","email":"alice@example.com"}');
console.log(User.isValidEmail('alice@example.com')); // true
```

## Private Fields (Modern JavaScript)

```javascript
class BankAccount {
  #balance;          // Private field
  #transactionLog;   // Private field
  
  constructor(initialBalance) {
    this.#balance = initialBalance;
    this.#transactionLog = [];
  }
  
  deposit(amount) {
    if (amount <= 0) throw new Error('Amount must be positive');
    this.#balance += amount;
    this.#log('deposit', amount);
  }
  
  withdraw(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds');
    this.#balance -= amount;
    this.#log('withdrawal', amount);
  }
  
  get balance() {
    return this.#balance;
  }
  
  get history() {
    return [...this.#transactionLog]; // Return copy
  }
  
  #log(type, amount) { // Private method
    this.#transactionLog.push({ type, amount, date: new Date() });
  }
}

const account = new BankAccount(100);
account.deposit(50);
account.withdraw(30);

console.log(account.balance); // 120
// account.#balance; // SyntaxError: Private field!
```

## Getters & Setters

```javascript
class Temperature {
  #celsius;
  
  constructor(celsius) {
    this.#celsius = celsius;
  }
  
  get fahrenheit() {
    return this.#celsius * 9/5 + 32;
  }
  
  set fahrenheit(value) {
    this.#celsius = (value - 32) * 5/9;
  }
  
  get celsius() {
    return this.#celsius;
  }
  
  set celsius(value) {
    if (value < -273.15) throw new Error('Below absolute zero!');
    this.#celsius = value;
  }
}

const temp = new Temperature(0);
console.log(temp.celsius);    // 0
console.log(temp.fahrenheit); // 32

temp.fahrenheit = 212;
console.log(temp.celsius); // 100
```

## Mixins — Sharing Behavior Without Inheritance

JavaScript only allows single inheritance. Mixins let you compose behavior from multiple sources.

```javascript
// Mixin factory functions
const Serializable = (Base) => class extends Base {
  serialize() {
    return JSON.stringify(this);
  }
  
  static deserialize(json) {
    return Object.assign(new this(), JSON.parse(json));
  }
};

const Validatable = (Base) => class extends Base {
  validate() {
    const errors = [];
    
    if (!this.name || this.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

const Timestamped = (Base) => class extends Base {
  constructor(...args) {
    super(...args);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
  
  touch() {
    this.updatedAt = new Date();
  }
};

// Compose with mixins
class Entity {
  constructor(name) {
    this.name = name;
  }
}

class User extends Serializable(Validatable(Timestamped(Entity))) {
  constructor(name, email) {
    super(name);
    this.email = email;
  }
}

const user = new User('Alice', 'alice@example.com');
console.log(user.validate().isValid); // true
console.log(user.serialize());        // JSON string
console.log(user.createdAt);          // Date
```

## Composition Over Inheritance

The most important pattern: **prefer object composition over deep inheritance hierarchies**.

```javascript
// ❌ Deep inheritance — fragile
class Vehicle { }
class Car extends Vehicle { }
class ElectricCar extends Car { }
class SelfDrivingElectricCar extends ElectricCar { }
// Changes to any parent break all children!

// ✅ Composition — flexible
const canDrive = (state) => ({
  drive: () => `${state.name} is driving`
});

const canFly = (state) => ({
  fly: () => `${state.name} is flying`
});

const canCharge = (state) => ({
  charge: () => `${state.name} is charging`
});

function createElectricCar(name) {
  const state = { name };
  return {
    ...state,
    ...canDrive(state),
    ...canCharge(state)
  };
}

function createFlyingCar(name) {
  const state = { name };
  return {
    ...state,
    ...canDrive(state),
    ...canFly(state)
  };
}

const tesla = createElectricCar('Tesla');
console.log(tesla.drive());  // "Tesla is driving"
console.log(tesla.charge()); // "Tesla is charging"
```

## `Object.create` — Direct Prototype Setting

```javascript
// Create an object with a specific prototype
const animal = {
  init(name) {
    this.name = name;
    return this; // for chaining
  },
  speak() {
    return `${this.name} makes a sound`;
  }
};

const dog = Object.create(animal);
dog.bark = function() {
  return `${this.name} barks!`;
};

dog.init('Rex').bark(); // "Rex barks!"
dog.speak();            // "Rex makes a sound"

// Object.create(null) — no prototype at all!
const pureMap = Object.create(null);
pureMap.key = 'value';
// No inherited methods — useful for pure data maps
```

## `instanceof` & `Object.prototype.isPrototypeOf`

```javascript
class Animal {}
class Dog extends Animal {}
class Cat extends Animal {}

const rex = new Dog();

console.log(rex instanceof Dog);    // true
console.log(rex instanceof Animal); // true (chain!)
console.log(rex instanceof Cat);    // false

// More explicit:
console.log(Animal.prototype.isPrototypeOf(rex)); // true
console.log(Cat.prototype.isPrototypeOf(rex));    // false
```

## Practice Exercises

### Exercise 1: Build a prototype chain

```javascript
// Create Animal → Mammal → Dog chain
// - Animal: breathe(), eat()
// - Mammal: warm-blooded info, nurse()
// - Dog: bark(), fetch()
// Use both constructor functions AND classes
```

### Exercise 2: Private bank account

```javascript
// Build a BankAccount class with:
// - Private #balance
// - deposit(amount)
// - withdraw(amount) with validation
// - transfer(amount, toAccount)
// - get statements() — array of transactions
// Make it impossible to set balance directly
```

## Key Takeaways

- Every object has a `[[Prototype]]` — a link to another object
- Property lookup follows the chain until found or `null`
- Classes are syntactic sugar over prototype-based inheritance
- `new` creates objects linked to `Constructor.prototype`
- Use composition over deep inheritance
- Private fields (`#`) enforce encapsulation

---

**Next:** [Lecture 5: Async Programming →](5-async-programming.md)
