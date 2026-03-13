# Homework: Complex State Machine

## Objective

Model a traffic light system with pedestrian crossing using XState. This homework teaches you to eliminate impossible states through explicit state modeling.

## Scenario

A smart traffic light at a busy intersection:
- **Normal cycle:** Red (5s) → Green (10s) → Yellow (2s) → Red
- **Pedestrian button:** When pressed during green, triggers pedestrian crossing after yellow
- **Pedestrian crossing:** Gives pedestrians 8 seconds to cross safely
- **Walk signal:** LED display shows "WALK" / "DON'T WALK"

## Requirements

### States
```
red                    — Vehicles stopped, may transition to green
green                  — Vehicles go, pedestrian button activates  
yellow                 — Vehicles prepare to stop
pedestrianCrossing     — Vehicles stopped, pedestrians crossing
```

### Events
```
TIMER               — Auto-transition after duration
PEDESTRIAN_PRESS    — Button pressed by pedestrian
```

### Context
```tsx
{
  pedestrianWaiting: boolean,      // Was button pressed?
  crossingsToday: number,           // Analytics counter
  lastPressTime: number | null      // Timestamp of button press
}
```

### Guards
```
pedestrianWaiting      — Button was pressed during this cycle
canCross               — Safe to allow crossing (red for vehicles)
```

## Implementation

```tsx
// src/trafficMachine.ts
import { createMachine, assign } from "xstate";

export const trafficMachine = createMachine(
  {
    id: "traffic",
    initial: "red",
    context: {
      pedestrianWaiting: false,
      crossingsToday: 0,
      lastPressTime: null,
    },
    states: {
      red: {
        entry: "logStateChange",
        after: {
          5000: [
            {
              target: "green",
              actions: "resetPedestrianWaiting",
            },
          ],
        },
        on: {
          PEDESTRIAN_PRESS: {
            // Button press during red is queued for next cycle
            actions: assign({
              pedestrianWaiting: true,
              lastPressTime: () => Date.now(),
            }),
          },
        },
      },

      green: {
        entry: "logStateChange",
        after: {
          10000: "yellow",
        },
        on: {
          PEDESTRIAN_PRESS: {
            // Activate crossing sequence
            actions: assign({
              pedestrianWaiting: true,
              lastPressTime: () => Date.now(),
            }),
          },
        },
      },

      yellow: {
        entry: "logStateChange",
        after: {
          2000: [
            {
              target: "pedestrianCrossing",
              guard: "pedestrianWaiting",
            },
            {
              target: "red",
            },
          ],
        },
      },

      pedestrianCrossing: {
        entry: [
          "logStateChange",
          "activateWalkSignal",
          assign({
            crossingsToday: (ctx) => ctx.crossingsToday + 1,
            pedestrianWaiting: false,
          }),
        ],
        exit: "deactivateWalkSignal",
        after: {
          8000: "red",
        },
      },
    },
  },
  {
    guards: {
      pedestrianWaiting: (context) => context.pedestrianWaiting,
      canCross: (context, event) => {
        // Could add time-of-day logic here
        return true;
      },
    },
    actions: {
      logStateChange: (context, event, meta) => {
        console.log(`State: ${meta.state.value}`);
      },
      activateWalkSignal: () => {
        console.log("🚶 WALK signal activated");
      },
      deactivateWalkSignal: () => {
        console.log("🛑 DON'T WALK signal");
      },
      resetPedestrianWaiting: assign({
        pedestrianWaiting: false,
        lastPressTime: null,
      }),
    },
  }
);
```

## Visualization

Use XState's visualizer to see your machine:

1. Go to https://stately.ai/viz
2. Paste your machine code
3. Take screenshot showing:
   - All 4 states
   - Transitions with labels
   - Guards highlighted
   - Context values

## Testing

```tsx
// src/trafficMachine.test.ts
import { describe, it, expect } from "vitest";
import { createActor } from "xstate";
import { trafficMachine } from "./trafficMachine";

describe("Traffic Light Machine", () => {
  it("starts in red state", () => {
    const actor = createActor(trafficMachine);
    actor.start();
    expect(actor.getSnapshot().value).toBe("red");
    actor.stop();
  });

  it("cycles through normal sequence without pedestrian", async () => {
    const actor = createActor(trafficMachine);
    actor.start();

    // Red → Green (after 5s)
    await new Promise((resolve) => setTimeout(resolve, 5100));
    expect(actor.getSnapshot().value).toBe("green");

    // Green → Yellow (after 10s)
    await new Promise((resolve) => setTimeout(resolve, 10100));
    expect(actor.getSnapshot().value).toBe("yellow");

    // Yellow → Red (after 2s, no pedestrian waiting)
    await new Promise((resolve) => setTimeout(resolve, 2100));
    expect(actor.getSnapshot().value).toBe("red");

    actor.stop();
  });

  it("enters pedestrian crossing when button pressed", async () => {
    const actor = createActor(trafficMachine);
    actor.start();

    // Wait for green
    await new Promise((resolve) => setTimeout(resolve, 5100));
    expect(actor.getSnapshot().value).toBe("green");

    // Press pedestrian button
    actor.send({ type: "PEDESTRIAN_PRESS" });
    expect(actor.getSnapshot().context.pedestrianWaiting).toBe(true);

    // Wait for yellow
    await new Promise((resolve) => setTimeout(resolve, 10100));
    expect(actor.getSnapshot().value).toBe("yellow");

    // Yellow → Pedestrian Crossing (because button was pressed)
    await new Promise((resolve) => setTimeout(resolve, 2100));
    expect(actor.getSnapshot().value).toBe("pedestrianCrossing");
    expect(actor.getSnapshot().context.crossingsToday).toBe(1);

    actor.stop();
  });

  it("increments crossing counter", async () => {
    const actor = createActor(trafficMachine);
    actor.start();

    // First crossing
    await new Promise((resolve) => setTimeout(resolve, 5100)); // Green
    actor.send({ type: "PEDESTRIAN_PRESS" });
    await new Promise((resolve) => setTimeout(resolve, 10100)); // Yellow
    await new Promise((resolve) => setTimeout(resolve, 2100)); // Pedestrian
    expect(actor.getSnapshot().context.crossingsToday).toBe(1);

    // Wait for red → green cycle
    await new Promise((resolve) => setTimeout(resolve, 8100 + 5100));

    // Second crossing
    actor.send({ type: "PEDESTRIAN_PRESS" });
    await new Promise((resolve) => setTimeout(resolve, 10100 + 2100));
    expect(actor.getSnapshot().context.crossingsToday).toBe(2);

    actor.stop();
  });
});
```

