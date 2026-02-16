/**
 * Generic Components — Test Suite
 * Tests both behavior AND type safety.
 * Run: npx jest components.test.tsx
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { List } from "./components/List";
import { Select } from "./components/Select";
import { AsyncBoundary } from "./components/AsyncBoundary";
import { DataTable } from "./components/DataTable";
import type { AsyncState } from "./types";

// ─── Test Data ────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  age: number;
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "admin", age: 30 },
  { id: 2, name: "Bob",   email: "bob@example.com",   role: "user",  age: 25 },
  { id: 3, name: "Carol", email: "carol@example.com", role: "user",  age: 35 },
];

// ─── List<T> Tests ────────────────────────────────────────────────────────────

describe("List<T>", () => {
  test("renders all items", () => {
    render(
      <List
        items={users}
        keyExtractor={(u) => u.id}
        renderItem={(u) => <span>{u.name}</span>}
      />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  test("applies filter prop", () => {
    render(
      <List
        items={users}
        keyExtractor={(u) => u.id}
        filter={(u) => u.role === "admin"}
        renderItem={(u) => <span>{u.name}</span>}
      />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).toBeNull();
    expect(screen.queryByText("Carol")).toBeNull();
  });

  test("applies sort prop", () => {
    render(
      <List
        items={users}
        keyExtractor={(u) => u.id}
        sort={(a, b) => b.age - a.age} // Descending by age
        renderItem={(u) => <span data-testid="user">{u.name}</span>}
      />
    );
    const items = screen.getAllByTestId("user");
    expect(items[0].textContent).toBe("Carol"); // age 35
    expect(items[1].textContent).toBe("Alice"); // age 30
    expect(items[2].textContent).toBe("Bob");   // age 25
  });

  test("renders empty state when no items match filter", () => {
    render(
      <List
        items={users}
        keyExtractor={(u) => u.id}
        filter={() => false}
        renderItem={(u) => <span>{u.name}</span>}
        renderEmpty={() => <p>Nobody here</p>}
      />
    );
    expect(screen.getByText("Nobody here")).toBeInTheDocument();
  });

  test("renders empty state for empty array", () => {
    render(
      <List
        items={[] as User[]}
        keyExtractor={(u) => u.id}
        renderItem={(u) => <span>{u.name}</span>}
        renderEmpty={() => <p>Empty</p>}
      />
    );
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  test("passes correct index to renderItem", () => {
    const indices: number[] = [];
    render(
      <List
        items={users}
        keyExtractor={(u) => u.id}
        renderItem={(u, i) => {
          indices.push(i);
          return <span>{u.name}</span>;
        }}
      />
    );
    expect(indices).toEqual([0, 1, 2]);
  });
});

// ─── Select<T> Tests ──────────────────────────────────────────────────────────

describe("Select<T>", () => {
  test("renders all options", () => {
    render(
      <Select
        options={users}
        value={null}
        onChange={() => {}}
        getLabel={(u) => u.name}
        getValue={(u) => u.id}
      />
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  test("calls onChange with full T object, not just value", () => {
    const handleChange = jest.fn();
    render(
      <Select
        options={users}
        value={null}
        onChange={handleChange}
        getLabel={(u) => u.name}
        getValue={(u) => u.id}
      />
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
    expect(handleChange).toHaveBeenCalledWith(users[0]); // Full User object!
  });

  test("calls onChange with null when placeholder selected", () => {
    const handleChange = jest.fn();
    render(
      <Select
        options={users}
        value={users[0]}
        onChange={handleChange}
        getLabel={(u) => u.name}
        getValue={(u) => u.id}
        placeholder="None"
      />
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  test("shows correct selected value", () => {
    render(
      <Select
        options={users}
        value={users[1]} // Bob
        onChange={() => {}}
        getLabel={(u) => u.name}
        getValue={(u) => u.id}
      />
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("2"); // Bob's id
  });

  test("is disabled when disabled prop is true", () => {
    render(
      <Select
        options={users}
        value={null}
        onChange={() => {}}
        getLabel={(u) => u.name}
        getValue={(u) => u.id}
        disabled
      />
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});

// ─── AsyncBoundary<T> Tests ───────────────────────────────────────────────────

describe("AsyncBoundary<T>", () => {
  test("renders loading state", () => {
    const state: AsyncState<User> = { status: "loading" };
    render(
      <AsyncBoundary state={state} loading={<div>Spinner</div>}>
        {(user) => <div>{user.name}</div>}
      </AsyncBoundary>
    );
    expect(screen.getByText("Spinner")).toBeInTheDocument();
  });

  test("renders children with data on success", () => {
    const state: AsyncState<User> = { status: "success", data: users[0] };
    render(
      <AsyncBoundary state={state}>
        {(user) => <div data-testid="user">{user.name}</div>}
      </AsyncBoundary>
    );
    expect(screen.getByTestId("user").textContent).toBe("Alice");
  });

  test("renders error state with error object", () => {
    const error = new Error("Not found");
    const state: AsyncState<User> = { status: "error", error };
    render(
      <AsyncBoundary
        state={state}
        error={(e) => <div data-testid="error">{e.message}</div>}
      >
        {(user) => <div>{user.name}</div>}
      </AsyncBoundary>
    );
    expect(screen.getByTestId("error").textContent).toBe("Not found");
  });

  test("renders empty state", () => {
    const state: AsyncState<User> = { status: "empty" };
    render(
      <AsyncBoundary state={state} empty={<div>No users</div>}>
        {(user) => <div>{user.name}</div>}
      </AsyncBoundary>
    );
    expect(screen.getByText("No users")).toBeInTheDocument();
  });

  test("renders null for idle state by default", () => {
    const state: AsyncState<User> = { status: "idle" };
    const { container } = render(
      <AsyncBoundary state={state}>
        {(user) => <div>{user.name}</div>}
      </AsyncBoundary>
    );
    expect(container.firstChild).toBeNull();
  });
});

// ─── DataTable<T> Tests ───────────────────────────────────────────────────────

describe("DataTable<T>", () => {
  const columns = [
    { key: "name" as const,  header: "Name",  sortable: true },
    { key: "email" as const, header: "Email" },
    { key: "role" as const,  header: "Role" },
  ];

  test("renders column headers", () => {
    render(
      <DataTable data={users} columns={columns} getRowKey={(u) => u.id} />
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  test("renders all rows", () => {
    render(
      <DataTable data={users} columns={columns} getRowKey={(u) => u.id} />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  test("calls onRowClick with full row data", () => {
    const handleClick = jest.fn();
    render(
      <DataTable
        data={users}
        columns={columns}
        getRowKey={(u) => u.id}
        onRowClick={handleClick}
      />
    );
    fireEvent.click(screen.getByText("Alice").closest("tr")!);
    expect(handleClick).toHaveBeenCalledWith(users[0], 0);
  });

  test("sorts rows when sortable column header clicked", () => {
    render(
      <DataTable data={users} columns={columns} getRowKey={(u) => u.id} />
    );
    // Click "Name" to sort ascending
    fireEvent.click(screen.getByText("Name"));
    const rows = screen.getAllByRole("row").slice(1); // Skip header
    expect(rows[0].textContent).toContain("Alice");

    // Click again for descending
    fireEvent.click(screen.getByText("Name"));
    const rows2 = screen.getAllByRole("row").slice(1);
    expect(rows2[0].textContent).toContain("Carol");
  });

  test("shows empty message when no data", () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        getRowKey={(u: User) => u.id}
        emptyMessage="No users found"
      />
    );
    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  test("uses custom render function for column", () => {
    const columnsWithRender = [
      { key: "name" as const, header: "Name" },
      {
        key: "role" as const,
        header: "Role",
        render: (user: User) => (
          <span data-testid="role-badge">{user.role.toUpperCase()}</span>
        ),
      },
    ];
    render(
      <DataTable data={users} columns={columnsWithRender} getRowKey={(u) => u.id} />
    );
    const badges = screen.getAllByTestId("role-badge");
    expect(badges[0].textContent).toBe("ADMIN");
    expect(badges[1].textContent).toBe("USER");
  });
});
