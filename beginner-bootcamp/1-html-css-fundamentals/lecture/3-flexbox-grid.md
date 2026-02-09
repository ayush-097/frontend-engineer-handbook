# Flexbox & Grid

## When to Use Each

| Layout Need                        | Use                             |
| ---------------------------------- | ------------------------------- |
| One-dimensional (row OR column)    | **Flexbox**                     |
| Two-dimensional (rows AND columns) | **Grid**                        |
| Content-driven sizing              | **Flexbox**                     |
| Layout-driven sizing               | **Grid**                        |
| Navigation bar                     | **Flexbox**                     |
| Page layout                        | **Grid**                        |
| Card grid                          | **Grid**                        |
| Centering items                    | Either (but Flexbox is simpler) |

## Flexbox Fundamentals

### Basic Setup

```css
.container {
  display: flex;
}
```

All direct children become **flex items**.

### Main Axis vs Cross Axis

```
flex-direction: row (default)
Main Axis →
┌──────────────────────────┐
│ [1] [2] [3]             │ ↕ Cross Axis
└──────────────────────────┘

flex-direction: column
┌────────┐
│  [1]   │ ↕ Main Axis
│  [2]   │
│  [3]   │
└────────┘
    ↔ Cross Axis
```

### Container Properties

#### flex-direction

```css
.container {
  flex-direction: row; /* → (default) */
  flex-direction: row-reverse; /* ← */
  flex-direction: column; /* ↓ */
  flex-direction: column-reverse; /* ↑ */
}
```

#### justify-content (Main Axis)

```css
.container {
  justify-content: flex-start; /* ← Items at start (default) */
  justify-content: flex-end; /* → Items at end */
  justify-content: center; /* — Items centered */
  justify-content: space-between; /* [1]   [2]   [3] */
  justify-content: space-around; /*  [1]  [2]  [3]  */
  justify-content: space-evenly; /*  [1]   [2]   [3]  */
}
```

#### align-items (Cross Axis)

```css
.container {
  align-items: stretch; /* Items fill container (default) */
  align-items: flex-start; /* Items at start */
  align-items: flex-end; /* Items at end */
  align-items: center; /* Items centered */
  align-items: baseline; /* Items aligned by text baseline */
}
```

#### flex-wrap

```css
.container {
  flex-wrap: nowrap; /* All items in one line (default) */
  flex-wrap: wrap; /* Items wrap to new lines */
  flex-wrap: wrap-reverse; /* Items wrap, but reverse order */
}
```

#### gap

```css
.container {
  gap: 20px; /* Gap between items */
  gap: 20px 10px; /* row-gap column-gap */
  row-gap: 20px;
  column-gap: 10px;
}
```

### Item Properties

#### flex-grow

How much an item should grow relative to others.

```css
.item {
  flex-grow: 0; /* Default: don't grow */
  flex-grow: 1; /* Grow to fill available space */
  flex-grow: 2; /* Grow twice as much as items with flex-grow: 1 */
}
```

**Example:**

```css
.item1 {
  flex-grow: 1;
} /* Takes 1/4 of space */
.item2 {
  flex-grow: 3;
} /* Takes 3/4 of space */
```

#### flex-shrink

How much an item should shrink when there isn't enough space.

```css
.item {
  flex-shrink: 1; /* Default: can shrink */
  flex-shrink: 0; /* Don't shrink */
  flex-shrink: 2; /* Shrink twice as much as others */
}
```

#### flex-basis

Initial size before growing/shrinking.

```css
.item {
  flex-basis: auto; /* Based on content (default) */
  flex-basis: 200px; /* Start at 200px */
  flex-basis: 0; /* Ignore content size */
}
```

#### flex (Shorthand)

```css
.item {
  flex: 1; /* flex-grow: 1, flex-shrink: 1, flex-basis: 0% */
  flex: 0 0 200px; /* Don't grow/shrink, 200px wide */
  flex: 1 1 auto; /* flex-grow: 1, flex-shrink: 1, flex-basis: auto */
}
```

#### align-self

Override container's `align-items` for one item.

```css
.item {
  align-self: auto; /* Use container's align-items (default) */
  align-self: flex-start;
  align-self: flex-end;
  align-self: center;
  align-self: stretch;
}
```

### Common Flexbox Patterns

#### Centering

```css
.container {
  display: flex;
  justify-content: center; /* Horizontal */
  align-items: center; /* Vertical */
}
```

#### Navigation Bar

```html
<nav>
  <div class="logo">Logo</div>
  <div class="nav-links">
    <a href="#">Home</a>
    <a href="#">About</a>
  </div>
</nav>
```

```css
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}
```

#### Equal Height Cards

```css
.card-container {
  display: flex;
  gap: 20px;
}

.card {
  flex: 1; /* All cards equal width */
  display: flex;
  flex-direction: column;
}

.card-content {
  flex: 1; /* Content expands to fill space */
}

.card-footer {
  /* Footer stays at bottom */
}
```

#### Holy Grail Layout