## React Integration (Optional)

```tsx
// src/TrafficLight.tsx
import { useMachine } from "@xstate/react";
import { trafficMachine } from "./trafficMachine";

export function TrafficLight() {
  const [state, send] = useMachine(trafficMachine);

  const getColor = () => {
    switch (state.value) {
      case "red":
      case "pedestrianCrossing":
        return "bg-red-500";
      case "yellow":
        return "bg-yellow-500";
      case "green":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-8">
      <div className="w-32 h-96 bg-black rounded-lg flex flex-col justify-around items-center p-4">
        <div className={`w-20 h-20 rounded-full ${
          state.matches("red") || state.matches("pedestrianCrossing")
            ? "bg-red-500"
            : "bg-gray-700"
        }`} />
        <div className={`w-20 h-20 rounded-full ${
          state.matches("yellow") ? "bg-yellow-500" : "bg-gray-700"
        }`} />
        <div className={`w-20 h-20 rounded-full ${
          state.matches("green") ? "bg-green-500" : "bg-gray-700"
        }`} />
      </div>

      <div className="mt-4">
        <button
          onClick={() => send({ type: "PEDESTRIAN_PRESS" })}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={state.matches("pedestrianCrossing")}
        >
          🚶 Press to Cross
        </button>
      </div>

      <div className="mt-4 text-sm">
        <p>State: {String(state.value)}</p>
        <p>Waiting: {state.context.pedestrianWaiting ? "Yes" : "No"}</p>
        <p>Crossings today: {state.context.crossingsToday}</p>
        {state.matches("pedestrianCrossing") && (
          <p className="text-green-600 font-bold">🚶 WALK</p>
        )}
      </div>
    </div>
  );
}
```

## Deliverables

```
traffic-light/
├── src/
│   ├── trafficMachine.ts      ← State machine definition
│   ├── trafficMachine.test.ts ← 4 tests
│   └── TrafficLight.tsx       ← (Optional) React component
├── screenshots/
│   └── visualizer.png         ← XState visualizer screenshot
└── README.md                  ← Reflection
```

## Grading Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| Machine implementation | 40 | All states, events, guards correct |
| Tests | 30 | All 4 tests pass |
| Visualizer screenshot | 20 | Shows complete machine |
| Reflection | 10 | Thoughtful answers |
| **Total** | **100** | **Pass: 70+** |

## Reflection Questions (in README.md)

Answer in 200-300 words:

1. **Impossible states:** What impossible states does this machine prevent? (e.g., green + pedestrian crossing simultaneously)

2. **Guards vs. Context:** Why use a guard for `pedestrianWaiting` instead of just checking context in `after`?

3. **Real-world extension:** How would you extend this for:
   - Emergency vehicle override (fire truck forces green)?
   - Rush hour timing (longer green during commute)?
   - Multiple intersections coordinated?

## Extension Ideas

- [ ] Add "flashing yellow" mode for late night
- [ ] Emergency vehicle priority (EMERGENCY event)
- [ ] Countdown timer display (8... 7... 6...)
- [ ] Multiple pedestrian crossings (north-south, east-west)
- [ ] Adaptive timing based on traffic sensors
- [ ] Sound effects for accessibility

## Tips

1. Use XState visualizer early to verify structure
2. Test timing with smaller delays first (5s → 500ms)
3. Guards run every time parent state evaluates transition
4. Use `assign` for all context mutations
5. Entry/exit actions are powerful for side effects

## Common Pitfalls

### ❌ Forgetting to reset pedestrianWaiting
```tsx
red: {
  after: { 5000: "green" }
  // Missing: reset pedestrianWaiting!
}
```

### ✅ Reset in entry action
```tsx
red: {
  entry: assign({ pedestrianWaiting: false }),
  after: { 5000: "green" }
}
```

### ❌ Guard on event instead of transition
```tsx
PEDESTRIAN_PRESS: {
  guard: "canCross", // ❌ Won't work
  actions: assign(...)
}
```

### ✅ Guard on transition target
```tsx
after: {
  2000: [
    { target: "pedestrianCrossing", guard: "pedestrianWaiting" },
    { target: "red" }
  ]
}
```

## Time Estimate: 2-3 hours

## Resources

- [XState Documentation](https://xstate.js.org/docs/)
- [XState Visualizer](https://stately.ai/viz)
- [State Machine Guide](https://xstate.js.org/docs/guides/introduction-to-state-machines-and-statecharts/)
