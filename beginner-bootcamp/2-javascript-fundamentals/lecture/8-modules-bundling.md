# Modules & Bundling

## Why Modules?

Before modules, all JavaScript shared one global scope. This was a disaster at scale.

```html
<!-- Old way — everything global, order-dependent, nightmare to maintain -->
<script src="jquery.js"></script>
<script src="lodash.js"></script>
<script src="utils.js"></script>       <!-- depends on lodash -->
<script src="api.js"></script>         <!-- depends on utils -->
<script src="components.js"></script>  <!-- depends on api -->
<script src="app.js"></script>         <!-- depends on all of above -->
```

**Problems:**
- Any script can overwrite any global variable
- Load order matters — break one and everything fails
- No way to declare explicit dependencies
- No privacy — everything exposed globally

Modules solve all of this.

## The Module Systems

JavaScript has had several module systems over the years:

```
Timeline:
2009: CommonJS (Node.js) ─────────── require() / module.exports
2011: AMD (RequireJS) ──────────────  define() / require() (async)
2015: ES Modules (ESM) ─────────────  import / export (the standard)
```

## CommonJS — Node.js Standard

CommonJS is the module system built into Node.js. Uses `require()` and `module.exports`.

### Exporting

```javascript
// math.js

// Export a single function
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }

// Method 1: module.exports object
module.exports = { add, subtract };

// Method 2: shorthand exports object
exports.multiply = (a, b) => a * b;
exports.divide   = (a, b) => a / b;

// Method 3: export a single value (replaces the whole module)
module.exports = function(a, b) { return a + b; };
```

### Importing

```javascript
// app.js

// Import the entire module
const math = require('./math');
math.add(1, 2); // 3

// Destructure imports
const { add, subtract } = require('./math');
add(5, 3); // 8

// Import built-in or installed packages (no ./ prefix)
const fs   = require('fs');
const path = require('path');
const _    = require('lodash'); // from node_modules
```

### How `require()` works internally

```javascript
// Simplified require() implementation:
function require(modulePath) {
  // 1. Resolve the file path
  const filename = resolve(modulePath);

  // 2. Check cache — return cached if already loaded
  if (require.cache[filename]) {
    return require.cache[filename].exports;
  }

  // 3. Create module object
  const module = { exports: {} };
  require.cache[filename] = module;

  // 4. Read and execute the file
  const code = fs.readFileSync(filename, 'utf8');
  const fn = new Function('module', 'exports', 'require', code);
  fn(module, module.exports, require);

  // 5. Return exports
  return module.exports;
}
```

### CommonJS is synchronous and cached

```javascript
// require() is synchronous — file is loaded and executed immediately
const config = require('./config'); // Blocking!

// require() caches — same module returns same object
const a = require('./utils');
const b = require('./utils');
console.log(a === b); // true — same object reference

// Circular requires are possible but tricky:
// a.js requires b.js which requires a.js
// Node.js handles this by returning the partial exports at time of require
```

## ES Modules (ESM) — The Modern Standard

ES Modules (ESM) were introduced in ES2015 and are now the official JavaScript module standard — used in browsers natively and in modern Node.js.

### Exporting

```javascript
// utils.js

// Named exports — export specific bindings
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export class Calculator {
  add(a, b) { return a + b; }
  subtract(a, b) { return a - b; }
}

// Export at the end (often preferred for readability)
function multiply(a, b) { return a * b; }
function divide(a, b) { return a / b; }

export { multiply, divide };

// Rename on export
export { multiply as times, divide as split };

// Default export — one per module
export default function mainUtility() { ... }
```

### Importing

```javascript
// app.js

// Import named exports
import { add, PI, Calculator } from './utils.js';

// Import with rename
import { add as sum, PI as pi } from './utils.js';

// Import everything as namespace
import * as Utils from './utils.js';
Utils.add(1, 2);
Utils.PI;

// Import default export
import mainUtility from './utils.js';

// Import default AND named in one statement
import mainUtility, { add, PI } from './utils.js';

// Side-effect only import (runs module but imports nothing)
import './polyfills.js';
```

### ESM Key Differences from CommonJS

```javascript
// 1. ESM is STATIC — imports resolved before code runs
//    Cannot use dynamic expressions in import path:

// ❌ Not allowed in ESM:
const module = 'utils';
import { add } from `./${module}`; // SyntaxError!

// ✅ CommonJS allows this:
const module = 'utils';
const { add } = require(`./${module}`); // Works!

// 2. ESM is ASYNCHRONOUS — module graph built before execution

// 3. ESM exports are LIVE BINDINGS, not copied values:
// counter.js
export let count = 0;
export function increment() { count++; }

// app.js
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 ← reflects the change!

// CommonJS: would still show 0 (copied value)

// 4. ESM uses strict mode automatically
```

