/**
 * TypeScript Type-Level Tests
 *
 * These tests verify that types are EXACTLY what we expect — not just
 * that code compiles, but that inference produces the right types.
 *
 * Two approaches used here:
 *   1. Compile-time assertions via `expectType` helper (type-level only)
 *   2. Runtime tests with Jest that also verify types via @ts-expect-error
 *
 * Run type checks:  npx tsc --noEmit
 * Run runtime tests: npx jest tests/type-tests.ts
 *
 * Install deps:
 *   npm install -D typescript @types/node
 *   npm install -D tsd            (optional — for .test-d.ts pattern)
 */

// ─── Type-level assertion helpers ────────────────────────────────────────────

/**
 * Assert that T is exactly U (both assignable to each other).
 * If the assertion fails the file won't compile.
 *
 * Usage:  expectType<string>(someValue)
 *         expectType<User[]>(api.getUsers())
 */
declare function expectType<Expected>(actual: Expected): void;

/**
 * Assert T extends U (T is assignable to U, but U may be broader).
 */
declare function expectAssignable<U, T extends U>(actual: T): void;

/**
 * Assert that T is never — a union that has been exhausted.
 */
declare function expectNever(actual: never): void;

// ─── Imports under test ───────────────────────────────────────────────────────
// Adjust paths to match your project layout once you complete the homework.
// The types below can also serve as a spec before you write the implementation.

// import type { Todo, FilterOptions, TodoStats, CreateTodoInput } from "../src/types";
// import type { createCache } from "../src/cache";
// import type { createEventEmitter } from "../src/events";
// import { filterTodos, groupByUser, stats } from "../src/filters";
// import { store } from "../src/store";

// ─── 1. Primitive types ───────────────────────────────────────────────────────

{
  // Basic inference
  const name = "Alice";
  expectType<string>(name);

  const count = 42;
  expectType<number>(count);

  const active = true;
  expectType<boolean>(active);

  // Const assertion narrows literals
  const direction = "north" as const;
  expectType<"north">(direction);

  const config = { port: 3000, host: "localhost" } as const;
  expectType<3000>(config.port);
  expectType<"localhost">(config.host);
}

// ─── 2. Union types ───────────────────────────────────────────────────────────

{
  type Status = "idle" | "loading" | "success" | "error";

  function getStatus(): Status {
    return "idle";
  }

  const s = getStatus();
  expectType<Status>(s);

  // Narrowing eliminates union members
  if (s === "idle") {
    expectType<"idle">(s);
  }

  // Discriminated union
  type Result<T> =
    | { ok: true;  value: T }
    | { ok: false; error: Error };

  const r: Result<number> = { ok: true, value: 42 };

  if (r.ok) {
    expectType<number>(r.value);
    // @ts-expect-error — 'error' only exists on the failure branch
    r.error;
  } else {
    expectType<Error>(r.error);
    // @ts-expect-error — 'value' only exists on the success branch
    r.value;
  }
}

// ─── 3. Narrowing ─────────────────────────────────────────────────────────────

{
  function process(value: string | number | null): string {
    if (value === null) {
      expectType<null>(value);
      return "null";
    }

    if (typeof value === "string") {
      expectType<string>(value);
      return value.toUpperCase();
    }

    // Only number left
    expectType<number>(value);
    return value.toFixed(2);
  }
}

// ─── 4. Generics — identity and inference ─────────────────────────────────────

{
  function identity<T>(val: T): T {
    return val;
  }

  const n = identity(42);
  expectType<number>(n);

  const s = identity("hello");
  expectType<string>(s);

  const arr = identity([1, 2, 3]);
  expectType<number[]>(arr);

  // Explicit type param
  const explicit = identity<boolean>(true);
  expectType<boolean>(explicit);
}

// ─── 5. Generics — constraints ────────────────────────────────────────────────

{
  function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
  }

  const user = { id: 1, name: "Alice", email: "a@example.com" };

  const name = getProperty(user, "name");
  expectType<string>(name);

  const id = getProperty(user, "id");
  expectType<number>(id);

  // @ts-expect-error — "phone" is not a key of user
  getProperty(user, "phone");
}

