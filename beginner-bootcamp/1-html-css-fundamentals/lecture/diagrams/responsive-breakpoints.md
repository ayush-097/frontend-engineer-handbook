# Responsive Design Breakpoints

## Common Device Sizes

```
Mobile Portrait     Mobile Landscape    Tablet          Desktop
    320-575px          576-767px        768-1023px      1024px+
┌─────────┐         ┌──────────────┐  ┌────────────┐  ┌──────────────────┐
│         │         │              │  │            │  │                  │
│         │         │              │  │            │  │                  │
│         │         │              │  │            │  │                  │
│         │         │              │  │            │  │                  │
│         │         │              │  │            │  │                  │
│         │         │              │  │            │  │                  │
│         │         │              │  │            │  │                  │
│         │         │              │  │            │  │                  │
│         │         └──────────────┘  │            │  │                  │
│         │                           │            │  │                  │
│         │                           │            │  │                  │
│         │                           └────────────┘  │                  │
│         │                                           │                  │
│         │                                           │                  │
│         │                                           │                  │
└─────────┘                                           └──────────────────┘

  iPhone SE          iPhone 12 Pro      iPad            Desktop
   375×667            390×844 (rotate)   768×1024        1920×1080
```

## Mobile-First Breakpoints

```css
/* Mobile First Approach */

/* Default: Mobile (0-575px) */
.container {
  padding: 1rem;
  font-size: 14px;
}

/* Small devices (≥576px) */
@media (min-width: 576px) {
  .container {
    padding: 1.5rem;
    font-size: 15px;
  }
}

/* Medium devices (≥768px) */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    font-size: 16px;
  }
}

/* Large devices (≥1024px) */
@media (min-width: 1024px) {
  .container {
    padding: 2.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

## Responsive Layout Examples

```
Mobile (< 576px): 1 Column
┌──────────────┐
│   Item 1     │
├──────────────┤
│   Item 2     │
├──────────────┤
│   Item 3     │
└──────────────┘

Tablet (≥ 768px): 2 Columns
┌──────────┬──────────┐
│  Item 1  │  Item 2  │
├──────────┼──────────┤
│  Item 3  │  Item 4  │
└──────────┴──────────┘

Desktop (≥ 1024px): 3 Columns
┌──────┬──────┬──────┐
│Item 1│Item 2│Item 3│
├──────┼──────┼──────┤
│Item 4│Item 5│Item 6│
└──────┴──────┴──────┘

Large Desktop (≥ 1440px): 4 Columns
┌─────┬─────┬─────┬─────┐
│ I 1 │ I 2 │ I 3 │ I 4 │
├─────┼─────┼─────┼─────┤
│ I 5 │ I 6 │ I 7 │ I 8 │
└─────┴─────┴─────┴─────┘
```
