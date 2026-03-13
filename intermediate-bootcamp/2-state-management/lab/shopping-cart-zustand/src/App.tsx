import { ProductList } from "./components/ProductList";
import { Cart } from "./components/Cart";
import { useStore, selectCartCount } from "./store";

export function App() {
  const cartCount = useStore(selectCartCount);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🛒 Zustand Shop</h1>
          <div className="header-badge">
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </div>
        </div>
      </header>
      <div className="app-layout">
        <ProductList />
        <Cart />
      </div>
    </div>
  );
}

// ============================================================================
// Global Styles
// ============================================================================

const globalStyles = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  min-height: 100vh;
  background: #f9fafb;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: #1f2937;
}

.header-badge {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.app-layout {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  
  .cart-sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = globalStyles;
  document.head.appendChild(styleTag);
}
