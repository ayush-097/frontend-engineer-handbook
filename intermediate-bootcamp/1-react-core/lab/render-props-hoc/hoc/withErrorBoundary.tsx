import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * withErrorBoundary — wraps a component in an ErrorBoundary.
 *
 * @example
 * const SafeChart = withErrorBoundary(Chart, <p>Chart failed to load</p>);
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback: React.ReactNode
) {
  class Boundary extends React.Component<P, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
      console.error(`[withErrorBoundary(${WrappedComponent.name})]`, error, info);
    }

    render() {
      if (this.state.hasError) return fallback;
      return <WrappedComponent {...this.props} />;
    }
  }

  (Boundary as React.ComponentClass).displayName =
    `withErrorBoundary(${WrappedComponent.displayName ?? WrappedComponent.name})`;

  return Boundary;
}
