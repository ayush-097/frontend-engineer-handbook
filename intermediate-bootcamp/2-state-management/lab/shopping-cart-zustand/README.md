# Lab: Shopping Cart with Zustand

Build a production-ready e-commerce shopping cart using Zustand with persistence, DevTools integration, and optimized selectors.

## Learning Objectives

- Implement Zustand store with slices pattern
- Use middleware (persist, devtools, immer)
- Write selectors that prevent unnecessary re-renders
- Handle complex state updates immutably
- Integrate Redux DevTools for debugging

## Features

### Core Functionality
- ✅ Browse product catalog
- ✅ Add items to cart (with duplicate detection)
- ✅ Update item quantities
- ✅ Remove items from cart
- ✅ Calculate subtotal, tax (8%), and total
- ✅ Clear entire cart

### Advanced Features
- ✅ Persist cart to localStorage (survives page refresh)
- ✅ Redux DevTools integration (time-travel debugging)
- ✅ Optimistic UI updates with Immer
- ✅ Selector-based re-render optimization
- ✅ Toast notifications for actions

## Architecture

```
src/
├── store/
│   ├── index.ts              ← Main store (combines slices + middleware)
│   ├── cart-slice.ts         ← Cart state + actions
│   └── products-slice.ts     ← Product catalog
├── components/
│   ├── ProductList.tsx       ← Browse products grid
│   ├── ProductCard.tsx       ← Single product display
│   ├── Cart.tsx              ← Shopping cart sidebar
│   ├── CartItem.tsx          ← Single cart item row
│   └── CartSummary.tsx       ← Subtotal/tax/total display
└── App.tsx                   ← Layout + routing
```

## Zustand Patterns Demonstrated

### 1. Slices Pattern
```tsx
// Separate concerns into slices
const createCartSlice = (set, get) => ({ ... });
const createProductsSlice = (set, get) => ({ ... });

// Combine in main store
const useStore = create((set, get) => ({
  ...createCartSlice(set, get),
  ...createProductsSlice(set, get)
}));
```

### 2. Middleware Stack
```tsx
create(
  devtools(            // Redux DevTools
    persist(           // localStorage persistence
      immer(           // Immer for mutations
        (set) => ({ ... })
      ),
      { name: "cart-storage" }
    ),
    { name: "ShoppingCart" }
  )
);
```

### 3. Optimized Selectors
```tsx
// ❌ Re-renders on ANY store change
const { cart, products } = useStore();

// ✅ Only re-renders when cart items change
const cartItems = useStore(state => state.cart);

// ✅ Derived state selector
const itemCount = useStore(state => 
  state.cart.reduce((sum, item) => sum + item.quantity, 0)
);
```

### 4. Computed Values
```tsx
// Store computed functions, call in components
const subtotal = useStore(state => state.subtotal());
const total = useStore(state => state.total());

// In store:
subtotal: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
```

## Implementation Guide

### Step 1: Create the Store (30 min)

Implement `store/index.ts` with:
- Product catalog (hardcoded 6-8 products)
- Cart array
- Add/remove/update actions
- Subtotal/tax/total computed functions
- Middleware: devtools → persist → immer

### Step 2: Product Browsing (20 min)

Create `ProductList.tsx` and `ProductCard.tsx`:
- Grid layout (3 columns on desktop)
- Product image, name, price
- "Add to Cart" button
- Show "In Cart (qty)" if already added

### Step 3: Cart Sidebar (30 min)

Create `Cart.tsx`, `CartItem.tsx`, `CartSummary.tsx`:
- Fixed sidebar on right side
- List all cart items
- Quantity controls (+/-)
- Remove button with confirmation
- Summary at bottom (subtotal, tax, total)

### Step 4: Polish (20 min)

- Add loading states
- Toast notifications
- Empty cart state
- Responsive design

## Acceptance Criteria

- [ ] Adding same product twice increases quantity (not duplicate entries)
- [ ] Changing quantity updates total immediately
- [ ] Removing item updates cart count in header
- [ ] Cart persists across browser refresh
- [ ] Redux DevTools shows all actions with state snapshots
- [ ] Updating cart quantity doesn't re-render ProductList
- [ ] Tax calculated at 8% of subtotal
- [ ] Total = subtotal + tax
- [ ] Clear cart shows confirmation dialog
- [ ] Empty cart shows "Your cart is empty" message

## Testing Checklist

```bash
# Manual testing steps:
1. Add 3 different products → cart shows 3 items
2. Add same product twice → quantity = 2 (not duplicate)
3. Refresh page → cart persists
4. Open Redux DevTools → see all actions
5. Change quantity to 0 → item removed
6. Click "Clear Cart" → confirmation shown
7. Open cart in one tab, add item in another → no sync (expected)
```

## Time Estimate

- **Store implementation:** 30 min
- **Product browsing:** 20 min
- **Cart UI:** 30 min
- **Polish + testing:** 20 min
- **Total:** ~2 hours

## Extension Ideas

After completing core functionality:
- [ ] Add product search/filter
- [ ] Implement categories
- [ ] Add discount codes
- [ ] Show "Recently Viewed"
- [ ] Add product ratings
- [ ] Implement undo/redo with DevTools time travel
- [ ] Add animations (framer-motion)

## Common Pitfalls

### ❌ Mutating state directly
```tsx
addToCart: (product) => set((state) => {
  state.cart.push(product); // ❌ Only works with Immer!
  return state;
});
```

### ✅ With Immer middleware
```tsx
addToCart: (product) => set((state) => {
  state.cart.push(product); // ✅ Immer makes this safe
})
```

### ❌ Over-selecting
```tsx
// Re-renders on ANY store change
const store = useStore();
return <div>{store.cart.length}</div>;
```

### ✅ Precise selectors
```tsx
// Only re-renders when cart length changes
const cartLength = useStore(state => state.cart.length);
```

## Deliverables

1. **Complete implementation** (all files in `src/`)
2. **README.md** with setup instructions
3. **Screenshot** of Redux DevTools showing actions
4. **Short reflection** (200 words): What did selectors improve? When would you choose Zustand vs Context?

## Resources

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Immer Guide](https://immerjs.github.io/immer/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
