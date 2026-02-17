import React, { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { api, type Post } from "../api/client";
import { PostList } from "../components/PostList";
import { AuthorCard } from "../components/AuthorCard";
import { PostListSkeleton, AuthorSkeleton } from "../components/Skeletons";
import { ErrorFallback } from "../components/ErrorFallback";

/**
 * Dashboard — kicks off all fetches BEFORE any Suspense renders.
 * Each section loads independently via its own Suspense boundary.
 */
export function Dashboard() {
  // Pre-kick: all three requests start simultaneously
  const postsResource  = useMemo(() => api.getPosts(), []);
  const authorResource = useMemo(() => api.getUser(1), []); // "site owner"

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, padding: 24 }}>
      {/* Main: post list */}
      <main>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Latest Posts</h1>
        <ErrorBoundary FallbackComponent={() => (
          <ErrorFallback title="Failed to load posts" />
        )}>
          <Suspense fallback={<PostListSkeleton />}>
            <PostList resource={postsResource} />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Sidebar: author card */}
      <aside>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#6b7280" }}>
          AUTHOR
        </h2>
        <ErrorBoundary FallbackComponent={() => (
          <ErrorFallback title="Failed to load author" />
        )}>
          <Suspense fallback={<AuthorSkeleton />}>
            <AuthorCard resource={authorResource} />
          </Suspense>
        </ErrorBoundary>
      </aside>
    </div>
  );
}
