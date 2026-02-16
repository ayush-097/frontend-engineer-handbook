# Homework: Convert a JavaScript Codebase to TypeScript

## 🎯 Objective

Take a real, working JavaScript application and migrate it to TypeScript with `strict` mode enabled — zero type errors, no `any`, full coverage. This is the most common TypeScript task you'll encounter in industry.

## 📦 The Starting Codebase

You will migrate a small **Todo API client** — a JavaScript module that manages todos by talking to a REST API. The full source is provided below. Copy it into a fresh folder and make it compile cleanly.

---

### `src/api.js` — API layer

```javascript
const BASE_URL = "https://jsonplaceholder.typicode.com";

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}: ${res.statusText}`);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getTodos:   ()       => request("GET",    "/todos"),
  getTodo:    (id)     => request("GET",    `/todos/${id}`),
  createTodo: (data)   => request("POST",   "/todos", data),
  updateTodo: (id, data) => request("PUT",  `/todos/${id}`, data),
  deleteTodo: (id)     => request("DELETE", `/todos/${id}`),
};
```

---

### `src/store.js` — State management

```javascript
let todos = [];
let listeners = [];
let nextId = 1;

function notify() {
  listeners.forEach(fn => fn(todos));
}

export const store = {
  getAll() {
    return todos;
  },

  getById(id) {
    return todos.find(t => t.id === id);
  },

  add(todo) {
    const newTodo = { ...todo, id: nextId++ };
    todos = [...todos, newTodo];
    notify();
    return newTodo;
  },

  update(id, changes) {
    todos = todos.map(t => t.id === id ? { ...t, ...changes } : t);
    notify();
    return todos.find(t => t.id === id) ?? null;
  },

  remove(id) {
    const existed = todos.some(t => t.id === id);
    todos = todos.filter(t => t.id !== id);
    if (existed) notify();
    return existed;
  },

  subscribe(listener) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter(fn => fn !== listener);
    };
  },

  clear() {
    todos = [];
    notify();
  },
};
```

---

### `src/filters.js` — Filtering and sorting utilities

```javascript
export function filterTodos(todos, options) {
  let result = [...todos];

  if (options.status === "active") {
    result = result.filter(t => !t.completed);
  } else if (options.status === "completed") {
    result = result.filter(t => t.completed);
  }

  if (options.userId !== undefined) {
    result = result.filter(t => t.userId === options.userId);
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(q));
  }

  if (options.sortBy === "title") {
    result = result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (options.sortBy === "id") {
    result = result.sort((a, b) => a.id - b.id);
  }

  if (options.limit !== undefined) {
    result = result.slice(0, options.limit);
  }

  return result;
}

export function groupByUser(todos) {
  return todos.reduce((acc, todo) => {
    const key = todo.userId;
    acc[key] = acc[key] ?? [];
    acc[key].push(todo);
    return acc;
  }, {});
}

export function stats(todos) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const completionRate = total === 0 ? 0 : completed / total;

  return { total, completed, active, completionRate };
}
```

---

### `src/cache.js` — Simple in-memory cache

```javascript
export function createCache(ttlMs) {
  const entries = new Map();

  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > ttlMs) {
        entries.delete(key);
        return null;
      }
      return entry.value;
    },

    set(key, value) {
      entries.set(key, { value, timestamp: Date.now() });
    },

    delete(key) {
      return entries.delete(key);
    },

    clear() {
      entries.clear();
    },

    has(key) {
      return this.get(key) !== null;
    },

    get size() {
      return entries.size;
    },
  };
}
```

---

### `src/events.js` — Typed event emitter

```javascript
export function createEventEmitter() {
  const handlers = {};

  return {
    on(event, handler) {
      handlers[event] = handlers[event] ?? [];
      handlers[event].push(handler);
      return () => this.off(event, handler);
    },

    off(event, handler) {
      handlers[event] = (handlers[event] ?? []).filter(h => h !== handler);
    },

    emit(event, ...args) {
      (handlers[event] ?? []).forEach(fn => fn(...args));
    },

    once(event, handler) {
      const off = this.on(event, (...args) => {
        handler(...args);
        off();
      });
      return off;
    },
  };
}
```

---

## 📋 Migration Tasks

### Phase 1 — Project setup

```bash
mkdir todo-ts && cd todo-ts
npm init -y
npm install -D typescript @types/node ts-node

# Create tsconfig.json with these settings:
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true,
    "declaration": true,
    "sourceMap": true,
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Phase 2 — Copy and rename

Rename each `.js` file to `.ts`. Run `npx tsc --noEmit` — expect many errors. **Do not use `any` to silence them.**

### Phase 3 — Add types (one file at a time)

Work through the files in this order:

#### `src/types.ts` (create this first)

Define shared domain types used across all files:

```typescript
// TODO: define these types

export interface Todo {
  // What fields does a JSONPlaceholder todo have?
  // https://jsonplaceholder.typicode.com/todos/1
}

export interface CreateTodoInput {
  // Fields required to create a new todo (excludes server-generated fields)
}

export interface UpdateTodoInput {
  // Fields that can be changed (all optional)
}

export type FilterStatus = /* TODO */;
export type SortField   = /* TODO */;

export interface FilterOptions {
  // Options accepted by filterTodos()
}

export interface TodoStats {
  // Return type of stats()
}
```

