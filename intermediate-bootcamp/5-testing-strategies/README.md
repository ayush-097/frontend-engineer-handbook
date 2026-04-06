# Module 5: Testing Strategies

**Duration:** 3 weeks | **Level:** Intermediate  
**Prerequisites:** React Core, Component Architecture

## Overview

Master testing React applications: unit tests with Vitest, integration tests with Testing Library, end-to-end tests with Playwright, visual regression with Chromatic, and the testing philosophy that ties it all together. Build confidence in your code with comprehensive test coverage.

## Learning Objectives

By the end of this module you will be able to:

- **Apply** the testing pyramid (unit, integration, E2E) to React apps
- **Write** unit tests for hooks, utilities, and business logic
- **Test** components using Testing Library's user-centric approach
- **Mock** APIs, modules, and external dependencies effectively
- **Implement** E2E tests for critical user flows with Playwright
- **Detect** visual regressions with snapshot testing
- **Achieve** meaningful test coverage (not just 100% for the sake of it)
- **Debug** failing tests efficiently

## Module Structure

```
5-testing-strategies/
├── README.md
├── lecture/
│   ├── 1-testing-pyramid.md          ← Unit vs Integration vs E2E
│   ├── 2-unit-testing.md             ← Pure functions, hooks, utils
│   ├── 3-integration-testing.md      ← Testing Library, user events
│   ├── 4-e2e-testing.md              ← Playwright, critical paths
│   ├── 5-visual-regression.md        ← Snapshot testing, Chromatic
│   └── 6-testing-library-philosophy.md ← Query priorities, accessibility
├── lab/
│   ├── component-testing/            ← Forms, modals, lists with RTL
│   ├── mock-strategies/              ← MSW, module mocks, timers
│   ├── e2e-user-flows/               ← Playwright checkout flow
│   └── visual-testing-setup/         ← Storybook + Chromatic
├── homework/
│   ├── test-coverage-improvement.md  ← Raise coverage to 80%
│   └── e2e-critical-paths.md         ← Test auth + payment flows
└── tests/
    ├── examples/                      ← Reference test examples
    └── playwright.config.ts
```

## Schedule

| Days | Topic | Activity |
|------|-------|----------|
| 1–3  | Testing pyramid & unit tests | Lecture 1–2 + pure function tests |
| 4–7  | Integration testing | Lecture 3 + component testing lab |
| 8–11 | Mocking strategies | Mock strategies lab |
| 12–14| E2E testing | Lecture 4 + user flows lab |
| 15–17| Visual regression | Lecture 5 + visual testing lab |
| 18–21| Homework | Coverage improvement + E2E paths |

## The Testing Pyramid

```
        /\
       /  \  E2E (Few, Slow, Brittle)
      /____\
     /      \
    / Integ. \ (Some, Medium Speed)
   /__________\
  /            \
 /     Unit     \ (Many, Fast, Stable)
/________________\
```

### Distribution
- **70% Unit** — Pure functions, hooks, utilities
- **20% Integration** — Components with Testing Library
- **10% E2E** — Critical user flows with Playwright

### Why This Ratio?

**Unit tests:**
- ✅ Fast (milliseconds)
- ✅ Reliable (no flakiness)
- ✅ Easy to debug
- ✅ High ROI

**E2E tests:**
- ❌ Slow (seconds to minutes)
- ❌ Flaky (network, timing issues)
- ❌ Hard to debug
- ❌ Lower ROI

**Integration tests:**
- 🟡 Medium speed
- 🟡 Fairly reliable
- 🟡 Decent ROI

## Testing Philosophy

### Test Behavior, Not Implementation

```tsx
// ❌ Testing implementation details
expect(component.state.isOpen).toBe(true);
expect(mockFunction).toHaveBeenCalledTimes(3);

// ✅ Testing behavior
expect(screen.getByRole('dialog')).toBeVisible();
expect(screen.getByText('Success')).toBeInTheDocument();
```

### Write Tests Users Would Run

```tsx
// ❌ Testing like a developer
const button = wrapper.find('[data-testid="submit-button"]');
button.simulate('click');

// ✅ Testing like a user
const button = screen.getByRole('button', { name: /submit/i });
await userEvent.click(button);
```

### Query Priority (Testing Library)

1. **Accessible queries** (users with assistive tech can use):
   - `getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`

2. **Semantic queries**:
   - `getByAltText`, `getByTitle`

3. **Test IDs** (last resort):
   - `getByTestId`

## Setup

```bash
npm create vite@latest testing-labs -- --template react-ts
cd testing-labs
npm install

# Testing dependencies
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D msw  # Mock Service Worker
npm install -D @playwright/test
npm install -D @storybook/react chromatic
```

## Assessment

- **Lab: Component Testing** — 25 pts
- **Lab: Mock Strategies** — 20 pts
- **Lab: E2E User Flows** — 25 pts
- **Lab: Visual Testing Setup** — 10 pts
- **Homework: Test Coverage** — 15 pts
- **Homework: E2E Critical Paths** — 5 pts

