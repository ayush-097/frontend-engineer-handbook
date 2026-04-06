# Lab: E2E User Flows

Test critical paths with Playwright.

## User Flows to Test

### 1. Authentication Flow
```tsx
test("user can sign up and log in", async ({ page }) => {
  // Sign up
  await page.goto("/signup");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "Password123!");
  await page.click("text=Sign Up");
  await expect(page).toHaveURL("/dashboard");
  
  // Log out
  await page.click("text=Log Out");
  
  // Log back in
  await page.goto("/login");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "Password123!");
  await page.click("text=Sign In");
  await expect(page).toHaveURL("/dashboard");
});
```

### 2. E-commerce Checkout
- Browse products
- Add to cart
- Update quantities
- Proceed to checkout
- Fill shipping info
- Enter payment
- Confirm order

### 3. Search and Filter
- Enter search query
- Apply filters
- Sort results
- Navigate to detail page

**Time:** 5-6 hours  
**Deliverable:** 3 complete user flow tests + Page Objects
