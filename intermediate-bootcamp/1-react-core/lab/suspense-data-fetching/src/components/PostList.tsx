import React from "react";
import type { Resource } from "../api/cache";
import type { Post } from "../api/client";

interface PostListProps {
  resource: Resource<Post[]>;
  onSelect?: (post: Post) => void;
  selectedId?: number;
}

/**
 * PostList suspends until the resource resolves.
 * No loading state needed here — Suspense handles it.
 */
export function PostList({ resource, onSelect, selectedId }: PostListProps) {
  const posts = resource.read(); // Suspends if pending, throws if error

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {posts.map(post => (
        <li
          key={post.id}
          onClick={() => onSelect?.(post)}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
            cursor: onSelect ? "pointer" : "default",
            background: selectedId === post.id ? "#eff6ff" : "transparent",
            fontWeight: selectedId === post.id ? 600 : 400,
          }}
        >
          <div style={{ fontSize: 14, color: "#111827", marginBottom: 4 }}>
            {post.title}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {post.body}
          </div>
        </li>
      ))}
    </ul>
  );
}
