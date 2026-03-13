import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// ============================================================================
// Types
// ============================================================================

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface StoreState {
  // Products
  products: Product[];
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed
  getCartItemCount: () => number;
  subtotal: () => number;
  tax: () => number;
  total: () => number;
  isInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
    category: "Audio",
    description: "Premium wireless headphones with noise cancellation",
  },
  {
    id: "2",
    name: "Smart Watch",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
    category: "Wearables",
    description: "Fitness tracking and notifications on your wrist",
  },
  {
    id: "3",
    name: "Laptop Stand",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300",
    category: "Accessories",
    description: "Ergonomic aluminum laptop stand",
  },
  {
    id: "4",
    name: "Mechanical Keyboard",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300",
    category: "Peripherals",
    description: "RGB mechanical keyboard with Cherry MX switches",
  },
  {
    id: "5",
    name: "Wireless Mouse",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300",
    category: "Peripherals",
    description: "Ergonomic wireless mouse with precision tracking",
  },
  {
    id: "6",
    name: "USB-C Hub",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300",
    category: "Accessories",
    description: "7-in-1 USB-C hub with HDMI and SD card reader",
  },
  {
    id: "7",
    name: "Webcam 1080p",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=300",
    category: "Peripherals",
    description: "Full HD webcam with autofocus and noise reduction",
  },
  {
    id: "8",
    name: "Phone Stand",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300",
    category: "Accessories",
    description: "Adjustable phone stand for desk or nightstand",
  },
];

// ============================================================================
// Store
// ============================================================================

export const useStore = create<StoreState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        products: MOCK_PRODUCTS,
        cart: [],

        // Actions
        addToCart: (product) =>
          set((state) => {
            const existingItem = state.cart.find((item) => item.id === product.id);
            
            if (existingItem) {
              // Increment quantity if already in cart
              existingItem.quantity += 1;
            } else {
              // Add new item with quantity 1
              state.cart.push({ ...product, quantity: 1 });
            }
          }),

        removeFromCart: (productId) =>
          set((state) => {
            state.cart = state.cart.filter((item) => item.id !== productId);
          }),

        updateQuantity: (productId, quantity) =>
          set((state) => {
            const item = state.cart.find((item) => item.id === productId);
            
            if (item) {
              if (quantity <= 0) {
                // Remove item if quantity is 0 or negative
                state.cart = state.cart.filter((item) => item.id !== productId);
              } else {
                item.quantity = quantity;
              }
            }
          }),

        clearCart: () =>
          set((state) => {
            state.cart = [];
          }),

        // Computed/Derived values
        getCartItemCount: () => {
          return get().cart.reduce((total, item) => total + item.quantity, 0);
        },

        subtotal: () => {
          return get().cart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );
        },

        tax: () => {
          return get().subtotal() * 0.08; // 8% tax
        },

        total: () => {
          return get().subtotal() + get().tax();
        },

        isInCart: (productId) => {
          return get().cart.some((item) => item.id === productId);
        },

        getCartItem: (productId) => {
          return get().cart.find((item) => item.id === productId);
        },
      })),
      {
        name: "cart-storage", // localStorage key
        // Only persist cart, not products
        partialize: (state) => ({ cart: state.cart }),
      }
    ),
    {
      name: "ShoppingCart", // DevTools display name
    }
  )
);

// ============================================================================
// Selectors (for optimized component subscriptions)
// ============================================================================

// These are examples - components can use inline selectors too
export const selectProducts = (state: StoreState) => state.products;
export const selectCart = (state: StoreState) => state.cart;
export const selectCartCount = (state: StoreState) => state.getCartItemCount();
export const selectSubtotal = (state: StoreState) => state.subtotal();
export const selectTax = (state: StoreState) => state.tax();
export const selectTotal = (state: StoreState) => state.total();
