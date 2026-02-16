# The DOM API

## What is the DOM?

The **Document Object Model (DOM)** is a programming interface for web documents. When a browser loads HTML, it parses it into a tree of objects in memory — the DOM tree. JavaScript can read and modify this tree, and the browser re-renders accordingly.

```html
<!-- HTML source -->
<html>
  <body>
    <h1 id="title">Hello</h1>
    <ul class="list">
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </body>
</html>
```

```
DOM Tree:
Document
└── html (HTMLHtmlElement)
    └── body (HTMLBodyElement)
        ├── h1#title (HTMLHeadingElement)
        │   └── "Hello" (Text)
        └── ul.list (HTMLUListElement)
            ├── li (HTMLLIElement)
            │   └── "Item 1" (Text)
            └── li (HTMLLIElement)
                └── "Item 2" (Text)
```

Everything is a **Node**. Node types include:
- `Element` (nodeType 1) — `<div>`, `<p>`, etc.
- `Text` (nodeType 3) — text content inside elements
- `Comment` (nodeType 8) — `<!-- comment -->`
- `Document` (nodeType 9) — the root `document` object

## Selecting Elements

### Modern selectors — use these

```javascript
// querySelector — first matching element (CSS selector syntax)
const title  = document.querySelector('#title');
const button = document.querySelector('.btn.btn--primary');
const input  = document.querySelector('form input[type="email"]');

// querySelectorAll — NodeList of all matches
const items    = document.querySelectorAll('.list li');
const headings = document.querySelectorAll('h1, h2, h3');

// Convert NodeList to Array to use array methods
const itemsArray = Array.from(items);
// or:
const itemsArray2 = [...items];

itemsArray.forEach(item => console.log(item.textContent));
itemsArray.filter(item => item.classList.contains('active'));
```

### Scoped queries — search inside an element

```javascript
const nav = document.querySelector('.navbar');

// ✅ Searches ONLY inside nav — much faster!
const links = nav.querySelectorAll('a');
const activeLink = nav.querySelector('.active');
```

### Legacy selectors (still valid, faster for IDs)

```javascript
// These return live HTMLCollections — update automatically when DOM changes
document.getElementById('app');           // Fastest for IDs
document.getElementsByClassName('item');  // Live collection
document.getElementsByTagName('li');      // Live collection
```

### Live vs Static collections

```javascript
const list = document.querySelector('ul');

// Static NodeList — snapshot at time of query
const staticItems = list.querySelectorAll('li'); // static

// Live HTMLCollection — updates with DOM changes
const liveItems = list.getElementsByTagName('li'); // live

list.appendChild(document.createElement('li'));

console.log(staticItems.length); // Still old count
console.log(liveItems.length);   // Updated count ← reflects change
```

## Reading & Writing Content

```javascript
const el = document.querySelector('.message');

// Text content (safe — no HTML injection risk)
el.textContent;        // Read text (strips HTML tags)
el.textContent = 'New message'; // Write text safely

// Inner HTML (careful with user input — XSS risk!)
el.innerHTML;           // Read HTML string
el.innerHTML = '<strong>Bold</strong>'; // Write HTML

// ✅ Safe alternative to innerHTML for user content
el.textContent = userInput; // Always escape user data this way!

// outerHTML — includes the element itself
el.outerHTML; // "<div class="message">New message</div>"

// innerText — respects CSS visibility (slower than textContent)
el.innerText;  // Only returns visible text
```

## Reading & Writing Attributes

```javascript
const img = document.querySelector('img');

// getAttribute / setAttribute — work for all attributes
img.getAttribute('src');           // "photo.jpg"
img.setAttribute('src', 'new.jpg');
img.setAttribute('alt', 'A photo');
img.hasAttribute('alt');           // true
img.removeAttribute('alt');

// Direct property access (faster, but limited to standard attributes)
img.src;           // Absolute URL (resolved)
img.alt;
img.id;
img.className;

// data-* attributes — use dataset
const card = document.querySelector('[data-id]');
card.dataset.id;            // "42"
card.dataset.userId;        // "123" (data-user-id → camelCase)
card.dataset.theme = 'dark'; // Sets data-theme="dark"
```

## Traversing the DOM

```javascript
const item = document.querySelector('.list li:nth-child(2)');

// Parent
item.parentElement;           // <ul class="list">
item.parentNode;              // Same (parentNode can be non-element)

// Children
item.parentElement.children;     // HTMLCollection of <li>s (elements only)
item.parentElement.childNodes;   // NodeList including text nodes
item.parentElement.firstElementChild;  // First <li>
item.parentElement.lastElementChild;   // Last <li>

// Siblings
item.previousElementSibling; // <li> before
item.nextElementSibling;      // <li> after

// closest() — walk UP tree to find ancestor matching selector
const link = document.querySelector('a.nav-link');
const nav   = link.closest('nav');       // Nearest ancestor <nav>
const body  = link.closest('body');      // <body>
link.closest('.modal');                  // null if no match

// matches() — test if element matches a selector
link.matches('.nav-link.active');        // true/false
link.matches('[href^="https"]');         // true if starts with https
```

