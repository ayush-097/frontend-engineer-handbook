/**
 * Async Queue with concurrency control
 */
class AsyncQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  /**
   * Add task to queue
   * @param {Function} task - Async function to execute
   * @returns {Promise} Resolves when task completes
   */
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  /**
   * Process queue
   */
  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process(); // Process next task
    }
  }

  /**
   * Get queue size
   */
  get size() {
    return this.queue.length;
  }

  /**
   * Get number of running tasks
   */
  get pending() {
    return this.running;
  }
}

module.exports = AsyncQueue;
