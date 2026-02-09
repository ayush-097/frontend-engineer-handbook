# Lab: Form Validation UI

## 🎯 Objective

Build an accessible form with visual validation feedback using pure CSS.

## 📋 Requirements

### Form Elements
- Email input
- Password input
- Confirm password input  
- Terms checkbox
- Submit button

### Validation States
- **Default**: Normal input appearance
- **Focus**: Highlighted border, no validation shown yet
- **Valid**: Green border, checkmark icon
- **Invalid**: Red border, error message below
- **Disabled**: Grayed out, not interactive

### Accessibility
- Proper label associations
- ARIA attributes for validation
- Keyboard navigation
- Error messages announced by screen readers

## 🏗️ HTML Structure

```html
<form class="form">
  <div class="form-group">
    <label for="email" class="form-group__label">
      Email <span class="required">*</span>
    </label>
    <input 
      type="email" 
      id="email" 
      class="form-group__input" 
      required
      aria-describedby="email-error"
    >
    <span id="email-error" class="form-group__error" role="alert">
      <!-- Error message -->
    </span>
  </div>
  
  <!-- More form groups -->
</form>
```

## 💡 CSS Validation Techniques

### Using :valid and :invalid
```css
.form-group__input:valid {
  border-color: var(--color-success);
}

.form-group__input:invalid {
  border-color: var(--color-error);
}
```

### Show errors only after user interaction
```css
/* Don't show validation on initial load */
.form-group__input:not(:placeholder-shown):invalid {
  border-color: var(--color-error);
}

/* Or use :focus */
.form-group__input:focus:invalid {
  border-color: var(--color-error);
}
```

### Checkbox validation
```css
.form-group__checkbox:required:invalid + label {
  color: var(--color-error);
}
```

## ✅ Acceptance Criteria

- [ ] All inputs have labels
- [ ] Validation states visible
- [ ] Error messages descriptive
- [ ] Works without JavaScript
- [ ] Keyboard accessible
- [ ] Screen reader friendly

## 🚀 Bonus Challenges

1. Password strength indicator
2. Real-time character count
3. Animated validation icons
4. Multi-step form
5. Form summary on submit

## 📊 Expected Behavior

**Before interaction:**
```
┌──────────────────────┐
│ Email               │
│ ┌──────────────────┐ │
│ │                  │ │
│ └──────────────────┘ │
└──────────────────────┘
```

**Valid input:**
```
┌──────────────────────┐
│ Email               │
│ ┌──────────────────┐ │
│ │ user@example.com │ │ ✓ (green)
│ └──────────────────┘ │
└──────────────────────┘
```

**Invalid input:**
```
┌──────────────────────┐
│ Email               │
│ ┌──────────────────┐ │
│ │ invalid         │ │ ✗ (red)
│ └──────────────────┘ │
│ ⚠ Please enter a   │
│   valid email       │
└──────────────────────┘
```
