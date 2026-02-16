# The TypeScript Type System

## Why TypeScript?

JavaScript has dynamic typing — types are checked at runtime. TypeScript adds a **static type checker** that runs at compile time, before the code ever executes.

```javascript
// JavaScript — discovers the bug at runtime
function greet(user) {
  return user.name.toUpperCase(); // Crashes if user is undefined!
}

greet(); // TypeError: Cannot read properties of undefined (reading 'name')
```

```typescript
// TypeScript — catches the bug at edit time
function greet(user: { name: string }) {
  return user.name.toUpperCase(); // ✅ Safe — TypeScript guarantees name exists
}

greet(); // Error: Expected 1 arguments, but got 0. ← editor underlines this!
```

**What TypeScript gives you:**
- Bugs caught before running the code
- Autocomplete based on actual types (not guesses)
- Safe refactoring — rename a property, TypeScript shows every usage that breaks
- Self-documenting APIs — function signatures tell you exactly what they accept

## TypeScript is a Superset

Every valid JavaScript file is valid TypeScript. You can add types gradually.

```
JavaScript ⊂ TypeScript

Valid JS → Valid TS (always)
Valid TS → Compiled to JS (always)
```

## Primitive Types

```typescript
// Boolean
let isDone: boolean = false;

// Number (no separate integer/float)
let age: number = 30;
let price: number = 9.99;
let hex: number = 0xFF;

// String
let name: string = "Alice";
let template: string = `Hello, ${name}!`;

// null and undefined
let n: null = null;
let u: undefined = undefined;

// bigint
let big: bigint = 100n;

// symbol
let sym: symbol = Symbol("id");

// any — opt out of type checking (avoid!)
let anything: any = 42;
anything = "now a string"; // No error — dangerous

// unknown — safer than any; must narrow before use
let value: unknown = getData();
if (typeof value === "string") {
  value.toUpperCase(); // ✅ Safe — narrowed to string
}
// value.toUpperCase(); // ❌ Error — not narrowed yet

// never — value that never exists (empty union, unreachable code)
function throwError(message: string): never {
  throw new Error(message);
  // No return — 'never' means this path never completes normally
}
```

## Type Inference

TypeScript infers types from context — you don't always need annotations.

```typescript
// TypeScript infers 'string' from the literal value
let name = "Alice"; // type: string
name = 42; // ❌ Error: Type 'number' is not assignable to type 'string'

// Inferred from return value
function add(a: number, b: number) {
  return a + b; // return type inferred as 'number'
}

const result = add(1, 2); // type: number

// Array inference
const numbers = [1, 2, 3]; // type: number[]
const mixed = [1, "two", true]; // type: (number | string | boolean)[]

// Object inference
const user = { name: "Alice", age: 30 };
// type: { name: string; age: number }

user.name = "Bob"; // ✅
user.age = "thirty"; // ❌ Error: not a number
```

## Explicit Annotations

When to use explicit annotations:
- Function parameters (TypeScript cannot infer from call sites)
- When you want to document intent
- When inference gives you too broad a type

```typescript
// Parameters always need annotation — TS can't infer them
function greet(name: string, age: number): string {
  return `Hello, ${name}! You are ${age} years old.`;
}

// Return type annotation (optional but recommended for public APIs)
function parseUser(json: string): { id: number; name: string } {
  return JSON.parse(json);
}

// Variable annotation when value isn't available yet
let currentUser: { id: number; name: string } | null = null;
// Later:
currentUser = { id: 1, name: "Alice" };
```

## Arrays and Tuples

```typescript
// Array — elements of same type
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ["a", "b", "c"]; // Generic syntax

// Readonly array — can't be modified
const fixed: readonly number[] = [1, 2, 3];
// fixed.push(4); // ❌ Error

// Tuple — fixed length, known types at each position
const point: [number, number] = [10, 20];
const entry: [string, number] = ["age", 30];

// Named tuple elements (TypeScript 4.0+)
type Range = [start: number, end: number];
const range: Range = [0, 100];

// Optional tuple element
type Optionals = [string, number?]; // second element optional
const a: Optionals = ["hello"];      // ✅
const b: Optionals = ["hello", 42];  // ✅

// Rest elements in tuples
type StringsThenNumber = [...string[], number];
const c: StringsThenNumber = ["a", "b", 3]; // ✅
```

## Objects

