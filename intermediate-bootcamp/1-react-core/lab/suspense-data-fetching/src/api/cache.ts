/**
 * Suspense-compatible resource wrapper.
 * Throws the pending promise so React can show a Suspense fallback.
 * Throws the error so an ErrorBoundary can catch it.
 * Returns the resolved value when ready.
 */
export interface Resource<T> {
  read(): T;
}

type ResourceStatus<T> =
  | { status: "pending"; suspender: Promise<void> }
  | { status: "success"; value: T }
  | { status: "error";   error: unknown };

export function createResource<T>(promise: Promise<T>): Resource<T> {
  let state: ResourceStatus<T> = {
    status: "pending",
    suspender: promise.then(
      (value) => { state = { status: "success", value }; },
      (error) => { state = { status: "error",   error }; }
    ),
  };

  return {
    read(): T {
      if (state.status === "pending") throw state.suspender;
      if (state.status === "error")   throw state.error;
      return state.value;
    },
  };
}

// URL-based cache — same URL returns same resource (no double fetches)
const resourceCache = new Map<string, Resource<unknown>>();

export function createCachedFetch<T>(url: string): Resource<T> {
  if (!resourceCache.has(url)) {
    const resource = createResource<T>(
      fetch(url).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json() as Promise<T>;
      })
    );
    resourceCache.set(url, resource as Resource<unknown>);
  }
  return resourceCache.get(url) as Resource<T>;
}

export function clearCache(): void {
  resourceCache.clear();
}