### Dynamic `import()` — Lazy Loading

ESM also supports dynamic imports that return a Promise:

```javascript
// Static import (always loaded):
import { formatDate } from './date-utils.js';

// Dynamic import (loaded on demand):
async function showCalendar() {
  // Only loaded when this function is called!
  const { formatDate } = await import('./date-utils.js');
  return formatDate(new Date());
}

// Real-world: code splitting in React
const HeavyChart = React.lazy(() => import('./HeavyChart.jsx'));

// Conditional loading:
async function loadLocale(locale) {
  const messages = await import(`./locales/${locale}.js`);
  return messages.default;
}
```

## ESM in Node.js

Node.js supports ESM natively since v12:

```json
// package.json
{
  "type": "module"  // All .js files treated as ESM
}
```

```javascript
// Or use .mjs extension:
// utils.mjs → always ESM
// utils.cjs → always CommonJS
```

```javascript
// node-app.mjs
import { readFile } from 'fs/promises'; // ✅ ESM import
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname not available in ESM — use this instead:
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const data = await readFile(`${__dirname}/data.json`, 'utf8');
```

## ESM in the Browser

Browsers support ESM natively — no bundler needed for development:

```html
<script type="module" src="app.js"></script>
```

```javascript
// app.js — loaded as a module
import { add } from './math.js'; // ← must include .js extension in browser!

console.log(add(1, 2));
```

**Module behavior in browser:**
- Deferred by default (like `<script defer>`)
- Strict mode automatically
- CORS restrictions apply — can't import from `file://`
- Each module downloads in parallel, executes in order

## Bundlers

In production, we bundle modules for performance. Key bundlers:

### Why bundle?

```
Without bundling (100 imports → 100 HTTP requests):
  app.js → imports utils.js → imports math.js → imports date.js → ...
  Each requires a separate network round trip!

With bundling (100 imports → 1 HTTP request):
  bundle.js (all modules concatenated and optimized)
```

### Webpack

The most widely used bundler. Handles everything.

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',   // Entry point

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js', // Cache-busting filename
  },

  module: {
    rules: [
      // Transform JS with Babel
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      // Bundle CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Handle images
      {
        test: /\.(png|jpg|svg)$/,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],

  optimization: {
    splitChunks: {
      chunks: 'all', // Split vendor code into separate chunks
    },
  },
};
```

### Vite

Modern bundler — blazing fast in development, Rollup-powered in production.

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'date-fns'],
        },
      },
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080', // Proxy API requests
    },
  },
});
```

**Why Vite is faster in development:**
- Serves files as native ESM — no bundling needed!
- HMR (Hot Module Replacement) updates only changed modules
- Pre-bundles `node_modules` with esbuild (10-100x faster than Webpack)

### Rollup

Best for libraries. Produces clean, minimal output.

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',

  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',    // For Node.js consumers
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',    // For modern bundlers (tree-shakeable)
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',    // For browsers via <script>
      name: 'MyLibrary',
    },
  ],

  plugins: [resolve(), commonjs(), terser()],
};
```

## Tree Shaking

**Tree shaking** eliminates unused exports from the final bundle.

```javascript
// math.js — exports 3 functions
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export function multiply(a, b) { return a * b; } // Expensive: imports big library

// app.js — only uses add
import { add } from './math.js';
add(1, 2);
```

With tree shaking, `subtract` and `multiply` are **not included** in the bundle.

### Requirements for tree shaking:

```javascript
// ✅ Named exports are tree-shakeable
export function add() {}
export function subtract() {}

// ❌ CommonJS is NOT tree-shakeable (require is dynamic)
module.exports = { add, subtract };
// Bundler can't know which exports are used at build time

// ✅ Import specifically (not namespace)
import { add } from 'lodash-es'; // Only 'add' bundled

// ❌ Namespace import defeats tree shaking
import * as _ from 'lodash-es'; // Entire lodash bundled
```

## Code Splitting

Split the bundle into multiple chunks loaded on demand.

```javascript
// Route-based splitting with React Router
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Each page loaded only when route is visited
const Home     = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings  = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings"  element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Result:
// main.js      — app shell (loads immediately)
// home.js      — loaded when / is visited
// dashboard.js — loaded when /dashboard is visited
// settings.js  — loaded when /settings is visited
```

### Component-level splitting

```javascript
// Heavy components loaded on demand
const HeavyMap = lazy(() => import('./HeavyMap'));
const RichEditor = lazy(() => import('./RichEditor'));
const DataGrid = lazy(() => import('./DataGrid'));

