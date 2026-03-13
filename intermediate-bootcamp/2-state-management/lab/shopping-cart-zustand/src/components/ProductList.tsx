import { useStore, selectProducts } from "../store";

export function ProductList() {
  // ✅ Only subscribes to products, not cart changes
  const products = useStore(selectProducts);

  return (
    <div className="product-list">
      <h2>Products</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const addToCart = useStore((state) => state.addToCart);
  const isInCart = useStore((state) => state.isInCart(product.id));
  const cartItem = useStore((state) => state.getCartItem(product.id));

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="category">{product.category}</p>
        <p className="description">{product.description}</p>
        <p className="price">${product.price.toFixed(2)}</p>
      </div>
      <button
        onClick={() => addToCart(product)}
        className={isInCart ? "in-cart" : ""}
      >
        {isInCart ? `In Cart (${cartItem?.quantity})` : "Add to Cart"}
      </button>
    </div>
  );
}

// ============================================================================
// Styles (inline for simplicity - use CSS modules in production)
// ============================================================================

const styles = `
.product-list {
  flex: 1;
  padding: 2rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
}

.category {
  color: #666;
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
}

.description {
  color: #888;
  font-size: 0.875rem;
  margin: 0 0 1rem;
  line-height: 1.4;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2563eb;
  margin: 0;
}

.product-card button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: #2563eb;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.product-card button:hover {
  background: #1d4ed8;
}

.product-card button.in-cart {
  background: #10b981;
}

.product-card button.in-cart:hover {
  background: #059669;
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}
