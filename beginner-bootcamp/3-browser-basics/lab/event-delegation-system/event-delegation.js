/**
 * Event Delegation System
 * A jQuery-inspired event library using delegation for performance.
 */

class EventHub {
  #listeners = new Map(); // eventType → [{selector, handler, options}]
  #root;

  constructor(root = document) {
    this.#root = root;
  }

  /**
   * Attach a delegated event listener
   * @param {string} eventType - 'click', 'keydown', etc.
   * @param {string} selector - CSS selector to match targets
   * @param {Function} handler - Called with (event, matchedElement)
   * @param {Object} options - { once, passive, capture }
   */
  on(eventType, selector, handler, options = {}) {
    if (!this.#listeners.has(eventType)) {
      this.#listeners.set(eventType, []);
      this.#root.addEventListener(eventType, this.#handleEvent.bind(this), {
        capture: options.capture ?? false,
        passive: options.passive ?? false,
      });
    }

    const entry = { selector, handler, options, active: true };
    this.#listeners.get(eventType).push(entry);

    // Return unsubscribe function
    return () => { entry.active = false; };
  }

  /**
   * One-time delegated listener
   */
  once(eventType, selector, handler) {
    const off = this.on(eventType, selector, (event, el) => {
      handler(event, el);
      off();
    });
    return off;
  }

  /**
   * Remove specific listener
   */
  off(eventType, selector, handler) {
    const entries = this.#listeners.get(eventType) || [];
    const index = entries.findIndex(e => e.selector === selector && e.handler === handler);
    if (index !== -1) entries[index].active = false;
  }

  /**
   * Remove ALL listeners for an event type
   */
  offAll(eventType) {
    const entries = this.#listeners.get(eventType) || [];
    entries.forEach(e => { e.active = false; });
  }

  /**
   * Trigger an event programmatically
   */
  emit(eventType, element, detail = {}) {
    element.dispatchEvent(new CustomEvent(eventType, {
      bubbles: true,
      cancelable: true,
      detail,
    }));
  }

  #handleEvent(event) {
    const entries = this.#listeners.get(event.type) || [];

    entries.forEach(entry => {
      if (!entry.active) return;

      // Find matching ancestor
      const target = event.target.closest(entry.selector);
      if (!target || !this.#root.contains(target)) return;

      entry.handler.call(target, event, target);

      if (entry.options.once) {
        entry.active = false;
      }
    });
  }
}

// Convenience wrapper for document-level delegation
const hub = new EventHub(document);

export { EventHub };
export default hub;
