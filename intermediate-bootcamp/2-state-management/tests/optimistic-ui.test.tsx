import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

describe("Optimistic mutations", () => {
  it("updates cache immediately", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["posts"], [{ id: 1, title: "Old" }]);

    const updatePost = vi.fn().mockResolvedValue({ id: 1, title: "New" });
    
    const mutation = {
      mutationFn: updatePost,
      onMutate: async (vars) => {
        queryClient.setQueryData(["posts"], [{ id: 1, title: vars.title }]);
      },
    };

    await mutation.onMutate({ id: 1, title: "New" });
    const data = queryClient.getQueryData(["posts"]);
    expect(data).toEqual([{ id: 1, title: "New" }]);
  });
});
