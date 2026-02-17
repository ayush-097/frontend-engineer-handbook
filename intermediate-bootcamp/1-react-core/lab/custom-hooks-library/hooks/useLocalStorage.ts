import { useState, useEffect, useCallback } from "react";

type Setter<T> = (value: T | ((prev: T) => T)) => void;

/**
 * useState backed by localStorage. Serializes/deserializes JSON
 * and syncs across browser tabs via the storage event.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, Setter<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue: Setter<T> = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const resolved = typeof value === "function"
          ? (value as (prev: T) => T)(prev)
          : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          console.warn(`useLocalStorage: could not write key "${key}"`);
        }
        return resolved;
      });
    },
    [key]
  );

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== key || e.newValue === null) return;
      try {
        setStoredValue(JSON.parse(e.newValue) as T);
      } catch { /* ignore */ }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  return [storedValue, setValue];
}
