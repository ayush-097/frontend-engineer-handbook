# Semantic HTML

## What is Semantic HTML?

**Semantic HTML** uses elements that describe their meaning, not just their appearance.

### ❌ Non-Semantic

```html
<div class="header">
  <div class="nav">
    <div class="nav-item">Home</div>
  </div>
</div>
```

### ✅ Semantic

```html
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>
```

## Why Semantics Matter

### 1. Accessibility

Screen readers use semantic elements to navigate:

- `<nav>` identifies navigation
- `<main>` identifies primary content
- `<article>` identifies standalone content

### 2. SEO

Search engines understand your content better:

- `<h1>` signals most important heading
- `<article>` indicates self-contained content
- `<time>` provides structured date data

### 3. Maintainability

Code is self-documenting:

```html
<!-- Which is clearer? -->
<div class="post">...</div>
<article>...</article>
```

## Document Structure Elements

### `<header>`

Introductory content or navigation.

```html
<header>
  <img src="logo.svg" alt="Company Logo" />
  <nav>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </nav>
</header>
```

**Note:** You can have multiple `<header>` elements (one per section).

---

### `<nav>`

Navigation links.

```html
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

**Best practice:** Use `aria-label` if multiple navs exist.

---

### `<main>`

Primary content (only one per page).

```html
<main>
  <h1>Welcome to Our Site</h1>
  <p>This is the main content...</p>
</main>
```

**Note:** Everything except header, footer, and aside should be in `<main>`.

---

### `<article>`

Self-contained, reusable content.

```html
<article>
  <h2>Blog Post Title</h2>
  <p>Published on <time datetime="2024-01-15">January 15, 2024</time></p>
  <p>Article content...</p>
</article>
```

**Test:** Could this stand alone as an RSS feed item? If yes, use `<article>`.

---

### `<section>`

Thematic grouping of content.

```html
<section>
  <h2>Our Services</h2>
  <p>We offer...</p>
</section>
```

**When to use:** When content has a natural heading.

---

### `<aside>`

Tangentially related content (sidebars, callouts).

```html
<aside>
  <h3>Related Articles</h3>
  <ul>
    <li><a href="/article1">Article 1</a></li>
  </ul>
</aside>
```

---

### `<footer>`

Footer content (can be for page or section).

```html
<footer>
  <p>&copy; 2024 Company Name</p>
  <nav aria-label="Footer navigation">
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
  </nav>
</footer>
```

## Heading Hierarchy

**Critical for accessibility and SEO.**

### ✅ Correct

```html
<h1>Page Title</h1>
<h2>Section 1</h2>
<h3>Subsection 1.1</h3>
<h2>Section 2</h2>
<h3>Subsection 2.1</h3>
```

### ❌ Wrong

```html
<h1>Page Title</h1>
<h3>Section</h3>
<!-- Skipped h2! -->
<h5>Subsection</h5>
<!-- Skipped h4! -->
```

**Rules:**

- Only one `<h1>` per page
- Don't skip levels
- Don't use headings for styling (use CSS)

## Lists

### Unordered Lists

```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

### Ordered Lists

```html
<ol>
  <li>First step</li>
  <li>Second step</li>
  <li>Third step</li>
</ol>
```

### Description Lists

```html
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language</dd>

  <dt>CSS</dt>
  <dd>Cascading Style Sheets</dd>
</dl>
```

**Use when:** Defining terms, key-value pairs, metadata.

## Forms

### Basic Structure

```html
<form action="/submit" method="POST">
  <label for="email">Email:</label>
  <input
    type="email"
    id="email"
    name="email"
    required
    aria-describedby="email-help"
  />
  <p id="email-help">We'll never share your email.</p>

  <button type="submit">Subscribe</button>
</form>
```

### Input Types (HTML5)

```html
<input type="text" />
<!-- Plain text -->
<input type="email" />
<!-- Email validation -->
<input type="password" />
<!-- Hidden input -->
<input type="number" />
<!-- Numeric input -->
<input type="date" />
<!-- Date picker -->
<input type="tel" />
<!-- Phone number -->
<input type="url" />
<!-- URL validation -->
<input type="search" />
<!-- Search input -->
<input type="color" />
<!-- Color picker -->
<input type="range" />
<!-- Slider -->
```

