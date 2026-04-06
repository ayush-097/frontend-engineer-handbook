# Testing Pyramid

## The Three Levels

```
        /\
       /E2E\     10% - Critical user flows (login, checkout)
      /______\
     /        \
    /Integration\ 20% - Components with dependencies
   /______________\
  /                \
 /      Unit        \ 70% - Pure functions, hooks, utilities
/____________________\
```

## Unit Tests

**What:** Test individual functions/modules in isolation  
**Speed:** Milliseconds  
**Cost:** Low (easy to write and maintain)  
**ROI:** High

```tsx
// utils/calculations.ts
export function calculateDiscount(price: number, percent: number): number {
  return price * (percent / 100);
}

// utils/calculations.test.ts
import { calculateDiscount } from "./calculations";

describe("calculateDiscount", () => {
  it("calculates 10% discount correctly", () => {
    expect(calculateDiscount(100, 10)).toBe(10);
  });
  
  it("handles 0% discount", () => {
    expect(calculateDiscount(100, 0)).toBe(0);
  });
  
  it("handles 100% discount", () => {
    expect(calculateDiscount(100, 100)).toBe(100);
  });
});
```

## Integration Tests

**What:** Test components with their dependencies  
**Speed:** Seconds  
**Cost:** Medium  
**ROI:** Medium-High

```tsx
// LoginForm.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

test("submits form with valid credentials", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  
  render(<LoginForm onSubmit={onSubmit} />);
  
  await user.type(screen.getByLabelText(/email/i), "user@example.com");
  await user.type(screen.getByLabelText(/password/i), "password123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  
  expect(onSubmit).toHaveBeenCalledWith({
    email: "user@example.com",
    password: "password123",
  });
});
```

## E2E Tests

**What:** Test complete user flows in real browser  
**Speed:** Minutes  
**Cost:** High (slow, flaky, hard to debug)  
**ROI:** Low-Medium

```tsx
// checkout.spec.ts (Playwright)
import { test, expect } from "@playwright/test";

test("user can complete checkout", async ({ page }) => {
  await page.goto("/products");
  await page.click("text=Add to Cart");
  await page.click("text=Checkout");
  
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="card"]', "4242424242424242");
  await page.click("text=Place Order");
  
  await expect(page.locator("text=Order Confirmed")).toBeVisible();
});
```

## When to Use Each

### Unit Tests
- Pure functions (utils, helpers)
- Business logic (calculations, validators)
- Custom hooks
- State reducers

### Integration Tests
- Forms
- Modals
- Lists with user interactions
- Components with API calls (mocked)

### E2E Tests
- Login flow
- Checkout flow
- Payment processing
- Critical features that generate revenue
