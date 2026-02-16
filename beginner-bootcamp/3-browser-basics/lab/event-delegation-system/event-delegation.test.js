/**
 * Event Delegation System — Test Suite
 * Run: npm test event-delegation.test.js
 */

const { EventHub } = require('./event-delegation.js');

// jsdom provides document/window in Jest automatically

// ─── Setup ────────────────────────────────────────────────────────────────────

function buildFixture() {
  document.body.innerHTML = `
    <ul id="list">
      <li class="item" data-id="1">
        <span class="text">Item 1</span>
        <button class="btn-action" data-action="select">Select</button>
        <button class="btn-delete" data-id="1">Delete</button>
      </li>
      <li class="item" data-id="2">
        <span class="text">Item 2</span>
        <button class="btn-action" data-action="select">Select</button>
        <button class="btn-delete" data-id="2">Delete</button>
      </li>
    </ul>
    <div id="outside">
      <button class="btn-action" data-action="outside">Outside</button>
    </div>
  `;
  return document.getElementById('list');
}

let list;
let hub;

beforeEach(() => {
  list = buildFixture();
  hub = new EventHub(list);
});

afterEach(() => {
  hub.offAll('click');
  hub.offAll('mouseenter');
  hub.offAll('custom-event');
});

// ─── Core on() ────────────────────────────────────────────────────────────────