### Validation Attributes

```html
<input type="text" required <!-- Must be filled -- /> minlength="3"
<!-- Min 3 characters -->
maxlength="20"
<!-- Max 20 characters -->
pattern="[A-Za-z]+"
<!-- Regex validation -->
placeholder="Enter name"
<!-- Hint text -->
>
```

### Textarea

```html
<label for="message">Message:</label>
<textarea id="message" name="message" rows="5" cols="40" required></textarea>
```

### Select Dropdown

```html
<label for="country">Country:</label>
<select id="country" name="country">
  <option value="">Choose...</option>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="ca">Canada</option>
</select>
```

### Radio Buttons

```html
<fieldset>
  <legend>Choose size:</legend>

  <input type="radio" id="small" name="size" value="small" />
  <label for="small">Small</label>

  <input type="radio" id="medium" name="size" value="medium" />
  <label for="medium">Medium</label>

  <input type="radio" id="large" name="size" value="large" />
  <label for="large">Large</label>
</fieldset>
```

### Checkboxes

```html
<fieldset>
  <legend>Select toppings:</legend>

  <input type="checkbox" id="pepperoni" name="toppings" value="pepperoni" />
  <label for="pepperoni">Pepperoni</label>

  <input type="checkbox" id="mushrooms" name="toppings" value="mushrooms" />
  <label for="mushrooms">Mushrooms</label>
</fieldset>
```

## Other Important Elements

### `<figure>` and `<figcaption>`

```html
<figure>
  <img src="chart.png" alt="Sales data chart" />
  <figcaption>Q4 2024 Sales Performance</figcaption>
</figure>
```

### `<time>`

```html
<time datetime="2024-01-15T19:00"> January 15, 2024 at 7:00 PM </time>
```

### `<mark>`

```html
<p>Search results for <mark>frontend</mark> engineering.</p>
```

### `<abbr>`

```html
<abbr title="HyperText Markup Language">HTML</abbr>
```

### `<code>` and `<pre>`

```html
<p>Use the <code>console.log()</code> function.</p>

<pre><code>
function greet() {
  console.log("Hello!");
}
</code></pre>
```

## Common Mistakes

### ❌ Using `<div>` for everything

```html
<div class="navigation">
  <div class="nav-item">Home</div>
</div>
```

### ✅ Use semantic elements

```html
<nav>
  <a href="/">Home</a>
</nav>
```

---

### ❌ Multiple `<h1>` tags

```html
<h1>Site Title</h1>
<h1>Page Title</h1>
<!-- Wrong! -->
```

### ✅ One `<h1>`, then `<h2>`, etc.

```html
<h1>Page Title</h1>
<h2>Section Title</h2>
```

---

### ❌ Empty links

```html
<a href="#"></a>
<!-- No accessible text! -->
```

### ✅ Meaningful link text

```html
<a href="/products">View our products</a>
```

---

### ❌ Images without alt text

```html
<img src="logo.png" />
<!-- Screen readers can't describe this -->
```

### ✅ Descriptive alt text

```html
<img src="logo.png" alt="Company Logo" />
```

## Accessibility Tips

### 1. Use ARIA labels when needed

```html
<button aria-label="Close dialog">×</button>
```

### 2. Ensure keyboard navigation

All interactive elements must be reachable via Tab key.

### 3. Provide skip links

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

### 4. Use proper form labels

```html
<!-- ✅ Good -->
<label for="username">Username:</label>
<input id="username" name="username" />

<!-- ❌ Bad -->
<input placeholder="Username" />
<!-- Placeholder isn't a label! -->
```

## Practice Exercise

Create a blog post page with:

- Proper document structure
- Semantic elements
- Accessible form for comments
- Proper heading hierarchy

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Blog Post Title - My Blog</title>
  </head>
  <body>
    <!-- Your code here -->
  </body>
</html>
```

## Resources

- [MDN HTML Elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)
- [HTML5 Doctor](http://html5doctor.com/)
- [WebAIM Semantic Structure](https://webaim.org/techniques/semanticstructure/)

---

**Next:** [Lecture 2: CSS Box Model →](2-css-box-model.md)