function Dashboard() {
  const [showMap, setShowMap] = useState(false);

  return (
    <div>
      <button onClick={() => setShowMap(true)}>Show Map</button>

      {showMap && (
        <Suspense fallback={<MapSkeleton />}>
          <HeavyMap /> {/* Only downloads when button clicked */}
        </Suspense>
      )}
    </div>
  );
}
```

## Package.json — Module Configuration

```json
{
  "name": "my-library",
  "version": "1.0.0",

  // Entry points for different environments:
  "main": "./dist/index.cjs",          // CommonJS (require)
  "module": "./dist/index.esm.js",     // ESM (import, tree-shakeable)
  "browser": "./dist/index.browser.js",// Browser-specific build
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs",
      "browser": "./dist/index.browser.js"
    },
    "./utils": "./dist/utils.esm.js"   // Subpath exports
  },

  // Files to include when publishing:
  "files": ["dist", "src"],

  // Bundler hints:
  "sideEffects": false  // Safe to tree-shake all exports
}
```

## Practical Module Patterns

### Barrel files — centralize exports

```javascript
// components/index.js — the "barrel"
export { Button }   from './Button';
export { Input }    from './Input';
export { Modal }    from './Modal';
export { Card }     from './Card';

// Now consumers import from one place:
import { Button, Modal } from './components';
// Instead of:
// import { Button } from './components/Button';
// import { Modal }  from './components/Modal';
```

⚠️ **Warning:** Barrel files can hurt tree shaking if not configured properly. Use with awareness.

### Singleton module pattern

```javascript
// store.js — module is cached, so this is a singleton
let state = { user: null, theme: 'light' };

export function getState() {
  return { ...state }; // Return copy
}

export function setState(update) {
  state = { ...state, ...update };
  notify();
}

const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn); // Unsubscribe
}

function notify() {
  listeners.forEach(fn => fn(state));
}
```

### Module augmentation (TypeScript)

```typescript
// Extend an existing module's types
declare module 'express' {
  interface Request {
    user?: { id: string; role: string };
  }
}
```

## Comparing Module Systems

| Feature | CommonJS | ESM |
|---------|----------|-----|
| Syntax | `require` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| Binding | Copied values | Live bindings |
| Tree shaking | ❌ No | ✅ Yes |
| Browser native | ❌ No | ✅ Yes |
| Node.js native | ✅ Yes | ✅ Yes (v12+) |
| Dynamic path | ✅ Yes | ✅ (`import()`) |
| Circular deps | Partial support | Better support |

## Practice Exercises

### Exercise 1: Convert CommonJS to ESM

```javascript
// Convert this CommonJS module:
const EventEmitter = require('events');
const path = require('path');

class Logger extends EventEmitter {
  log(message) {
    this.emit('log', { message, time: new Date() });
    console.log(`[${path.basename(__filename)}] ${message}`);
  }
}

module.exports = { Logger };
```

### Exercise 2: Build a mini bundler

```javascript
// Implement a tiny bundler that:
// 1. Reads an entry file
// 2. Finds all require() calls
// 3. Recursively loads dependencies
// 4. Concatenates everything into one file
// 5. Wraps each module to prevent global scope pollution

function bundle(entryFile) {
  // TODO: implement
}
```

### Exercise 3: Implement lazy loading

```javascript
// Create a function that:
// - Accepts a module path
// - Returns a proxy object
// - Only actually imports the module when a property is accessed

function lazyImport(modulePath) {
  // TODO: implement using dynamic import()
}

const utils = lazyImport('./heavy-utils.js');
// Module not loaded yet...
utils.formatDate(new Date()); // ← Module loads HERE
```

## Key Takeaways

- **CommonJS** (`require`/`exports`) = Node.js native, synchronous, not tree-shakeable
- **ESM** (`import`/`export`) = the modern standard, static, tree-shakeable, async
- Bundlers (Webpack, Vite, Rollup) combine modules for production performance
- **Tree shaking** removes unused exports — requires ESM named exports
- **Code splitting** loads modules lazily — massive performance win for large apps
- Use `export default` for the primary export, named exports for utilities
- In 2024+, prefer ESM everywhere — it's the official standard

---

**Module complete! You've finished the JavaScript Fundamentals lectures.**

**Next:** [Lab: Promise Implementation →](../lab/promise-implementation/)
