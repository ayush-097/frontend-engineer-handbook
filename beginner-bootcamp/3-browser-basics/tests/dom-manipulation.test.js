/**
 * DOM Manipulation Test Suite
 *
 * Tests core DOM APIs used throughout the Browser Basics module.
 * Uses jsdom (via Jest) for headless browser simulation.
 *
 * Run: npm test dom-manipulation.test.js
 */

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  document.body.innerHTML = `
    <div id="app">
      <header class="header">
        <h1 id="title">Hello World</h1>
        <nav class="nav">
          <a href="/" class="nav-link active" data-page="home">Home</a>
          <a href="/about" class="nav-link" data-page="about">About</a>
        </nav>
      </header>

      <main>
        <ul id="list" class="item-list">
          <li class="item" data-id="1">
            <span class="item__text">Item One</span>
            <button class="item__delete" data-id="1">Delete</button>
          </li>
          <li class="item" data-id="2">
            <span class="item__text">Item Two</span>
            <button class="item__delete" data-id="2">Delete</button>
          </li>
          <li class="item" data-id="3">
            <span class="item__text">Item Three</span>
            <button class="item__delete" data-id="3">Delete</button>
          </li>
        </ul>

        <form id="add-form">
          <input id="text-input" type="text" placeholder="New item">
          <button type="submit" id="submit-btn">Add</button>
        </form>

        <div id="hidden-section" style="display: none">Hidden</div>
        <div id="details" class="card" data-user-id="42" data-role="admin"></div>
      </main>
    </div>
  `;
});

// ─── 1. Selecting Elements ────────────────────────────────────────────────────

describe('Selecting Elements', () => {
  test('querySelector returns first matching element', () => {
    const title = document.querySelector('#title');
    expect(title).not.toBeNull();
    expect(title.tagName).toBe('H1');
    expect(title.id).toBe('title');
  });

  test('querySelectorAll returns all matching elements', () => {
    const items = document.querySelectorAll('.item');
    expect(items.length).toBe(3);
  });

  test('querySelector with complex selector', () => {
    const activeLink = document.querySelector('.nav-link.active');
    expect(activeLink).not.toBeNull();
    expect(activeLink.textContent).toBe('Home');
  });

  test('querySelectorAll can be converted to array', () => {
    const items = [...document.querySelectorAll('.item')];
    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(3);

    const texts = items.map(li => li.querySelector('.item__text').textContent);
    expect(texts).toEqual(['Item One', 'Item Two', 'Item Three']);
  });

  test('scoped querySelector searches inside element', () => {
    const nav = document.querySelector('.nav');
    const links = nav.querySelectorAll('a');
    expect(links.length).toBe(2); // Only nav links, not all anchors

    const external = nav.querySelector('#title');
    expect(external).toBeNull(); // Not inside nav
  });

  test('getElementById returns null for missing element', () => {
    expect(document.getElementById('nonexistent')).toBeNull();
  });

  test('closest walks up tree correctly', () => {
    const deleteBtn = document.querySelector('.item__delete[data-id="2"]');
    const listItem = deleteBtn.closest('.item');
    expect(listItem).not.toBeNull();
    expect(listItem.dataset.id).toBe('2');
  });

  test('closest returns null when no ancestor matches', () => {
    const title = document.querySelector('#title');
    const result = title.closest('.nonexistent-class');
    expect(result).toBeNull();
  });

  test('matches tests element against selector', () => {
    const link = document.querySelector('.nav-link');
    expect(link.matches('.nav-link')).toBe(true);
    expect(link.matches('.nav-link.active')).toBe(true); // First link is active
    expect(link.matches('.btn')).toBe(false);
  });
});

// ─── 2. Reading & Writing Content ─────────────────────────────────────────────

describe('Reading & Writing Content', () => {
  test('textContent reads text without HTML', () => {
    const title = document.querySelector('#title');
    expect(title.textContent).toBe('Hello World');
  });

  test('textContent sets text and escapes HTML', () => {
    const title = document.querySelector('#title');
    title.textContent = '<script>alert("xss")</script>';
    expect(title.textContent).toBe('<script>alert("xss")</script>');
    expect(title.innerHTML).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });

  test('innerHTML sets HTML content', () => {
    const el = document.querySelector('#details');
    el.innerHTML = '<strong>Bold</strong> and <em>italic</em>';
    expect(el.querySelector('strong').textContent).toBe('Bold');
    expect(el.querySelector('em').textContent).toBe('italic');
  });

  test('innerHTML replacement removes old children', () => {
    const list = document.querySelector('#list');
    const original = list.children.length;
    expect(original).toBe(3);

    list.innerHTML = '<li>New item</li>';
    expect(list.children.length).toBe(1);
    expect(list.querySelector('li').textContent).toBe('New item');
  });
});

