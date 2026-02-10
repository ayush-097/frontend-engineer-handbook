/**
 * Debounce function - delays execution until after wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeoutId;
  
  return function debounced(...args) {
    const context = this;
    
    // Clear previous timer
    clearTimeout(timeoutId);
    
    // Set new timer
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

module.exports = debounce;
