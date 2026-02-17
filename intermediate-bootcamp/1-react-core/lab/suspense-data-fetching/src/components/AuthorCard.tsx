import React from "react";
import type { Resource } from "../api/cache";
import type { User } from "../api/client";

interface AuthorCardProps {
  resource: Resource<User>;
}

export function AuthorCard({ resource }: AuthorCardProps) {
  const user = resource.read();

  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{user.name}</div>
      <div style={{ fontSize: 13, color: "#6b7280" }}>{user.email}</div>
      <div style={{ fontSize: 13, color: "#6b7280" }}>@{user.username}</div>
      <a href={`https://${user.website}`} style={{ fontSize: 12, color: "#6366f1" }}>
        {user.website}
      </a>
    </div>
  );
}
