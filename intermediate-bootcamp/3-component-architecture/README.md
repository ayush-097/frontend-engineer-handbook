# Module 3: Component Architecture

**Duration:** 2.5 weeks | **Level:** Intermediate  
**Prerequisites:** React Core (Module 5), State Management (Module 2)

## Overview

Learn to design scalable, reusable component APIs that stand the test of time. This module teaches you to think in components, compose behavior through patterns (not inheritance), eliminate prop drilling, handle errors gracefully, and optimize bundle size through code splitting.

## Learning Objectives

By the end of this module you will be able to:

- **Design** flexible component APIs using the Inversion of Control pattern
- **Build** polymorphic components (`<Button as="a">`) with full type safety
- **Implement** headless UI components separating logic from presentation
- **Compose** complex behavior without prop drilling (slots, render props, compound components)
- **Create** robust error boundaries with fallback UI and recovery strategies
- **Optimize** bundle size with lazy loading, React.lazy, and route-based splitting
- **Test** component contracts and API surface areas

## Module Structure

```
3-component-architecture/
├── README.md
├── lecture/
│   ├── 1-component-api-design.md      ← API design principles, IoC
│   ├── 2-composition-patterns.md      ← Slots, children as API, compound
│   ├── 3-prop-drilling-solutions.md   ← Context, component composition
│   ├── 4-error-boundaries.md          ← Class boundaries, recovery, logging
│   └── 5-code-splitting.md            ← React.lazy, Suspense, dynamic imports
├── lab/
│   ├── polymorphic-components/        ← Button/Link/Heading with `as` prop
│   ├── headless-ui-components/        ← useSelect, useDialog (logic only)
│   ├── error-boundary-system/         ← App-wide error handling
│   └── lazy-loading-routes/           ← Route-based + component-level splitting
├── homework/
│   ├── design-table-component.md      ← Flexible DataTable API
│   └── refactor-monolith.md           ← Break up 500-line component
└── tests/
    └── component-api.test.tsx         ← Contract testing
```

## Schedule

| Days | Topic | Activity |
|------|-------|----------|
| 1–2  | Component API design | Lecture 1 + design exercises |
| 3–5  | Composition patterns | Lecture 2 + polymorphic components lab |
| 6–8  | Prop drilling solutions | Lecture 3 + headless UI lab |
| 9–11 | Error boundaries | Lecture 4 + error boundary system lab |
| 12–14| Code splitting | Lecture 5 + lazy loading lab |
| 15–17| Homework + review | Design table + refactor monolith |

## Key Concepts

### Inversion of Control
```tsx
// ❌ Rigid: component controls everything
<Button onClick={handleClick} loading={isLoading} />

// ✅ Flexible: caller controls behavior
<Button onClick={handleClick}>
  {isLoading ? <Spinner /> : "Submit"}
</Button>
```

### Polymorphic Components
```tsx
<Button as="a" href="/home">Link Button</Button>
<Button as="button" type="submit">Form Button</Button>
<Heading as="h1">Main Title</Heading>
<Heading as="h3">Subsection</Heading>
```

### Headless UI
```tsx
// Logic (headless)
const { isOpen, open, close } = useDialog();

// Presentation (your choice)
<div className={myStyles.modal}>...</div>
// or <MuiDialog>...</MuiDialog>
// or <ChakraModal>...</ChakraModal>
```

### Error Boundaries
```tsx
<ErrorBoundary fallback={<ErrorPage />} onError={logToSentry}>
  <Router>
    <Routes />
  </Router>
</ErrorBoundary>
```

### Code Splitting
```tsx
const Dashboard = lazy(() => import("./Dashboard"));

<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>
```

## Setup

```bash
npm create vite@latest component-labs -- --template react-ts
cd component-labs
npm install

# Dependencies
npm install clsx react-router-dom
npm install -D @testing-library/react @testing-library/user-event vitest
```

## Assessment

