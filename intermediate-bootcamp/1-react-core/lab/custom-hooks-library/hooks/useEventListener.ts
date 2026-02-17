import { useEffect, useRef } from "react";

/**
 * Attaches an event listener to a target with automatic cleanup.
 * The handler is always up-to-date (no stale closure).
 *
 * @example
 * useEventListener(window, "keydown", (e) => {
 *   if ((e as KeyboardEvent).key === "Escape") closeModal();
 * });
 */
export function useEventListener(
  target: EventTarget | null | undefined,
  eventName: string,
  handler: (event: Event) => void,
  options?: AddEventListenerOptions
): void {
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });

  useEffect(() => {
    if (!target) return;
    const listener = (event: Event) => handlerRef.current(event);
    target.addEventListener(eventName, listener, options);
    return () => target.removeEventListener(eventName, listener, options);
  }, [target, eventName, options?.capture, options?.passive, options?.once]);
}
