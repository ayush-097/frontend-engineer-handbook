# Lab: Virtual DOM Implementation

Build a minimal virtual DOM system that powers React's core concept.

## Objectives
Implement `createElement`, `render` (vDOM → real DOM), and `diff`/`patch` (update only what changed).

## API to Implement

```javascript
import { createElement, render, diff, patch } from './vdom';

// 1. Define UI as plain objects
const vdom = createElement('div', { class: 'app' },
  createElement('h1', null, 'Hello World'),
  createElement('ul', null,
    createElement('li', { key: '1' }, 'Item 1'),
    createElement('li', { key: '2' }, 'Item 2'),
  )
);

// 2. Mount to real DOM
const root = document.getElementById('app');
let tree = render(vdom);    // Returns real DOM node
root.appendChild(tree);

// 3. Update efficiently
const newVdom = createElement('div', { class: 'app' },
  createElement('h1', null, 'Hello Updated'),
  createElement('ul', null,
    createElement('li', { key: '1' }, 'Item 1'),
    createElement('li', { key: '3' }, 'Item 3'), // Changed
  )
);

const patches = diff(vdom, newVdom); // Compute minimal changes
patch(tree, patches);               // Apply only what changed
```

## Files

```
virtual-dom-implementation/
├── README.md        (this file)
├── vdom.js          (your implementation)
├── vdom.test.js     (tests — all must pass)
└── demo.html        (interactive demo)
```

## Acceptance Criteria

- [ ] `createElement(tag, props, ...children)` returns a vnode object
- [ ] `render(vnode)` creates and returns a real DOM node
- [ ] Text nodes render as `Text` DOM nodes
- [ ] `diff(oldVnode, newVnode)` returns array of patches
- [ ] `patch(domNode, patches)` applies patches to real DOM
- [ ] Only changed nodes are updated in the DOM
- [ ] Keys are used to match list items correctly

## Hints

- A vnode is just a plain object: `{ tag, props, children }`
- Text is a special case: `{ type: 'TEXT_NODE', value: 'Hello' }`
- Patch types: `REPLACE`, `UPDATE_PROPS`, `REORDER`, `REMOVE`, `ADD`
- Use `document.createElement`, `setAttribute`, `textContent`

## Bonus Challenges

1. Component support: `createElement(MyComponent, { name: 'Alice' })`
2. Event prop support: `{ onClick: handler }` → `addEventListener`
3. `useState` hook (re-render on state change)
4. Keyed reconciliation (efficient list updates)

## Time Estimate: 3–4 hours