// ─── 3. Attributes ────────────────────────────────────────────────────────────

describe('Attributes', () => {
  test('getAttribute reads attribute', () => {
    const link = document.querySelector('a[href="/about"]');
    expect(link.getAttribute('href')).toBe('/about');
  });

  test('setAttribute sets attribute', () => {
    const title = document.querySelector('#title');
    title.setAttribute('aria-label', 'Page title');
    expect(title.getAttribute('aria-label')).toBe('Page title');
  });

  test('hasAttribute checks existence', () => {
    const title = document.querySelector('#title');
    expect(title.hasAttribute('id')).toBe(true);
    expect(title.hasAttribute('hidden')).toBe(false);
  });

  test('removeAttribute deletes attribute', () => {
    const link = document.querySelector('.nav-link.active');
    link.removeAttribute('class');
    expect(link.hasAttribute('class')).toBe(false);
  });

  test('dataset reads data-* attributes in camelCase', () => {
    const details = document.querySelector('#details');
    expect(details.dataset.userId).toBe('42');    // data-user-id → userId
    expect(details.dataset.role).toBe('admin');
  });

  test('dataset sets data-* attributes', () => {
    const details = document.querySelector('#details');
    details.dataset.theme = 'dark';
    expect(details.getAttribute('data-theme')).toBe('dark');
  });
});

// ─── 4. classList ─────────────────────────────────────────────────────────────

describe('classList', () => {
  test('add adds one or more classes', () => {
    const el = document.querySelector('#details');
    el.classList.add('active', 'highlight');
    expect(el.classList.contains('card')).toBe(true);   // Original
    expect(el.classList.contains('active')).toBe(true);
    expect(el.classList.contains('highlight')).toBe(true);
  });

  test('remove removes classes', () => {
    const link = document.querySelector('.nav-link.active');
    link.classList.remove('active');
    expect(link.classList.contains('active')).toBe(false);
    expect(link.classList.contains('nav-link')).toBe(true); // Other classes preserved
  });

  test('toggle adds when absent, removes when present', () => {
    const el = document.querySelector('#details');
    expect(el.classList.contains('open')).toBe(false);
    el.classList.toggle('open');
    expect(el.classList.contains('open')).toBe(true);
    el.classList.toggle('open');
    expect(el.classList.contains('open')).toBe(false);
  });

  test('toggle with force=true always adds', () => {
    const el = document.querySelector('#details');
    el.classList.toggle('open', true);
    el.classList.toggle('open', true);
    expect(el.classList.contains('open')).toBe(true);
  });

  test('toggle with force=false always removes', () => {
    const el = document.querySelector('#details');
    el.classList.add('open');
    el.classList.toggle('open', false);
    expect(el.classList.contains('open')).toBe(false);
  });

  test('replace swaps one class for another', () => {
    const link = document.querySelector('.nav-link.active');
    link.classList.replace('active', 'current');
    expect(link.classList.contains('active')).toBe(false);
    expect(link.classList.contains('current')).toBe(true);
  });

  test('contains returns true/false', () => {
    const link = document.querySelector('.nav-link.active');
    expect(link.classList.contains('nav-link')).toBe(true);
    expect(link.classList.contains('nonexistent')).toBe(false);
  });
});

// ─── 5. Creating & Inserting Elements ─────────────────────────────────────────

