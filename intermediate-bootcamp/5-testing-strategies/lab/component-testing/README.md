# Lab: Component Testing

Test forms, modals, and lists using Testing Library.

## Tasks

### 1. Test ContactForm Component
**Features to test:**
- Email validation (shows error for invalid email)
- Required fields (shows error if empty)
- Successful submission (calls onSubmit with correct data)
- Disabled submit button while submitting

```tsx
test("validates email format", async () => {
  const user = userEvent.setup();
  render(<ContactForm />);
  
  await user.type(screen.getByLabelText(/email/i), "invalid");
  await user.click(screen.getByRole("button", { name: /submit/i }));
  
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});
```

### 2. Test Modal Component
- Opens on trigger click
- Closes on X button click
- Closes on Escape key
- Traps focus inside modal
- ARIA attributes correct

### 3. Test TodoList Component
- Adds new todo
- Toggles todo completion
- Deletes todo
- Filters (All, Active, Completed)
- Shows empty state

**Time:** 4-5 hours  
**Deliverable:** Full test suite with 15+ tests
