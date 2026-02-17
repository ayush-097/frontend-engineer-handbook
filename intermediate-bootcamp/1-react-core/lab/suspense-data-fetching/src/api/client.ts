import { createCachedFetch, type Resource } from "./cache";

const BASE = "https://jsonplaceholder.typicode.com";

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  website: string;
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

// Pre-kick-off fetch — call these BEFORE rendering, pass resources as props
export const api = {
  getPosts:    (): Resource<Post[]>    => createCachedFetch(`${BASE}/posts?_limit=10`),
  getPost:     (id: number): Resource<Post>     => createCachedFetch(`${BASE}/posts/${id}`),
  getUser:     (id: number): Resource<User>     => createCachedFetch(`${BASE}/users/${id}`),
  getComments: (postId: number): Resource<Comment[]> =>
    createCachedFetch(`${BASE}/posts/${postId}/comments`),
};
