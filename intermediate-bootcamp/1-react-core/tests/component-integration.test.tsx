/**
 * Component Integration Tests
 * Tests compound components, render props, and HOCs.
 * Run: npx vitest component-integration.test.tsx
 */
import {
          render, screen,
          waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Tabs } from "../lab/compound-components/Tabs";
import { withErrorBoundary } from "../lab/render-props-hoc/hoc/withErrorBoundary";
import { withLogger } from "../lab/render-props-hoc/hoc/withLogger";
import { DataFetcher } from "../lab/render-props-hoc/render-props/DataFetcher";
import { Toggle } from "../lab/render-props-hoc/render-props/Toggle";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

describe("Tabs compound component", () => {
  function TestTabs({ defaultTab = "a" }: { defaultTab?: string }) {
    return (
      <Tabs defaultTab={defaultTab}>
        <Tabs.List>
          <Tabs.Trigger tab="a">Tab A</Tabs.Trigger>
          <Tabs.Trigger tab="b">Tab B</Tabs.Trigger>
          <Tabs.Trigger tab="c">Tab C</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel tab="a">Content A</Tabs.Panel>
        <Tabs.Panel tab="b">Content B</Tabs.Panel>
        <Tabs.Panel tab="c">Content C</Tabs.Panel>
      </Tabs>
    );
  }

  it("renders the default tab as active", () => {
    render(<TestTabs defaultTab="a" />);
    expect(screen.getByText("Content A")).toBeVisible();
    expect(screen.queryByText("Content B")).toBeNull(); // Not yet activated
  });

  it("shows correct tab when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<TestTabs />);

    await user.click(screen.getByRole("tab", { name: "Tab B" }));
    expect(screen.getByText("Content B")).toBeVisible();
  });

  it("hides non-active panels", async () => {
    const user = userEvent.setup();
    render(<TestTabs defaultTab="a" />);

    // Activate B first so its panel renders (lazy activation)
    await user.click(screen.getByRole("tab", { name: "Tab B" }));
    await user.click(screen.getByRole("tab", { name: "Tab A" }));

    const panelB = screen.getByRole("tabpanel", { name: /tab b/i, hidden: true });
    expect(panelB).toHaveAttribute("hidden");
  });

  it("sets aria-selected on active trigger", () => {
    render(<TestTabs defaultTab="b" />);
    const tabB = screen.getByRole("tab", { name: "Tab B" });
    expect(tabB).toHaveAttribute("aria-selected", "true");
    const tabA = screen.getByRole("tab", { name: "Tab A" });
    expect(tabA).toHaveAttribute("aria-selected", "false");
  });

  it("connects trigger to panel via aria-controls/aria-labelledby", () => {
    render(<TestTabs defaultTab="a" />);
    const trigger = screen.getByRole("tab", { name: "Tab A" });
    const panelId = trigger.getAttribute("aria-controls")!;
    const panel = document.getElementById(panelId);
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute("aria-labelledby")).toBe(trigger.id);
  });

  it("navigates with arrow keys", async () => {
    const user = userEvent.setup();
    render(<TestTabs defaultTab="a" />);

    const tabA = screen.getByRole("tab", { name: "Tab A" });
    tabA.focus();

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Tab B" }));

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Tab C" }));

    // Wraps around
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Tab A" }));
  });

  it("navigates backwards with ArrowLeft", async () => {
    const user = userEvent.setup();
    render(<TestTabs defaultTab="a" />);

    screen.getByRole("tab", { name: "Tab A" }).focus();
    await user.keyboard("{ArrowLeft}");

    // Wraps from first to last
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Tab C" }));
  });

  it("lazily renders panel content (not rendered until first activated)", () => {
    render(<TestTabs defaultTab="a" />);
    expect(screen.queryByText("Content C")).toBeNull(); // C never activated
  });

  it("calls onChange when tab changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Tabs defaultTab="a" onChange={onChange}>
        <Tabs.List>
          <Tabs.Trigger tab="a">A</Tabs.Trigger>
          <Tabs.Trigger tab="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel tab="a">Content A</Tabs.Panel>
        <Tabs.Panel tab="b">Content B</Tabs.Panel>
      </Tabs>
    );

    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

// ─── Toggle ───────────────────────────────────────────────────────────────────

