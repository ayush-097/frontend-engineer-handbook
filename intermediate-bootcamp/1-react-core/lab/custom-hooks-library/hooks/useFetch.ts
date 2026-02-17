import { useState, useEffect, useCallback, useRef } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseFetchResult<T> extends FetchState<T> {
  refetch: () => void;
}

/**
 * Fetches a URL and returns typed { data, loading, error, refetch }.
 * Cancels in-flight requests on URL change or unmount.
 *
 * @example
 * const { data: user, loading, error } = useFetch<User>(`/api/users/${id}`);
 */
export function useFetch<T>(
  url: string | null,
  options?: RequestInit
): UseFetchResult<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: !!url,
    error: null,
  });
  const [refetchIndex, setRefetchIndex] = useState(0);
  const optionsRef = useRef(options);
  useEffect(() => { optionsRef.current = options; });

  useEffect(() => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    setState(prev => ({ ...prev, loading: true, error: null }));

    fetch(url, { ...optionsRef.current, signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json() as T;
        setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setState({ data: null, loading: false, error: err });
        }
      });

    return () => controller.abort();
  }, [url, refetchIndex]);

  const refetch = useCallback(() => setRefetchIndex(i => i + 1), []);
  return { ...state, refetch };
}
