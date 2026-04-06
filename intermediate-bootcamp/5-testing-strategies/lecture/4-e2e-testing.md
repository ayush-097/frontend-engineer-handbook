# E2E Testing with Playwright

## Basic Test Structure

```tsx
import { test, expect } from "@playwright/test";

test("user can log in", async ({ page }) => {
  // Navigate
  await page.goto("/login");
  
  // Fill form
  await page.fill('[name="email"]', "user@example.com");
  await page.fill('[name="password"]', "password123");
  
  // Submit
  await page.click('button:has-text("Sign In")');
  
  // Assert
  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("text=Welcome")).toBeVisible();
});
```

## Page Object Pattern

```tsx
class LoginPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto("/login");
  }
  
  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button:has-text("Sign In")');
  }
  
  async getErrorMessage() {
    return this.page.locator('[role="alert"]').textContent();
  }
}

test("login with invalid credentials shows error", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("wrong@example.com", "wrongpass");
  
  const error = await loginPage.getErrorMessage();
  expect(error).toContain("Invalid credentials");
});
```

## Waiting Strategies

```tsx
// ❌ Don't use arbitrary waits
await page.waitForTimeout(3000);

// ✅ Wait for specific element
await page.waitForSelector("text=Loaded");

// ✅ Use auto-waiting assertions
await expect(page.locator("text=Loaded")).toBeVisible();

// ✅ Wait for network idle
await page.waitForLoadState("networkidle");
```
