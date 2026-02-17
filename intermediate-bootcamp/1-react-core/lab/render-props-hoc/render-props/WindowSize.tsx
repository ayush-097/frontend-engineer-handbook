import { useState, useEffect } from "react";
import type React from "react";

interface WindowSizeRenderProps {
  width: number;
  height: number;
}

interface WindowSizeProps {
  children: (props: WindowSizeRenderProps) => React.ReactNode;
}

/**
 * WindowSize — renders with current viewport dimensions.
 * Updates reactively on resize.
 */
export function WindowSize({ children }: WindowSizeProps) {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth  : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return <>{children(size)}</>;
}
