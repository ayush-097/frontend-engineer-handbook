/**
 * Throttle function - ensures function is called at most once per interval
 * @param {Function} func - Function to throttle
 * @param {number} interval - Minimum time between calls in ms
 * @returns {Function} Throttled function
 */
function throttle(func, interval) {
  let lastTime = 0;

  return function throttled(...args) {
    const now = Date.now();

    if (now - lastTime >= interval) {
      lastTime = now;
      return func.apply(this, args);
    }
  };
}

module.exports = throttle;
