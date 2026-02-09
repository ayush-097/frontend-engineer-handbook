# CSS Architecture

## Why Architecture Matters

As projects grow, CSS becomes:

- Hard to maintain
- Full of conflicts
- Unpredictable
- Scary to change

**Good architecture solves this.**

## BEM Methodology

**Block Element Modifier** - naming convention for classes.

### Structure

```
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}
```

### Example: Card Component

```html
<div class="card card--featured">
  <img class="card__image" src="..." alt="..." />
  <div class="card__body">
    <h3 class="card__title">Title</h3>
    <p class="card__text">Description...</p>
    <button class="card__button card__button--primary">Read More</button>
  </div>
</div>
```

```css
/* Block */
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
}

/* Element */
.card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card__body {
  padding: 1rem;
}

.card__title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.card__button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
}

/* Modifier */
.card--featured {
  border-color: gold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card__button--primary {
  background: blue;
  color: white;
}

.card__button--secondary {
  background: gray;
  color: white;
}
```

### BEM Benefits

- **No specificity wars** - all classes have same specificity
- **Portable** - move component anywhere
- **Self-documenting** - naming shows relationships
- **Searchable** - easy to find related code

### BEM Rules

1. **Never nest blocks** - keep specificity flat
2. **Element belongs to block** - not to element
3. **Use modifiers for variations** - not new classes

```css
/* ❌ Bad - nested blocks */
.card .button {
}

/* ✅ Good - separate blocks */
.button {
}

/* ❌ Bad - element of element */
.card__body__title {
}

/* ✅ Good - all elements belong to block */
.card__title {
}
```

## CSS Custom Properties

**Variables in CSS** - powerful for theming and maintenance.

### Basic Usage

```css
:root {
  --color-primary: #3498db;
  --color-secondary: #2ecc71;
  --color-danger: #e74c3c;

  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;

  --font-size-base: 16px;
  --font-size-lg: 1.25rem;

  --border-radius: 4px;
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  border-radius: var(--border-radius);
}
```

### Theming

```css
:root {
  --bg-color: white;
  --text-color: black;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}
```

```javascript
// Toggle theme
document.documentElement.setAttribute("data-theme", "dark");
```

### Fallback Values

```css
.element {
  color: var(--custom-color, blue); /* Falls back to blue */
}
```

### Responsive Custom Properties

```css
:root {
  --padding: 1rem;
}

@media (min-width: 768px) {
  :root {
    --padding: 2rem;
  }
}

.container {
  padding: var(--padding);
}
```

## File Organization

### Small Projects

```
styles/
├── reset.css          # CSS reset
├── variables.css      # Custom properties
├── base.css           # Base styles (html, body, etc.)
├── components/
│   ├── button.css
│   ├── card.css
│   └── nav.css
├── utilities.css      # Utility classes
└── main.css           # Imports all files
```

### Large Projects

```
styles/
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── variables.css
├── components/
│   ├── button.css
│   ├── card.css
│   ├── form.css
│   └── modal.css
├── layout/
│   ├── grid.css
│   ├── header.css
│   └── footer.css
├── pages/
│   ├── home.css
│   └── about.css
├── utilities/
│   ├── spacing.css
│   └── display.css
└── main.css
```

### Import Order

```css
/* main.css */
@import "base/reset.css";
@import "base/variables.css";
@import "base/typography.css";

@import "layout/grid.css";
@import "layout/header.css";

@import "components/button.css";
@import "components/card.css";

@import "utilities/spacing.css";
```

## Utility Classes

Small, single-purpose classes.

```css
/* Spacing */
.mt-1 {
  margin-top: 0.25rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.mt-3 {
  margin-top: 1rem;
}

.p-1 {
  padding: 0.25rem;
}
.p-2 {
  padding: 0.5rem;
}
.p-3 {
  padding: 1rem;
}

/* Display */
.flex {
  display: flex;
}
.grid {
  display: grid;
}
.hidden {
  display: none;
}

/* Text */
.text-center {
  text-align: center;
}
.text-bold {
  font-weight: bold;
}
.text-sm {
  font-size: 0.875rem;
}

/* Colors */
.text-primary {
  color: var(--color-primary);
}
.bg-primary {
  background: var(--color-primary);
}
```

**Usage:**

```html
<div class="card p-3 mt-2">
  <h2 class="text-lg text-bold text-primary">Title</h2>
  <p class="text-sm">Description</p>
</div>
```

## Avoiding Specificity Wars

### Specificity Hierarchy

```
Inline styles:        1000
IDs:                  100
Classes/attributes:   10
Elements:             1
```

### Rules

1. **Avoid IDs for styling** - too specific
2. **Keep nesting shallow** - max 2-3 levels
3. **Use classes** - consistent specificity
4. **Avoid `!important`** - except for utilities

```css
/* ❌ Too specific */
#header nav ul li a {
} /* Specificity: 113 */

/* ✅ Better */
.nav__link {
} /* Specificity: 10 */

/* ❌ Nested */
.card .header .title {
} /* Specificity: 30 */

/* ✅ Flat */
.card__title {
} /* Specificity: 10 */
```

## Naming Conventions

### Be Descriptive

```css
/* ❌ Vague */
.btn-1 {
}
.box {
}

/* ✅ Descriptive */
.btn-primary {
}
.feature-card {
}
```

### Use Prefixes

```css
/* Layout */
.l-container {
}
.l-grid {
}

/* Components */
.c-button {
}
.c-card {
}

/* Utilities */
.u-mt-2 {
}
.u-text-center {
}

/* JavaScript hooks */
.js-modal-trigger {
} /* Never style these! */
```

## CSS Reset/Normalize

### Modern Reset

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}
```

## Performance Best Practices

### Minimize Selectors

```css
/* ❌ Expensive */
div > ul > li > a {
}
[class^="btn-"] {
}

/* ✅ Fast */
.nav-link {
}
```

### Avoid Universal Selector (Except for Reset)

```css
/* ❌ Slow */
* {
  border: 1px solid red;
}

/* ✅ OK for reset only */
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

### Use `will-change` Sparingly

```css
/* Tell browser element will animate */
.animated-box {
  will-change: transform;
}

/* Remove after animation */
.animated-box:hover {
  will-change: auto;
}
```

## Documentation

### Comment Components

```css
/* ==========================================================================
   Card Component
   ========================================================================== */

/**
 * Card container with optional featured modifier
 * 
 * 1. Border radius for all corners
 * 2. Shadow on featured cards only
 */

.card {
  border: 1px solid #ddd;
  border-radius: 8px; /* [1] */
}

.card--featured {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* [2] */
}
```

## Example: Full Component

```css
/* ==========================================================================
   Button Component
   ========================================================================== */

:root {
  --btn-padding: 0.75rem 1.5rem;
  --btn-border-radius: 4px;
  --btn-transition: all 0.3s ease;
}

.btn {
  display: inline-block;
  padding: var(--btn-padding);
  border: none;
  border-radius: var(--btn-border-radius);
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: var(--btn-transition);
}

.btn:hover {
  transform: translateY(-2px);
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--secondary {
  background: var(--color-secondary);
  color: white;
}

.btn--outline {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.btn--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn--lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn--block {
  display: block;
  width: 100%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Resources

- [BEM Official](http://getbem.com/)
- [CSS Guidelines](https://cssguidelin.es/)
- [Scalable CSS](https://www.smashingmagazine.com/2011/12/an-introduction-to-object-oriented-css-oocss/)

---

**Lectures complete! Move to [Lab 1: Responsive Navbar →](../lab/responsive-navbar/)**
