import { useState, useEffect } from "react";

/**
 * Returns a debounced version of `value` that only updates after
 * `delay` milliseconds of inactivity.
 *
 * @example
 * function SearchBox() {
 *   const [input, setInput] = useState("");
 *   const debouncedInput = useDebounce(input, 300);
 *
 *   useEffect(() => {
 *     if (debouncedInput) fetchResults(debouncedInput);
 *   }, [debouncedInput]);
 * }
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
