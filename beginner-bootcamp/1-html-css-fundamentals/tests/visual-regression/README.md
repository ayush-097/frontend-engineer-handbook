# Visual Regression Testing

## What is Visual Regression Testing?

Visual regression testing captures screenshots of UI components and compares them against baseline images to detect unintended visual changes.

## Tools

### Recommended Tools:

1. **Percy** - Cloud-based visual testing
2. **Chromatic** - Storybook integration
3. **BackstopJS** - Open-source, local testing
4. **Playwright** - Built-in screenshot testing

## Setup with BackstopJS

### Installation

```bash
npm install -g backstopjs
backstop init
```

### Configuration

```javascript
// backstop.json
{
  "id": "html-css-components",
  "viewports": [
    {
      "label": "phone",
      "width": 375,
      "height": 667
    },
    {
      "label": "tablet",
      "width": 768,
      "height": 1024
    },
    {
      "label": "desktop",
      "width": 1920,
      "height": 1080
    }
  ],
  "scenarios": [
    {
      "label": "Navbar",
      "url": "http://localhost:8080/navbar.html",
      "selectors": [".navbar"],
      "delay": 500
    },
    {
      "label": "Card",
      "url": "http://localhost:8080/card.html",
      "selectors": [".card"],
      "hoverSelector": ".card",
      "delay": 500
    }
  ]
}
```

### Commands

```bash
# Create reference screenshots
backstop reference

# Run tests (compare against reference)
backstop test

# Approve changes
backstop approve
```

## Setup with Playwright

```javascript
// visual.test.js
const { test, expect } = require("@playwright/test");

test("navbar looks correct", async ({ page }) => {
  await page.goto("http://localhost:8080/navbar.html");

  // Take screenshot
  await expect(page.locator(".navbar")).toHaveScreenshot("navbar.png");
});

test("card hover state", async ({ page }) => {
  await page.goto("http://localhost:8080/card.html");

  const card = page.locator(".card");

  // Normal state
  await expect(card).toHaveScreenshot("card-normal.png");

  // Hover state
  await card.hover();
  await expect(card).toHaveScreenshot("card-hover.png");
});
```

## Manual Testing Checklist

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Device Testing

- [ ] iPhone (375px width)
- [ ] iPad (768px width)
- [ ] Desktop (1920px width)

### States to Test

- [ ] Normal state
- [ ] Hover state
- [ ] Focus state
- [ ] Active state
- [ ] Disabled state
- [ ] Error state
- [ ] Loading state

### Accessibility

- [ ] Color contrast (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Text readable at 200% zoom
- [ ] Components work with keyboard only

## Example Test Scenarios

### Navbar

1. **Mobile view**: Hamburger menu visible
2. **Desktop view**: Horizontal navigation
3. **Menu open**: Overlay visible
4. **Hover**: Link color changes

### Card

1. **Default**: Border, shadow visible
2. **Hover**: Lift effect, increased shadow
3. **Responsive**: Adapts to container width
4. **With image**: Image maintains aspect ratio

### Form

1. **Empty**: Normal border color
2. **Focus**: Blue border, box-shadow
3. **Valid**: Green border, checkmark
4. **Invalid**: Red border, error message
5. **Disabled**: Gray appearance

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Run visual tests
        run: npm run test:visual

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: visual-diff
          path: backstop_data/bitmaps_test/
```

## Best Practices

1. **Baseline Management**

   - Store baselines in version control
   - Update baselines intentionally, not automatically
   - Document why baselines changed

2. **Test Stability**

   - Wait for animations to complete
   - Use fixed data (no random content)
   - Disable auto-playing videos

3. **Performance**

   - Test critical components only
   - Use selective screenshots (not full page)
   - Run in parallel when possible

4. **Maintenance**
   - Review failures regularly
   - Update baselines when design changes
   - Clean up old screenshots

## Resources

- [BackstopJS Documentation](https://github.com/garris/BackstopJS)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Percy Documentation](https://docs.percy.io/)
- [Visual Regression Testing Guide](https://www.smashingmagazine.com/2015/09/visual-regression-testing-tutorial/)
