const EventEmitter = require("../event-emitter");

// Create emitter
const emitter = new EventEmitter();

// Register listeners
emitter.on("greet", (name) => {
  console.log(`Hello, ${name}!`);
});

emitter.on("greet", (name) => {
  console.log(`Welcome, ${name}!`);
});

// Emit event
emitter.emit("greet", "Alice");
// Output:
// Hello, Alice!
// Welcome, Alice!

// One-time listener
emitter.once("goodbye", (name) => {
  console.log(`Goodbye, ${name}!`);
});

emitter.emit("goodbye", "Bob"); // Goodbye, Bob!
emitter.emit("goodbye", "Charlie"); // Nothing (listener removed)
