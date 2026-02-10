/**
 * Custom Event Emitter implementation
 * Similar to Node.js EventEmitter
 */
class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  /**
   * Register a one-time event listener
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener.apply(this, args);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param  {...any} args - Arguments to pass to listeners
   */
  emit(event, ...args) {
    const listeners = this.events[event];
    if (!listeners) return false;
    
    listeners.forEach(listener => {
      listener.apply(this, args);
    });
    
    return true;
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} listenerToRemove - Specific listener to remove
   */
  off(event, listenerToRemove) {
    const listeners = this.events[event];
    if (!listeners) return this;
    
    this.events[event] = listeners.filter(listener => listener !== listenerToRemove);
    return this;
  }

  /**
   * Remove all listeners for an event, or all events
   * @param {string} event - Event name (optional)
   */
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  /**
   * Get all listeners for an event
   * @param {string} event - Event name
   * @returns {Function[]} Array of listeners
   */
  listeners(event) {
    return this.events[event] || [];
  }

  /**
   * Get count of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Count
   */
  listenerCount(event) {
    return this.listeners(event).length;
  }
}

module.exports = EventEmitter;