describe('Creating & Inserting Elements', () => {
  test('createElement creates element with correct tag', () => {
    const div = document.createElement('div');
    expect(div.tagName).toBe('DIV');
    expect(div.nodeType).toBe(1); // Element
  });

  test('append adds children to element', () => {
    const list = document.querySelector('#list');
    const originalCount = list.children.length;

    const li = document.createElement('li');
    li.textContent = 'New Item';
    list.append(li);

    expect(list.children.length).toBe(originalCount + 1);
    expect(list.lastElementChild.textContent).toBe('New Item');
  });

  test('prepend adds to beginning', () => {
    const list = document.querySelector('#list');
    const li = document.createElement('li');
    li.textContent = 'First Item';
    list.prepend(li);

    expect(list.firstElementChild.textContent).toBe('First Item');
  });

  test('before inserts before element', () => {
    const secondItem = document.querySelector('.item[data-id="2"]');
    const newItem = document.createElement('li');
    newItem.textContent = 'Between 1 and 2';
    newItem.className = 'item';
    newItem.dataset.id = '1.5';
    secondItem.before(newItem);

    const list = document.querySelector('#list');
    expect(list.children[1].textContent).toContain('Between 1 and 2');
  });

  test('after inserts after element', () => {
    const secondItem = document.querySelector('.item[data-id="2"]');
    const newItem = document.createElement('li');
    newItem.textContent = 'After 2';
    secondItem.after(newItem);

    const list = document.querySelector('#list');
    expect(list.children[2].textContent).toBe('After 2');
  });

  test('replaceWith swaps element', () => {
    const title = document.querySelector('#title');
    const h2 = document.createElement('h2');
    h2.textContent = 'New Title';
    title.replaceWith(h2);

    expect(document.querySelector('#title')).toBeNull();
    expect(document.querySelector('h2').textContent).toBe('New Title');
  });

  test('cloneNode with deep=true copies children', () => {
    const original = document.querySelector('.item[data-id="1"]');
    const clone = original.cloneNode(true);

    expect(clone.querySelector('.item__text').textContent).toBe('Item One');
    expect(clone.querySelector('.item__delete')).not.toBeNull();
  });

  test('DocumentFragment batches insertions', () => {
    const list = document.querySelector('#list');
    const fragment = document.createDocumentFragment();

    ['A', 'B', 'C'].forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      fragment.appendChild(li);
    });

    list.append(fragment);

    const items = list.querySelectorAll('li');
    const texts = [...items].map(li => li.textContent);
    expect(texts).toContain('A');
    expect(texts).toContain('B');
    expect(texts).toContain('C');
  });

  test('append accepts strings directly', () => {
    const el = document.querySelector('#details');
    el.append('Hello ', 'World');
    expect(el.textContent).toBe('Hello World');
  });
});

// ─── 6. Removing Elements ─────────────────────────────────────────────────────

describe('Removing Elements', () => {
  test('remove() removes element from DOM', () => {
    const item = document.querySelector('.item[data-id="2"]');
    item.remove();

    expect(document.querySelector('.item[data-id="2"]')).toBeNull();
    expect(document.querySelectorAll('.item').length).toBe(2);
  });

  test('replaceChildren() removes all children', () => {
    const list = document.querySelector('#list');
    list.replaceChildren();
    expect(list.children.length).toBe(0);
  });

  test('innerHTML = "" removes all children', () => {
    const list = document.querySelector('#list');
    list.innerHTML = '';
    expect(list.children.length).toBe(0);
  });
});

// ─── 7. Traversal ─────────────────────────────────────────────────────────────

describe('DOM Traversal', () => {
  test('parentElement returns parent', () => {
    const item = document.querySelector('.item[data-id="1"]');
    expect(item.parentElement.id).toBe('list');
  });

  test('children returns element children only', () => {
    const list = document.querySelector('#list');
    expect(list.children.length).toBe(3);
    expect([...list.children].every(c => c.classList.contains('item'))).toBe(true);
  });

  test('firstElementChild and lastElementChild', () => {
    const list = document.querySelector('#list');
    expect(list.firstElementChild.dataset.id).toBe('1');
    expect(list.lastElementChild.dataset.id).toBe('3');
  });

  test('nextElementSibling and previousElementSibling', () => {
    const secondItem = document.querySelector('.item[data-id="2"]');
    expect(secondItem.previousElementSibling.dataset.id).toBe('1');
    expect(secondItem.nextElementSibling.dataset.id).toBe('3');
  });

  test('nextElementSibling of last child is null', () => {
    const lastItem = document.querySelector('.item[data-id="3"]');
    expect(lastItem.nextElementSibling).toBeNull();
  });
});

// ─── 8. Events ────────────────────────────────────────────────────────────────