// ─── 6. Generics — return type inference ──────────────────────────────────────

{
  function first<T>(arr: T[]): T | undefined {
    return arr[0];
  }

  const n = first([1, 2, 3]);
  expectType<number | undefined>(n);

  const s = first(["a", "b"]);
  expectType<string | undefined>(s);

  const empty = first([] as never[]);
  expectType<never | undefined>(empty);
}

// ─── 7. Utility types ─────────────────────────────────────────────────────────

{
  interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
    createdAt: Date;
  }

  // Partial
  type UserUpdate = Partial<User>;
  const update: UserUpdate = { name: "Bob" }; // All fields optional ✅
  expectType<number | undefined>(update.id);

  // Required — removes optional modifier
  interface MaybeUser { id?: number; name?: string; }
  type DefiniteUser = Required<MaybeUser>;
  const def: DefiniteUser = { id: 1, name: "Alice" }; // Both required ✅

  // Pick
  type PublicUser = Pick<User, "id" | "name" | "email">;
  const pub: PublicUser = { id: 1, name: "Alice", email: "a@b.com" };
  // @ts-expect-error — password not in PublicUser
  pub.password;

  // Omit
  type SafeUser = Omit<User, "password">;
  const safe: SafeUser = { id: 1, name: "A", email: "a@b.com", role: "user", createdAt: new Date() };
  // @ts-expect-error — password was omitted
  safe.password;

  // Readonly
  type ImmutableUser = Readonly<User>;
  const frozen: ImmutableUser = { ...safe, password: "x" };
  // @ts-expect-error — cannot reassign readonly property
  frozen.name = "Bob";

  // Record
  type RolePermissions = Record<"admin" | "user" | "guest", string[]>;
  const perms: RolePermissions = { admin: ["all"], user: ["read"], guest: [] };
  // @ts-expect-error — "superuser" not in union
  const bad: RolePermissions = { admin: [], user: [], guest: [], superuser: [] };

  // NonNullable
  type MaybeName = string | null | undefined;
  type DefiniteName = NonNullable<MaybeName>;
  const dn: DefiniteName = "Alice";
  // @ts-expect-error — null not assignable to NonNullable
  const invalid: DefiniteName = null;
}

// ─── 8. ReturnType and Parameters ─────────────────────────────────────────────

{
  function createUser(name: string, role: "admin" | "user") {
    return { id: Math.random(), name, role, createdAt: new Date() };
  }

  type CreatedUser = ReturnType<typeof createUser>;
  const u: CreatedUser = { id: 1, name: "Alice", role: "user", createdAt: new Date() };
  expectType<string>(u.name);

  // @ts-expect-error — "guest" not in "admin" | "user"
  const bad: CreatedUser = { id: 1, name: "x", role: "guest", createdAt: new Date() };

  type CreateParams = Parameters<typeof createUser>;
  // Should be [name: string, role: "admin" | "user"]
  const args: CreateParams = ["Alice", "admin"];
  expectType<string>(args[0]);
}

// ─── 9. Conditional types ─────────────────────────────────────────────────────

{
  type IsArray<T> = T extends unknown[] ? true : false;

  type A = IsArray<string[]>; // true
  type B = IsArray<string>;   // false
  type C = IsArray<number[]>; // true

  // Type assertions at compile time
  const a: A = true;
  const b: B = false;
  const c: C = true;

  // @ts-expect-error — IsArray<string> is false, not true
  const bad: B = true;

  // Awaited
  type Unwrapped = Awaited<Promise<string>>;
  const uw: Unwrapped = "hello";
  expectType<string>(uw);

  type DoubleWrapped = Awaited<Promise<Promise<number>>>;
  const dw: DoubleWrapped = 42;
  expectType<number>(dw);
}

// ─── 10. Mapped types ─────────────────────────────────────────────────────────

