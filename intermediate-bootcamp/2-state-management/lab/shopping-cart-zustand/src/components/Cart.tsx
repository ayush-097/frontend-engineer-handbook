import { useStore, selectCart, selectCartCount, selectSubtotal, selectTax, selectTotal } from "../store";

export function Cart() {
  const cart = useStore(selectCart);
  const cartCount = useStore(selectCartCount);
  const clearCart = useStore((state) => state.clearCart);

  const handleClearCart = () => {
    if (cartCount === 0) return;
    if (confirm(`Remove all ${cartCount} items from cart?`)) {
      clearCart();
    }
  };

  return (
    <div className="cart-sidebar">
      <div className="cart-header">
        <h2>Cart ({cartCount})</h2>
        {cartCount > 0 && (
          <button onClick={handleClearCart} className="clear-btn">
            Clear
          </button>
        )}
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <p className="empty-hint">Add some products to get started!</p>
          </div>
        ) : (
          cart.map((item) => <CartItem key={item.id} item={item} />)
        )}
      </div>

      {cart.length > 0 && <CartSummary />}
    </div>
  );
}

function CartItem({ item }: { item: CartItem }) {
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);

  const handleRemove = () => {
    if (confirm(`Remove ${item.name} from cart?`)) {
      removeFromCart(item.id);
    }
  };

  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} />
      <div className="cart-item-details">
        <h4>{item.name}</h4>
        <p className="cart-item-price">${item.price.toFixed(2)}</p>
      </div>
      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="quantity">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <p className="item-total">${(item.price * item.quantity).toFixed(2)}</p>
        <button onClick={handleRemove} className="remove-btn" aria-label="Remove item">
          ✕
        </button>
      </div>
    </div>
  );
}

function CartSummary() {
  const subtotal = useStore(selectSubtotal);
  const tax = useStore(selectTax);
  const total = useStore(selectTotal);

  return (
    <div className="cart-summary">
      <div className="summary-row">
        <span>Subtotal:</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span>Tax (8%):</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div className="summary-row total">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <button className="checkout-btn">Proceed to Checkout</button>
    </div>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = `
.cart-sidebar {
  width: 380px;
  height: 100vh;
  position: sticky;
  top: 0;
  border-left: 1px solid #e0e0e0;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.cart-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.cart-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.clear-btn:hover {
  background: #dc2626;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
}

.empty-cart p {
  margin: 0.5rem 0;
}

.empty-hint {
  font-size: 0.875rem;
}

.cart-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  border: 1px solid #e0e0e0;
}

.cart-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.cart-item-details {
  flex: 1;
}

.cart-item-details h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.cart-item-price {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.cart-item-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-controls button {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-controls button:hover {
  background: #e5e7eb;
}

.quantity {
  min-width: 32px;
  text-align: center;
  font-weight: 500;
}

.item-total {
  font-weight: bold;
  color: #2563eb;
  margin: 0;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0;
  width: 24px;
  height: 24px;
}

.remove-btn:hover {
  color: #dc2626;
}

.cart-summary {
  border-top: 1px solid #e0e0e0;
  padding: 1.5rem;
  background: white;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2563eb;
  padding-top: 0.75rem;
  border-top: 2px solid #e0e0e0;
  margin-top: 0.5rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
}

.checkout-btn:hover {
  background: #1d4ed8;
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}
