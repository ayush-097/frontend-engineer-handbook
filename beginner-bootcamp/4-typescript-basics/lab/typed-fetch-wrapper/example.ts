/**
 * Example usage of the typed HTTP client.
 * Run: npx ts-node example.ts
 */
import { createClient, ApiError } from "./http-client";

// ─── Define your API schema ───────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

interface Api {
  "/users":             { GET: User[];  POST: Omit<User, "id" | "createdAt"> };
  "/users/:id":         { GET: User;    PUT: Partial<User>; DELETE: void };
  "/users/:id/posts":   { GET: Post[] };
  "/posts":             { GET: Post[];  POST: Omit<Post, "id"> };
  "/auth/login":        { POST: { token: string; expiresAt: string } };
  "/auth/logout":       { POST: void };
}

// ─── Create client ────────────────────────────────────────────────────────────

const api = createClient<Api>({
  baseUrl: "https://jsonplaceholder.typicode.com",
  timeout: 5000,
  defaultHeaders: {
    "X-Client-Version": "1.0.0",
  },
  onRequest: async (url, init) => {
    const token = localStorage?.getItem?.("authToken");
    if (token) {
      return {
        ...init,
        headers: { ...init.headers as Record<string, string>, Authorization: `Bearer ${token}` },
      };
    }
    return init;
  },
  onError: async (error) => {
    if (error.isUnauthorized) {
      // Redirect to login
      console.log("Session expired, redirecting to login");
    }
    throw error;
  },
});

// ─── Usage — all fully typed ──────────────────────────────────────────────────

async function demo() {
  // GET /users → User[]
  const users = await api.get("/users");
  console.log(`Got ${users.length} users`);
  console.log(users[0].name); // ✅ TypeScript knows this is a string

  // GET /users/:id → User
  const user = await api.get("/users/:id", {
    params: { id: "1" },
  });
  console.log(user.email); // ✅ TypeScript knows this is User

  // POST /users → User
  const newUser = await api.post("/users", {
    body: {
      name: "Alice Smith",
      email: "alice@example.com",
      role: "user" as const,
    },
  });
  console.log(`Created user: ${newUser.id}`); // ✅ id is a number

  // Error handling
  try {
    await api.get("/users/:id", { params: { id: "99999" } });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.isNotFound) console.log("User not found");
      else console.error(`API Error ${err.status}:`, err.message);
    }
  }

  // ─── Type errors caught at compile time ──────────────────────────────────

  // @ts-expect-error — DELETE is not defined for /users in our schema
  await api.delete("/users");

  // @ts-expect-error — /nonexistent is not in the schema
  await api.get("/nonexistent");
}

demo().catch(console.error);
