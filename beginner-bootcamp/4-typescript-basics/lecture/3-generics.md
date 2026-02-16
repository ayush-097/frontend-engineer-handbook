# Generics

## What Are Generics?

Generics let you write code that works with **any type** while still being fully type-safe. Without generics, you'd either write separate functions for each type (duplication), or use `any` (unsafe).

```typescript
// ❌ No generics — loses type information
function identity(value: any): any {
  return value;
}
const n = identity(42);      // type: any — not number!
const s = identity("hello"); // type: any — not string!

// ❌ Duplicate code — tedious and fragile
function identityNumber(value: number): number { return value; }
function identityString(value: string): string { return value; }

// ✅ Generics — flexible AND type-safe
function identity<T>(value: T): T {
  return value;
}
const n = identity(42);       // type: number ✅ (inferred)
const s = identity("hello");  // type: string ✅ (inferred)
const explicit = identity<boolean>(true); // type: boolean ✅ (explicit)
```

The `<T>` is a **type parameter** — a placeholder filled in when the function is called. Think of it like a function parameter, but for types.

## Generic Functions

```typescript
// Return the first element of any array
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

first([1, 2, 3]);         // type: number | undefined
first(["a", "b"]);        // type: string | undefined
first([true, false]);     // type: boolean | undefined

// Multiple type parameters
function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return a.map((item, i) => [item, b[i]]);
}

zip([1, 2, 3], ["a", "b", "c"]); // [number, string][]
zip(["x"], [true]);               // [string, boolean][]

// Generic with transformation
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

map([1, 2, 3], n => n * 2);         // number[]
map(["a", "b"], s => s.toUpperCase()); // string[]
map([1, 2, 3], n => `item-${n}`);    // string[]

// Swap tuple values
function swap<A, B>(pair: [A, B]): [B, A] {
  const [a, b] = pair;
  return [b, a];
}

swap([1, "hello"]);   // type: [string, number]
swap(["a", true]);    // type: [boolean, string]
```

## Generic Interfaces

```typescript
// Generic collection
interface Stack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  readonly size: number;
  isEmpty(): boolean;
}

class ArrayStack<T> implements Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const numStack = new ArrayStack<number>();
numStack.push(1);
numStack.push(2);
numStack.pop(); // type: number | undefined

const strStack = new ArrayStack<string>();
strStack.push("hello");
// strStack.push(42); // ❌ Error: Argument of type 'number' is not assignable to 'string'

// Generic repository pattern
interface Repository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}
```

## Generic Type Aliases

```typescript
// Pair of any two types
type Pair<A, B> = { first: A; second: B };

const coordinates: Pair<number, number> = { first: 10, second: 20 };
const labeled: Pair<string, boolean> = { first: "active", second: true };

// Result type — success or failure
type Result<T, E = Error> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

function parseJSON<T>(json: string): Result<T> {
  try {
    return { ok: true, value: JSON.parse(json) };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}

const result = parseJSON<User>('{"id":1,"name":"Alice"}');
if (result.ok) {
  result.value.name; // type: string ✅
} else {
  result.error.message; // type: string ✅
}

// Maybe/Option type
type Maybe<T> = T | null | undefined;

function getFirst<T>(arr: T[]): Maybe<T> {
  return arr[0]; // undefined if empty
}

// Tree node
type TreeNode<T> = {
  value: T;
  left?: TreeNode<T>;
  right?: TreeNode<T>;
};

const tree: TreeNode<number> = {
  value: 1,
  left: { value: 2 },
  right: { value: 3, left: { value: 4 } },
};
```

## Generic Constraints

Constrain what types `T` can be using `extends`.

```typescript
// T must have a 'length' property
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("hello", "hi");        // ✅ strings have length
longest([1, 2], [3, 4, 5]);    // ✅ arrays have length
longest(3, 4);                  // ❌ Error: number has no 'length'

// T must be an object type
function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

keys({ name: "Alice", age: 30 }); // ("name" | "age")[]
keys("hello");                    // ❌ string is not an object

// T must extend another generic type
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30, email: "alice@example.com" };
const name  = getProperty(user, "name");  // type: string
const age   = getProperty(user, "age");   // type: number
const x     = getProperty(user, "phone"); // ❌ Error: "phone" not a key of user

// Multiple constraints
function merge<T extends object, U extends object>(target: T, source: U): T & U {
  return { ...target, ...source };
}

const merged = merge({ name: "Alice" }, { age: 30 });
// type: { name: string } & { age: number }

// Constraint to constructor
function create<T>(ctor: new () => T): T {
  return new ctor();
}

class User { name = ""; }
const u = create(User); // type: User

// Constraint to array element
function flatten<T>(arr: T[][]): T[] {
  return arr.flat() as T[];
}
flatten([[1, 2], [3, 4]]); // number[]
flatten([["a"], ["b"]]);   // string[]
```

## Default Type Parameters

```typescript
// T defaults to string if not specified
interface Input<T = string> {
  value: T;
  onChange: (value: T) => void;
  validate?: (value: T) => string | null;
}

const textInput: Input = { // T = string (default)
  value: "hello",
  onChange: (v) => console.log(v.toUpperCase()), // v: string
};

const numberInput: Input<number> = { // T = number
  value: 42,
  onChange: (v) => console.log(v.toFixed(2)), // v: number
};

// Multiple defaults
interface ApiConfig<
  TResponse = unknown,
  TError = Error,
  TBody = Record<string, unknown>
> {
  url: string;
  body?: TBody;
  onSuccess: (data: TResponse) => void;
  onError: (err: TError) => void;
}
```

