import React, { createContext, useContext, useState, useMemo } from "react";

interface Theme {
  colors: { primary: string; background: string; text: string };
  borderRadius: string;
  fontFamily: string;
}

const defaultTheme: Theme = {
  colors: { primary: "#6366f1", background: "#ffffff", text: "#111827" },
  borderRadius: "6px",
  fontFamily: "system-ui, sans-serif",
};

export const ThemeContext = createContext<Theme>(defaultTheme);

export function ThemeProvider({ theme = defaultTheme, children }: {
  theme?: Theme;
  children: React.ReactNode;
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export interface WithThemeProps {
  theme: Theme;
}

/**
 * withTheme — injects `theme` prop from ThemeContext.
 * The wrapped component declares `theme` in its props;
 * consumers don't pass it — the HOC provides it.
 *
 * @example
 * interface ButtonProps extends WithThemeProps { label: string }
 * function Button({ label, theme }: ButtonProps) { ... }
 * const ThemedButton = withTheme(Button);
 * <ThemedButton label="Click" />  // ← no `theme` needed
 */
export function withTheme<P extends WithThemeProps>(
  WrappedComponent: React.ComponentType<P>
) {
  function WithTheme(props: Omit<P, "theme">) {
    const theme = useContext(ThemeContext);
    return <WrappedComponent {...(props as P)} theme={theme} />;
  }

  WithTheme.displayName = `withTheme(${WrappedComponent.displayName ?? WrappedComponent.name})`;
  return WithTheme;
}