```typescript
// Inline object type
function printUser(user: { name: string; age: number; email?: string }) {
  // email is optional — might be undefined
  console.log(user.name, user.email?.toLowerCase());
}

// Optional properties with ?
type User = {
  id: number;
  name: string;
  email?: string;     // Optional — may be undefined
};

// Readonly properties
type Config = {
  readonly apiUrl: string; // Cannot be reassigned after initialization
  timeout: number;
};

const config: Config = { apiUrl: "https://api.example.com", timeout: 5000 };
// config.apiUrl = "other"; // ❌ Error: Cannot assign to 'apiUrl' (read-only)

// Index signatures — for dynamic keys
type StringMap = {
  [key: string]: string; // Any string key maps to string value
};

const headers: StringMap = {
  "Content-Type": "application/json",
  "Authorization": "Bearer token123",
};
```

## Union Types

A value that can be one of several types.

```typescript
// Basic union
let id: string | number;
id = "abc"; // ✅
id = 42;    // ✅
id = true;  // ❌ Error

// Union with null (common pattern)
function findUser(id: number): User | null {
  // Returns user or null if not found
}

// Discriminated unions — the most powerful pattern
type LoadingState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: Error };

function renderState(state: LoadingState) {
  switch (state.status) {
    case "idle":    return <div>Ready</div>;
    case "loading": return <Spinner />;
    case "success": return <UserCard user={state.data} />; // data available here!
    case "error":   return <Error msg={state.error.message} />; // error available!
  }
}

// Literal types — only specific values allowed
type Direction = "north" | "south" | "east" | "west";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type StatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500;

function navigate(dir: Direction) { ... }
navigate("north"); // ✅
navigate("up");    // ❌ Error: Argument of type '"up"' is not assignable
```

## Type Narrowing

TypeScript tracks which type is active based on runtime checks.

```typescript
function process(value: string | number) {
  // At this point: value is string | number

  if (typeof value === "string") {
    // Here: value is string
    return value.toUpperCase();
  }
  // Here: value is number (string eliminated by if branch)
  return value.toFixed(2);
}

// instanceof narrowing
function format(input: Date | string) {
  if (input instanceof Date) {
    return input.toISOString(); // input: Date
  }
  return input;                 // input: string
}

// in operator narrowing
type Cat = { meow(): void };
type Dog = { bark(): void };

function makeNoise(animal: Cat | Dog) {
  if ("meow" in animal) {
    animal.meow(); // animal: Cat
  } else {
    animal.bark(); // animal: Dog
  }
}

// Truthiness narrowing
function greet(name: string | null) {
  if (name) {
    // name: string (null is falsy, eliminated)
    console.log(`Hello, ${name}!`);
  } else {
    console.log("Hello, stranger!");
  }
}

// Type predicates — user-defined type guards
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processUnknown(value: unknown) {
  if (isString(value)) {
    value.toUpperCase(); // ✅ TypeScript knows it's string
  }
}

// Assertion functions
function assertDefined<T>(val: T | null | undefined, msg: string): asserts val is T {
  if (val == null) throw new Error(msg);
}

function process(user: User | null) {
  assertDefined(user, "User is required");
  user.name; // ✅ TypeScript knows user is not null after assertDefined
}
```

## Enums

```typescript
// Numeric enum (auto-increments)
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}
Direction.Up;    // 0
Direction[0];    // "Up" (reverse mapping)

// String enum (preferred — values are meaningful in debug)
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING",
}
Status.Active; // "ACTIVE"

// Const enum — inlined at compile time (zero runtime cost)
const enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}
// let c = Color.Red; → compiled to: let c = "RED";

// Modern alternative: literal union (often preferred over enums)
type Direction2 = "up" | "down" | "left" | "right";
```

## Functions

```typescript
// Full function annotation
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

// Default parameters
function createUser(name: string, role: string = "user") { ... }

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

// Function type
type BinaryOp = (a: number, b: number) => number;
const add: BinaryOp = (a, b) => a + b;

// Overloads — multiple signatures for the same function
function format(value: number): string;
function format(value: string): string;
function format(value: number | string): string {
  if (typeof value === "number") return value.toFixed(2);
  return value.trim();
}

format(42);      // ✅ uses first overload
format("hello"); // ✅ uses second overload
format(true);    // ❌ Error — no matching overload

// Void and never
function logMessage(msg: string): void {
  console.log(msg);
  // Returns undefined implicitly — void means "ignore the return value"
}

function fail(msg: string): never {
  throw new Error(msg); // Never returns normally
}
```

## The `tsconfig.json`

