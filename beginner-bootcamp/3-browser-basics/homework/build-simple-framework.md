# Homework: Build a Simple UI Framework

## 🎯 Objective

Combine everything from the Browser Basics module to build a minimal, working UI framework that can power real apps. Think of it as a "nano-React" — state management, reactive rendering, and component composition using only the browser DOM API.

## 📋 Requirements

### Core Features to Implement

#### 1. `createApp(rootElement)` — Application factory

```javascript
const app = createApp(document.getElementById('root'));
app.mount(Counter);
```

#### 2. `component(setup)` — Component definition

```javascript
const Counter = component(() => {
  const count = signal(0);

  return () => (
    h('div', { class: 'counter' },
      h('p', null, `Count: ${count.value}`),
      h('button', { onClick: () => count.value++ }, '+'),
      h('button', { onClick: () => count.value-- }, '-'),
    )
  );
});
```

#### 3. `signal(value)` — Reactive state primitive

```javascript
const name = signal('Alice');

// Reading
name.value; // 'Alice'

// Writing — automatically re-renders all consumers!
name.value = 'Bob';

// Derived/computed signal
const greeting = computed(() => `Hello, ${name.value}!`);
```

#### 4. `h(tag, props, ...children)` — Hyperscript (like createElement)

```javascript
h('div', { class: 'card', onClick: handler },
  h('h1', null, title),
  h('p', null, description),
)
```

### Application to Build

Use your framework to build a **Todo App** that demonstrates all features:

```javascript
// todo-app.js
import { component, signal, computed, h } from './framework.js';

const TodoApp = component(() => {
  const todos = signal([
    { id: 1, text: 'Build a framework', done: false },
    { id: 2, text: 'Build a todo app', done: false },
  ]);
  const filter = signal('all'); // 'all' | 'active' | 'done'
  const input = signal('');
  let nextId = 3;

  const filtered = computed(() => {
    switch (filter.value) {
      case 'active': return todos.value.filter(t => !t.done);
      case 'done':   return todos.value.filter(t => t.done);
      default:       return todos.value;
    }
  });

  const remaining = computed(() => todos.value.filter(t => !t.done).length);

  function addTodo() {
    if (!input.value.trim()) return;
    todos.value = [...todos.value, { id: nextId++, text: input.value, done: false }];
    input.value = '';
  }

  function toggleTodo(id) {
    todos.value = todos.value.map(t => t.id === id ? { ...t, done: !t.done } : t);
  }

  function deleteTodo(id) {
    todos.value = todos.value.filter(t => t.id !== id);
  }

  return () => h('div', { class: 'app' },
    h('h1', null, 'Todos'),
    h('p', null, `${remaining.value} remaining`),

    h('div', { class: 'add-form' },
      h('input', {
        type: 'text',
        value: input.value,
        placeholder: 'What needs to be done?',
        onInput: e => { input.value = e.target.value; },
        onKeydown: e => { if (e.key === 'Enter') addTodo(); },
      }),
      h('button', { onClick: addTodo }, 'Add'),
    ),

    h('div', { class: 'filters' },
      ['all', 'active', 'done'].map(f =>
        h('button', {
          class: filter.value === f ? 'active' : '',
          onClick: () => { filter.value = f; },
        }, f)
      )
    ),

    h('ul', { class: 'todo-list' },
      ...filtered.value.map(todo =>
        h('li', { key: todo.id, class: todo.done ? 'done' : '' },
          h('input', {
            type: 'checkbox',
            checked: todo.done,
            onChange: () => toggleTodo(todo.id),
          }),
          h('span', null, todo.text),
          h('button', { onClick: () => deleteTodo(todo.id) }, '×'),
        )
      )
    ),
  );
});
```

## 📁 File Structure

```
build-simple-framework/
├── framework.js     ← Your implementation
├── todo-app.js      ← Demo app using your framework
├── index.html       ← Runs the demo
└── framework.test.js← Tests
```

## 🔍 Implementation Hints

### Signal implementation

```javascript
function signal(initial) {
  let value = initial;
  const subscribers = new Set();

  return {
    get value() { return value; },
    set value(newVal) {
      value = newVal;
      subscribers.forEach(fn => fn()); // Notify all subscribers
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  };
}
```

### Automatic dependency tracking (advanced)

```javascript
let currentEffect = null;

function computed(fn) {
  const result = signal(undefined);

  // Run fn, track which signals it reads
  function update() {
    currentEffect = update;
    result.value = fn(); // fn reads signals — they track this update
    currentEffect = null;
  }

  update();
  return result;
}

// In signal's getter:
get value() {
  if (currentEffect) subscribers.add(currentEffect); // Track!
  return value;
}
```

### Rendering with diffing

```javascript
function mount(Component, root) {
  let tree = null;
  let dom = null;

  function render() {
    const newTree = Component();
    if (!dom) {
      dom = createDom(newTree);
      root.appendChild(dom);
    } else {
      updateDom(dom, tree, newTree); // Only update what changed
    }
    tree = newTree;
  }

  // Initial render
  render();

  // Re-render when signals change
  // (Signals call render() via subscribers)
}
```

## ✅ Acceptance Criteria

### Must pass:

- [ ] Counter app works: click +/- updates display
- [ ] Todo app: add, toggle, delete, filter all work
- [ ] Re-renders happen automatically when signal.value changes
- [ ] `computed()` derives from other signals correctly
- [ ] Only changed DOM nodes are updated (log DOM mutations to verify)

### Code quality:

- [ ] Framework is < 200 lines of code
- [ ] No external dependencies
- [ ] Works in modern browsers (Chrome, Firefox, Safari)
- [ ] Passes all tests in `framework.test.js`

## 🚀 Bonus Challenges

### Bonus 1: `effect(fn)` — Side effects that run when deps change

```javascript
const theme = signal('light');

effect(() => {
  document.body.className = theme.value; // Runs when theme changes
});

theme.value = 'dark'; // body.className updates automatically
```

### Bonus 2: `store(initialState)` — Redux-like centralized state

```javascript
const store = createStore({
  count: 0,
  name: 'Alice',
}, {
  increment: (state) => ({ ...state, count: state.count + 1 }),
  setName: (state, name) => ({ ...state, name }),
});

store.dispatch('increment');
store.state.count; // 1
```

### Bonus 3: `router` — Client-side routing

```javascript
const router = createRouter({
  '/': HomeComponent,
  '/todos': TodosComponent,
  '/todos/:id': TodoDetailComponent,
});

// Navigates without page reload
router.push('/todos/42');
```

### Bonus 4: Custom directives

```javascript
// v-show equivalent
h('div', { 'v-show': isVisible.value }, content)
// → style.display = isVisible.value ? '' : 'none'
```

## 📊 Grading Rubric

| Criterion | Points |
|-----------|--------|
| `signal` and `computed` work correctly | 15 |
| `h()` builds vnode tree | 10 |
| Initial rendering to DOM | 15 |
| Reactive re-renders on signal change | 20 |
| Todo app is functional | 20 |
| Code quality & no memory leaks | 10 |
| Tests pass | 10 |
| **Total** | **100** |

## ⏱️ Time Estimate

- Core framework: 4–6 hours
- Todo app demo: 1–2 hours
- Tests: 1 hour
- Bonus features: +2–4 hours each

**Submit:** GitHub repo with live demo link (GitHub Pages or similar)
