# Lab: Card Layout System

## 🎯 Objective

Create a flexible, responsive card grid system using CSS Grid.

## 📋 Requirements

### Responsive Behavior
- Mobile (<600px): 1 column
- Tablet (600-1000px): 2 columns
- Desktop (>1000px): 3 columns
- Large Desktop (>1400px): 4 columns

### Card Features
- Equal height cards
- Image with aspect ratio (16:9)
- Title, description, button
- Hover effect (lift + shadow)
- Loading state placeholder

## 🏗️ Starter Code

```html
<div class="card-grid">
  <article class="card">
    <img class="card__image" src="..." alt="...">
    <div class="card__body">
      <h3 class="card__title">Card Title</h3>
      <p class="card__description">Lorem ipsum...</p>
      <button class="card__button">Learn More</button>
    </div>
  </article>
  <!-- More cards... -->
</div>
```

## 💡 Implementation Tips

### Responsive Grid
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}
```

### Equal Height
Cards automatically equal height with Grid!

### Aspect Ratio
```css
.card__image {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
}
```

### Hover Effect
```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
```

## ✅ Acceptance Criteria

- [ ] Responsive without media queries
- [ ] Equal height cards
- [ ] Smooth hover animation
- [ ] Images maintain aspect ratio
- [ ] Loading skeleton implemented

## 🚀 Bonus Challenges

1. Add card variants (featured, urgent)
2. Implement lazy loading placeholder
3. Add tags/badges to cards
4. Create masonry layout option
