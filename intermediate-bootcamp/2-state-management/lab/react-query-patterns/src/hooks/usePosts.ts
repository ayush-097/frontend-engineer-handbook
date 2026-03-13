import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { api, type Post } from "../api/client";

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: ({ pageParam = 1 }) => api.fetchPosts(pageParam, 10),
    getNextPageParam: (lastPage, pages) => lastPage.length === 10 ? pages.length + 1 : undefined,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPost,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previous = queryClient.getQueryData(["posts"]);
      queryClient.setQueryData(["posts"], (old: Post[] = []) => [
        { ...newPost, id: Date.now() },
        ...old,
      ]);
      return { previous };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(["posts"], context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });
}