describe('Events', () => {
  test('addEventListener and click trigger', () => {
    const btn = document.querySelector('#submit-btn');
    const handler = jest.fn();

    btn.addEventListener('click', handler);
    btn.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('removeEventListener stops handler', () => {
    const btn = document.querySelector('#submit-btn');
    const handler = jest.fn();

    btn.addEventListener('click', handler);
    btn.click(); // First click
    btn.removeEventListener('click', handler);
    btn.click(); // Second click

    expect(handler).toHaveBeenCalledTimes(1); // Only first click
  });

  test('{ once: true } auto-removes listener', () => {
    const btn = document.querySelector('#submit-btn');
    const handler = jest.fn();

    btn.addEventListener('click', handler, { once: true });
    btn.click();
    btn.click();
    btn.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('event bubbles to parent', () => {
    const parentHandler = jest.fn();
    const list = document.querySelector('#list');
    list.addEventListener('click', parentHandler);

    const item = document.querySelector('.item[data-id="1"]');
    item.click();

    expect(parentHandler).toHaveBeenCalled();
  });

  test('stopPropagation prevents bubbling', () => {
    const parentHandler = jest.fn();
    const list = document.querySelector('#list');
    list.addEventListener('click', parentHandler);

    const item = document.querySelector('.item[data-id="1"]');
    item.addEventListener('click', (e) => e.stopPropagation());
    item.click();

    expect(parentHandler).not.toHaveBeenCalled();
  });

  test('event.target is the actual clicked element', () => {
    const list = document.querySelector('#list');
    let capturedTarget = null;

    list.addEventListener('click', (e) => {
      capturedTarget = e.target;
    });

    const deleteBtn = document.querySelector('.item__delete[data-id="1"]');
    deleteBtn.click();

    expect(capturedTarget).toBe(deleteBtn);
  });

  test('event.currentTarget is the listener element', () => {
    const list = document.querySelector('#list');
    let capturedCurrent = null;

    list.addEventListener('click', (e) => {
      capturedCurrent = e.currentTarget;
    });

    document.querySelector('.item__delete[data-id="1"]').click();

    expect(capturedCurrent).toBe(list);
  });

  test('CustomEvent carries detail data', () => {
    const el = document.querySelector('#app');
    const received = [];

    el.addEventListener('custom-event', (e) => {
      received.push(e.detail);
    });

    el.dispatchEvent(new CustomEvent('custom-event', {
      bubbles: true,
      detail: { message: 'hello', count: 42 },
    }));

    expect(received).toHaveLength(1);
    expect(received[0].message).toBe('hello');
    expect(received[0].count).toBe(42);
  });

  test('event delegation with closest()', () => {
    const list = document.querySelector('#list');
    const deleted = [];

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.item__delete');
      if (!btn) return;
      const item = btn.closest('.item');
      deleted.push(item.dataset.id);
      item.remove();
    });

    // Click inside the span (not the button) — closest should still find button
    const deleteBtn = document.querySelector('.item__delete[data-id="2"]');
    deleteBtn.click();

    expect(deleted).toEqual(['2']);
    expect(document.querySelectorAll('.item').length).toBe(2);
  });
});

// ─── 9. Form Events ───────────────────────────────────────────────────────────

describe('Form Events', () => {
  test('form submit event fires with preventDefault', () => {
    const form = document.querySelector('#add-form');
    const submitHandler = jest.fn(e => e.preventDefault());

    form.addEventListener('submit', submitHandler);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(submitHandler).toHaveBeenCalledTimes(1);
  });

  test('input event fires on value change', () => {
    const input = document.querySelector('#text-input');
    const inputHandler = jest.fn();

    input.addEventListener('input', inputHandler);
    input.value = 'New text';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(inputHandler).toHaveBeenCalledTimes(1);
  });
});

// ─── 10. MutationObserver ─────────────────────────────────────────────────────

describe('MutationObserver', () => {
  test('observes child additions', (done) => {
    const list = document.querySelector('#list');
    const added = [];

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) added.push(node);
        });
      });

      expect(added).toHaveLength(1);
      expect(added[0].textContent).toBe('New Item');
      observer.disconnect();
      done();
    });

    observer.observe(list, { childList: true });

    const li = document.createElement('li');
    li.textContent = 'New Item';
    list.appendChild(li);
  });

  test('observes attribute changes', (done) => {
    const details = document.querySelector('#details');
    let changedAttr = null;

    const observer = new MutationObserver((mutations) => {
      changedAttr = mutations[0].attributeName;
      observer.disconnect();
      done();
    });

    observer.observe(details, { attributes: true });
    details.setAttribute('data-status', 'active');

    expect(changedAttr).toBe('data-status');
  });
});
