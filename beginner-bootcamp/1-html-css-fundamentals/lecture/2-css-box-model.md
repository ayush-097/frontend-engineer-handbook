# CSS Box Model

## What is the Box Model?

Every HTML element is a **rectangular box** with four layers:

```
┌─────────────────────────────────────┐
│          MARGIN (transparent)       │
│  ┌───────────────────────────────┐  │
│  │     BORDER                    │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   PADDING               │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │    CONTENT        │  │  │  │
│  │  │  │  (width × height) │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## The Four Layers

### 1. Content

The actual content (text, images, etc.).

```css
.box {
  width: 200px;
  height: 100px;
}
```

---

### 2. Padding

Space **inside** the element, between content and border.

```css
.box {
  padding: 20px; /* All sides */
  padding: 10px 20px; /* top/bottom left/right */
  padding: 10px 20px 30px 40px; /* top right bottom left */

  /* Individual sides */
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 10px;
  padding-left: 20px;
}
```

**Key point:** Padding **increases** the element's total size (by default).

---

### 3. Border

The edge of the element.

```css
.box {
  border: 2px solid #333;

  /* Or individually */
  border-width: 2px;
  border-style: solid; /* solid, dashed, dotted, double, none */
  border-color: #333;

  /* Individual sides */
  border-top: 1px solid red;
  border-right: 2px dashed blue;
  border-bottom: 3px dotted green;
  border-left: 4px double purple;

  /* Rounded corners */
  border-radius: 8px;
}
```

---

### 4. Margin

Space **outside** the element, between this element and others.

```css
.box {
  margin: 20px; /* All sides */
  margin: 10px 20px; /* top/bottom left/right */
  margin: 10px 20px 30px 40px; /* top right bottom left */

  /* Individual sides */
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;

  /* Centering horizontally */
  margin: 0 auto;
}
```

**Key point:** Margins are **transparent** and can collapse.

## Box-Sizing Property

### Default: `content-box`

Width/height applies to **content only**.

```css
.box {
  width: 200px;
  padding: 20px;
  border: 2px solid black;
}
/* Total width = 200 + 20 + 20 + 2 + 2 = 244px */
```

### Better: `border-box`

Width/height includes **padding and border**.

```css
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 2px solid black;
}
/* Total width = 200px (padding/border included) */
```

### Global Reset (Recommended)

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

**Why?** Makes sizing predictable. `width: 50%` means exactly 50%.

## Margin Collapse

**Vertical margins collapse** (horizontal margins don't).

### Example 1: Adjacent Siblings

```html
<div class="box1"></div>
<div class="box2"></div>
```

```css
.box1 {
  margin-bottom: 30px;
}
.box2 {
  margin-top: 20px;
}
/* Gap between boxes = 30px (not 50px!) */
/* Larger margin wins */
```

### Example 2: Parent and First/Last Child

```html
<div class="parent">
  <div class="child"></div>
</div>
```

```css
.parent {
  margin-top: 20px;
}
.child {
  margin-top: 30px;
}
/* Parent's effective margin-top = 30px */
/* Child's margin "escapes" parent */
```

### Preventing Collapse

```css
/* Add padding or border to parent */
.parent {
  padding-top: 1px; /* or border-top: 1px solid transparent; */
}

