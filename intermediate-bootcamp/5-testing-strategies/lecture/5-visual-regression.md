# Visual Regression Testing

## Snapshot Testing

```tsx
// Button.test.tsx
import { render } from "@testing-library/react";
import { Button } from "./Button";

test("matches snapshot", () => {
  const { container } = render(<Button>Click Me</Button>);
  expect(container.firstChild).toMatchSnapshot();
});

// First run: Creates __snapshots__/Button.test.tsx.snap
// Subsequent runs: Compares against snapshot
// If different: Test fails, shows diff
```

## Chromatic (Visual Testing SaaS)

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  component: Button,
};
export default meta;

export const Primary: StoryObj<typeof Button> = {
  args: {
    variant: "primary",
    children: "Click Me",
  },
};

export const Disabled: StoryObj<typeof Button> = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

// Chromatic captures screenshots of each story
// CI fails if visual changes detected
```

## Playwright Screenshots

```tsx
test("homepage looks correct", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png");
});

// First run: Captures baseline
// Subsequent runs: Compares pixel-by-pixel
```
