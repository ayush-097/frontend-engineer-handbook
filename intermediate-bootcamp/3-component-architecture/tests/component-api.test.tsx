import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

// Example polymorphic Button tests
describe("Polymorphic Button API", () => {
  it("renders as button by default", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("Click Me");
  });

  it("renders as anchor when as='a'", () => {
    render(<Button as="a" href="/home">Home</Button>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/home");
    expect(link).toHaveTextContent("Home");
  });

  it("accepts button-specific props", () => {
    render(<Button type="submit" disabled>Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeDisabled();
  });

  it("accepts anchor-specific props", () => {
    render(
      <Button as="a" href="https://example.com" target="_blank" rel="noopener">
        External
      </Button>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("applies variant styling", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-danger");
  });

  it("merges className prop with component classes", () => {
    render(<Button className="custom-class">Click</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("btn");
    expect(button).toHaveClass("custom-class");
  });

  it("forwards ref to underlying element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

// Compound component tests
describe("Compound Tabs API", () => {
  it("renders tab panels based on active tab", () => {
    render(
      <Tabs defaultValue="profile">
        <Tabs.List>
          <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="profile">
          <div>Profile Content</div>
        </Tabs.Panel>
        <Tabs.Panel value="settings">
          <div>Settings Content</div>
        </Tabs.Panel>
      </Tabs>
    );

    expect(screen.getByText("Profile Content")).toBeInTheDocument();
    expect(screen.queryByText("Settings Content")).not.toBeInTheDocument();
  });

  it("switches tabs on click", async () => {
    const user = userEvent.setup();
    
    render(
      <Tabs defaultValue="profile">
        <Tabs.List>
          <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="profile">Profile Content</Tabs.Panel>
        <Tabs.Panel value="settings">Settings Content</Tabs.Panel>
      </Tabs>
    );

    await user.click(screen.getByRole("tab", { name: /settings/i }));

    expect(screen.getByText("Settings Content")).toBeInTheDocument();
    expect(screen.queryByText("Profile Content")).not.toBeInTheDocument();
  });

  it("sets aria-selected on active tab", () => {
    render(
      <Tabs defaultValue="profile">
        <Tabs.List>
          <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="profile">Profile</Tabs.Panel>
        <Tabs.Panel value="settings">Settings</Tabs.Panel>
      </Tabs>
    );

    const profileTab = screen.getByRole("tab", { name: /profile/i });
    const settingsTab = screen.getByRole("tab", { name: /settings/i });

    expect(profileTab).toHaveAttribute("aria-selected", "true");
    expect(settingsTab).toHaveAttribute("aria-selected", "false");
  });
});

// Error Boundary tests
describe("ErrorBoundary API", () => {
  const ThrowError = () => {
    throw new Error("Test error");
  };

  it("renders children when no error", () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal content")).toBeInTheDocument();
    expect(screen.queryByText("Error occurred")).not.toBeInTheDocument();
  });

  it("renders fallback when error thrown", () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Error occurred")).toBeInTheDocument();
    expect(screen.queryByText("Normal content")).not.toBeInTheDocument();

    spy.mockRestore();
  });

  it("calls onError callback with error details", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <ErrorBoundary fallback={<div>Error</div>} onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe("Test error");

    spy.mockRestore();
  });
});

// Headless component tests
describe("useSelect Hook API", () => {
  it("returns selection state and controls", () => {
    const { result } = renderHook(() =>
      useSelect({
        items: ["Apple", "Banana", "Orange"],
      })
    );

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedValue).toBeNull();
    expect(typeof result.current.open).toBe("function");
    expect(typeof result.current.close).toBe("function");
    expect(typeof result.current.select).toBe("function");
  });

  it("opens and closes dropdown", () => {
    const { result } = renderHook(() =>
      useSelect({ items: ["Apple", "Banana"] })
    );

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("selects item and calls onSelect callback", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useSelect({
        items: ["Apple", "Banana"],
        onSelect,
      })
    );

    act(() => result.current.select("Apple"));

    expect(result.current.selectedValue).toBe("Apple");
    expect(onSelect).toHaveBeenCalledWith("Apple");
  });

  it("provides item props with ARIA attributes", () => {
    const { result } = renderHook(() =>
      useSelect({ items: ["Apple", "Banana"] })
    );

    const itemProps = result.current.getItemProps({
      item: "Apple",
      index: 0,
    });

    expect(itemProps.role).toBe("option");
    expect(itemProps["aria-selected"]).toBeDefined();
    expect(typeof itemProps.onClick).toBe("function");
  });
});

// Lazy loading tests
describe("Lazy Component Loading", () => {
  it("shows fallback while component loads", async () => {
    const LazyComponent = lazy(() =>
      Promise.resolve({ default: () => <div>Loaded</div> })
    );

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Loaded")).toBeInTheDocument();
    });
  });

  it("catches errors in lazy loaded components", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    const LazyError = lazy(() =>
      Promise.reject(new Error("Failed to load"))
    );

    render(
      <ErrorBoundary fallback={<div>Failed to load component</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyError />
        </Suspense>
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load component")).toBeInTheDocument();
    });

    spy.mockRestore();
  });
});