describe("Toggle render prop", () => {
  it("starts with defaultOn value", () => {
    render(
      <Toggle defaultOn={false}>
        {({ on }) => <span data-testid="state">{on ? "on" : "off"}</span>}
      </Toggle>
    );
    expect(screen.getByTestId("state").textContent).toBe("off");
  });

  it("toggle switches the state", async () => {
    const user = userEvent.setup();
    render(
      <Toggle defaultOn={false}>
        {({ on, toggle }) => (
          <button onClick={toggle}>{on ? "ON" : "OFF"}</button>
        )}
      </Toggle>
    );

    expect(screen.getByRole("button").textContent).toBe("OFF");
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button").textContent).toBe("ON");
  });

  it("setOn forces true regardless of current state", async () => {
    const user = userEvent.setup();
    render(
      <Toggle defaultOn={false}>
        {({ on, setOn }) => (
          <>
            <span data-testid="state">{on ? "on" : "off"}</span>
            <button onClick={setOn}>Set On</button>
          </>
        )}
      </Toggle>
    );
    await user.click(screen.getByText("Set On"));
    await user.click(screen.getByText("Set On")); // Click twice
    expect(screen.getByTestId("state").textContent).toBe("on");
  });

  it("setOff forces false", async () => {
    const user = userEvent.setup();
    render(
      <Toggle defaultOn={true}>
        {({ on, setOff }) => (
          <>
            <span data-testid="state">{on ? "on" : "off"}</span>
            <button onClick={setOff}>Set Off</button>
          </>
        )}
      </Toggle>
    );
    await user.click(screen.getByText("Set Off"));
    expect(screen.getByTestId("state").textContent).toBe("off");
  });

  it("calls onChange with new value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Toggle onChange={onChange}>
        {({ toggle }) => <button onClick={toggle}>Toggle</button>}
      </Toggle>
    );
    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

// ─── DataFetcher ──────────────────────────────────────────────────────────────

describe("DataFetcher render prop", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("renders loading state initially", () => {
    (fetch as any).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    render(
      <DataFetcher url="/api/test">
        {({ loading }) => <span>{loading ? "loading" : "done"}</span>}
      </DataFetcher>
    );
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("renders data after fetch resolves", async () => {
    const data = { name: "Alice" };
    (fetch as any).mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });

    render(
      <DataFetcher<{ name: string }> url="/api/user">
        {({ data, loading }) => (
          <span>{loading ? "loading" : data?.name}</span>
        )}
      </DataFetcher>
    );

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
  });

  it("renders error state on fetch failure", async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 500, statusText: "Server Error" });

    render(
      <DataFetcher url="/api/broken">
        {({ error }) => <span>{error ? `Error: ${error.message}` : "ok"}</span>}
      </DataFetcher>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});

// ─── withLogger HOC ───────────────────────────────────────────────────────────

describe("withLogger HOC", () => {
  it("renders the wrapped component", () => {
    function Btn({ label }: { label: string }) {
      return <button>{label}</button>;
    }
    const LoggedBtn = withLogger(Btn);
    render(<LoggedBtn label="Click me" />);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("logs on mount", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    function Comp() { return <div>test</div>; }
    const Logged = withLogger(Comp, "Comp");
    render(<Logged />);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Comp"));
    consoleSpy.mockRestore();
  });

  it("does not change component behavior", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    function Btn({ onClick }: { onClick: () => void }) {
      return <button onClick={onClick}>Click</button>;
    }
    const LoggedBtn = withLogger(Btn);
    render(<LoggedBtn onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("sets displayName on wrapped component", () => {
    function MyComponent() { return null; }
    const Logged = withLogger(MyComponent);
    expect(Logged.displayName).toContain("MyComponent");
  });
});

// ─── withErrorBoundary HOC ───────────────────────────────────────────────────

describe("withErrorBoundary HOC", () => {
  // Suppress React error boundary console output in tests
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    (console.error as any).mockRestore();
  });

  it("renders component normally when no error", () => {
    function Safe() { return <div>Safe content</div>; }
    const Protected = withErrorBoundary(Safe, <div>Error!</div>);
    render(<Protected />);
    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  it("renders fallback when component throws", () => {
    function Broken() { throw new Error("Component failed"); }
    const Protected = withErrorBoundary(Broken, <div>Fallback UI</div>);
    render(<Protected />);
    expect(screen.getByText("Fallback UI")).toBeInTheDocument();
  });

  it("sets displayName on wrapped component", () => {
    function Widget() { return null; }
    const Protected = withErrorBoundary(Widget, null);
    expect((Protected as any).displayName).toContain("Widget");
  });
});
