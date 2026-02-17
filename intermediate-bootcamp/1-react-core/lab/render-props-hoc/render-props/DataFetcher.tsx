import { useEffect, useState, useRef } from "react";
import type React from "react";

interface FetchRenderProps<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface DataFetcherProps<T> {
  url: string;
  children: (props: FetchRenderProps<T>) => React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * DataFetcher<T> — generic render-prop data fetcher.
 * Cancels in-flight requests on URL change or unmount.
 *
 * @example
 * <DataFetcher<User[]> url="/api/users">
 *   {({ data, loading, error }) => (
 *     loading ? <Spinner /> : <UserList users={data!} />
 *   )}
 * </DataFetcher>
 */
export function DataFetcher<T>({ url, children, fallback }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const optionsRef = useRef<RequestInit | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal, ...optionsRef.current })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(err => {
        if (err.name !== "AbortError") {
          setError(err); setLoading(false);
        }
      });

    return () => controller.abort();
  }, [url, refetchIndex]);

  if (fallback && loading) return <>{fallback}</>;

  return <>{children({ data, loading, error, refetch: () => setRefetchIndex(i => i + 1) })}</>;
}