{
  interface Form {
    username: string;
    password: string;
    age: number;
  }

  // Custom mapped type — make all values boolean (e.g., touched state)
  type Touched<T> = { [K in keyof T]: boolean };
  type FormTouched = Touched<Form>;

  const touched: FormTouched = { username: true, password: false, age: false };
  expectType<boolean>(touched.username);
  // @ts-expect-error — "email" not a key of Form
  touched.email;

  // Mapped type with remapped keys
  type Nullable<T> = { [K in keyof T]: T[K] | null };
  type NullableForm = Nullable<Form>;
  const nf: NullableForm = { username: null, password: null, age: null };
  expectType<string | null>(nf.username);
  expectType<number | null>(nf.age);
}

// ─── 11. Template literal types ───────────────────────────────────────────────

{
  type EventName = "click" | "focus" | "blur";
  type HandlerName = `on${Capitalize<EventName>}`;
  // Should be: "onClick" | "onFocus" | "onBlur"

  const h1: HandlerName = "onClick";
  const h2: HandlerName = "onFocus";
  const h3: HandlerName = "onBlur";

  // @ts-expect-error — "onHover" not in the union
  const bad: HandlerName = "onHover";
  // @ts-expect-error — "click" (not capitalized) not in the union
  const bad2: HandlerName = "onclick";
}

// ─── 12. Discriminated unions — exhaustiveness ─────────────────────────────────

{
  type Shape =
    | { kind: "circle";   radius: number }
    | { kind: "square";   side: number }
    | { kind: "triangle"; base: number; height: number };

  function area(shape: Shape): number {
    switch (shape.kind) {
      case "circle":   return Math.PI * shape.radius ** 2;
      case "square":   return shape.side ** 2;
      case "triangle": return 0.5 * shape.base * shape.height;
      default:
        // This never branch catches missing cases at compile time.
        // If you add a new Shape variant, TypeScript errors here.
        const _exhausted: never = shape;
        return _exhausted;
    }
  }

  // Accessing narrowed fields
  const s: Shape = { kind: "circle", radius: 5 };
  if (s.kind === "circle") {
    expectType<number>(s.radius);
    // @ts-expect-error — side only exists on square
    s.side;
  }
}

// ─── 13. Generic Cache<V> (homework verification) ─────────────────────────────

{
  // This block tests the EXPECTED interface for src/cache.ts
  // Uncomment and fix import once your implementation is done.

  // import { createCache } from "../src/cache";
  // const numCache = createCache<number>(5000);
  // expectType<number | null>(numCache.get("key"));
  // numCache.set("key", 42);
  // numCache.set("key", "oops"); // ← should be @ts-expect-error

  // interface User { id: number; name: string; }
  // const userCache = createCache<User>(60_000);
  // const u = userCache.get("user:1");
  // if (u !== null) {
  //   expectType<User>(u);
  //   u.name.toUpperCase(); // safe — TypeScript knows it's User
  // }

  // Placeholder so the block compiles before implementation is done
  const _placeholder = 0;
  expectType<number>(_placeholder);
}

// ─── 14. Generic EventEmitter (homework verification) ─────────────────────────

{
  // This tests the EXPECTED interface for src/events.ts (generic version)
  // Uncomment once your implementation is done.

  // import { createEventEmitter } from "../src/events";

  // type AppEvents = {
  //   "user:login":   [user: { id: number; name: string }];
  //   "user:logout":  [];
  //   "data:loaded":  [items: string[], total: number];
  // };

  // const emitter = createEventEmitter<AppEvents>();

  // // Types flow correctly into handlers:
  // emitter.on("user:login", (user) => {
  //   expectType<{ id: number; name: string }>(user);
  // });

  // emitter.on("data:loaded", (items, total) => {
  //   expectType<string[]>(items);
  //   expectType<number>(total);
  // });

  // // Emit argument types are checked:
  // emitter.emit("user:login", { id: 1, name: "Alice" }); // ✅
  // emitter.emit("user:logout");                           // ✅ no args
  // emitter.emit("user:login", 42);                        // should be @ts-expect-error

  const _placeholder = 0;
  expectType<number>(_placeholder);
}

// ─── 15. Type-level tests for store (homework verification) ───────────────────