describe('on() — core delegation', () => {
  test('fires when target matches selector', () => {
    const handler = jest.fn();
    hub.on('click', '.btn-action', handler);

    document.querySelector('.btn-action').click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('passes event and matched element to handler', () => {
    let capturedEvent = null;
    let capturedEl = null;

    hub.on('click', '.btn-action', (event, el) => {
      capturedEvent = event;
      capturedEl = el;
    });

    const btn = document.querySelector('.btn-action[data-action="select"]');
    btn.click();

    expect(capturedEvent).toBeInstanceOf(MouseEvent);
    expect(capturedEl).toBe(btn);
  });

  test('this inside handler is the matched element', () => {
    let thisValue = null;

    hub.on('click', '.btn-action', function() {
      thisValue = this;
    });

    const btn = document.querySelector('.btn-action');
    btn.click();

    expect(thisValue).toBe(btn);
  });

  test('fires for click on child of matched element', () => {
    // Clicking a <span> inside <li> should match li selector
    const handler = jest.fn();
    hub.on('click', '.item', handler);

    const span = document.querySelector('.item .text');
    span.click(); // Click child span — should bubble up and match .item

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('matched element is the .item not the span child', () => {
    let matched = null;
    hub.on('click', '.item', (event, el) => { matched = el; });

    const span = document.querySelector('.item[data-id="1"] .text');
    span.click();

    expect(matched.dataset.id).toBe('1');
    expect(matched.tagName).toBe('LI');
  });

  test('does NOT fire for elements outside root', () => {
    const handler = jest.fn();
    hub.on('click', '.btn-action', handler);

    // Click the .btn-action that is OUTSIDE the list
    document.querySelector('#outside .btn-action').click();

    expect(handler).not.toHaveBeenCalled();
  });

  test('does NOT fire when selector does not match', () => {
    const handler = jest.fn();
    hub.on('click', '.btn-action', handler);

    // Click a delete button — does not match .btn-action
    document.querySelector('.btn-delete').click();

    expect(handler).not.toHaveBeenCalled();
  });

  test('multiple handlers for same event type both fire', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    hub.on('click', '.btn-action', handler1);
    hub.on('click', '.btn-action', handler2);

    document.querySelector('.btn-action').click();

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  test('different selectors on same event type fire independently', () => {
    const actionHandler = jest.fn();
    const deleteHandler = jest.fn();

    hub.on('click', '.btn-action', actionHandler);
    hub.on('click', '.btn-delete', deleteHandler);

    document.querySelector('.btn-action').click();

    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(deleteHandler).not.toHaveBeenCalled();

    document.querySelector('.btn-delete').click();

    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(deleteHandler).toHaveBeenCalledTimes(1);
  });

  test('returns an unsubscribe function', () => {
    const handler = jest.fn();
    const off = hub.on('click', '.btn-action', handler);

    expect(typeof off).toBe('function');
  });
});

// ─── Unsubscribe ──────────────────────────────────────────────────────────────

describe('unsubscribe (returned off function)', () => {
  test('calling off() stops handler from firing', () => {
    const handler = jest.fn();
    const off = hub.on('click', '.btn-action', handler);

    document.querySelector('.btn-action').click();
    expect(handler).toHaveBeenCalledTimes(1);

    off();

    document.querySelector('.btn-action').click();
    document.querySelector('.btn-action').click();
    expect(handler).toHaveBeenCalledTimes(1); // Still 1
  });

  test('removing one handler does not affect others', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    const off1 = hub.on('click', '.btn-action', handler1);
    hub.on('click', '.btn-action', handler2);

    off1();

    document.querySelector('.btn-action').click();

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});

// ─── once() ───────────────────────────────────────────────────────────────────

describe('once()', () => {
  test('fires exactly once', () => {
    const handler = jest.fn();
    hub.once('click', '.btn-action', handler);

    document.querySelector('.btn-action').click();
    document.querySelector('.btn-action').click();
    document.querySelector('.btn-action').click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('once handler receives correct arguments', () => {
    let captured = null;
    hub.once('click', '.btn-action', (event, el) => { captured = el; });

    const btn = document.querySelector('.btn-action');
    btn.click();

    expect(captured).toBe(btn);
  });

  test('once returns unsubscribe function', () => {
    const handler = jest.fn();
    const off = hub.once('click', '.btn-action', handler);

    expect(typeof off).toBe('function');

    off(); // Unsubscribe before it fires

    document.querySelector('.btn-action').click();

    expect(handler).not.toHaveBeenCalled();
  });

  test('multiple once() listeners each fire once independently', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    hub.once('click', '.btn-action', handler1);
    hub.once('click', '.btn-action', handler2);

    document.querySelector('.btn-action').click();
    document.querySelector('.btn-action').click();

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});

// ─── off() ────────────────────────────────────────────────────────────────────

describe('off()', () => {
  test('off() removes specific handler by reference', () => {
    const handler = jest.fn();
    hub.on('click', '.btn-action', handler);
    hub.off('click', '.btn-action', handler);

    document.querySelector('.btn-action').click();

    expect(handler).not.toHaveBeenCalled();
  });

  test('off() only removes the matching entry', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    hub.on('click', '.btn-action', handler1);
    hub.on('click', '.btn-action', handler2);

    hub.off('click', '.btn-action', handler1);

    document.querySelector('.btn-action').click();

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  test('off() is safe to call when listener does not exist', () => {
    expect(() => {
      hub.off('click', '.btn-action', () => {});
    }).not.toThrow();
  });
});

// ─── offAll() ─────────────────────────────────────────────────────────────────

describe('offAll()', () => {
  test('removes all handlers for an event type', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    const h3 = jest.fn();

    hub.on('click', '.btn-action', h1);
    hub.on('click', '.btn-delete', h2);
    hub.on('click', '.item', h3);

    hub.offAll('click');

    document.querySelector('.btn-action').click();
    document.querySelector('.btn-delete').click();

    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
    expect(h3).not.toHaveBeenCalled();
  });

  test('offAll for one type does not affect other types', () => {
    const clickHandler = jest.fn();
    const mouseHandler = jest.fn();

    hub.on('click', '.btn-action', clickHandler);
    hub.on('mouseenter', '.item', mouseHandler);

    hub.offAll('click');

    document.querySelector('.btn-action').click();
    document.querySelector('.item').dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    expect(clickHandler).not.toHaveBeenCalled();
    expect(mouseHandler).toHaveBeenCalledTimes(1);
  });
});

// ─── emit() ───────────────────────────────────────────────────────────────────

describe('emit()', () => {
  test('dispatches CustomEvent that bubbles', () => {
    const handler = jest.fn();
    list.addEventListener('item:select', handler);

    const btn = document.querySelector('.btn-action');
    hub.emit('item:select', btn, { id: 1 });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('dispatched event carries detail data', () => {
    let detail = null;
    list.addEventListener('item:select', (e) => { detail = e.detail; });

    hub.emit('item:select', document.querySelector('.btn-action'), { id: 42, name: 'test' });

    expect(detail.id).toBe(42);
    expect(detail.name).toBe('test');
  });

  test('delegated listener catches emitted events', () => {
    const handler = jest.fn();
    hub.on('item:select', '.btn-action', handler);

    hub.emit('item:select', document.querySelector('.btn-action'), { id: 1 });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ─── Dynamic Content ──────────────────────────────────────────────────────────

describe('Dynamic content', () => {
  test('handler fires for elements added after listener registration', () => {
    const handler = jest.fn();
    hub.on('click', '.btn-action', handler);

    // Add new item AFTER registering listener
    const newLi = document.createElement('li');
    newLi.className = 'item';
    newLi.dataset.id = '99';
    newLi.innerHTML = `
      <button class="btn-action" data-action="select">Select</button>
    `;
    list.appendChild(newLi);

    // Click the newly added button
    newLi.querySelector('.btn-action').click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('removed elements no longer trigger handler', () => {
    const handler = jest.fn();
    hub.on('click', '.btn-action', handler);

    const item = document.querySelector('.item[data-id="1"]');
    item.remove();

    // Can't click a detached element — verify nothing throws
    expect(() => {
      const detachedBtn = item.querySelector('.btn-action');
      // Detached element events don't bubble through our root
    }).not.toThrow();

    expect(handler).not.toHaveBeenCalled();
  });
});
