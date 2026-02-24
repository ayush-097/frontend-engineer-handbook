import { describe, expect, it } from "vitest";
import { create } from "zustand";

describe("Zustand store", () => {
  it("updates state", () => {
    const useStore = create<{ count: number; inc: () => void }>((set) => ({
      count: 0,
      inc: () => set((s) => ({ count: s.count + 1 })),
    }));
    const { inc, count } = useStore.getState();
    expect(count).toBe(0);
    inc();
    expect(useStore.getState().count).toBe(1);
  });

  it("selectors prevent re-renders", () => {
    const useStore = create(() => ({ a: 1, b: 2 }));
    const a = useStore.getState().a;
    expect(a).toBe(1);
  });
});
