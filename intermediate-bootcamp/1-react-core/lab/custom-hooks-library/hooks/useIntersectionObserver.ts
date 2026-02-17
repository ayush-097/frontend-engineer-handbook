import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Observes an element for intersection with the viewport.
 * Returns [refCallback, entry]. Attach the callback ref to the target element.
 *
 * @example
 * const [ref, entry] = useIntersectionObserver({ rootMargin: "200px" });
 * return <img ref={ref} src={entry?.isIntersecting ? src : placeholder} />;
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefCallback<Element>, IntersectionObserverEntry | null] {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const optionsKey = JSON.stringify(options);

  const refCallback = useCallback(
    (node: Element | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) return;
      observerRef.current = new IntersectionObserver(
        ([newEntry]) => setEntry(newEntry),
        options
      );
      observerRef.current.observe(node);
    },
    [optionsKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [refCallback, entry];
}