## Generic Classes

```typescript
class EventEmitter<Events extends Record<string, unknown[]>> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(
    event: K,
    listener: (...args: Events[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(
    event: K,
    listener: (...args: Events[K]) => void
  ): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    this.listeners.get(event)?.forEach(fn => fn(...args));
  }
}

// Usage — fully typed!
type AppEvents = {
  "user:login":   [user: User];
  "user:logout":  [];
  "message:new":  [message: string, sender: User];
  "error":        [error: Error];
};

const emitter = new EventEmitter<AppEvents>();

// TypeScript knows exactly what arguments each event carries:
emitter.on("user:login", (user) => {
  console.log(user.name); // user: User ✅
});

emitter.emit("user:login", { id: 1, name: "Alice", email: "" }); // ✅
emitter.emit("user:logout");                                       // ✅ (no args)
emitter.emit("message:new", "Hello!", { id: 2, name: "Bob", email: "" }); // ✅
emitter.emit("user:login", 42); // ❌ Error: number is not User
```

## Generic Utility Functions

```typescript
// Type-safe Object.entries
function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

// Type-safe Object.fromEntries
function fromEntries<K extends PropertyKey, V>(
  entries: [K, V][]
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

// Pick properties from object
function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(k => { result[k] = obj[k]; });
  return result;
}

const user = { id: 1, name: "Alice", email: "a@b.com", password: "secret" };
const safe = pick(user, ["id", "name", "email"]);
// type: { id: number; name: string; email: string } — password excluded!

// Omit properties
function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(k => delete result[k]);
  return result as Omit<T, K>;
}

const withoutPassword = omit(user, ["password"]);

// Deep readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Group by
function groupBy<T, K extends PropertyKey>(
  items: T[],
  getKey: (item: T) => K
): Partial<Record<K, T[]>> {
  const result: Partial<Record<K, T[]>> = {};
  items.forEach(item => {
    const key = getKey(item);
    (result[key] ??= []).push(item);
  });
  return result;
}

const grouped = groupBy(users, u => u.role);
// type: Partial<Record<string, User[]>>
```

## Generic React Components

```typescript
// A generic list component that works with any item type
interface ListProps<T> {
  items: T[];
  getKey: (item: T) => string | number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

function List<T>({ items, getKey, renderItem, emptyMessage }: ListProps<T>) {
  if (items.length === 0) {
    return <p>{emptyMessage ?? "No items"}</p>;
  }
  return (
    <ul>
      {items.map((item, i) => (
        <li key={getKey(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}

// Usage — TypeScript infers T from items prop
<List
  items={users}
  getKey={u => u.id}               // u: User ✅
  renderItem={(u, i) => u.name}    // u: User ✅
/>

<List
  items={[1, 2, 3]}
  getKey={n => n}                  // n: number ✅
  renderItem={n => `Item ${n}`}    // n: number ✅
/>

// Generic Select/Dropdown
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
}

function Select<T>(props: SelectProps<T>) { ... }
```

## Conditional Types in Depth

```typescript
// Unwrap a Promise
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
type A = Awaited<Promise<string>>;          // string
type B = Awaited<Promise<Promise<number>>>; // number (recursive!)

// Function parameter types
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;

function fetchUser(id: number): Promise<User> { ... }
type FetchParams = Parameters<typeof fetchUser>; // [id: number]
type FetchReturn = ReturnType<typeof fetchUser>; // Promise<User>

// Filter union members
type NonNullable<T> = T extends null | undefined ? never : T;
type X = NonNullable<string | null | undefined>; // string

// Extract / Exclude
type Extract<T, U> = T extends U ? T : never;
type Exclude<T, U> = T extends U ? never : T;

type Nums = Extract<string | number | boolean, number>;  // number
type NoNums = Exclude<string | number | boolean, number>; // string | boolean
```

## Practice Exercises

### Exercise 1: Generic cache

```typescript
// Build a Cache<K, V> class that:
// - Stores key-value pairs
// - Has get(key: K): V | undefined
// - Has set(key: K, value: V): void
// - Has a TTL (time-to-live) per entry
// - Has getOrSet(key: K, factory: () => V): V (create if missing)
class Cache<K, V> {
  // TODO
}
```

### Exercise 2: Pipeline

```typescript
// Create a pipe() function that chains functions together
// Each function's output becomes the next function's input
// The types should flow through correctly

function pipe<A, B>(fn1: (a: A) => B): (a: A) => B;
function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;
function pipe<A, B, C, D>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D
): (a: A) => D;
// Implementation:
function pipe(...fns: Function[]) {
  return (input: unknown) => fns.reduce((v, fn) => fn(v), input);
}

// Usage should be fully typed:
const process = pipe(
  (n: number) => n * 2,        // number → number
  (n: number) => `${n}px`,     // number → string
  (s: string) => s.toUpperCase() // string → string
);
const result = process(5); // type: string, value: "10PX"
```

## Key Takeaways

- Generics let functions/classes work with any type while preserving type safety
- `<T>` is inferred from usage — you rarely need explicit `<string>` calls
- Constraints (`T extends Something`) limit what types are accepted
- Generic classes/interfaces model containers, repositories, event systems
- Conditional types (`T extends U ? X : Y`) enable type-level computation
- Default type parameters (`T = string`) simplify common use cases
- React components with generics enable fully-typed reusable UI

---

**Next:** [Lecture 4: Utility Types →](4-utility-types.md)
