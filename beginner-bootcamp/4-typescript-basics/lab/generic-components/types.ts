/**
 * Shared types for the Generic Components lab
 */

// ─── Async State ──────────────────────────────────────────────────────────────

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error }
  | { status: "empty" };

// ─── Table ────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
  /** Must be a key of T (for type-safe default rendering) */
  key: keyof T;
  header: string;
  sortable?: boolean;
  /** Custom render function — receives the full row, returns JSX */
  render?: (row: T, index: number) => React.ReactNode;
  /** Width hint */
  width?: string | number;
  /** Text alignment */
  align?: "left" | "center" | "right";
}

export interface SortState<T> {
  column: keyof T | null;
  direction: SortDirection;
}

// ─── Select ───────────────────────────────────────────────────────────────────

export interface SelectOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}
