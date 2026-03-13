const BASE_URL = "https://jsonplaceholder.typicode.com";

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  return response.json();
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export const api = {
  fetchPosts: (page = 1, limit = 10) => fetcher<Post[]>(`/posts?_page=${page}&_limit=${limit}`),
  fetchPost: (id: number) => fetcher<Post>(`/posts/${id}`),
  createPost: (post: Omit<Post, "id">) => fetcher<Post>("/posts", { method: "POST", body: JSON.stringify(post) }),
  updatePost: (id: number, post: Partial<Post>) => fetcher<Post>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(post) }),
  deletePost: (id: number) => fetcher<void>(`/posts/${id}`, { method: "DELETE" }),
};
