# Zustand Patterns

Zustand is a minimal store library — simpler than Redux, more powerful than Context.

## Basic Store

```tsx
import { create } from "zustand";

interface BearStore {
  bears: number;
  increase: () => void;
  reset: () => void;
}

const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  reset: () => set({ bears: 0 }),
}));

// Use in components
function BearCounter() {
  const bears = useBearStore(state => state.bears);
  const increase = useBearStore(state => state.increase);
  return <button onClick={increase}>{bears} bears</button>;
}
```

## Slices Pattern — Scaling to Many Domains

```tsx
interface UserSlice {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

interface CartSlice {
  items: CartItem[];
  addItem: (item: Product) => void;
  removeItem: (id: string) => void;
  total: () => number;
}

type StoreState = UserSlice & CartSlice;

const createUserSlice = (set: SetState<StoreState>): UserSlice => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
});

const createCartSlice = (set: SetState<StoreState>, get: GetState<StoreState>): CartSlice => ({
  items: [],
  addItem: (product) => set((state) => ({
    items: [...state.items, { ...product, quantity: 1 }],
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id),
  })),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
});

const useStore = create<StoreState>()((set, get) => ({
  ...createUserSlice(set, get),
  ...createCartSlice(set, get),
}));
```

## Middleware — Persist, DevTools, Immer

```tsx
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const useStore = create<StoreState>()(
  devtools(
    persist(
      immer((set) => ({
        items: [],
        addItem: (item) => set((state) => {
          state.items.push(item); // Immer allows mutations!
        }),
      })),
      { name: "cart-storage" } // localStorage key
    )
  )
);
```

## Selectors — Fine-grained Re-renders

```tsx
// ❌ Re-renders on any store change
const { bears, fish, birds } = useStore();

// ✅ Only re-renders when bears changes
const bears = useStore(state => state.bears);

// Computed selector
const totalAnimals = useStore(state =>
  state.bears + state.fish + state.birds
);

// Equality function (for objects)
const user = useStore(
  state => state.user,
  (a, b) => a?.id === b?.id
);
```

**Key Takeaways:**
- Zustand = Redux simplicity without boilerplate
- Slices keep domains separated
- Middleware for devtools, persistence, immutability helpers
- Selectors prevent unnecessary re-renders
