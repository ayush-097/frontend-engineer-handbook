# Lab: Typed Fetch Wrapper

Build a fully type-safe HTTP client using TypeScript generics that makes it impossible to use the wrong response type for a given endpoint.

## Learning Goals
- Generic functions with constraints
- Conditional and mapped types
- Real-world API design in TypeScript

## The API You Will Build

```typescript
import { createClient } from "./http-client";

// Define your API schema once
interface Api {
  "/users":           { GET: User[];  POST: CreateUserDto };
  "/users/:id":       { GET: User;    PUT: Partial<User>; DELETE: void };
  "/users/:id/posts": { GET: Post[] };
  "/auth/login":      { POST: { token: string; expiresAt: Date } };
}

const client = createClient<Api>({ baseUrl: "https://api.example.com" });

// Fully typed — response type inferred from route + method
const users  = await client.get("/users");           // User[]
const user   = await client.get("/users/:id", { params: { id: "1" } }); // User
const newUser = await client.post("/users", {         // User (POST response)
  body: { name: "Alice", email: "a@b.com" },
});

// Type errors caught at compile time:
// client.delete("/users");       // ❌ No DELETE on /users
// client.get("/nonexistent");    // ❌ Not in schema
// client.post("/auth/login", {
//   body: { wrong: "field" }     // ❌ Wrong body shape
// });
```

## Files

```
typed-fetch-wrapper/
├── README.md
├── http-client.ts       ← Your implementation
├── http-client.test.ts  ← Tests (must pass)
└── example.ts           ← Usage example / demo
```

## Type Design

```typescript
// Route schema maps paths to method → response type
type RouteSchema = Record<string, Partial<Record<HttpMethod, unknown>>>;

// Extract response type for a given route + method
type RouteResponse<
  Schema extends RouteSchema,
  Path extends keyof Schema,
  Method extends keyof Schema[Path]
> = Schema[Path][Method];

// Request options
interface RequestOptions<Body = unknown> {
  params?: Record<string, string>;   // URL params (:id → "1")
  query?: Record<string, string>;    // ?key=value query string
  headers?: Record<string, string>;
  body?: Body;
  signal?: AbortSignal;
}
```

## Tasks

### Task 1 — Core types (required)
- [ ] `HttpMethod` — `"GET" | "POST" | "PUT" | "PATCH" | "DELETE"`
- [ ] `RouteSchema` — base constraint for API schemas
- [ ] `RouteResponse<Schema, Path, Method>` — extracts response type
- [ ] `MethodsFor<Schema, Path>` — which HTTP methods a path supports

### Task 2 — `createClient<Schema>` (required)
- [ ] Returns typed `get`, `post`, `put`, `patch`, `delete` methods
- [ ] Each method only accepts valid paths for that HTTP method
- [ ] Response type inferred from schema
- [ ] Interpolates `:param` placeholders in URLs

### Task 3 — Request execution (required)
- [ ] Uses `fetch` under the hood
- [ ] Throws `ApiError` with status code and message on non-2xx responses
- [ ] Supports request cancellation via `AbortSignal`
- [ ] Appends query string parameters correctly

### Task 4 — Interceptors (bonus)
- [ ] `onRequest` — modify headers before each request
- [ ] `onResponse` — transform response after each request
- [ ] `onError` — handle errors globally (retry, redirect)

## Acceptance Criteria

```bash
npx tsc --noEmit   # No type errors
npm test           # All tests pass
```

- The TypeScript compiler must enforce the schema at call sites
- No `any` in the implementation (except well-documented escape hatches)
- Works with real `fetch` in browser and Node.js 18+

## Time Estimate: 3–4 hours
