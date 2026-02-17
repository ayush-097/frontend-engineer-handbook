import React from "react";
import type { Resource } from "../api/cache";
import type { Comment } from "../api/client";

interface CommentThreadProps {
  resource: Resource<Comment[]>;
}

export function CommentThread({ resource }: CommentThreadProps) {
  const comments = resource.read();

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
        {comments.length} Comments
      </h3>
      {comments.map(comment => (
        <div key={comment.id} style={{
          padding: "12px 0", borderTop: "1px solid #f3f4f6"
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
            {comment.name}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
            {comment.email}
          </div>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
