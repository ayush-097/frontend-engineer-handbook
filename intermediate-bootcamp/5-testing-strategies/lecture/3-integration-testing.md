# Integration Testing with Testing Library

## Query Priority

1. **getByRole** (most accessible)
2. **getByLabelText** (forms)
3. **getByPlaceholderText** (forms)
4. **getByText** (non-interactive)
5. **getByDisplayValue** (current form value)
6. **getByAltText** (images)
7. **getByTitle** (rare)
8. **getByTestId** (last resort)

## Testing Forms

```tsx
test("validates email format", async () => {
  const user = userEvent.setup();
  render(<SignupForm />);
  
  const emailInput = screen.getByLabelText(/email/i);
  await user.type(emailInput, "invalid-email");
  await user.click(screen.getByRole("button", { name: /submit/i }));
  
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});
```

## Testing Async Components

```tsx
test("loads and displays user data", async () => {
  render(<UserProfile userId={1} />);
  
  // Initially loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Eventually shows data
  const userName = await screen.findByText("John Doe");
  expect(userName).toBeInTheDocument();
  
  // Loading is gone
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

## Testing User Interactions

```tsx
test("opens modal on button click", async () => {
  const user = userEvent.setup();
  render(<App />);
  
  await user.click(screen.getByRole("button", { name: /open/i }));
  
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.getByLabelText(/close modal/i)).toBeInTheDocument();
});
```
