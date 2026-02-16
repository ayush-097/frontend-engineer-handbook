/**
 * Typed HTTP Client — Test Suite
 * Run: npx jest http-client.test.ts
 */
import { createClient, ApiError, buildUrl } from "./http-client";

// ─── Mock fetch ───────────────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: { get: () => null },
    json: () => Promise.resolve(body),
  } as unknown as Response);
}

interface TestApi {
  "/users":     { GET: { id: number; name: string }[]; POST: { id: number; name: string } };
  "/users/:id": { GET: { id: number; name: string }; DELETE: void };
  "/health":    { GET: { status: "ok" } };
}

const client = createClient<TestApi>({ baseUrl: "https://api.test.com" });

beforeEach(() => {
  mockFetch.mockReset();
});

// ─── HTTP Methods ─────────────────────────────────────────────────────────────

describe("HTTP Methods", () => {
  test("get() sends GET request", async () => {
    mockFetch.mockResolvedValue(mockResponse([{ id: 1, name: "Alice" }]));
    const users = await client.get("/users");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      expect.objectContaining({ method: "GET" })
    );
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe("Alice");
  });

  test("post() sends POST with JSON body", async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 2, name: "Bob" }));
    const newUser = await client.post("/users", { body: { name: "Bob" } });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Bob" }),
      })
    );
    expect(newUser.id).toBe(2);
  });

  test("delete() sends DELETE request", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204,
      headers: { get: () => "0" }, json: jest.fn() } as any);
    await client.delete("/users/:id", { params: { id: "1" } });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

// ─── URL Building ─────────────────────────────────────────────────────────────

describe("URL building", () => {
  test("interpolates :param placeholders", async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 42, name: "Carol" }));
    await client.get("/users/:id", { params: { id: "42" } });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/42"),
      expect.anything()
    );
  });

  test("appends query string parameters", async () => {
    mockFetch.mockResolvedValue(mockResponse([]));
    await client.get("/users", { query: { page: "1", limit: "10" } });

    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("limit=10");
  });

  test("includes baseUrl in request", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok" }));
    await client.get("/health");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("api.test.com"),
      expect.anything()
    );
  });
});

// ─── Headers ─────────────────────────────────────────────────────────────────

describe("Headers", () => {
  test("sends Content-Type: application/json by default", async () => {
    mockFetch.mockResolvedValue(mockResponse([]));
    await client.get("/users");

    const [, init] = mockFetch.mock.calls[0];
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  test("merges custom headers with defaults", async () => {
    mockFetch.mockResolvedValue(mockResponse([]));
    await client.get("/users", { headers: { "X-Custom": "value" } });

    const [, init] = mockFetch.mock.calls[0];
    expect((init.headers as Record<string, string>)["X-Custom"]).toBe("value");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  test("includes defaultHeaders from config", async () => {
    const clientWithDefaults = createClient<TestApi>({
      baseUrl: "https://api.test.com",
      defaultHeaders: { "X-App-Id": "my-app" },
    });
    mockFetch.mockResolvedValue(mockResponse([]));
    await clientWithDefaults.get("/users");

    const [, init] = mockFetch.mock.calls[0];
    expect((init.headers as Record<string, string>)["X-App-Id"]).toBe("my-app");
  });
});

// ─── Error Handling ───────────────────────────────────────────────────────────

describe("Error handling", () => {
  test("throws ApiError on 4xx response", async () => {
    mockFetch.mockResolvedValue(mockResponse({ message: "Not found" }, 404));

    await expect(client.get("/users/:id", { params: { id: "999" } }))
      .rejects.toBeInstanceOf(ApiError);
  });

  test("ApiError has correct status code", async () => {
    mockFetch.mockResolvedValue(mockResponse({ message: "Unauthorized" }, 401));

    try {
      await client.get("/health");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(401);
      expect((err as ApiError).isUnauthorized).toBe(true);
    }
  });

  test("throws ApiError on 5xx response", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "Server error" }, 500));

    await expect(client.get("/users"))
      .rejects.toBeInstanceOf(ApiError);
  });

  test("ApiError.isServerError is true for 5xx", async () => {
    mockFetch.mockResolvedValue(mockResponse({}, 503));

    try {
      await client.get("/users");
    } catch (err) {
      expect((err as ApiError).isServerError).toBe(true);
    }
  });
});

// ─── Interceptors ─────────────────────────────────────────────────────────────

describe("Interceptors", () => {
  test("onRequest can modify headers", async () => {
    const clientWithInterceptor = createClient<TestApi>({
      baseUrl: "https://api.test.com",
      onRequest: async (url, init) => ({
        ...init,
        headers: { ...(init.headers as Record<string, string>), Authorization: "Bearer token123" },
      }),
    });
    mockFetch.mockResolvedValue(mockResponse([]));
    await clientWithInterceptor.get("/users");

    const [, init] = mockFetch.mock.calls[0];
    expect((init.headers as Record<string, string>)["Authorization"]).toBe("Bearer token123");
  });

  test("onError is called on request failure", async () => {
    const onError = jest.fn().mockImplementation((err) => { throw err; });
    const clientWithErrorHandler = createClient<TestApi>({
      baseUrl: "https://api.test.com",
      onError,
    });
    mockFetch.mockResolvedValue(mockResponse({}, 500));

    await expect(clientWithErrorHandler.get("/health")).rejects.toBeInstanceOf(ApiError);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(ApiError);
  });
});

// ─── Cancellation ─────────────────────────────────────────────────────────────

describe("Request cancellation", () => {
  test("supports AbortSignal", async () => {
    const controller = new AbortController();
    mockFetch.mockImplementation(() => new Promise((_, reject) => {
      controller.signal.addEventListener("abort", () =>
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }))
      );
    }));

    const promise = client.get("/users", { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });
});