## Creating & Inserting Elements

### Creating elements

```javascript
// createElement — the fundamental building block
const div = document.createElement('div');
div.className = 'card';
div.dataset.id = '42';
div.textContent = 'Hello!';

// createTextNode — explicit text node
const text = document.createTextNode('Plain text');

// cloneNode — duplicate existing element
const original = document.querySelector('.template');
const clone = original.cloneNode(true);  // true = deep clone (with children)
clone.classList.remove('template');
```

### Modern insertion methods (preferred)

```javascript
const parent = document.querySelector('.container');
const newEl  = document.createElement('p');
newEl.textContent = 'New paragraph';

// append() — insert at end, accepts strings and nodes
parent.append(newEl);
parent.append('Text directly', newEl, anotherEl); // Multiple at once!

// prepend() — insert at beginning
parent.prepend(newEl);

// before() / after() — insert relative to element
const reference = document.querySelector('.middle');
reference.before(newEl);  // Insert before .middle
reference.after(newEl);   // Insert after .middle

// replaceWith() — swap element with another
reference.replaceWith(newEl);

// insertAdjacentHTML — parse and insert HTML string (performant)
parent.insertAdjacentHTML('beforebegin', '<p>Before parent</p>');
parent.insertAdjacentHTML('afterbegin',  '<p>First child</p>');
parent.insertAdjacentHTML('beforeend',   '<p>Last child</p>');
parent.insertAdjacentHTML('afterend',    '<p>After parent</p>');
```

### Positions visualized

```
<!-- beforebegin -->
<div class="parent">
  <!-- afterbegin -->
  existing content
  <!-- beforeend -->
</div>
<!-- afterend -->
```

### Legacy insertion (avoid when possible)

```javascript
// appendChild — adds to end of parent (only one element at a time)
parent.appendChild(newEl);

// insertBefore — insert before a reference node
parent.insertBefore(newEl, referenceEl);

// replaceChild — replace a child
parent.replaceChild(newEl, oldEl);
```

## Removing Elements

```javascript
// Modern — remove() on the element itself
const el = document.querySelector('.to-remove');
el.remove(); // ← Clean, simple

// Legacy — remove via parent
el.parentNode.removeChild(el);

// Remove all children efficiently
const container = document.querySelector('.list');
container.innerHTML = ''; // Fast but triggers full parse

// Faster for large lists:
while (container.firstChild) {
  container.removeChild(container.firstChild);
}
// Or most modern:
container.replaceChildren(); // Removes all children
```

## Class Manipulation

```javascript
const el = document.querySelector('.button');

// classList API — the right way
el.classList.add('active');
el.classList.add('loading', 'disabled'); // Multiple at once
el.classList.remove('active');
el.classList.remove('loading', 'disabled');
el.classList.toggle('open');         // Add if absent, remove if present
el.classList.toggle('open', true);   // Force add
el.classList.toggle('open', false);  // Force remove
el.classList.replace('old', 'new');  // Replace one class with another
el.classList.contains('active');     // true/false
el.classList.length;                 // Number of classes
[...el.classList];                   // Convert to array

// ❌ Old way — overwrites all classes!
el.className = 'button active'; // Replaces everything
```

## Styles

```javascript
const el = document.querySelector('.box');

// Inline styles (least preferred — hard to override)
el.style.backgroundColor = '#3498db'; // camelCase
el.style.marginTop = '20px';
el.style.cssText = 'color: red; font-size: 16px;'; // Set multiple at once

// Read COMPUTED style (actual applied value including stylesheets)
const styles = window.getComputedStyle(el);
styles.backgroundColor; // "rgb(52, 152, 219)"
styles.marginTop;       // "20px"
styles.display;         // "block"

// ✅ Preferred: use CSS classes, not inline styles
el.classList.add('highlighted');
// .highlighted { background-color: #3498db; }

// CSS Custom Properties (CSS Variables)
el.style.setProperty('--color', '#ff0000');
el.style.getPropertyValue('--color'); // '#ff0000'
getComputedStyle(el).getPropertyValue('--color');
```

## Measurements & Geometry

```javascript
const el = document.querySelector('.box');

// getBoundingClientRect — position relative to viewport
const rect = el.getBoundingClientRect();
rect.top;     // Distance from top of viewport
rect.left;    // Distance from left of viewport
rect.width;   // Element width (including padding and border)
rect.height;  // Element height
rect.right;   // rect.left + rect.width
rect.bottom;  // rect.top + rect.height

// Offset dimensions — relative to offset parent
el.offsetWidth;   // Width including padding + border
el.offsetHeight;  // Height including padding + border
el.offsetTop;     // Distance from offset parent's top
el.offsetLeft;    // Distance from offset parent's left

// Client dimensions — visible area (excludes border)
el.clientWidth;   // Width including padding, excludes border + scrollbar
el.clientHeight;  // Height including padding, excludes border

// Scroll dimensions
el.scrollWidth;   // Total scrollable width
el.scrollHeight;  // Total scrollable height
el.scrollTop;     // Pixels scrolled from top
el.scrollLeft;    // Pixels scrolled from left

// Check if element is in viewport
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}
```