#### `src/api.ts`

- Type the `request` helper (generic return type)
- Type the `api` object so each method has the correct return type
- Handle the error with a custom `ApiError` class that has a `status: number` property
- The `err.status = res.status` line on a plain `Error` won't compile — fix it properly

#### `src/store.ts`

- Type the state variables (`todos`, `listeners`)
- `subscribe`'s listener should be typed as `(todos: Todo[]) => void`
- `subscribe` should return an unsubscribe function type: `() => void`
- `getById`, `update` should return the right union types

#### `src/filters.ts`

- Use your `FilterOptions`, `FilterStatus`, `SortField` types
- `groupByUser` return type: `Record<number, Todo[]>`
- `stats` return type: your `TodoStats` interface

#### `src/cache.ts`

- Make `createCache` generic: `createCache<V>(ttlMs: number)`
- `get(key)` returns `V | null`
- `set(key, value)` types `value` as `V`
- The returned object type should be fully typed

#### `src/events.ts`

- Make `createEventEmitter` generic over an event map
- Pattern: `EventEmitter<Events extends Record<string, unknown[]>>`
- `on(event, handler)` and `emit(event, ...args)` should be fully typed
- Look at Lecture 3 (Generics) for the EventEmitter example

### Phase 4 — Verification

```bash
# Must produce zero errors:
npx tsc --noEmit

# Run a quick smoke test:
npx ts-node src/api.ts
```

### Phase 5 — Enhance with utility types

Apply at least **3** of these improvements using utility types from Lecture 4:

```typescript
// A — Make CreateTodoInput from Todo using Omit
type CreateTodoInput = Omit<Todo, "id">;

// B — Derive UpdateTodoInput using Partial + Omit
type UpdateTodoInput = Partial<Omit<Todo, "id">>;

// C — Derive TodoStats fields from Todo using Pick
type TodoStats = {
  total: number;
  completed: number;
  active: number;
  completionRate: number;
};

// D — Use ReturnType to derive the store's return type
type StoreInstance = ReturnType<typeof createStore>;

// E — Use Record for groupByUser return type
type UserGroups = Record<Todo["userId"], Todo[]>;
```

---

## ✅ Acceptance Criteria

```bash
npx tsc --noEmit   # ← Must output nothing (zero errors)
```

The following must be true:

- [ ] `tsconfig.json` has `"strict": true` enabled (all sub-checks on)
- [ ] Zero `any` types in any `.ts` file (use `unknown` + narrowing instead)
- [ ] Custom `ApiError` class with typed `status: number` property
- [ ] `createCache<V>` is generic — `cache.get()` returns `V | null`
- [ ] `createEventEmitter<Events>` is generic — handlers typed per event
- [ ] `FilterOptions` uses literal union types for `status` and `sortBy`
- [ ] `store.subscribe` listener typed as `(todos: Todo[]) => void`
- [ ] All functions have explicit return types (or clearly inferred ones)
- [ ] At least 3 utility-type applications documented with comments

---

## 📊 Grading Rubric

| Criterion | Points |
|-----------|--------|
| `tsconfig.json` correct + strict enabled | 5 |
| `src/types.ts` — domain types complete | 10 |
| `src/api.ts` — generic request, ApiError | 15 |
| `src/store.ts` — state + listener types | 15 |
| `src/filters.ts` — FilterOptions, return types | 15 |
| `src/cache.ts` — generic Cache<V> | 15 |
| `src/events.ts` — generic EventEmitter | 15 |
| Utility type enhancements (≥ 3) | 10 |
| **Total** | **100** |

---

## 💡 Tips

```typescript
// Tip 1: Start with types.ts and import everywhere
// Tip 2: Fix one file at a time — keep tsc --watch running
// Tip 3: When you see 'any' in an error, look for a generic <T> opportunity
// Tip 4: 'unknown' + narrowing beats 'any' every time
// Tip 5: Use 'satisfies' to validate literal objects without widening

const SORT_OPTIONS = ["title", "id", "userId"] as const;
type SortField = (typeof SORT_OPTIONS)[number]; // "title" | "id" | "userId"

// Tip 6: Augment Error properly
class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,   // ← typed property, not runtime assignment
    public readonly statusText: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Tip 7: Generic cache with constraints
function createCache<V>(ttlMs: number) {
  const entries = new Map<string, { value: V; timestamp: number }>();
  // Return type inferred — no need to write it out
  return { get, set, delete: del, clear, has, get size() { ... } };
}
```

## ⏱️ Time Estimate

- Phase 1–2 (setup): 20 min
- Phase 3 (typing): 2–3 hours
- Phase 4 (verify): 30 min
- Phase 5 (enhance): 30 min

**Total: ~4 hours**

**Submit:** GitHub repo link. The repo must pass `npx tsc --noEmit` in CI.
