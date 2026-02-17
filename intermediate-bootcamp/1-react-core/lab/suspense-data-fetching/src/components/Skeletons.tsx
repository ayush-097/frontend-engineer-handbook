import React from "react";

const shimmer: React.CSSProperties = {
  background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: 4,
};

export function PostListSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ ...shimmer, height: 14, width: "70%", marginBottom: 8 }} />
          <div style={{ ...shimmer, height: 12, width: "90%" }} />
        </div>
      ))}
    </div>
  );
}

export function AuthorSkeleton() {
  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ ...shimmer, height: 18, width: "50%", marginBottom: 8 }} />
      <div style={{ ...shimmer, height: 13, width: "70%", marginBottom: 6 }} />
      <div style={{ ...shimmer, height: 13, width: "40%" }} />
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ padding: "12px 0", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ ...shimmer, height: 13, width: "40%", marginBottom: 6 }} />
          <div style={{ ...shimmer, height: 12, width: "30%", marginBottom: 8 }} />
          <div style={{ ...shimmer, height: 12, width: "90%" }} />
        </div>
      ))}
    </div>
  );
}
