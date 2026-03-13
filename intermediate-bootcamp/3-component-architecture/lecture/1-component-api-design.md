# Component API Design

## The Problem: Anticipating Every Use Case

When you design a component's API (its props interface), you're making a bet about how it will be used. Get it wrong, and you end up with one of two outcomes:

1. **Too rigid** — Component can't handle new use cases without modification
2. **Too complex** — 50+ props trying to accommodate everything

The solution: **Inversion of Control (IoC)** — let the caller control behavior, not the component.

## Inversion of Control

### ❌ Component Controls Too Much

```tsx
interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  showIcon?: boolean;
  iconName?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  actions?: Array<{ label: string; onClick: () => void }>;
}

<Alert
  type="success"
  title="Profile Updated"
  message="Your changes have been saved."
  showIcon
  iconName="check"
  showCloseButton
  onClose={handleClose}
  actions={[
    { label: "Undo", onClick: handleUndo },
    { label: "View Profile", onClick: handleView },
  ]}
/>
```

**Problems:**
- New requirement: "Can I have a custom icon component?" → Need new prop
- New requirement: "Can the title be bold + underlined?" → Need styling props
- New requirement: "Can I have 3 action buttons?" → Already supported, but what about 4? 5?

### ✅ Caller Controls via Children

```tsx
interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  onClose?: () => void;
  children: ReactNode;
}

<Alert variant="success" onClose={handleClose}>
  <AlertIcon><CheckIcon /></AlertIcon>
  <AlertTitle>Profile Updated</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
  <AlertActions>
    <Button onClick={handleUndo}>Undo</Button>
    <Button onClick={handleView}>View Profile</Button>
    <Button onClick={handleSomethingElse}>Something Else</Button>
  </AlertActions>
</Alert>
```

**Benefits:**
- Want custom icon? Pass any component as `<AlertIcon>` child
- Want bold + underlined title? Wrap `<AlertTitle>` in your own styled component
- Want 10 action buttons? Just add them — no prop limit

---

## Principle 1: Children as API

The `children` prop is your most powerful API surface. Use it.

### Example: Modal

```tsx
// ❌ Rigid
<Modal
  title="Delete Account"
  content="This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>

// ✅ Flexible
<Modal onClose={handleCancel}>
  <Modal.Title>Delete Account</Modal.Title>
  <Modal.Body>
    <p>This action cannot be undone.</p>
    <p>Are you absolutely sure?</p>
    <Checkbox checked={confirmed} onChange={setConfirmed}>
      I understand the consequences
    </Checkbox>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleCancel}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete} disabled={!confirmed}>
      Delete
    </Button>
  </Modal.Footer>
</Modal>
```

---

## Principle 2: Polymorphism via `as` Prop

Components should adapt to semantic HTML needs.

### Example: Button

```tsx
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  children: ReactNode;
} & React.ComponentPropsWithoutRef<T>;

function Button<T extends React.ElementType = "button">({
  as,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || "button";
  return <Component {...props}>{children}</Component>;
}

// Usage
<Button onClick={handleClick}>Submit</Button>
// → <button onClick={...}>Submit</button>

<Button as="a" href="/home">Go Home</Button>
// → <a href="/home">Go Home</a>

<Button as={Link} to="/dashboard">Dashboard</Button>
// → <Link to="/dashboard">Dashboard</Link>
```

**Type safety:** The props available depend on the `as` value. If `as="a"`, TypeScript requires `href`. If `as="button"`, TypeScript allows `type="submit"`.

---

## Principle 3: Render Props for Flexibility

When you can't predict what the caller will render, use a render prop.

### Example: DataTable

```tsx
// ❌ Hardcoded rendering
interface TableProps {
  data: User[];
}

function Table({ data }: TableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {data.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Problem:** What if you want to render avatars? Action buttons? Different fields?

```tsx
// ✅ Render prop
interface TableProps<T> {
  data: T[];
  renderRow: (item: T) => ReactNode;
  renderHeader?: () => ReactNode;
}

function Table<T>({ data, renderRow, renderHeader }: TableProps<T>) {
  return (
    <table>
      {renderHeader && <thead>{renderHeader()}</thead>}
      <tbody>
        {data.map((item, index) => (
          <Fragment key={index}>{renderRow(item)}</Fragment>
        ))}
      </tbody>
    </table>
  );
}

// Usage
<Table
  data={users}
  renderHeader={() => (
    <tr>
      <th>Avatar</th>
      <th>Name</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
  )}
  renderRow={(user) => (
    <tr>
      <td><Avatar src={user.avatar} /></td>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <Button onClick={() => edit(user)}>Edit</Button>
        <Button onClick={() => delete(user)}>Delete</Button>
      </td>
    </tr>
  )}
