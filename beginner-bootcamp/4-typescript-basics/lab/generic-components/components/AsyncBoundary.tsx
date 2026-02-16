import React from "react";
import type { AsyncState } from "../types";

interface AsyncBoundaryProps<T> {
  /** The async state to render against */
  state: AsyncState<T>;
  /**
   * Render prop — called with data when status is "success".
   * TypeScript infers T from the state prop, so this receives the correct type.
   */
  children: (data: T) => React.ReactNode;
  /** Shown while status is "loading" */
  loading?: React.ReactNode;
  /** Called with the Error when status is "error" */
  error?: (err: Error) => React.ReactNode;
  /** Shown when status is "empty" */
  empty?: React.ReactNode;
  /** Shown when status is "idle" (defaults to null) */
  idle?: React.ReactNode;
}

/**
 * AsyncBoundary<T>
 *
 * Renders different UI for each phase of async data fetching.
 * The children render-prop receives the resolved data, fully typed as T.
 *
 * @example
 * ```tsx
 * const [state, setState] = useAsyncState<User>();
 *
 * <AsyncBoundary
 *   state={state}
 *   loading={<Spinner />}
 *   error={(e) => <ErrorCard message={e.message} />}
 *   empty={<EmptyState />}
 * >
 *   {(user) => <UserProfile user={user} />}
 *   {//         ^--- user: User  (inferred from state's generic param)
 * </AsyncBoundary>
 * ```
 */
export function AsyncBoundary<T>({
  state,
  children,
  loading = (
    <div role="status" aria-busy="true" aria-label="Loading">
      Loading…
    </div>
  ),
  error: renderError = (e) => (
    <div role="alert" aria-live="assertive">
      {e.message}
    </div>
  ),
  empty = <div>No data available</div>,
  idle = null,
}: AsyncBoundaryProps<T>): React.ReactElement | null {
  switch (state.status) {
    case "idle":
      return <>{idle}</>;

    case "loading":
      return <>{loading}</>;

    case "error":
      return <>{renderError(state.error)}</>;

    case "empty":
      return <>{empty}</>;

    case "success":
      // TypeScript narrows state.data to T here — fully safe
      return <>{children(state.data)}</>;
  }
}