```json
{
  "compilerOptions": {
    // Target output
    "target": "ES2022",           // Output JS version
    "module": "ESNext",           // Module system
    "moduleResolution": "bundler",// How imports are resolved

    // Output
    "outDir": "./dist",           // Compiled output folder
    "rootDir": "./src",           // Source files folder
    "declaration": true,          // Generate .d.ts files
    "sourceMap": true,            // Generate source maps

    // Strictness (ALWAYS enable these)
    "strict": true,               // Enables all strict checks below:
    // "noImplicitAny": true,     // Error on 'any' without annotation
    // "strictNullChecks": true,  // null/undefined not assignable to other types
    // "strictFunctionTypes": true,
    // "strictBindCallApply": true,
    // "noImplicitThis": true,

    // Additional checks (recommended)
    "noUnusedLocals": true,       // Error on unused variables
    "noUnusedParameters": true,   // Error on unused function params
    "noImplicitReturns": true,    // Error if not all code paths return
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true, // undefined ≠ missing property

    // Library types
    "lib": ["ES2022", "DOM"],
    "types": ["node"]             // @types packages to include
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## `strict` Mode — Understanding What It Enables

```typescript
// Without strict (dangerous defaults):
let name; // type: any — no error
name = 42; // fine
name.toUpperCase(); // fine at compile time, crashes at runtime!

function getUser(): User {
  // If you forget a return path — no error without noImplicitReturns
}

// ─── strictNullChecks ────────────────────────────────────────────────────────
// Without: null and undefined assignable to everything
// With: null/undefined must be handled explicitly

// ❌ Without strictNullChecks — type: string (null is silently included)
let user: string = null; // Allowed!

// ✅ With strictNullChecks
let name: string = null;  // ❌ Error: null is not assignable to string
let name2: string | null = null; // ✅ Explicit about nullability

// ─── noImplicitAny ───────────────────────────────────────────────────────────
// ❌ Without — TypeScript silently treats unannotated params as 'any'
function process(data) { return data.name; } // data: any — no safety!

// ✅ With noImplicitAny — must annotate
function process(data: User) { return data.name; } // ✅

// ─── exactOptionalPropertyTypes ──────────────────────────────────────────────
type Profile = { bio?: string };

// Without: { bio: undefined } is assignable to Profile
// With: setting a property to undefined is different from omitting it
const p: Profile = { bio: undefined }; // ❌ Error with exactOptionalPropertyTypes
const p2: Profile = {}; // ✅ Property omitted
```

## Type Assertions

When you know more than TypeScript does — use sparingly.

```typescript
// 'as' assertion
const input = document.querySelector("#email") as HTMLInputElement;
input.value; // ✅ TypeScript now knows it's an input

// Non-null assertion operator !
const button = document.querySelector(".btn")!; // Tell TS it won't be null
button.addEventListener("click", handler); // ✅

// Double assertion (escape hatch — avoid)
const dangerous = (someValue as unknown) as string; // Bypasses type system!

// Const assertions — narrow literals to their exact type
const config = {
  endpoint: "https://api.example.com",
  retries: 3,
} as const;
// type: { readonly endpoint: "https://api.example.com"; readonly retries: 3 }
// NOT { endpoint: string; retries: number }

config.endpoint; // type: "https://api.example.com" (literal, not string)
config.retries = 5; // ❌ Error — readonly
```

## Practice Exercises

### Exercise 1: Fix the types

```typescript
// Make this type-safe — no 'any', strict null checks, all paths return
function processInput(input) {
  if (input.type === "number") {
    return input.value * 2;
  }
  if (input.type === "string") {
    return input.value.toUpperCase();
  }
  // Missing case!
}
```

### Exercise 2: Discriminated union

```typescript
// Model an API response that can be loading, success (with data), or error
// Then write a function that handles all three cases
type ApiResponse<T> = // TODO

function handleResponse<T>(response: ApiResponse<T>): void {
  // TODO — TypeScript should error if any case is unhandled
}
```

## Key Takeaways

- TypeScript types are **erased** at runtime — no runtime overhead
- **Type inference** means you don't annotate everything — only where needed
- **strict mode** (`"strict": true`) catches the most bugs — always enable it
- `unknown` is safer than `any` — force yourself to narrow before using
- **Discriminated unions** + `switch` are the cleanest way to model state
- **Type narrowing** — TypeScript tracks which type is active in each branch
- `as const` narrows literals to their exact values (great for config objects)

---

**Next:** [Lecture 2: Interfaces & Type Aliases →](2-interfaces-types.md)
