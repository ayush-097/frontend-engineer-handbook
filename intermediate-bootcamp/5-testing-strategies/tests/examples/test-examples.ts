/**
 * Reference Test Examples
 * 
 * This file contains example tests demonstrating best practices
 * for unit, integration, and E2E testing in React applications.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderHook, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// ============================================================================
// UNIT TESTS - Pure Functions
// ============================================================================

describe("Unit Tests: Pure Functions", () => {
  // Example: Testing utility function
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  it("formats positive amounts", () => {
    expect(formatCurrency(100)).toBe("$100.00");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-50)).toBe("-$50.00");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatCurrency(99.999)).toBe("$100.00");
  });

  // Example: Testing validation function
  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  it("accepts valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("rejects email without @", () => {
    expect(validateEmail("userexample.com")).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(validateEmail("user@")).toBe(false);
  });
});

// ============================================================================
// UNIT TESTS - Custom Hooks
// ============================================================================

describe("Unit Tests: Custom Hooks", () => {
  // Example hook
  function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue);
    const toggle = useCallback(() => setValue(v => !v), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);
    return { value, toggle, setTrue, setFalse };
  }

  it("initializes with default value", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.value).toBe(false);
  });

  it("initializes with custom value", () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current.value).toBe(true);
  });

  it("toggles value", () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);
    
    act(() => result.current.toggle());
    expect(result.current.value).toBe(false);
  });

  it("sets true", () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);
  });

  it("sets false", () => {
    const { result } = renderHook(() => useToggle(true));
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);
  });
});

// ============================================================================
// INTEGRATION TESTS - Components
// ============================================================================

describe("Integration Tests: Form Component", () => {
  // Example component
  function ContactForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
      
      if (!message) newErrors.message = "Message is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      onSubmit({ email, message });
    };

    return (
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {errors.email && <span role="alert">{errors.email}</span>}

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        {errors.message && <span role="alert">{errors.message}</span>}

        <button type="submit">Submit</button>
      </form>
    );
  }

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<ContactForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/message/i), "Hello!");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: "user@example.com",
      message: "Hello!",
    });
  });

  it("shows error for invalid email", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<ContactForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "invalid-email");
    await user.type(screen.getByLabelText(/message/i), "Hello!");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("shows error for empty required fields", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<ContactForm onSubmit={handleSubmit} />);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

// ============================================================================
// INTEGRATION TESTS - Async Components with API
// ============================================================================

describe("Integration Tests: Async Data Loading", () => {
  const server = setupServer(
    http.get("/api/users", () => {
      return HttpResponse.json([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ]);
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  // Example component
  function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => {
          setUsers(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading users</div>;

    return (
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    );
  }

  it("loads and displays users", async () => {
    render(<UserList />);

    // Initially loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Eventually shows users
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    // Loading gone
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it("shows error on API failure", async () => {
    server.use(
      http.get("/api/users", () => {
        return HttpResponse.error();
      })
    );

    render(<UserList />);

    expect(await screen.findByText(/error loading users/i)).toBeInTheDocument();
  });
});

// ============================================================================
// INTEGRATION TESTS - User Interactions
// ============================================================================

describe("Integration Tests: Modal Component", () => {
  function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
      <div role="dialog" aria-modal="true">
        <button onClick={onClose} aria-label="Close">
          X
        </button>
        {children}
      </div>
    );
  }

  function App() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open Modal</button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <h2>Modal Content</h2>
        </Modal>
      </>
    );
  }

  it("opens modal on button click", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open modal/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("closes modal on close button click", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open modal/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByLabelText(/close/i));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ============================================================================
// MOCK STRATEGIES
// ============================================================================

describe("Mock Strategies", () => {
  it("mocks module dependency", () => {
    const mockNavigate = vi.fn();
    
    vi.mock("react-router-dom", () => ({
      useNavigate: () => mockNavigate,
    }));

    // Component that uses useNavigate
    // ... test navigation behavior
    
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("mocks timers for debounce", () => {
    vi.useFakeTimers();
    
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 1000);
    
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    // Called 3 times but callback not invoked yet
    expect(callback).not.toHaveBeenCalled();
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    // Now callback invoked once
    expect(callback).toHaveBeenCalledTimes(1);
    
    vi.useRealTimers();
  });
});
