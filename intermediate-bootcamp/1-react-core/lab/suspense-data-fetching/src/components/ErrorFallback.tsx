import React from "react";

interface ErrorFallbackProps {
  title?: string;
  retry?: () => void;
}

export function ErrorFallback({ title = "Something went wrong", retry }: ErrorFallbackProps) {
  return (
    <div role="alert" style={{
      padding: 16, background: "#fef2f2", border: "1px solid #fecaca",
      borderRadius: 8, color: "#b91c1c"
    }}>
      <p style={{ margin: 0, fontWeight: 500 }}>{title}</p>
      {retry && (
        <button onClick={retry} style={{ marginTop: 8, fontSize: 13 }}>
          Try again
        </button>
      )}
    </div>
  );
}
