# Interfaces & Type Aliases

## Two Ways to Define Object Shapes

TypeScript gives you two constructs for defining types: `interface` and `type`. They overlap significantly but have distinct strengths.

```typescript
// Interface
interface User {
  id: number;
  name: string;
  email: string;
}

// Type alias
type User = {
  id: number;
  name: string;
  email: string;
};

// Both work identically for object shapes:
const alice: User = { id: 1, name: "Alice", email: "alice@example.com" };
```

## Interfaces — Declaration Merging

Interfaces can be declared multiple times — TypeScript merges them. This is unique to `interface`.

```typescript
// Useful for extending third-party types
interface Window {
  myAnalytics: AnalyticsClient; // Add to the global Window type
}

// Or splitting large interfaces across files
interface ApiClient {
  get<T>(url: string): Promise<T>;
}

interface ApiClient {
  post<T>(url: string, body: unknown): Promise<T>;
  delete(url: string): Promise<void>;
}

// Merged result — ApiClient now has all three methods
const client: ApiClient = { get, post, delete: del };
```

## Type Aliases — Union, Intersection, Mapped, Conditional

`type` can express things `interface` cannot:

```typescript
// Union type alias
type ID = string | number;
type Status = "active" | "inactive" | "pending";

// Intersection — combine multiple types
type AdminUser = User & { permissions: string[]; lastLogin: Date };

// Mapped type
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// Conditional type
type IsArray<T> = T extends unknown[] ? true : false;

// These are impossible with interface
```

## When to Use Which

| Use Case | `interface` | `type` |
|----------|-------------|--------|
| Object shapes | ✅ | ✅ |
| Declaration merging | ✅ | ❌ |
| `extends` keyword | ✅ | ❌ |
| Unions / intersections | ❌ | ✅ |
| Mapped / conditional types | ❌ | ✅ |
| Primitive aliases | ❌ | ✅ |

**Rule of thumb:** Use `interface` for public API object shapes (extensible). Use `type` for unions, intersections, and complex transformations.

## Interface Inheritance

```typescript
interface Animal {
  name: string;
  age: number;
}

interface Pet extends Animal {
  owner: string;
}

interface ServiceDog extends Pet {
  certificationId: string;
  tasks: string[];
}

const rex: ServiceDog = {
  name: "Rex",
  age: 3,
  owner: "Alice",
  certificationId: "SD-2024-001",
  tasks: ["guide", "alert"],
};

// Multiple inheritance
interface Flyable { fly(): void; }
interface Swimmable { swim(): void; }

interface Duck extends Animal, Flyable, Swimmable {
  quack(): void;
}
```

## Intersection Types

Combine multiple types — the result has ALL properties of ALL types.

```typescript
type WithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

type WithId = {
  id: number;
};

type BaseEntity = WithId & WithTimestamps;

type User = BaseEntity & {
  name: string;
  email: string;
};

// User must have: id, createdAt, updatedAt, name, email

// Practical pattern — adding metadata to any type
type WithMeta<T> = T & {
  _meta: {
    source: string;
    version: number;
  };
};

type ApiUser = WithMeta<User>;
// Must have all User props + _meta
```

## Discriminated Unions — The Most Important Pattern

A union where each member has a **literal discriminant field** that TypeScript can use to narrow.

```typescript
// ─── Modeling async state ────────────────────────────────────────────────────

type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error; retryCount: number };

function renderUserState(state: AsyncState<User>) {
  switch (state.status) {
    case "idle":
      return "Ready to load";

    case "loading":
      return "Loading...";

    case "success":
      // TypeScript narrows: state.data is User
      return `Hello, ${state.data.name}`;

    case "error":
      // TypeScript narrows: state.error and state.retryCount available
      return `Error: ${state.error.message} (attempt ${state.retryCount})`;
  }
  // TypeScript knows all cases are handled — no default needed!
}

// ─── Exhaustiveness checking ──────────────────────────────────────────────────

// Add a 'never' check to catch missed cases at compile time
function exhaustiveCheck(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":   return Math.PI * shape.radius ** 2;
    case "square":   return shape.side ** 2;
    case "triangle": return 0.5 * shape.base * shape.height;
    default:         return exhaustiveCheck(shape); // Compile error if case missed!
  }
}

// If you add a new shape variant and forget to handle it,
// TypeScript errors: "Argument of type 'Rectangle' is not assignable to 'never'"
```

