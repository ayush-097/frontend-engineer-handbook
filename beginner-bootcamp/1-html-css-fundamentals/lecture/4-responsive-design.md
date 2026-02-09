# Responsive Design

## Mobile-First Approach

Start with mobile styles, enhance for larger screens.

### ❌ Desktop-First (Old Way)

```css
/* Desktop styles */
.container {
  width: 1200px;
}

@media (max-width: 768px) {
  /* Override for mobile - harder to maintain */
  .container {
    width: 100%;
  }
}
```

### ✅ Mobile-First (Modern Way)

```css
/* Mobile styles (default) */
.container {
  width: 100%;
}

@media (min-width: 768px) {
  /* Enhance for desktop */
  .container {
    width: 1200px;
  }
}
```

**Why mobile-first?**

- Mobile is most constrained (design for constraints first)
- Progressive enhancement > graceful degradation
- Smaller CSS files for mobile users

## Media Queries

### Breakpoints

```css
/* Mobile: default */
.container {
  padding: 10px;
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .container {
    padding: 20px;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .container {
    padding: 40px;
  }
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
  .container {
    padding: 60px;
  }
}
```

### Common Breakpoints

```css
/* Extra small devices (phones, <576px) */
/* No media query - mobile first! */

/* Small devices (phones, ≥576px) */
@media (min-width: 576px) {
}

/* Medium devices (tablets, ≥768px) */
@media (min-width: 768px) {
}

/* Large devices (desktops, ≥1024px) */
@media (min-width: 1024px) {
}

/* Extra large devices (large desktops, ≥1440px) */
@media (min-width: 1440px) {
}
```

### Media Query Features

```css
/* Width */
@media (min-width: 768px) {
}
@media (max-width: 767px) {
}
@media (min-width: 768px) and (max-width: 1023px) {
}

/* Height */
@media (min-height: 600px) {
}

/* Orientation */
@media (orientation: portrait) {
}
@media (orientation: landscape) {
}

/* Hover capability */
@media (hover: hover) {
  .button:hover {
    background: blue;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  body {
    background: black;
    color: white;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
  }
}
```

## Viewport Units

```css
/* vw: 1% of viewport width */
.hero {
  width: 100vw;
}

/* vh: 1% of viewport height */
.hero {
  height: 100vh;
}

/* vmin: 1% of smaller dimension */
.square {
  width: 50vmin;
  height: 50vmin;
}

/* vmax: 1% of larger dimension */

/* dvh (new): Dynamic viewport height */
.hero {
  height: 100dvh;
} /* Accounts for mobile browser UI */
```

## Fluid Typography

### Clamp Function

```css
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
  /* min, preferred, max */
  /* Scales smoothly between 1.5rem and 3rem */
}

p {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.25rem);
}
```

### Calc Function

```css
.container {
  width: calc(100% - 40px);
  padding: calc(1rem + 2vw);
}
```

## Container Queries (New!)

Style elements based on parent container size, not viewport.

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: 1rem;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 150px 1fr;
    padding: 2rem;
  }
}
```

**Use case:** Reusable components that adapt to their container.

## Responsive Images

### srcset Attribute

```html
<img
  src="image-small.jpg"
  srcset="image-small.jpg 400w, image-medium.jpg 800w, image-large.jpg 1200w"
  sizes="
    (max-width: 600px) 100vw,
    (max-width: 1000px) 50vw,
    33vw
  "
  alt="Description"
/>
```

### Picture Element

```html
<picture>
  <source media="(min-width: 1024px)" srcset="large.webp" type="image/webp" />
  <source media="(min-width: 768px)" srcset="medium.webp" type="image/webp" />
  <source media="(min-width: 1024px)" srcset="large.jpg" />
  <source media="(min-width: 768px)" srcset="medium.jpg" />
  <img src="small.jpg" alt="Description" />
</picture>
```

## Common Patterns

### Responsive Grid

```css
.grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: 1 column */
  gap: 1rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columns */
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop: 3 columns */
  }
}
```

### Responsive Navigation

```css
/* Mobile: stack vertically */
.nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Desktop: horizontal */
@media (min-width: 768px) {
  .nav {
    flex-direction: row;
    justify-content: space-between;
  }
}
```

### Responsive Typography

```css
/* Base font size scales with viewport */
html {
  font-size: 14px;
}

@media (min-width: 768px) {
  html {
    font-size: 16px;
  }
}

@media (min-width: 1024px) {
  html {
    font-size: 18px;
  }
}

/* Use rem for everything else */
h1 {
  font-size: 2rem;
} /* Scales with base */
p {
  font-size: 1rem;
}
```

## Testing Responsive Design

### Chrome DevTools

1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Select device or enter custom dimensions
3. Throttle network to test slow connections

### Responsive Design Mode (Firefox)

- Ctrl+Shift+M
- Better device pixel ratio simulation

### Real Devices

**Always test on real devices** - emulation isn't perfect.

## Accessibility Considerations

### Touch Targets

```css
/* Minimum 44×44px for touch */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 24px;
}
```

### Prevent Zoom Disable

```html
<!-- ❌ Don't do this -->
<meta name="viewport" content="width=device-width, user-scalable=no" />

<!-- ✅ Allow zoom -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### Focus Visible

```css
/* Keyboard users need visible focus */
:focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}
```

## Performance Tips

### Reduce Layout Shifts

```css
/* Reserve space for images */
img {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}
```

### Use Modern Units

```css
/* Better performance than % in some cases */
.container {
  width: 100dvw; /* Dynamic viewport width */
  padding: 1rem;
}
```

## Resources

- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev Responsive Images](https://web.dev/responsive-images/)

---

**Next:** [Lecture 5: CSS Architecture →](5-css-architecture.md)
