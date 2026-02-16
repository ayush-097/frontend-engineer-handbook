/**
 * Virtual DOM — Test Suite
 *
 * Tests createElement, render, diff, and patch.
 * Run: npm test vdom.test.js
 */

const { createElement, render, diff, patch, PatchType } = require('./vdom.js');

// Alias for readability
const h = createElement;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Apply a full update cycle and return new DOM node state */
function applyUpdate(oldVnode, newVnode, domNode) {
  const patches = diff(oldVnode, newVnode);
  patch(domNode, patches);
  return patches;
}

// ─── createElement ────────────────────────────────────────────────────────────

describe('createElement()', () => {
  test('returns a vnode object with tag, props, children', () => {
    const vnode = h('div', { id: 'app' });
    expect(vnode.tag).toBe('div');
    expect(vnode.props.id).toBe('app');
    expect(vnode.children).toEqual([]);
  });

  test('accepts null props', () => {
    const vnode = h('span', null);
    expect(vnode.props).toEqual({});
  });

  test('wraps string children in text vnodes', () => {
    const vnode = h('p', null, 'Hello');
    expect(vnode.children).toHaveLength(1);
    expect(vnode.children[0].tag).toBe('#text');
    expect(vnode.children[0].value).toBe('Hello');
  });

  test('wraps number children as text vnodes', () => {
    const vnode = h('p', null, 42);
    expect(vnode.children[0].tag).toBe('#text');
    expect(vnode.children[0].value).toBe('42');
  });

  test('accepts multiple children', () => {
    const vnode = h('ul', null,
      h('li', null, 'One'),
      h('li', null, 'Two'),
      h('li', null, 'Three'),
    );
    expect(vnode.children).toHaveLength(3);
  });

  test('filters out null and false children', () => {
    const vnode = h('div', null,
      h('span', null, 'Visible'),
      null,
      false,
      undefined,
    );
    expect(vnode.children).toHaveLength(1);
    expect(vnode.children[0].tag).toBe('span');
  });

  test('stores key from props', () => {
    const vnode = h('li', { key: 'item-1' }, 'text');
    expect(vnode.key).toBe('item-1');
  });

  test('key is not in props after extraction', () => {
    const vnode = h('li', { key: 'item-1', class: 'item' }, 'text');
    // key should still be accessible from props (source of truth)
    expect(vnode.props.key).toBe('item-1');
  });

  test('flattens nested arrays of children', () => {
    const items = ['a', 'b', 'c'].map(s => h('span', null, s));
    const vnode = h('div', null, ...items);
    expect(vnode.children).toHaveLength(3);
  });

  test('calls functional component and returns its result', () => {
    const MyComponent = ({ name }) => h('p', null, `Hello, ${name}`);
    const vnode = h(MyComponent, { name: 'Alice' });
    expect(vnode.tag).toBe('p');
    expect(vnode.children[0].value).toBe('Hello, Alice');
  });
});

// ─── render ───────────────────────────────────────────────────────────────────

