# Lab: Image Optimization

Optimize images for performance: lazy loading, responsive images, modern formats.

## Tasks

### 1. Lazy Loading
Images below fold load only when scrolled into view:
```tsx
<img src="photo.jpg" loading="lazy" alt="..." />
```

### 2. Responsive Images
Different sizes for different viewports:
```tsx
<picture>
  <source
    srcset="photo-400.webp 400w, photo-800.webp 800w"
    type="image/webp"
  />
  <img
    src="photo-400.jpg"
    srcset="photo-400.jpg 400w, photo-800.jpg 800w"
    sizes="(max-width: 600px) 400px, 800px"
    loading="lazy"
  />
</picture>
```

### 3. Blur Placeholder
Show blurred low-res version while loading:
```tsx
<div style={{ backgroundImage: `url(${blurDataURL})` }}>
  <img src={fullSizeURL} onLoad={...} />
</div>
```

### 4. Lighthouse Audit
Score 90+ on Performance with optimized images

**Time:** 2-3 hours  
**Deliverable:** Gallery with optimized images + Lighthouse screenshot
