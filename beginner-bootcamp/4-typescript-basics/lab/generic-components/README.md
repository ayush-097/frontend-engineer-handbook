# Lab: Generic React Components

Build a library of fully type-safe, reusable React components using TypeScript generics. Each component infers types from its props so consumers never write type annotations themselves.

## Learning Goals
- Generic React components with `<T>` type parameters
- Constraining generics for props
- Discriminated union prop APIs
- Type-safe render props and slot patterns

## Components to Build

### 1. `DataTable<T>` — Generic sortable table

```tsx
<DataTable
  data={users}
  columns={[
    { key: "name",  header: "Name",  sortable: true },
    { key: "email", header: "Email" },
    { key: "role",  header: "Role",  render: (u) => <Badge>{u.role}</Badge> },
  ]}
  getRowKey={(user) => user.id}
  onRowClick={(user) => navigate(`/users/${user.id}`)}
/>
// All callbacks receive User — TypeScript knows from `data` prop
```

### 2. `Select<T>` — Generic dropdown

```tsx
<Select
  options={users}
  value={selectedUser}
  onChange={(user) => setSelectedUser(user)}  // user: User
  getLabel={(user) => user.name}
  getValue={(user) => user.id}
  placeholder="Select a user..."
/>
```

### 3. `AsyncBoundary<T>` — State-driven async wrapper

```tsx
<AsyncBoundary
  state={userState}    // AsyncState<User> from your state management
  loading={<Spinner />}
  error={(err) => <ErrorMessage message={err.message} />}
  empty={<EmptyState />}
>
  {(user) => <UserProfile user={user} />}
  {/* user: User — TypeScript infers from state */}
</AsyncBoundary>
```

### 4. `List<T>` — Generic sorted/filtered list

```tsx
<List
  items={products}
  filter={(p) => p.inStock}                    // p: Product
  sort={(a, b) => a.price - b.price}           // a, b: Product
  keyExtractor={(p) => p.sku}
  renderItem={(p, index) => <ProductCard product={p} rank={index + 1} />}
  renderEmpty={() => <p>No products in stock</p>}
/>
```

## Files

```
generic-components/
├── README.md
├── components/
│   ├── DataTable.tsx       ← Generic table
│   ├── Select.tsx          ← Generic dropdown
│   ├── AsyncBoundary.tsx   ← Async state handler
│   └── List.tsx            ← Generic filtered list
├── types.ts                ← Shared types (AsyncState, Column, etc.)
├── index.ts                ← Re-export all components
└── components.test.tsx     ← Tests
```

## Acceptance Criteria

- TypeScript compiles with `strict: true` and `noEmit`
- `data`/`items`/`options` prop drives all callback types
- No `any` in component implementations
- All tests pass

## Time Estimate: 3–4 hours