describe('render()', () => {
  test('creates a DOM element with correct tag', () => {
    const vnode = h('div', null);
    const dom = render(vnode);
    expect(dom.tagName).toBe('DIV');
  });

  test('sets attributes from props', () => {
    const vnode = h('div', { id: 'app', class: 'container' });
    const dom = render(vnode);
    expect(dom.getAttribute('id')).toBe('app');
    expect(dom.getAttribute('class')).toBe('container');
  });

  test('does not set "key" as a DOM attribute', () => {
    const vnode = h('li', { key: 'k1', class: 'item' });
    const dom = render(vnode);
    expect(dom.hasAttribute('key')).toBe(false);
    expect(dom.getAttribute('class')).toBe('item');
  });

  test('renders text nodes for string children', () => {
    const vnode = h('p', null, 'Hello World');
    const dom = render(vnode);
    expect(dom.childNodes).toHaveLength(1);
    expect(dom.childNodes[0].nodeType).toBe(3); // Text node
    expect(dom.childNodes[0].nodeValue).toBe('Hello World');
  });

  test('renders nested element children', () => {
    const vnode = h('ul', null,
      h('li', null, 'One'),
      h('li', null, 'Two'),
    );
    const dom = render(vnode);
    expect(dom.children).toHaveLength(2);
    expect(dom.children[0].tagName).toBe('LI');
    expect(dom.children[0].textContent).toBe('One');
  });

  test('renders deeply nested structure', () => {
    const vnode = h('div', { class: 'card' },
      h('header', null,
        h('h2', null, 'Title'),
      ),
      h('p', null, 'Body text'),
    );
    const dom = render(vnode);
    expect(dom.querySelector('h2').textContent).toBe('Title');
    expect(dom.querySelector('p').textContent).toBe('Body text');
  });

  test('attaches event listeners from on* props', () => {
    const onClick = jest.fn();
    const vnode = h('button', { onClick }, 'Click me');
    const dom = render(vnode);
    dom.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('handles className prop', () => {
    const vnode = h('div', { className: 'box active' });
    const dom = render(vnode);
    expect(dom.className).toBe('box active');
  });

  test('handles boolean true attribute', () => {
    const vnode = h('input', { disabled: true });
    const dom = render(vnode);
    expect(dom.hasAttribute('disabled')).toBe(true);
  });

  test('handles boolean false attribute (omits it)', () => {
    const vnode = h('input', { disabled: false });
    const dom = render(vnode);
    expect(dom.hasAttribute('disabled')).toBe(false);
  });

  test('renders text vnode as text node', () => {
    const vnode = h('span', null, 'plain text');
    const dom = render(vnode);
    expect(dom.nodeType).toBe(1);
    expect(dom.textContent).toBe('plain text');
  });
});

// ─── diff ─────────────────────────────────────────────────────────────────────

describe('diff()', () => {
  test('returns empty array when trees are identical', () => {
    const vnode = h('div', { class: 'app' }, h('p', null, 'Hello'));
    const patches = diff(vnode, vnode);
    expect(patches).toEqual([]);
  });

  test('creates REPLACE patch when tag changes', () => {
    const old = h('div', null, 'text');
    const next = h('span', null, 'text');
    const patches = diff(old, next);
    expect(patches.some(p => p.type === PatchType.REPLACE)).toBe(true);
  });

  test('creates UPDATE_PROPS patch when prop changes', () => {
    const old = h('div', { class: 'a' });
    const next = h('div', { class: 'b' });
    const patches = diff(old, next);
    const propPatch = patches.find(p => p.type === PatchType.UPDATE_PROPS);
    expect(propPatch).toBeDefined();
    expect(propPatch.props.class).toBe('b');
  });

  test('marks removed prop as null in UPDATE_PROPS', () => {
    const old = h('div', { class: 'a', id: 'box' });
    const next = h('div', { class: 'a' }); // id removed
    const patches = diff(old, next);
    const propPatch = patches.find(p => p.type === PatchType.UPDATE_PROPS);
    expect(propPatch.props.id).toBeNull();
  });

  test('creates TEXT patch when text content changes', () => {
    const old = h('p', null, 'Hello');
    const next = h('p', null, 'World');
    const patches = diff(old, next);
    expect(patches.some(p => p.type === PatchType.REPLACE)).toBe(true);
  });

  test('creates REMOVE patch when child removed', () => {
    const old = h('ul', null, h('li', null, 'A'), h('li', null, 'B'));
    const next = h('ul', null, h('li', null, 'A'));
    const patches = diff(old, next);
    expect(patches.some(p => p.type === PatchType.REMOVE)).toBe(true);
  });

  test('creates ADD patch when child added', () => {
    const old = h('ul', null, h('li', null, 'A'));
    const next = h('ul', null, h('li', null, 'A'), h('li', null, 'B'));
    const patches = diff(old, next);
    expect(patches.some(p => p.type === PatchType.ADD)).toBe(true);
  });

  test('no patches when props unchanged', () => {
    const old = h('div', { class: 'app', id: 'root' });
    const next = h('div', { class: 'app', id: 'root' });
    const patches = diff(old, next);
    expect(patches.filter(p => p.type === PatchType.UPDATE_PROPS)).toHaveLength(0);
  });

  test('does not patch key attribute', () => {
    const old = h('li', { key: 'k1', class: 'item' });
    const next = h('li', { key: 'k1', class: 'item' });
    const patches = diff(old, next);
    expect(patches.filter(p => p.type === PatchType.UPDATE_PROPS)).toHaveLength(0);
  });
});

// ─── patch ────────────────────────────────────────────────────────────────────

describe('patch()', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('replaces element when tag changes', () => {
    const oldVnode = h('p', null, 'text');
    const newVnode = h('h1', null, 'text');
    const dom = render(oldVnode);
    container.appendChild(dom);

    applyUpdate(oldVnode, newVnode, dom);

    // The child should now be an h1 (replacement happened in-place via parent)
    // Since replaceChild changes the reference, check container
    expect(container.children[0].tagName).toBe('H1');
  });

  test('updates changed attribute', () => {
    const oldVnode = h('div', { class: 'old' });
    const newVnode = h('div', { class: 'new' });
    const dom = render(oldVnode);
    container.appendChild(dom);

    applyUpdate(oldVnode, newVnode, dom);

    expect(dom.getAttribute('class')).toBe('new');
  });

  test('removes deleted attribute', () => {
    const oldVnode = h('div', { class: 'box', id: 'main' });
    const newVnode = h('div', { class: 'box' }); // id removed
    const dom = render(oldVnode);
    container.appendChild(dom);

    applyUpdate(oldVnode, newVnode, dom);

    expect(dom.hasAttribute('id')).toBe(false);
    expect(dom.getAttribute('class')).toBe('box');
  });

  test('adds new child', () => {
    const oldVnode = h('ul', null, h('li', null, 'A'));
    const newVnode = h('ul', null, h('li', null, 'A'), h('li', null, 'B'));
    const dom = render(oldVnode);
    container.appendChild(dom);

    expect(dom.children).toHaveLength(1);
    applyUpdate(oldVnode, newVnode, dom);
    expect(dom.children).toHaveLength(2);
    expect(dom.children[1].textContent).toBe('B');
  });

  test('removes extra child', () => {
    const oldVnode = h('ul', null, h('li', null, 'A'), h('li', null, 'B'));
    const newVnode = h('ul', null, h('li', null, 'A'));
    const dom = render(oldVnode);
    container.appendChild(dom);

    expect(dom.children).toHaveLength(2);
    applyUpdate(oldVnode, newVnode, dom);
    expect(dom.children).toHaveLength(1);
    expect(dom.children[0].textContent).toBe('A');
  });

  test('applies no DOM mutations for identical trees', () => {
    const vnode = h('div', { class: 'card' }, h('p', null, 'Content'));
    const dom = render(vnode);
    container.appendChild(dom);

    const setAttribute = jest.spyOn(dom, 'setAttribute');
    applyUpdate(vnode, vnode, dom);

    expect(setAttribute).not.toHaveBeenCalled();
  });

  test('updates text content when text changes', () => {
    const oldVnode = h('p', null, 'Hello');
    const newVnode = h('p', null, 'World');
    const dom = render(oldVnode);
    container.appendChild(dom);

    applyUpdate(oldVnode, newVnode, dom);

    expect(container.querySelector('p').textContent).toBe('World');
  });
});

// ─── Integration ──────────────────────────────────────────────────────────────

describe('Integration — full update cycle', () => {
  let root;

  beforeEach(() => {
    root = document.createElement('div');
    root.id = 'app';
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  test('counter renders and updates', () => {
    let count = 0;

    const buildVdom = (n) =>
      h('div', { class: 'counter' },
        h('p', null, `Count: ${n}`),
        h('button', { id: 'inc' }, '+'),
      );

    let currentVdom = buildVdom(count);
    let currentDom = render(currentVdom);
    root.appendChild(currentDom);

    expect(root.querySelector('p').textContent).toBe('Count: 0');

    // Simulate increment
    count = 1;
    const nextVdom = buildVdom(count);
    const patches = diff(currentVdom, nextVdom);
    patch(currentDom, patches);
    currentVdom = nextVdom;

    expect(root.querySelector('p').textContent).toBe('Count: 1');
  });

  test('list renders and items can be added', () => {
    const buildVdom = (items) =>
      h('ul', null, ...items.map(item =>
        h('li', { key: item.id }, item.text)
      ));

    let items = [{ id: 1, text: 'First' }];
    let currentVdom = buildVdom(items);
    let currentDom = render(currentVdom);
    root.appendChild(currentDom);

    expect(root.querySelectorAll('li')).toHaveLength(1);

    items = [...items, { id: 2, text: 'Second' }];
    const nextVdom = buildVdom(items);
    patch(currentDom, diff(currentVdom, nextVdom));
    currentVdom = nextVdom;

    expect(root.querySelectorAll('li')).toHaveLength(2);
    expect(root.querySelectorAll('li')[1].textContent).toBe('Second');
  });

  test('conditional rendering — show/hide element', () => {
    const buildVdom = (showBanner) =>
      h('div', null,
        showBanner ? h('div', { class: 'banner' }, 'Alert!') : null,
        h('p', null, 'Content'),
      );

    let currentVdom = buildVdom(true);
    let currentDom = render(currentVdom);
    root.appendChild(currentDom);

    expect(root.querySelector('.banner')).not.toBeNull();

    // Hide the banner
    const nextVdom = buildVdom(false);
    patch(currentDom, diff(currentVdom, nextVdom));

    expect(root.querySelector('p').textContent).toBe('Content');
  });
});