/* Or use flexbox/grid */
.parent {
  display: flex;
  flex-direction: column;
}
```

## Display Property

Controls how an element behaves in the layout.

### Block

Takes full width available, starts on new line.

```css
div,
p,
h1,
section {
  display: block; /* Default for these elements */
}
```

**Characteristics:**

- Width: 100% of parent (by default)
- Height: Based on content
- Can set width/height
- Respects all margins

---

### Inline

Takes only as much width as needed, doesn't break line.

```css
span,
a,
strong,
em {
  display: inline; /* Default for these elements */
}
```

**Characteristics:**

- Width: Based on content
- Height: Based on content
- **Cannot** set width/height
- Vertical margins/padding don't push other elements away

---

### Inline-Block

Hybrid: flows like inline, but can have width/height.

```css
.button {
  display: inline-block;
  width: 150px;
  height: 40px;
  padding: 10px 20px;
}
```

**Use cases:**

- Navigation items
- Buttons side-by-side
- Icons with spacing

---

### None

Element is removed from document flow.

```css
.hidden {
  display: none; /* Element doesn't take up space */
}
```

**Contrast with:**

```css
.invisible {
  visibility: hidden; /* Element is invisible but takes up space */
}
```

## Width and Height

### Fixed

```css
.box {
  width: 300px;
  height: 200px;
}
```

### Percentage

```css
.box {
  width: 50%; /* 50% of parent's width */
  height: 50%; /* Only works if parent has explicit height */
}
```

### Min/Max

```css
.box {
  min-width: 200px; /* Won't shrink below this */
  max-width: 800px; /* Won't grow beyond this */
  min-height: 100px;
  max-height: 500px;
}
```

### Auto

```css
.box {
  width: auto; /* Default: as wide as needed */
  height: auto; /* Default: as tall as needed */
}
```

### Viewport Units

```css
.hero {
  width: 100vw; /* 100% of viewport width */
  height: 100vh; /* 100% of viewport height */
}
```

## Overflow

What happens when content is too big?

```css
.box {
  width: 200px;
  height: 100px;
  overflow: visible; /* Default: content spills out */
  overflow: hidden; /* Clip content */
  overflow: scroll; /* Always show scrollbars */
  overflow: auto; /* Scrollbars only if needed */
}

/* Separate axes */
.box {
  overflow-x: hidden; /* Horizontal */
  overflow-y: auto; /* Vertical */
}
```

## Debugging the Box Model

### Chrome DevTools

1. Right-click element → Inspect
2. Look at "Styles" panel
3. See box model diagram at bottom
4. Hover over diagram parts to highlight on page

### Outline vs Border

```css
/* Debugging: outline doesn't affect layout */
* {
  outline: 1px solid red;
}

/* Border affects layout (increases size) */
* {
  border: 1px solid red;
}
```

### Box Model Visualization

```css
/* Add backgrounds to see spacing */
.parent {
  background: lightblue;
}
.child {
  background: lightcoral;
}
```

## Common Patterns

### Centered Box

```css
.box {
  width: 80%;
  max-width: 1200px;
  margin: 0 auto; /* Horizontal centering */
}
```

### Card with Spacing

```css
.card {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
```

### Full-Width Section with Contained Content

```css
.section {
  width: 100%;
  background: #f5f5f5;
}

.section-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
```

## Practice Exercise

Create three boxes with these requirements:

1. **Box 1**: 200px wide, 20px padding, 2px border, 10px margin
2. **Box 2**: Same visual size as Box 1, but using `border-box`
3. **Box 3**: Centered horizontally, max-width 600px

```html
<div class="box box1">Box 1</div>
<div class="box box2">Box 2</div>
<div class="box box3">Box 3</div>
```

## Common Mistakes

### ❌ Forgetting box-sizing

```css
.box {
  width: 50%;
  padding: 20px; /* Now wider than 50%! */
}
```

### ✅ Use border-box

```css
.box {
  box-sizing: border-box;
  width: 50%;
  padding: 20px; /* Still exactly 50% */
}
```

---

### ❌ Not accounting for margin collapse

```css
.box {
  margin: 30px 0;
}
/* Vertical gap between boxes might not be 60px */
```

### ✅ Understand collapse or prevent it

```css
/* Prevent with flexbox */
.container {
  display: flex;
  flex-direction: column;
  gap: 30px; /* Guaranteed spacing */
}
```

## Resources

- [MDN Box Model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model)
- [CSS Tricks Box Sizing](https://css-tricks.com/box-sizing/)

---

**Next:** [Lecture 3: Flexbox & Grid →](3-flexbox-grid.md)