/>
```

---

## Principle 4: Compound Components

Related components share state via context.

### Example: Tabs

```tsx
// ❌ All-in-one component with arrays
<Tabs
  tabs={[
    { label: "Profile", content: <ProfilePanel /> },
    { label: "Settings", content: <SettingsPanel /> },
    { label: "Billing", content: <BillingPanel /> },
  ]}
/>
```

**Problems:**
- Hard to customize individual tabs
- Can't add icons or badges to labels
- Content must be pre-rendered (no lazy loading)

```tsx
// ✅ Compound components
<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Trigger value="profile">
      <UserIcon /> Profile
    </Tabs.Trigger>
    <Tabs.Trigger value="settings">
      Settings <Badge>New</Badge>
    </Tabs.Trigger>
    <Tabs.Trigger value="billing">
      Billing
    </Tabs.Trigger>
  </Tabs.List>
  
  <Tabs.Panel value="profile">
    <ProfilePanel />
  </Tabs.Panel>
  <Tabs.Panel value="settings">
    <SettingsPanel />
  </Tabs.Panel>
  <Tabs.Panel value="billing">
    <BillingPanel />
  </Tabs.Panel>
</Tabs>
```

**Implementation:**

```tsx
const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
} | null>(null);

function Tabs({ defaultValue, children }: {
  defaultValue: string;
  children: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>;
};

Tabs.Trigger = function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs.Trigger must be inside Tabs");
  
  const isActive = context.activeTab === value;
  
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => context.setActiveTab(value)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function TabsPanel({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs.Panel must be inside Tabs");
  
  if (context.activeTab !== value) return null;
  
  return <div role="tabpanel">{children}</div>;
};
```

---

## Principle 5: Default to Minimal Props

Start with the **minimum viable API**, then expand based on real usage.

### Example: Card

```tsx
// ❌ Day 1: Kitchen sink
interface CardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  imagePosition?: "top" | "left" | "right";
  footer?: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  // ... 20 more props for every possible variation
}

// ✅ Day 1: Minimal
interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>;
}

// Day 30: Add variants based on actual usage
interface CardProps {
  children: ReactNode;
  variant?: "default" | "outlined" | "elevated";
  padding?: "sm" | "md" | "lg";
}
```

---

## Good API Smells

### ✅ Few Required Props
```tsx
<Button>Click Me</Button> // Just works
<Modal><Modal.Body>Content</Modal.Body></Modal> // Minimal
```

### ✅ Composition Over Configuration
```tsx
// Not this:
<Header logo={logo} nav={nav} actions={actions} />

// This:
<Header>
  <Header.Logo><img src={logo} /></Header.Logo>
  <Header.Nav>{nav}</Header.Nav>
  <Header.Actions>{actions}</Header.Actions>
</Header>
```

### ✅ Single Responsibility
```tsx
// Not this:
<UserProfile showActivity showFriends showPosts />

// This:
<UserProfile>
  <ActivityFeed />
  <FriendsList />
  <PostsList />
</UserProfile>
```

---

## Bad API Smells

### ❌ Boolean Soup
```tsx
<Button primary large loading disabled fullWidth />
// Which takes precedence? What if primary + secondary both true?
```

### ❌ Stringly Typed
```tsx
<Icon name="user" /> // Typo: "usre" → runtime error
<Icon name="user" as const /> // Better, but still not type-safe
```

**Better:** Enum or union type
```tsx
type IconName = "user" | "settings" | "logout";
<Icon name="user" /> // TypeScript error if typo
```

### ❌ Callback Confusion
```tsx
<Form
  onSubmit={...}
  onValidSubmit={...}
  onInvalidSubmit={...}
  onSubmitSuccess={...}
  onSubmitError={...}
/>
// When does each fire? In what order?
```

---

## Testing Component APIs

```tsx
describe("Button API", () => {
  it("renders as button by default", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders as link when as='a'", () => {
    render(<Button as="a" href="/home">Home</Button>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/home");
  });

  it("forwards props to underlying element", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("accepts children", () => {
    render(<Button><span>Icon</span> Text</Button>);
    expect(screen.getByText("Icon")).toBeInTheDocument();
  });
});
```

---

## Key Takeaways

1. **Children are your most flexible API** — use them liberally
2. **Polymorphism via `as` prop** — one component, many elements
3. **Render props for unpredictable content** — let caller decide
4. **Compound components for related state** — share via context
5. **Start minimal, expand based on usage** — don't predict every use case
6. **Prefer composition over configuration** — slots over props

---

**Next:** [Lecture 2: Composition Patterns →](2-composition-patterns.md)