{
  // These test the EXPECTED shape of src/store.ts after migration.
  // Uncomment once done.

  // import { store } from "../src/store";
  // import type { Todo } from "../src/types";

  // const todos = store.getAll();
  // expectType<Todo[]>(todos);

  // const single = store.getById(1);
  // expectType<Todo | undefined>(single);

  // const added = store.add({ userId: 1, title: "Test", completed: false });
  // expectType<Todo>(added);

  // const updated = store.update(1, { completed: true });
  // expectType<Todo | null>(updated);

  // const removed = store.remove(1);
  // expectType<boolean>(removed);

  // const unsub = store.subscribe((todos) => {
  //   expectType<Todo[]>(todos);
  // });
  // expectType<() => void>(unsub);

  const _placeholder = 0;
  expectType<number>(_placeholder);
}

// ─── 16. Strict mode guards ───────────────────────────────────────────────────

{
  // strictNullChecks: string ≠ string | null
  function getName(): string | null {
    return null;
  }

  const name = getName();

  // @ts-expect-error — name might be null; can't call string methods directly
  name.toUpperCase();

  // After narrowing — safe
  if (name !== null) {
    name.toUpperCase(); // ✅
  }

  // noImplicitAny: unannotated function params must be inferrable
  // The line below would fail with noImplicitAny:
  // function bad(x) { return x; }  // ← x has implicit 'any'

  // With annotation:
  function good(x: unknown): unknown { return x; } // ✅
}

// ─── 17. Intersection types ───────────────────────────────────────────────────

{
  type WithId = { id: number };
  type WithTimestamps = { createdAt: Date; updatedAt: Date };
  type WithName = { name: string };

  type Entity = WithId & WithTimestamps & WithName;

  const e: Entity = {
    id: 1,
    name: "Test",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  expectType<number>(e.id);
  expectType<string>(e.name);
  expectType<Date>(e.createdAt);

  // @ts-expect-error — email not in Entity
  e.email;
}

// ─── 18. keyof and indexed access ─────────────────────────────────────────────

{
  interface Config {
    host: string;
    port: number;
    ssl: boolean;
    timeout: number;
  }

  type ConfigKey = keyof Config;
  // "host" | "port" | "ssl" | "timeout"

  type ConfigValues = Config[keyof Config];
  // string | number | boolean

  function getConfigValue<K extends keyof Config>(config: Config, key: K): Config[K] {
    return config[key];
  }

  const cfg: Config = { host: "localhost", port: 3000, ssl: false, timeout: 5000 };

  const host = getConfigValue(cfg, "host");
  expectType<string>(host);

  const port = getConfigValue(cfg, "port");
  expectType<number>(port);

  // @ts-expect-error — "url" is not in Config
  getConfigValue(cfg, "url");
}

// ─── 19. Tuple types ─────────────────────────────────────────────────────────

{
  type Point = [x: number, y: number];
  type RGB = [r: number, g: number, b: number];
  type Entry<K, V> = [key: K, value: V];

  const p: Point = [10, 20];
  expectType<number>(p[0]);
  expectType<number>(p[1]);
  // @ts-expect-error — index 2 out of range for tuple [number, number]
  p[2];

  // Destructuring preserves types
  const [x, y] = p;
  expectType<number>(x);
  expectType<number>(y);

  // Generic tuple
  const entry: Entry<string, number> = ["age", 30];
  expectType<string>(entry[0]);
  expectType<number>(entry[1]);
}

// ─── 20. Extract and Exclude ──────────────────────────────────────────────────

{
  type Primitive = string | number | boolean | null | undefined;

  type Strings = Extract<Primitive, string>;
  const s: Strings = "hello";
  // @ts-expect-error — number not in Extract<Primitive, string>
  const bad: Strings = 42;

  type NoNull = Exclude<Primitive, null | undefined>;
  const nn: NoNull = "valid";
  // @ts-expect-error — null excluded
  const invalid: NoNull = null;

  // Extract from event union
  type AppEvents =
    | { type: "CLICK"; target: HTMLElement }
    | { type: "KEY"; key: string }
    | { type: "RESIZE"; width: number; height: number };

  type ClickEvent = Extract<AppEvents, { type: "CLICK" }>;
  const clickEvt: ClickEvent = { type: "CLICK", target: document.body };
  expectType<HTMLElement>(clickEvt.target);
}

export { };
// ↑ Make this file a module (prevents name collisions with other files)