## Classes and Interfaces

```typescript
// Interface defining a contract
interface Repository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
}

// Class implementing the interface
class UserRepository implements Repository<User> {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findById(id: number): Promise<User | null> {
    return this.db.query("SELECT * FROM users WHERE id = $1", [id]);
  }

  async findAll(): Promise<User[]> {
    return this.db.query("SELECT * FROM users");
  }

  async save(user: User): Promise<User> {
    if (user.id) {
      return this.db.query("UPDATE users SET ...", [user]);
    }
    return this.db.query("INSERT INTO users ...", [user]);
  }

  async delete(id: number): Promise<void> {
    await this.db.query("DELETE FROM users WHERE id = $1", [id]);
  }
}

// Multiple interface implementation
interface Serializable {
  serialize(): string;
}

interface Validatable {
  validate(): { isValid: boolean; errors: string[] };
}

class FormModel implements Serializable, Validatable {
  serialize() { return JSON.stringify(this); }
  validate() { return { isValid: true, errors: [] }; }
}
```

## Class Visibility Modifiers

```typescript
class BankAccount {
  // public — default, accessible everywhere
  public readonly id: number;

  // private — only this class (compile-time only)
  private balance: number;

  // protected — this class and subclasses
  protected owner: string;

  // # — truly private (JavaScript runtime enforcement)
  #secretKey: string;

  constructor(id: number, owner: string, initialBalance: number) {
    this.id = id;
    this.owner = owner;
    this.balance = initialBalance;
    this.#secretKey = crypto.randomUUID();
  }

  // Parameter shorthand — creates and assigns properties automatically
  // (instead of this.x = x in constructor body)
  // constructor(
  //   public readonly id: number,
  //   protected owner: string,
  //   private balance: number,
  // ) {}

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.balance += amount;
  }

  get currentBalance(): number {
    return this.balance;
  }
}

class SavingsAccount extends BankAccount {
  private interestRate: number;

  constructor(id: number, owner: string, balance: number, rate: number) {
    super(id, owner, balance);
    this.interestRate = rate;
  }

  applyInterest(): void {
    // this.balance; // ❌ Error — private, not accessible in subclass
    // this.owner;   // ✅ protected — accessible in subclass
    this.deposit(this.currentBalance * this.interestRate);
  }
}
```

## Abstract Classes

```typescript
abstract class Renderer {
  // Subclasses MUST implement this
  abstract render(element: VNode): HTMLElement;

  // Shared implementation
  mount(element: VNode, container: HTMLElement): void {
    const dom = this.render(element); // Calls the subclass implementation
    container.appendChild(dom);
  }

  unmount(container: HTMLElement): void {
    container.innerHTML = "";
  }
}

class DOMRenderer extends Renderer {
  render(element: VNode): HTMLElement {
    const el = document.createElement(element.tag);
    el.textContent = element.text ?? "";
    return el;
  }
}

// const r = new Renderer(); // ❌ Error — cannot instantiate abstract class
const r = new DOMRenderer(); // ✅
r.mount(vnode, document.getElementById("app")!);
```

## Index Signatures and Record Types

