# State Machines with XState

State machines eliminate impossible states by modeling all valid states and transitions explicitly.

## The Problem

```tsx
// ❌ Implicit state — impossible combinations
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

// Bug: isLoading=true, data=something, error=something — what does this mean?
```

## State Machine Solution

```tsx
// ✅ Explicit states — only valid combinations possible
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "failure"; error: Error };

// Impossible: loading + data, success + error, etc.
```

## XState Machine

```tsx
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";

const fetchMachine = createMachine({
  id: "fetch",
  initial: "idle",
  context: { data: null, error: null },
  states: {
    idle: {
      on: { FETCH: "loading" },
    },
    loading: {
      invoke: {
        src: "fetchUser",
        onDone: {
          target: "success",
          actions: assign({ data: (_, event) => event.data }),
        },
        onError: {
          target: "failure",
          actions: assign({ error: (_, event) => event.data }),
        },
      },
    },
    success: {
      on: { REFETCH: "loading" },
    },
    failure: {
      on: { RETRY: "loading" },
    },
  },
}, {
  services: {
    fetchUser: () => fetch("/api/user").then(r => r.json()),
  },
});

function UserProfile() {
  const [state, send] = useMachine(fetchMachine);

  if (state.matches("loading")) return <Spinner />;
  if (state.matches("failure")) return (
    <Error error={state.context.error} onRetry={() => send("RETRY")} />
  );
  if (state.matches("success")) return <UserCard user={state.context.data} />;
  
  return <button onClick={() => send("FETCH")}>Load User</button>;
}
```

## Form Wizard Example

```tsx
const wizardMachine = createMachine({
  id: "wizard",
  initial: "personal",
  context: { personal: {}, address: {}, payment: {} },
  states: {
    personal: {
      on: {
        NEXT: {
          target: "address",
          actions: assign({ personal: (_, event) => event.data }),
        },
      },
    },
    address: {
      on: {
        NEXT: {
          target: "payment",
          actions: assign({ address: (_, event) => event.data }),
        },
        BACK: "personal",
      },
    },
    payment: {
      on: {
        SUBMIT: "submitting",
        BACK: "address",
      },
    },
    submitting: {
      invoke: {
        src: "submitForm",
        onDone: "success",
        onError: { target: "payment", actions: assign({ error: ... }) },
      },
    },
    success: { type: "final" },
  },
});
```

**Key Takeaways:**
- State machines model **all** valid states and transitions
- Impossible states become unrepresentable
- XState visualizer shows entire flow
- Great for wizards, modals, async flows
