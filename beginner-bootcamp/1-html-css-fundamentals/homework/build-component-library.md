# Homework: Build a Component Library

## 🎯 Objective

Create a reusable component library with pure HTML/CSS (no JavaScript).

## 📦 Required Components

### 1. Buttons

```html
<button class="btn btn--primary">Primary</button>
<button class="btn btn--secondary">Secondary</button>
<button class="btn btn--danger">Danger</button>
<button class="btn btn--outline">Outline</button>
<button class="btn btn--sm">Small</button>
<button class="btn btn--lg">Large</button>
<button class="btn" disabled>Disabled</button>
```

**Requirements:**

- At least 3 color variants
- 3 size variants (sm, default, lg)
- Outline variant
- Disabled state
- Hover/focus states
- Rounded corners

---

### 2. Input Fields

```html
<div class="form-group">
  <label for="email">Email</label>
  <input type="email" id="email" class="input" placeholder="Enter email" />
</div>

<div class="form-group form-group--error">
  <label for="password">Password</label>
  <input type="password" id="password" class="input input--error" />
  <span class="form-group__error">Password is required</span>
</div>

<div class="form-group form-group--success">
  <label for="username">Username</label>
  <input type="text" id="username" class="input input--success" />
  <span class="form-group__success">✓ Username available</span>
</div>
```

**Requirements:**

- Normal, error, success states
- Focus states
- Placeholder styles
- Helper text
- Icons (optional)

---

### 3. Cards

```html
<div class="card">
  <img class="card__img" src="..." alt="..." />
  <div class="card__content">
    <h3>Card Title</h3>
    <p>Card description goes here...</p>
    <a href="#" class="card__link">Read more →</a>
  </div>
</div>
```

**Requirements:**

- With and without image
- Horizontal variant
- Hover effects
- Shadow variants

---

### 4. Modals

```html
<!-- Trigger -->
<a href="#modal1">Open Modal</a>

<!-- Modal -->
<div id="modal1" class="modal">
  <div class="modal__overlay"></div>
  <div class="modal__container">
    <div class="modal__header">
      <h2>Modal Title</h2>
      <a href="#" class="modal__close">×</a>
    </div>
    <div class="modal__body">
      <p>Modal content...</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--primary">Confirm</button>
      <a href="#" class="btn btn--secondary">Cancel</a>
    </div>
  </div>
</div>
```

**Requirements:**

- Pure CSS (`:target` pseudo-class)
- Backdrop overlay
- Smooth transitions
- Close button
- Keyboard accessible

---

### 5. Tooltips

```html
<span class="tooltip" data-tooltip="This is a tooltip"> Hover me </span>
```

**Requirements:**

- Top, right, bottom, left positions
- Pure CSS (data attribute + ::after)
- Smooth fade-in
- Arrow pointer

---

## 🎨 Design Requirements

### Color System

```css
:root {
  --primary: #3498db;
  --secondary: #2ecc71;
  --danger: #e74c3c;
  --warning: #f39c12;
  --dark: #2c3e50;
  --light: #ecf0f1;
}
```

### Typography

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
}
```

### Spacing

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
}
```

## 📁 File Structure

```
component-library/
├── index.html          # Demo page showing all components
├── styles/
│   ├── variables.css   # CSS custom properties
│   ├── reset.css       # CSS reset
│   ├── components/
│   │   ├── buttons.css
│   │   ├── inputs.css
│   │   ├── cards.css
│   │   ├── modals.css
│   │   └── tooltips.css
│   └── main.css        # Imports all styles
└── README.md           # Documentation
```

## ✅ Acceptance Criteria

- [ ] All 5 components implemented
- [ ] Mobile responsive
- [ ] BEM naming convention
- [ ] CSS custom properties for theming
- [ ] Documented with examples
- [ ] Demo page showcasing all components
- [ ] Dark mode support (bonus)

## 📊 Evaluation Rubric

| Criteria                      | Points  |
| ----------------------------- | ------- |
| All components work           | 40      |
| Responsive design             | 20      |
| Code quality (BEM, clean CSS) | 20      |
| Accessibility                 | 10      |
| Documentation                 | 10      |
| **Total**                     | **100** |

## 🚀 Bonus Challenges

1. **Dark mode toggle** using `:root[data-theme="dark"]`
2. **Animated loading states** for all components
3. **Accordions** component
4. **Tabs** component
5. **Badges** component
6. **Progress bars** component

## 📝 Submission

Create a GitHub repository with:

1. All source files
2. Hosted demo (GitHub Pages)
3. README with screenshots
4. Usage documentation

## 💡 Tips

1. Start with variables - makes theming easy
2. Use BEM consistently - no exceptions
3. Test on real devices, not just browser resize
4. Focus states matter - don't skip them
5. Document as you code - easier than after

---

**Expected time:** 8-10 hours

**Need help?** Review the lectures and check [MDN Web Docs](https://developer.mozilla.org/)
