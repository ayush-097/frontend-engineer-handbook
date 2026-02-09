# Lab: Responsive Navbar

## 🎯 Objective

Build a production-ready navigation component that:
- Works on mobile and desktop
- Is keyboard accessible
- Has smooth transitions
- Uses no JavaScript for basic functionality

## 📋 Requirements

### Desktop (≥768px)
- Logo on left
- Navigation links horizontally on right
- Hover effects on links
- Active link highlighted

### Mobile (<768px)
- Logo on left
- Hamburger icon on right
- Menu slides in from right
- Overlay darkens page
- Close button in menu

### Accessibility
- Keyboard navigable (Tab, Enter, Escape)
- Proper ARIA labels
- Focus states visible
- Semantic HTML

## 🏗️ Starter Code

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Navbar</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <nav class="navbar">
    <div class="navbar__container">
      <a href="/" class="navbar__logo">MyApp</a>
      
      <input type="checkbox" id="nav-toggle" class="navbar__toggle">
      <label for="nav-toggle" class="navbar__toggle-label" aria-label="Toggle navigation">
        <span></span>
        <span></span>
        <span></span>
      </label>
      
      <ul class="navbar__menu">
        <li class="navbar__item">
          <a href="#home" class="navbar__link navbar__link--active">Home</a>
        </li>
        <li class="navbar__item">
          <a href="#about" class="navbar__link">About</a>
        </li>
        <li class="navbar__item">
          <a href="#services" class="navbar__link">Services</a>
        </li>
        <li class="navbar__item">
          <a href="#contact" class="navbar__link">Contact</a>
        </li>
      </ul>
    </div>
  </nav>
  
  <main>
    <h1>Page Content</h1>
    <p>Lorem ipsum dolor sit amet...</p>
  </main>
</body>
</html>
```

## 💡 Implementation Tips

### Checkbox Hack
Use a hidden checkbox to toggle menu (no JS needed):

```css
.navbar__toggle {
  display: none;
}

.navbar__toggle:checked ~ .navbar__menu {
  transform: translateX(0);
}
```

### Hamburger Animation
```css
.navbar__toggle-label span {
  transition: all 0.3s ease;
}

.navbar__toggle:checked + .navbar__toggle-label span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.navbar__toggle:checked + .navbar__toggle-label span:nth-child(2) {
  opacity: 0;
}

.navbar__toggle:checked + .navbar__toggle-label span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}
```

## ✅ Acceptance Criteria

- [ ] Logo always visible
- [ ] Desktop: horizontal links
- [ ] Mobile: hamburger menu
- [ ] Smooth transitions (0.3s)
- [ ] Works without JavaScript
- [ ] Keyboard accessible
- [ ] No layout shift on toggle

## 🚀 Bonus Challenges

1. Add dropdown submenu
2. Sticky navbar on scroll
3. Dark mode toggle
4. Blur backdrop on mobile menu

## 📊 Expected Output

**Desktop:**
```
┌─────────────────────────────────────┐
│ Logo      Home About Services Contact│
└─────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────┐  ┌───────────────┐
│ Logo      ☰ │  │ ×           │
└──────────────┘  │             │
                  │ Home        │
                  │ About       │
                  │ Services    │
                  │ Contact     │
                  └───────────────┘
```

## 📚 Resources

- [MDN :checked](https://developer.mozilla.org/en-US/docs/Web/CSS/:checked)
- [Checkbox Hack](https://css-tricks.com/the-checkbox-hack/)
