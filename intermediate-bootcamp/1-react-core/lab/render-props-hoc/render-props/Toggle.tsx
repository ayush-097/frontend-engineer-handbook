import { useState, useCallback } from "react";
import type React from "react";

interface ToggleRenderProps {
  on: boolean;
  toggle: () => void;
  setOn:  () => void;
  setOff: () => void;
}

interface ToggleProps {
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
  children: (props: ToggleRenderProps) => React.ReactNode;
}

/**
 * Toggle — boolean state as a render prop.
 *
 * @example
 * <Toggle defaultOn={false}>
 *   {({ on, toggle }) => (
 *     <button onClick={toggle}>{on ? "ON" : "OFF"}</button>
 *   )}
 * </Toggle>
 */
export function Toggle({ defaultOn = false, onChange, children }: ToggleProps) {
  const [on, setOnState] = useState(defaultOn);

  const toggle = useCallback(() => setOnState(v => { onChange?.(!v); return !v; }), [onChange]);
  const setOn  = useCallback(() => setOnState(() => { onChange?.(true);  return true;  }), [onChange]);
  const setOff = useCallback(() => setOnState(() => { onChange?.(false); return false; }), [onChange]);

  return <>{children({ on, toggle, setOn, setOff })}</>;
}
