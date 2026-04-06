# Testing Library Philosophy

## Core Principle

> "The more your tests resemble the way your software is used, the more confidence they can give you."

## Guiding Questions

1. **If I were a user, how would I use this?**
2. **What would I see? What would I click?**
3. **What outcome would I expect?**

## Query Priority

### 1. Queries Accessible to Everyone
```tsx
// ✅ How users with assistive tech find elements
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText(/email address/i);
screen.getByPlaceholderText(/search/i);
screen.getByText(/welcome/i);
```

### 2. Semantic Queries
```tsx
// ✅ Backup for images, titles
screen.getByAltText(/profile photo/i);
screen.getByTitle(/close/i);
```

### 3. Test IDs (Last Resort)
```tsx
// ❌ Only when accessibility queries don't work
screen.getByTestId("custom-element");
```

## Anti-Patterns

### ❌ Testing Implementation Details

```tsx
// Bad: Testing internal state
expect(wrapper.state("isOpen")).toBe(true);

// Good: Testing visible behavior
expect(screen.getByRole("dialog")).toBeVisible();
```

### ❌ Using Container/Wrapper

```tsx
// Bad
const wrapper = render(<Component />);
expect(wrapper.container.querySelector(".class")).toBeTruthy();

// Good
render(<Component />);
expect(screen.getByRole("button")).toBeInTheDocument();
```

### ❌ Waiting Arbitrarily

```tsx
// Bad
await new Promise(resolve => setTimeout(resolve, 1000));

// Good
await screen.findByText("Loaded");
await waitFor(() => expect(screen.getByText("Loaded")).toBeInTheDocument());
```

## Best Practices

1. **Use `userEvent` over `fireEvent`**
```tsx
// ❌ fireEvent doesn't simulate full user interaction
fireEvent.click(button);

// ✅ userEvent simulates real user (hover, focus, click)
await user.click(button);
```

2. **Query by accessible name**
```tsx
// ❌ Fragile
screen.getByText("Submit");

// ✅ Robust
screen.getByRole("button", { name: /submit/i });
```

3. **Test error states**
```tsx
test("shows error on API failure", async () => {
  server.use(
    http.get("/api/data", () => HttpResponse.error())
  );
  
  render(<Component />);
  
  expect(await screen.findByRole("alert")).toHaveTextContent(/error/i);
});
```