```typescript
// Index signature — dynamic keys of a known type
interface StringMap {
  [key: string]: string;
}

const headers: StringMap = {
  "Content-Type": "application/json",
  "X-Request-Id": "abc123",
};

// Problem: allows any value, not just the indexed type
interface Problematic {
  [key: string]: number;
  name: string; // ❌ Error: 'name' must return number (contradicts index sig)
}

// Record<Keys, Value> — cleaner than index signature
type CountMap = Record<string, number>;
type HttpHeaders = Record<string, string>;

// Record with literal key union
type StatusConfig = Record<"active" | "inactive" | "pending", {
  label: string;
  color: string;
}>;

const config: StatusConfig = {
  active:   { label: "Active",   color: "green"  },
  inactive: { label: "Inactive", color: "gray"   },
  pending:  { label: "Pending",  color: "yellow" },
};
```

## Template Literal Types

```typescript
// Compose string literal types
type EventName = "click" | "focus" | "blur";
type EventHandler = `on${Capitalize<EventName>}`; // "onClick" | "onFocus" | "onBlur"

type CssProperty = "margin" | "padding";
type CssDirection = "Top" | "Right" | "Bottom" | "Left";
type CssShorthand = `${CssProperty}${CssDirection}`;
// "marginTop" | "marginRight" | "marginBottom" | "marginLeft"
// | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft"

// Route parameter extraction
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = ExtractParams<"/users/:userId/posts/:postId">;
// type Params = "userId" | "postId"
```

## Mapped Types

Transform every property in a type systematically.

```typescript
// Make all properties optional
type Partial<T> = { [K in keyof T]?: T[K] };

// Make all properties required
type Required<T> = { [K in keyof T]-?: T[K] }; // -? removes optional

// Make all properties readonly
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// Make all properties mutable
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// Practical example: form state
interface UserForm {
  name: string;
  email: string;
  age: number;
}

type FormErrors = Partial<Record<keyof UserForm, string>>;
// { name?: string; email?: string; age?: string }

type DirtyFields = Record<keyof UserForm, boolean>;
// { name: boolean; email: boolean; age: boolean }

// Remapping keys with 'as'
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};

type UserGetters = Getters<User>;
// { getName: () => string; getEmail: () => string; getAge: () => number }
```

## Conditional Types

```typescript
// Basic: T extends U ? TrueType : FalseType
type IsString<T> = T extends string ? true : false;
type A = IsString<string>; // true
type B = IsString<number>; // false

// Infer — extract types from within a structure
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Distributive conditional types
type ToArray<T> = T extends unknown ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[] (distributes!)

// Non-distributive (wrap in tuple to prevent distribution)
type ToArrayND<T> = [T] extends [unknown] ? T[] : never;
type ResultND = ToArrayND<string | number>; // (string | number)[]
```

## Practice Exercises

### Exercise 1: Model a payment system

```typescript
// Design types for a payment system with:
// - Multiple payment methods: card, bank, crypto
// - Each method has different required fields
// - A transaction that references a payment method
// - Use discriminated unions so TypeScript narrows correctly

type PaymentMethod = // TODO

type Transaction = {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: "pending" | "completed" | "failed";
};

function processPayment(transaction: Transaction): void {
  // TypeScript should let you access method-specific fields after narrowing
}
```

### Exercise 2: Builder pattern

```typescript
// Create a type-safe query builder where:
// - .select() returns a builder with column types
// - .where() narrows the result
// - .execute() returns the final typed result

interface QueryBuilder<T> {
  select<K extends keyof T>(columns: K[]): QueryBuilder<Pick<T, K>>;
  where(condition: Partial<T>): QueryBuilder<T>;
  execute(): Promise<T[]>;
}
```

## Key Takeaways

- `interface` for object shapes (extensible via declaration merging)
- `type` for unions, intersections, mapped/conditional types
- **Discriminated unions** are the most powerful pattern in TypeScript
- Always add exhaustiveness checks with `never` in `switch` statements
- `abstract` classes define contracts with shared implementation
- Mapped types systematically transform every property in a type
- Conditional types (`T extends U ? X : Y`) enable type-level logic

---

**Next:** [Lecture 3: Generics →](3-generics.md)