- **Lab: Polymorphic Components** — 20 pts
- **Lab: Headless UI Components** — 25 pts
- **Lab: Error Boundary System** — 20 pts
- **Lab: Lazy Loading Routes** — 15 pts
- **Homework: Design Table Component** — 10 pts
- **Homework: Refactor Monolith** — 10 pts

**Total: 100 pts | Pass: 70+**

## Design Principles

### 1. Open/Closed Principle
Components should be **open for extension** (via props, children, composition) but **closed for modification** (don't need to edit source for new use cases).

```tsx
// ✅ Open: supports any use case via children
<Card>
  <CardHeader>
    <Avatar user={user} />
    <h3>{user.name}</h3>
  </CardHeader>
  <CardBody>
    {/* anything here */}
  </CardBody>
</Card>

// ❌ Closed: needs new props for every variation
<Card
  showAvatar
  avatarUser={user}
  headerTitle={user.name}
  headerIcon={<Icon />}
  // ... 20 more props for every possible configuration
/>
```

### 2. Single Responsibility
Each component should do **one thing well**.

```tsx
// ❌ Too much responsibility
<UserProfile
  userId={id}
  onEdit={...}
  onDelete={...}
  showActivityFeed
  activityLimit={10}
  showFriendsList
  friendsLimit={5}
/>

// ✅ Composed from focused components
<UserProfile userId={id}>
  <ProfileHeader onEdit={...} onDelete={...} />
  <ActivityFeed limit={10} />
  <FriendsList limit={5} />
</UserProfile>
```

### 3. Dependency Inversion
Depend on **abstractions** (interfaces, children, render props) not **concrete implementations**.

```tsx
// ❌ Hardcoded implementation
function DataTable({ data }) {
  return (
    <table>
      {data.map(row => (
        <tr>
          <td>{row.name}</td>
          <td>{row.email}</td>
        </tr>
      ))}
    </table>
  );
}

// ✅ Abstract via render prop
function DataTable({ data, renderRow }) {
  return (
    <table>
      {data.map(row => renderRow(row))}
    </table>
  );
}
```

## Common Anti-Patterns

### ❌ Boolean Props
```tsx
<Button primary />
<Button secondary />
<Button danger />
// What if you need primary + danger? Two booleans active?
```

### ✅ Variant Prop
```tsx
<Button variant="primary" />
<Button variant="secondary" />
<Button variant="danger" />
// Mutually exclusive by design
```

---

### ❌ Massive Props Interface
```tsx
interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  // ... 15 more props
}
```

### ✅ Composition + Slots
```tsx
<Button onClick={...} disabled={loading}>
  {loading && <Spinner />}
  {icon && <Icon name={icon} />}
  Submit
</Button>
```

---

### ❌ Prop Drilling
```tsx
<App user={user} theme={theme} locale={locale}>
  <Layout user={user} theme={theme} locale={locale}>
    <Sidebar user={user} theme={theme}>
      <UserMenu user={user} theme={theme} />
    </Sidebar>
  </Layout>
</App>
```

### ✅ Context
```tsx
<UserProvider value={user}>
  <ThemeProvider value={theme}>
    <LocaleProvider value={locale}>
      <App>
        <Layout>
          <Sidebar>
            <UserMenu />
          </Sidebar>
        </Layout>
      </App>
    </LocaleProvider>
  </ThemeProvider>
</UserProvider>
```

## Deliverables

By the end of this module, you will have built:

1. **Polymorphic `<Button>`** — Works as button, link, or any element
2. **Headless `useSelect`** — Accessible dropdown logic you can style
3. **Error boundary system** — App-wide, route-level, component-level
4. **Lazy-loaded routes** — Dashboard loads on-demand, not upfront
5. **DataTable component** — Flexible API supporting infinite use cases
6. **Refactored monolith** — 500-line component → composed from smaller pieces

## Resources

- [Kent C. Dodds: Inversion of Control](https://kentcdodds.com/blog/inversion-of-control)
- [Headless UI Components](https://www.merrickchristensen.com/articles/headless-user-interface-components/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Code Splitting Guide](https://react.dev/reference/react/lazy)
- [Component Composition vs Inheritance](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)
