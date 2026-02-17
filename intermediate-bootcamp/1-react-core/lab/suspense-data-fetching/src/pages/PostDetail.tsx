import { Suspense, useMemo, useState, useTransition } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { api, type Post } from "../api/client";
import { AuthorCard } from "../components/AuthorCard";
import { CommentThread } from "../components/CommentThread";
import { ErrorFallback } from "../components/ErrorFallback";
import { AuthorSkeleton, CommentSkeleton } from "../components/Skeletons";

interface PostDetailProps {
  post: Post;
  onBack?: () => void;
}

/**
 * PostDetail — shows post content with comments and author.
 * Uses useTransition so navigating to a new post keeps
 * the current content visible while next content loads.
 */
export function PostDetail({ post: initialPost, onBack }: PostDetailProps) {
  const [currentPost, setCurrentPost] = useState(initialPost);
  const [isPending, startTransition] = useTransition();

  // Kick off related fetches for current post
  const authorResource   = useMemo(() => api.getUser(currentPost.userId), [currentPost.userId]);
  const commentsResource = useMemo(() => api.getComments(currentPost.id), [currentPost.id]);

  function navigateToPost(post: Post) {
    startTransition(() => {
      // Lower-priority update — current content stays visible while loading
      setCurrentPost(post);
    });
  }

  return (
    <div style={{ padding: 24, opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
      {isPending && (
        <div style={{ position: "fixed", top: 16, right: 16,
          background: "#6366f1", color: "white", borderRadius: 4, padding: "4px 10px", fontSize: 12 }}>
          Loading…
        </div>
      )}

      {onBack && (
        <button onClick={onBack} style={{ marginBottom: 16, fontSize: 13 }}>
          ← Back
        </button>
      )}

      <article>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          {currentPost.title}
        </h1>
        <p style={{ color: "#4b5563", lineHeight: 1.6 }}>{currentPost.body}</p>
      </article>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, marginTop: 32 }}>
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Comments</h2>
          <ErrorBoundary FallbackComponent={() => <ErrorFallback title="Failed to load comments" />}>
            <Suspense fallback={<CommentSkeleton />}>
              <CommentThread resource={commentsResource} />
            </Suspense>
          </ErrorBoundary>
        </section>

        <aside>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#6b7280" }}>
            AUTHOR
          </h2>
          <ErrorBoundary FallbackComponent={() => <ErrorFallback title="Failed to load author" />}>
            <Suspense fallback={<AuthorSkeleton />}>
              <AuthorCard resource={authorResource} />
            </Suspense>
          </ErrorBoundary>
        </aside>
      </div>
    </div>
  );
}
