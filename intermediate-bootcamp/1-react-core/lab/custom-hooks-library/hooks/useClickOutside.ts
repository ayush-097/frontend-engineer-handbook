import { useEffect, useRef } from "react";

/**
 * Calls the handler when a click or touch occurs outside the attached element.
 * Returns a ref to attach to the element to watch.
 *
 * @example
 * function Dropdown({ onClose }) {
 *   const ref = useClickOutside<HTMLDivElement>(onClose);
 *   return <div ref={ref}>Dropdown content</div>;
 * }
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void
): React.RefObject<T> {
  const elementRef = useRef<T>(null);
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });

  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      const el = elementRef.current;
      if (!el || el.contains(event.target as Node)) return;
      handlerRef.current(event);
    }
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);

  return elementRef;
}