```html
<div class="container">
  <header>Header</header>
  <div class="content">
    <aside class="sidebar">Sidebar</aside>
    <main>Main</main>
    <aside class="sidebar">Sidebar</aside>
  </div>
  <footer>Footer</footer>
</div>
```

```css
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  display: flex;
  flex: 1;
}

.sidebar {
  flex: 0 0 200px; /* Fixed width */
}

main {
  flex: 1; /* Grows to fill space */
}
```

## CSS Grid Fundamentals

### Basic Setup

```css
.container {
  display: grid;
}
```

### Defining Columns and Rows

```css
.container {
  /* 3 columns of 200px each */
  grid-template-columns: 200px 200px 200px;

  /* 3 equal columns */
  grid-template-columns: 1fr 1fr 1fr;

  /* Shorthand for equal columns */
  grid-template-columns: repeat(3, 1fr);

  /* Mix fixed and flexible */
  grid-template-columns: 200px 1fr 1fr;

  /* Auto-fill: as many as fit */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

  /* Rows */
  grid-template-rows: 100px auto 100px;
}
```

### Gap

```css
.container {
  gap: 20px; /* Both row and column */
  gap: 20px 10px; /* row-gap column-gap */
  row-gap: 20px;
  column-gap: 10px;
}
```

### Placing Items

#### Manual Placement

```css
.item {
  grid-column: 1 / 3; /* Span columns 1-2 */
  grid-row: 1 / 2; /* Row 1 */

  /* Or with span */
  grid-column: span 2; /* Span 2 columns */
  grid-row: span 3; /* Span 3 rows */

  /* Shorthand */
  grid-area: 1 / 1 / 2 / 3; /* row-start / col-start / row-end / col-end */
}
```

#### Named Grid Lines

```css
.container {
  grid-template-columns: [start] 1fr [middle] 1fr [end];
}

.item {
  grid-column: start / middle;
}
```

#### Named Grid Areas

```css
.container {
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}

header {
  grid-area: header;
}
.sidebar {
  grid-area: sidebar;
}
main {
  grid-area: main;
}
footer {
  grid-area: footer;
}
```

### Alignment

#### Justify (Horizontal)

```css
.container {
  /* Align grid within container */
  justify-content: start | end | center | stretch | space-between | space-around
    | space-evenly;

  /* Align items within their grid cells */
  justify-items: start | end | center | stretch;
}

.item {
  /* Override for one item */
  justify-self: start | end | center | stretch;
}
```

#### Align (Vertical)

```css
.container {
  /* Align grid within container */
  align-content: start | end | center | stretch | space-between | space-around |
    space-evenly;

  /* Align items within their grid cells */
  align-items: start | end | center | stretch;
}

.item {
  /* Override for one item */
  align-self: start | end | center | stretch;
}
```

### Common Grid Patterns

#### Simple Card Grid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}
```

**Responsive automatically** - adds columns as space allows!

#### Dashboard Layout

```css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 60px;
  gap: 20px;
  min-height: 100vh;
}

.sidebar {
  grid-row: 1 / -1;
} /* Spans all rows */
.header {
  grid-column: 2;
}
.main {
  grid-column: 2;
}
.footer {
  grid-column: 2;
}
```

#### Asymmetric Layout

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px;
  gap: 10px;
}

.item:nth-child(1) {
  grid-column: span 2;
  grid-row: span 2;
}

.item:nth-child(5) {
  grid-column: span 2;
}
```

## Flexbox vs Grid Examples

### Navigation Bar (Flexbox wins)

```css
/* Flexbox - simple and intuitive */
nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

/* Grid - overkill */
nav {
  display: grid;
  grid-template-columns: auto 1fr;
}
```

### Card Grid (Grid wins)

```css
/* Grid - responsive without media queries */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

/* Flexbox - needs manual wrapping logic */
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  flex: 1 1 calc(33.333% - 20px); /* Complex calculation */
}
```

### Page Layout (Grid wins)

```css
/* Grid - clean and declarative */
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

/* Flexbox - nested and complex */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  display: flex;
  flex: 1;
}

.sidebar {
  flex: 0 0 250px;
}
```

## Practice Exercises

### Exercise 1: Flexbox Navigation

Create a responsive nav with logo left, links right.

```html
<nav>
  <div class="logo">MyApp</div>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>
```

### Exercise 2: Grid Gallery

Create a responsive image gallery (3 columns desktop, 2 tablet, 1 mobile).

```html
<div class="gallery">
  <img src="1.jpg" alt="Image 1" />
  <img src="2.jpg" alt="Image 2" />
  <!-- ... -->
</div>
```

### Exercise 3: Holy Grail Layout

Header, footer, sidebar, main content using Grid.

## Resources

- [CSS Tricks Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS Tricks Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Froggy](https://flexboxfroggy.com/) - Game to learn Flexbox
- [Grid Garden](https://cssgridgarden.com/) - Game to learn Grid

---

**Next:** [Lecture 4: Responsive Design →](4-responsive-design.md)
