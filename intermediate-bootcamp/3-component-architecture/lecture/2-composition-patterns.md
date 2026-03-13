# Composition Patterns

## Slots Pattern

```tsx
// Instead of: <Header logo={...} nav={...} actions={...} />
<Header>
  <Header.Logo><img src="/logo.png" /></Header.Logo>
  <Header.Nav>
    <NavLink to="/">Home</NavLink>
    <NavLink to="/about">About</NavLink>
  </Header.Nav>
  <Header.Actions>
    <Button>Sign In</Button>
  </Header.Actions>
</Header>
```

## Children as Function

```tsx
<DataFetcher url="/api/users">
  {({ data, loading, error }) => {
    if (loading) return <Spinner />;
    if (error) return <Error error={error} />;
    return <UserList users={data} />;
  }}
</DataFetcher>
```

## Compound Components

```tsx
const AccordionContext = createContext(null);

export function Accordion({ children }) {
  const [openId, setOpenId] = useState(null);
  return (
    <AccordionContext.Provider value={{ openId, setOpenId }}>
      {children}
    </AccordionContext.Provider>
  );
}

Accordion.Item = function Item({ id, children }) {
  const { openId, setOpenId } = useContext(AccordionContext);
  const isOpen = openId === id;
  return (
    <div>
      {React.Children.map(children, child =>
        React.cloneElement(child, { id, isOpen, setOpenId })
      )}
    </div>
  );
};

Accordion.Trigger = function Trigger({ id, children }) {
  const { setOpenId } = useContext(AccordionContext);
  return <button onClick={() => setOpenId(id)}>{children}</button>;
};

Accordion.Panel = function Panel({ isOpen, children }) {
  if (!isOpen) return null;
  return <div>{children}</div>;
};
```

## Layout Components

```tsx
<Stack spacing="md" direction="vertical">
  <Card />
  <Card />
  <Card />
</Stack>

<Grid cols={3} gap="lg">
  <Card />
  <Card />
  <Card />
</Grid>
```
