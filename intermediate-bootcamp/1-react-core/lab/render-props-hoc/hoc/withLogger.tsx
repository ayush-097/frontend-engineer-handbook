import React, { useEffect, useRef } from "react";

/**
 * withLogger — logs render count and changed props to the console.
 * Zero impact on component behavior.
 *
 * @example
 * const LoggedButton = withLogger(Button);
 */
export function withLogger<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName?: string
) {
  const name = displayName ?? WrappedComponent.displayName ?? WrappedComponent.name ?? "Component";

  function WithLogger(props: P) {
    const renderCount = useRef(0);
    const prevProps   = useRef<P | null>(null);
    renderCount.current++;

    if (renderCount.current > 1 && prevProps.current) {
      const changedKeys = (Object.keys(props) as (keyof P)[]).filter(
        k => props[k] !== (prevProps.current as P)[k]
      );
      if (changedKeys.length) {
        console.log(`[${name}] render #${renderCount.current} | props changed: ${changedKeys.join(", ")}`);
      } else {
        console.log(`[${name}] render #${renderCount.current} | parent re-render`);
      }
    } else {
      console.log(`[${name}] mount (render #1)`);
    }

    useEffect(() => {
      prevProps.current = props;
    });

    useEffect(() => {
      return () => console.log(`[${name}] unmounted`);
    }, []);

    return <WrappedComponent {...props} />;
  }

  WithLogger.displayName = `withLogger(${name})`;
  return WithLogger;
}
