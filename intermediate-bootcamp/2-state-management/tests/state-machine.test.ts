import { describe, expect, it } from "vitest";
import { createMachine, interpret } from "xstate";

describe("XState machine", () => {
  const machine = createMachine({
    id: "toggle",
    initial: "inactive",
    states: {
      inactive: { on: { TOGGLE: "active" } },
      active:   { on: { TOGGLE: "inactive" } },
    },
  });

  it("transitions between states", () => {
    const service = interpret(machine).start();
    expect(service.state.value).toBe("inactive");
    service.send("TOGGLE");
    expect(service.state.value).toBe("active");
  });
});
