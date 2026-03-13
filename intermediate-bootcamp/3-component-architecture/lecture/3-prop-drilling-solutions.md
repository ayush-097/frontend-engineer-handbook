# Prop Drilling Solutions

## The Problem

```tsx
// App needs to pass user 5 levels deep
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <Nav user={user}>
        <UserMenu user={user} />
      </Nav>
    </Sidebar>
  </Layout>
</App>
```

## Solution 1: Context

```tsx
const UserContext = createContext(null);

function App() {
  const user = useAuth();
  return (
    <UserContext.Provider value={user}>
      <Layout>
        <Sidebar>
          <Nav>
            <UserMenu />
          </Nav>
        </Sidebar>
      </Layout>
    </UserContext.Provider>
  );
}

function UserMenu() {
  const user = useContext(UserContext);
  return <div>{user.name}</div>;
}
```

## Solution 2: Component Composition

```tsx
// Instead of passing user down, pass <UserMenu> down
<App>
  <Layout sidebar={
    <Sidebar>
      <Nav menu={<UserMenu user={user} />} />
    </Sidebar>
  }>
    <Content />
  </Layout>
</App>
```

## Solution 3: Children Pattern

```tsx
function App() {
  const user = useAuth();
  return (
    <Layout>
      <Sidebar>
        <Nav>
          <UserMenu user={user} />
        </Nav>
      </Sidebar>
    </Layout>
  );
}
```

**Key insight:** Layout/Sidebar/Nav don't need to know about `user`. Only UserMenu does. So pass UserMenu as children, not user as props.