## DocumentFragment — Batch DOM Updates

Inserting many elements one at a time is slow — each causes a reflow. Use `DocumentFragment` to batch them.

```javascript
// ❌ Slow — triggers reflow for each item
const list = document.querySelector('ul');
items.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item.name;
  list.appendChild(li); // Reflow on every append!
});

// ✅ Fast — one reflow at the end
const fragment = document.createDocumentFragment();

items.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item.name;
  fragment.appendChild(li); // Fragment lives off-DOM — no reflow
});

list.appendChild(fragment); // ONE reflow
```

## Template Literals for DOM Building

```javascript
// Build complex HTML from data
function createCard(user) {
  const article = document.createElement('article');
  article.className = 'card';
  article.innerHTML = `
    <img 
      class="card__avatar" 
      src="${escapeHtml(user.avatar)}" 
      alt="${escapeHtml(user.name)}"
    >
    <div class="card__body">
      <h2 class="card__name">${escapeHtml(user.name)}</h2>
      <p class="card__bio">${escapeHtml(user.bio)}</p>
      <a class="card__link" href="/users/${user.id}">View Profile</a>
    </div>
  `;
  return article;
}

// Always escape user data to prevent XSS:
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

## The `<template>` Element

HTML templates are inert — not rendered, not fetched, but parsed and cloneable.

```html
<template id="card-template">
  <article class="card">
    <img class="card__avatar" src="" alt="">
    <div class="card__body">
      <h2 class="card__name"></h2>
      <p class="card__bio"></p>
    </div>
  </article>
</template>
```

```javascript
function createCard(user) {
  const template = document.getElementById('card-template');
  const clone = template.content.cloneNode(true); // Deep clone template content

  clone.querySelector('.card__avatar').src = user.avatar;
  clone.querySelector('.card__avatar').alt = user.name;
  clone.querySelector('.card__name').textContent = user.name;
  clone.querySelector('.card__bio').textContent = user.bio;

  return clone;
}

const container = document.querySelector('.cards');
users.forEach(user => container.append(createCard(user)));
```

## MutationObserver — Watching DOM Changes

React to DOM changes programmatically.

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      console.log('Children changed:', mutation.addedNodes, mutation.removedNodes);
    }
    if (mutation.type === 'attributes') {
      console.log(`Attribute changed: ${mutation.attributeName}`);
    }
  });
});

// Start observing
observer.observe(document.querySelector('.container'), {
  childList: true,       // Watch for added/removed children
  subtree: true,         // Watch all descendants
  attributes: true,      // Watch attribute changes
  attributeFilter: ['class', 'data-id'], // Only these attributes
  characterData: true,   // Watch text content changes
});

// Stop observing
observer.disconnect();
```

**Real use case — auto-initialize third-party widgets:**

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1 && node.matches('[data-widget]')) {
        initWidget(node); // Auto-initialize new widgets added to DOM
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
```

## Performance — Avoiding Layout Thrash

**Layout thrash** happens when you alternate reading and writing layout properties, forcing the browser to recalculate layout repeatedly.

```javascript
// ❌ Layout thrash — browser recalculates layout for EACH read after write
boxes.forEach(box => {
  box.style.width = box.offsetWidth + 10 + 'px'; // Write then READ
});
// Each read (offsetWidth) after a write forces a synchronous layout!

// ✅ Batch reads first, then batch writes
const widths = boxes.map(box => box.offsetWidth); // Read ALL
boxes.forEach((box, i) => {
  box.style.width = widths[i] + 10 + 'px'; // Write ALL
});

// ✅ Even better — use CSS transforms (no layout, only compositing)
boxes.forEach(box => {
  box.style.transform = 'translateX(10px)'; // GPU accelerated, no layout!
});
```

## Practice Exercises

### Exercise 1: DOM inspector

```javascript
// Build a function that logs the entire DOM tree structure
function printTree(node, indent = 0) {
  // TODO: Print node type and tag, indented by depth
  // Recursively print all children
}

printTree(document.body);
// Expected output:
// BODY
//   DIV#app
//     H1
//       "Hello World"
//     UL.list
//       LI
//         "Item 1"
```

### Exercise 2: Virtual table

```javascript
// Build a function that creates an HTML table from an array of objects
function createTable(data) {
  // data = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]
  // Should create: <table><thead>...</thead><tbody>...</tbody></table>
  // Use DocumentFragment for performance
}
```

## Key Takeaways

- The DOM is a tree of Nodes; Element, Text, and Comment are subtypes
- `querySelector` / `querySelectorAll` are the go-to selectors — use CSS syntax
- `closest()` walks up; `matches()` tests; scope queries with `el.querySelector()`
- Always use `textContent` for user data — `innerHTML` risks XSS
- `DocumentFragment` batches DOM insertions — one reflow instead of many
- Read layout properties in batches, then write — avoid layout thrash
- `MutationObserver` watches the DOM without polling

---

**Next:** [Lecture 2: Events & Delegation →](2-events-delegation.md)
