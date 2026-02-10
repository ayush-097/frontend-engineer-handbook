const AsyncQueue = require('../async-queue');

// Simulate API call
function fetchUser(id) {
  return new Promise((resolve) => {
    console.log(`Fetching user ${id}...`);
    setTimeout(() => {
      resolve({ id, name: `User ${id}` });
    }, 1000);
  });
}

// Create queue with concurrency of 2
const queue = new AsyncQueue(2);

// Add 5 tasks
const userIds = [1, 2, 3, 4, 5];
const promises = userIds.map(id => 
  queue.add(() => fetchUser(id))
);

// Wait for all
Promise.all(promises).then(users => {
  console.log('All users fetched:', users);
});

// Only 2 requests run at a time!
