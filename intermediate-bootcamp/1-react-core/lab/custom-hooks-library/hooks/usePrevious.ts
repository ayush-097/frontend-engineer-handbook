import { useRef, useEffect } from "react";

/**
 * Returns the value from the previous render.
 * Returns undefined on the first render.
 *
 * @example
 * const prevCount = usePrevious(count);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => { ref.current = value; }); // Runs AFTER render
  return ref.current;
}