**Total: 100 pts | Pass: 70+**

## What to Test

### ✅ Always Test
- Business logic (calculations, transformations)
- Critical user paths (login, checkout, payment)
- Edge cases (empty states, errors, loading)
- Accessibility (keyboard nav, screen reader labels)
- User interactions (forms, modals, dropdowns)

### ❌ Don't Test
- Third-party libraries (they have their own tests)
- Trivial code (`const sum = (a, b) => a + b`)
- Implementation details (internal state, private methods)
- Styles (use visual regression instead)

## Common Testing Patterns

### 1. Render + Query + Assert

```tsx
test("shows success message on submit", async () => {
  const user = userEvent.setup();
  
  render(<ContactForm />);
  
  await user.type(screen.getByLabelText(/name/i), "John");
  await user.type(screen.getByLabelText(/email/i), "john@example.com");
  await user.click(screen.getByRole("button", { name: /submit/i }));
  
  expect(await screen.findByText(/success/i)).toBeInTheDocument();
});
```

### 2. Mock API Responses

```tsx
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/user", () => {
    return HttpResponse.json({ name: "John", email: "john@example.com" });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 3. Test Async UI

```tsx
test("loads and displays user data", async () => {
  render(<UserProfile userId={1} />);
  
  // Initially shows loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Eventually shows user data
  expect(await screen.findByText("John")).toBeInTheDocument();
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

### 4. Test Error States

```tsx
test("shows error on API failure", async () => {
  server.use(
    http.get("/api/user", () => {
      return HttpResponse.error();
    })
  );
  
  render(<UserProfile userId={1} />);
  
  expect(await screen.findByText(/error/i)).toBeInTheDocument();
});
```

## E2E Testing Best Practices

### 1. Test Critical Paths Only

```tsx
// ✅ Critical: User can complete checkout
test("user can purchase product", async ({ page }) => {
  await page.goto("/products");
  await page.click("text=Add to Cart");
  await page.click("text=Checkout");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="card"]', "4242424242424242");
  await page.click("text=Pay");
  await expect(page.locator("text=Order confirmed")).toBeVisible();
});

// ❌ Not critical: UI details
test("button has correct background color", async ({ page }) => {
  // This should be a visual regression test instead
});
```

### 2. Use Page Object Pattern

```tsx
class CheckoutPage {
  constructor(private page: Page) {}
  
  async fillShippingInfo(info: ShippingInfo) {
    await this.page.fill('[name="name"]', info.name);
    await this.page.fill('[name="address"]', info.address);
  }
  
  async submitOrder() {
    await this.page.click('[data-testid="submit-order"]');
  }
}

test("checkout flow", async ({ page }) => {
  const checkout = new CheckoutPage(page);
  await checkout.fillShippingInfo({ name: "John", address: "123 Main" });
  await checkout.submitOrder();
});
```

### 3. Avoid Hardcoded Waits

```tsx
// ❌ Fragile
await page.waitForTimeout(3000);

// ✅ Wait for specific condition
await page.waitForSelector("text=Loaded");
await expect(page.locator("text=Loaded")).toBeVisible();
```

## Visual Regression Testing

```tsx
// Storybook story
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Click Me",
  },
};

// Chromatic captures screenshots
// CI fails if visual changes detected
```

## Coverage Goals

- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

**But:** Coverage is a tool, not a goal. 100% coverage doesn't mean bug-free code.

## Debugging Tests

### 1. Use `screen.debug()`

```tsx
test("debugging example", () => {
  render(<MyComponent />);
  screen.debug(); // Prints current DOM to console
});
```

### 2. Use `logRoles()`

```tsx
import { logRoles } from "@testing-library/react";

test("check available roles", () => {
  const { container } = render(<MyComponent />);
  logRoles(container); // Shows all available roles
});
```

### 3. Use Playwright Inspector

```bash
npx playwright test --debug
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npx chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
```

## Deliverables

By the end of this module, you will have:

1. **Component test suite** — Forms, modals, lists with full coverage
2. **Mock strategies** — API mocking with MSW, module mocks, timer mocks
3. **E2E test suite** — Checkout flow with Playwright
4. **Visual regression setup** — Storybook + Chromatic configured
5. **80% coverage** — Meaningful tests for critical code paths
6. **E2E critical paths** — Auth, payment, core features tested

## Tools Comparison

| Tool | Type | Use Case |
|------|------|----------|
| **Vitest** | Unit/Integration | Fast tests for functions, hooks, components |
| **Testing Library** | Integration | User-centric component tests |
| **MSW** | Mocking | API mocking without changing code |
| **Playwright** | E2E | Cross-browser critical path testing |
| **Chromatic** | Visual | Screenshot diff for UI regressions |
| **Storybook** | Dev Tool | Component playground + visual tests |

## Resources

- [Testing Library Docs](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [Vitest Guide](https://vitest.dev/guide/)
- [Kent C. Dodds: Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
