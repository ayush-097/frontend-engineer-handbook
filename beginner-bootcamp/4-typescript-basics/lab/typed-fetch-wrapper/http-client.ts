/**
 * Typed HTTP Client
 *
 * A generic, schema-driven HTTP client where response types are
 * automatically inferred from the endpoint being called.
 */

// ─── Core Types ───────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Base constraint — maps URL paths to HTTP method → response type */
export type RouteSchema = Record<
  string,
  Partial<Record<HttpMethod, unknown>>
>;

/** Extract the response type for a specific route + method combination */
export type RouteResponse<
  Schema extends RouteSchema,
  Path extends keyof Schema,
  Method extends keyof Schema[Path]
> = Schema[Path][Method];

/** Get the HTTP methods supported on a given path */
export type MethodsFor<
  Schema extends RouteSchema,
  Path extends keyof Schema
> = keyof Schema[Path] & HttpMethod;

/** Paths that support a specific HTTP method */
export type PathsFor<
  Schema extends RouteSchema,
  Method extends HttpMethod
> = {
  [P in keyof Schema]: Method extends keyof Schema[P] ? P : never;
}[keyof Schema];

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface RequestOptions {
  /** Interpolate :paramName in the URL */
  params?: Record<string, string>;
  /** Append as ?key=value query string */
  query?: Record<string, string | number | boolean>;
  /** Additional request headers */
  headers?: Record<string, string>;
  /** Request body (will be JSON serialized) */
  body?: unknown;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
  /** Override the default timeout (ms) */
  timeout?: number;
}

export interface ClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  /** Default timeout in ms (default: 10000) */
  timeout?: number;
  /** Called before each request — return modified options */
  onRequest?: (url: string, options: RequestInit) => RequestInit | Promise<RequestInit>;
  /** Called after each successful response */
  onResponse?: (response: Response) => Response | Promise<Response>;
  /** Called on error — return a value to recover, or throw to propagate */
  onError?: (error: ApiError) => never | Promise<never>;
}

// ─── Error Type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isClientError(): boolean { return this.status >= 400 && this.status < 500; }
  get isServerError(): boolean { return this.status >= 500; }
  get isNotFound(): boolean    { return this.status === 404; }
  get isUnauthorized(): boolean { return this.status === 401; }
  get isForbidden(): boolean   { return this.status === 403; }
}

// ─── URL Building ─────────────────────────────────────────────────────────────

function buildUrl(
  baseUrl: string,
  path: string,
  params: Record<string, string> = {},
  query: Record<string, string | number | boolean> = {}
): string {
  // Replace :paramName placeholders
  let resolvedPath = path;
  for (const [key, value] of Object.entries(params)) {
    resolvedPath = resolvedPath.replace(`:${key}`, encodeURIComponent(value));
  }

  const url = new URL(resolvedPath, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);

  // Append query parameters
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.append(key, String(value));
  }

  return url.toString();
}

// ─── Core Request Function ────────────────────────────────────────────────────

async function executeRequest<T>(
  config: ClientConfig,
  method: HttpMethod,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    params = {},
    query = {},
    headers = {},
    body,
    signal,
    timeout = config.timeout ?? 10_000,
  } = options;

  const url = buildUrl(config.baseUrl, path, params, query);

  // Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const abortSignal = signal
    ? anySignal([signal, controller.signal])
    : controller.signal;

  let requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.defaultHeaders,
      ...headers,
    },
    signal: abortSignal,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  // Run request interceptor
  if (config.onRequest) {
    requestInit = await config.onRequest(url, requestInit);
  }

  try {
    let response = await fetch(url, requestInit);
    clearTimeout(timeoutId);

    // Run response interceptor
    if (config.onResponse) {
      response = await config.onResponse(response);
    }

    if (!response.ok) {
      let errorBody: unknown;
      try { errorBody = await response.json(); } catch { /* ignore */ }

      const error = new ApiError(
        `HTTP ${response.status} ${response.statusText} — ${method} ${url}`,
        response.status,
        response.statusText,
        url,
        errorBody
      );

      if (config.onError) {
        return config.onError(error) as never;
      }
      throw error;
    }

    // 204 No Content
    if (response.status === 204 || response.headers.get("Content-Length") === "0") {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    if ((err as Error).name === "AbortError") {
      throw new ApiError("Request aborted", 0, "Aborted", url);
    }
    throw err;
  }
}

/** Combine multiple AbortSignals — aborts when any of them fires */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) { controller.abort(); break; }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}

// ─── Client Factory ───────────────────────────────────────────────────────────

export type TypedClient<Schema extends RouteSchema> = {
  get<Path extends PathsFor<Schema, "GET">>(
    path: Path,
    options?: RequestOptions
  ): Promise<RouteResponse<Schema, Path, "GET">>;

  post<Path extends PathsFor<Schema, "POST">>(
    path: Path,
    options?: RequestOptions
  ): Promise<RouteResponse<Schema, Path, "POST">>;

  put<Path extends PathsFor<Schema, "PUT">>(
    path: Path,
    options?: RequestOptions
  ): Promise<RouteResponse<Schema, Path, "PUT">>;

  patch<Path extends PathsFor<Schema, "PATCH">>(
    path: Path,
    options?: RequestOptions
  ): Promise<RouteResponse<Schema, Path, "PATCH">>;

  delete<Path extends PathsFor<Schema, "DELETE">>(
    path: Path,
    options?: RequestOptions
  ): Promise<RouteResponse<Schema, Path, "DELETE">>;

  request<
    Path extends keyof Schema,
    Method extends MethodsFor<Schema, Path>
  >(
    method: Method,
    path: Path,
    options?: RequestOptions
  ): Promise<RouteResponse<Schema, Path, Method>>;
};

/**
 * Create a type-safe HTTP client bound to an API schema.
 *
 * @example
 * const client = createClient<MyApi>({ baseUrl: "https://api.example.com" });
 * const users = await client.get("/users"); // User[]
 */
export function createClient<Schema extends RouteSchema>(
  config: ClientConfig
): TypedClient<Schema> {
  const req = <T>(
    method: HttpMethod,
    path: string,
    options?: RequestOptions
  ) => executeRequest<T>(config, method, path, options);

  return {
    get:    (path, opts) => req("GET",    path as string, opts),
    post:   (path, opts) => req("POST",   path as string, opts),
    put:    (path, opts) => req("PUT",    path as string, opts),
    patch:  (path, opts) => req("PATCH",  path as string, opts),
    delete: (path, opts) => req("DELETE", path as string, opts),
    request:(method, path, opts) =>
      req(method as HttpMethod, path as string, opts),
  } as TypedClient<Schema>;
}
