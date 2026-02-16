# Utility Types

## What Are Utility Types?

TypeScript ships a library of built-in **utility types** — generic types that transform other types in common ways. Instead of rewriting mapped/conditional logic from scratch every time, these give you the transformation you need in one word.

```typescript
// Without utility types — repetitive
type PartialUser = {
  id?: number;
  name?: string;
  email?: string;
};

// With utility types — one line, stays in sync automatically
type PartialUser = Partial<User>;
```

## Object Modification Utilities

### `Partial<T>` — Make all properties optional

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; role?: "admin" | "user" }

// Primary use case: update payloads (only send changed fields)
async function updateUser(id: number, updates: Partial<User>): Promise<User> {
  return api.patch(`/users/${id}`, updates);
}

updateUser(1, { name: "Alice" });         // ✅ Only update name
updateUser(1, { email: "new@email.com" }); // ✅ Only update email
updateUser(1, { id: 99 });               // ✅ TypeScript won't stop you (id is number)
// but business logic would reject it

// Partial is shallow — nested objects still required
interface Config {
  server: { host: string; port: number };
  db: { url: string; pool: number };
}

type PartialConfig = Partial<Config>;
// { server?: { host: string; port: number }; db?: { url: string; pool: number } }
// ← server itself is optional, but if provided, BOTH host AND port required
```

### `Required<T>` — Make all properties required

```typescript
interface Options {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

type ResolvedOptions = Required<Options>;
// { timeout: number; retries: number; headers: Record<string, string> }

// Use case: after filling in defaults, all fields are guaranteed present
function withDefaults(opts: Options): Required<Options> {
  return {
    timeout: opts.timeout ?? 5000,
    retries: opts.retries ?? 3,
    headers: opts.headers ?? {},
  };
}

const resolved = withDefaults({});
resolved.timeout; // type: number (not number | undefined)
```

### `Readonly<T>` — Make all properties read-only

```typescript
interface State {
  count: number;
  items: string[];
}

type ImmutableState = Readonly<State>;

function reducer(state: ImmutableState, action: Action): ImmutableState {
  // state.count = 0; // ❌ Error: Cannot assign to 'count' (readonly)
  return { ...state, count: state.count + 1 }; // ✅ Create new object
}

// Use Object.freeze for runtime enforcement too
const config: Readonly<Config> = Object.freeze({
  apiUrl: "https://api.example.com",
  timeout: 5000,
});
```

### `Pick<T, K>` — Include only specific properties

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

// Only expose safe fields to the client
type PublicUser = Pick<User, "id" | "name" | "email">;
// { id: number; name: string; email: string }

// Card preview with minimal data
type UserCard = Pick<User, "id" | "name" | "role">;

// Form that only edits profile fields
type ProfileForm = Pick<User, "name" | "email">;

function renderCard(user: UserCard): JSX.Element { ... }
// ← TypeScript enforces only the fields you need are passed
```

### `Omit<T, K>` — Exclude specific properties

```typescript
// Everything except password (sensitive fields)
type SafeUser = Omit<User, "password">;
// { id: number; name: string; email: string; role: string; createdAt: Date }

// Create payload — omit server-generated fields
type CreateUserPayload = Omit<User, "id" | "createdAt">;
// { name: string; email: string; password: string; role: string }

// Database entity without ORM internals
type UserDto = Omit<User, "_entity" | "_meta" | "save" | "delete">;

// Pick vs Omit strategy:
// - Few fields to KEEP → Pick
// - Few fields to EXCLUDE → Omit
```

## Function Utilities

### `ReturnType<T>` — Extract a function's return type

```typescript
function createUser(name: string, email: string) {
  return { id: Math.random(), name, email, createdAt: new Date() };
}

type CreatedUser = ReturnType<typeof createUser>;
// { id: number; name: string; email: string; createdAt: Date }

// Use case: functions return complex objects you want to reuse
async function fetchDashboardData() {
  const [user, stats, notifications] = await Promise.all([
    api.getUser(),
    api.getStats(),
    api.getNotifications(),
  ]);
  return { user, stats, notifications };
}

type DashboardData = ReturnType<typeof fetchDashboardData>;
// Promise<{ user: User; stats: Stats; notifications: Notification[] }>
// ← Stays in sync as fetchDashboardData changes!

// Unwrap the promise too
type DashboardDataResolved = Awaited<ReturnType<typeof fetchDashboardData>>;
// { user: User; stats: Stats; notifications: Notification[] }
```

### `Parameters<T>` — Extract function parameter types as tuple

```typescript
function createRequest(url: string, method: HttpMethod, body?: unknown) { ... }

type RequestParams = Parameters<typeof createRequest>;
// [url: string, method: HttpMethod, body?: unknown]

// Spread to re-use the same params
function retryRequest(...args: Parameters<typeof createRequest>) {
  // Retry with exact same arguments
  return createRequest(...args);
}

// Useful for wrapper functions that need to forward arguments
type SetStateAction<T> = T | ((prevState: T) => T);
type UseStateSetter<T> = Parameters<React.Dispatch<SetStateAction<T>>>[0];
```

### `ConstructorParameters<T>` and `InstanceType<T>`

```typescript
class HttpClient {
  constructor(
    private baseUrl: string,
    private timeout: number,
    private headers: Record<string, string>
  ) {}
}

type ClientArgs = ConstructorParameters<typeof HttpClient>;
// [baseUrl: string, timeout: number, headers: Record<string, string>]

type ClientInstance = InstanceType<typeof HttpClient>;
// HttpClient

// Useful when working with class constructors as values
function createInstance<T extends new (...args: any) => any>(
  Ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Ctor(...args);
}
```

### `Awaited<T>` — Unwrap nested Promises

```typescript
type A = Awaited<Promise<string>>;                // string
type B = Awaited<Promise<Promise<number>>>;       // number (recursive)
type C = Awaited<string>;                         // string (not a promise)
type D = Awaited<Promise<User[]>>;               // User[]

// Practical: extract the type you'll actually work with
async function getUsers(): Promise<User[]> { ... }

type Users = Awaited<ReturnType<typeof getUsers>>; // User[]
```

## Set-Operation Utilities

### `Extract<T, U>` — Keep union members assignable to U

```typescript
type Primitive = string | number | boolean | null | undefined;
type Strings = Extract<Primitive, string>; // string

type Events = "click" | "focus" | "blur" | "keydown" | "mousemove";
type KeyEvents = Extract<Events, `key${string}`>; // "keydown"
type MouseEvents = Extract<Events, `mouse${string}`>; // "mousemove"

// Extract only function-type properties from an object
type Methods<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T];

type UserMethods = Methods<User>; // names of function-valued keys
```

### `Exclude<T, U>` — Remove union members assignable to U

```typescript
type Status = "active" | "inactive" | "pending" | "deleted";
type LiveStatus = Exclude<Status, "deleted">; // "active" | "inactive" | "pending"

// Remove null/undefined
type NonNullable<T> = Exclude<T, null | undefined>;
type SafeString = NonNullable<string | null | undefined>; // string

// Remove specific types from a union
type WithoutBooleans<T> = Exclude<T, boolean>;
type Scalars = WithoutBooleans<string | number | boolean>; // string | number
```

### `NonNullable<T>` — Remove null and undefined

```typescript
function processName(name: string | null | undefined): string {
  const safe: NonNullable<typeof name> = name ?? "Anonymous";
  // type: string (null and undefined excluded)
  return safe.toUpperCase();
}

// Useful in mapped contexts
type StrictConfig<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};
```

## Record and Template Utilities

### `Record<K, V>` — Build an object type with known keys

```typescript
// Static keys
type StatusLabels = Record<"active" | "inactive" | "pending", string>;
const labels: StatusLabels = {
  active:   "Active",
  inactive: "Inactive",
  pending:  "Pending",
  // Missing any key → compile error!
};

// Dynamic string keys
type Cache = Record<string, unknown>;

// Translate from one key set to another
type DayNumber = Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
  number
>;
const dayIndex: DayNumber = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5,
};

// Combine with mapped types
type FormState<T> = Record<keyof T, {
  value: T[keyof T];
  error: string | null;
  touched: boolean;
}>;
```

## Building Your Own Utility Types

### Deep Partial

```typescript
// Partial is shallow — DeepPartial recurses into nested objects
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface AppConfig {
  server: { host: string; port: number };
  db: { url: string; pool: number; ssl: boolean };
  logging: { level: "debug" | "info" | "warn" | "error" };
}

type ConfigPatch = DeepPartial<AppConfig>;
// { server?: { host?: string; port?: number }; db?: { url?: string; ... }; ... }

updateConfig({ db: { pool: 10 } }); // ✅ Only override pool size
```

### Nullable / Maybe

```typescript
// Add null to every property
type Nullable<T> = { [K in keyof T]: T[K] | null };

// Wrap value in Maybe (for optional return values)
type Maybe<T> = T | null | undefined;

function findUser(id: number): Maybe<User> {
  return users.find(u => u.id === id);
}
```

### Flatten

```typescript
// Flatten a nested object type into a dotted-key map
type Flatten<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? Flatten<T[K], `${Prefix}${K}.`>
    : { [P in `${Prefix}${K}`]: T[K] }
}[keyof T & string];

// type Flattened = { "server.host": string; "server.port": number; "db.url": string; ... }
```

### Paths & PathValue

```typescript
// Get all valid dot-notation paths in an object type
type Paths<T, Prefix extends string = ""> = {
  [K in keyof T & string]:
    T[K] extends Record<string, unknown>
      ? Paths<T[K], `${Prefix}${K}.`> | `${Prefix}${K}`
      : `${Prefix}${K}`
}[keyof T & string];

type ConfigPaths = Paths<AppConfig>;
// "server" | "server.host" | "server.port" | "db" | "db.url" | ...

// Get the value type at a given path
type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : P extends keyof T
      ? T[P]
      : never;

type HostType = PathValue<AppConfig, "server.host">; // string
type PoolType = PathValue<AppConfig, "db.pool">;     // number

// Fully-typed deep getter
function get<T, P extends Paths<T>>(obj: T, path: P): PathValue<T, P> {
  return path.split(".").reduce((v: any, k) => v?.[k], obj);
}

get(config, "server.port"); // type: number
get(config, "db.pool");     // type: number
get(config, "server.xyz");  // ❌ Error: invalid path
```

### Mutable Variants

```typescript
// Remove readonly from all properties
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepMutable<T[K]> : T[K];
};

const frozenConfig = Object.freeze({ apiUrl: "..." });
type EditableConfig = Mutable<typeof frozenConfig>;
```

### Builder Pattern

```typescript
// Type-safe builder with method chaining
type Builder<T, Required extends keyof T = never> = {
  set<K extends keyof T>(key: K, value: T[K]): Builder<T, Required | K>;
  build(): Required extends keyof T ? T : Partial<T>;
};

// Example: force required fields before build()
type UserBuilder = Builder<User, "name" | "email">;
// Forces .set("name") and .set("email") before .build() returns User
```

## Practical Recipes

```typescript
// ─── API Type Safety ─────────────────────────────────────────────────────────

// Typed fetch that returns the right type based on the endpoint
type ApiRoutes = {
  "/users":       { GET: User[];     POST: User };
  "/users/:id":   { GET: User;       PUT: User; DELETE: void };
  "/posts":       { GET: Post[];     POST: Post };
};

type RouteMethod<Route extends keyof ApiRoutes, Method extends keyof ApiRoutes[Route]> =
  ApiRoutes[Route][Method];

async function api<
  Route extends keyof ApiRoutes,
  Method extends keyof ApiRoutes[Route]
>(route: Route, method: Method): Promise<RouteMethod<Route, Method>> {
  const res = await fetch(route, { method: method as string });
  return res.json();
}

const users = await api("/users", "GET");    // type: User[]
const user  = await api("/users/:id", "PUT"); // type: User

// ─── Form utilities ───────────────────────────────────────────────────────────

type FormValues<T> = {
  [K in keyof T]: T[K];
};

type FormErrors<T> = {
  [K in keyof T]?: string;
};

type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

type FormState<T> = {
  values: FormValues<T>;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
};

// ─── Event system ─────────────────────────────────────────────────────────────

type EventMap<T extends Record<string, unknown[]>> = {
  [K in keyof T]: (...args: T[K]) => void;
};

type Unsubscribe = () => void;

interface TypedEventEmitter<Events extends Record<string, unknown[]>> {
  on<K extends keyof Events>(event: K, listener: EventMap<Events>[K]): Unsubscribe;
  emit<K extends keyof Events>(event: K, ...args: Events[K]): void;
}
```

## Practice Exercises

### Exercise 1: Form builder utility types

```typescript
// Given a form schema, derive:
// 1. FormValues<Schema> — the values object
// 2. FormErrors<Schema> — same shape but all string | undefined
// 3. FormRequired<Schema> — keys where required: true
// 4. FormDefaults<Schema> — pick fields that have defaultValue

type FieldSchema = {
  type: "text" | "number" | "email" | "checkbox";
  required?: boolean;
  defaultValue?: unknown;
};

type FormSchema = Record<string, FieldSchema>;

const schema = {
  name:  { type: "text",     required: true },
  email: { type: "email",    required: true },
  age:   { type: "number",   defaultValue: 18 },
  newsletter: { type: "checkbox", defaultValue: false },
} satisfies FormSchema;

// Derive these:
type SchemaValues  = // TODO: { name: string; email: string; age: number; newsletter: boolean }
type SchemaErrors  = // TODO: { name?: string; email?: string; age?: string; newsletter?: string }
type RequiredKeys  = // TODO: "name" | "email"
```

### Exercise 2: Recursive utility

```typescript
// Build DeepRequired<T> — makes ALL nested properties required
// Test it against:

interface DeepOptional {
  a?: string;
  b?: {
    c?: number;
    d?: {
      e?: boolean;
    };
  };
}

type DeepRequiredResult = DeepRequired<DeepOptional>;
// Should be: { a: string; b: { c: number; d: { e: boolean } } }
```

## Key Takeaways

| Utility | Effect |
|---------|--------|
| `Partial<T>` | All properties optional |
| `Required<T>` | All properties required |
| `Readonly<T>` | All properties readonly |
| `Pick<T, K>` | Keep only keys K |
| `Omit<T, K>` | Remove keys K |
| `Record<K, V>` | Map keys to value type |
| `ReturnType<F>` | Function return type |
| `Parameters<F>` | Function params tuple |
| `Awaited<T>` | Unwrap Promise |
| `Extract<T, U>` | Keep assignable to U |
| `Exclude<T, U>` | Remove assignable to U |
| `NonNullable<T>` | Remove null/undefined |

- Utility types keep your types **DRY** — change the source, derived types update automatically
- `ReturnType` + `Awaited` are essential for typing async function results
- Build your own utilities with mapped + conditional types for domain-specific needs
- `satisfies` operator validates a value against a type without widening it

---

**Module complete!** You now have the TypeScript fundamentals to write safe, expressive, maintainable code.

**Next:** [Lab: Typed Fetch Wrapper →](../lab/typed-fetch-wrapper/)
